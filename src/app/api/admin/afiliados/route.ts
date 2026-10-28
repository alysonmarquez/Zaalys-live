import { z } from "zod";
import { getAccess } from "@/lib/access";
import { fail, json, unauthorized } from "@/lib/http";
import { createAdminClient } from "@/lib/supabase/server";

// Afiliados no Painel do Afiliado (só ADMIN_EMAILS). Aprovar cria uma assinatura vitalícia "manual" ativa para a
// conta, que libera o painel sem pagamento; revogar cancela só essa assinatura manual (pagamentos não são tocados).
// "comissao" muda a porcentagem de comissão do afiliado (profiles.commission_pct; nulo = padrão).
// "repassar" marca como repassadas as comissões pagas do afiliado (vendas pelos links de convite).

const manualRef = (userId: string) => `aprovacao:${userId}`;

async function adminCtx() {
  const access = await getAccess();
  if (!access?.admin || access.demo) return null;
  return { access, admin: createAdminClient() };
}

export async function GET() {
  const c = await adminCtx();
  if (!c) return unauthorized();
  try {
    type Row = {
      id: string;
      email: string;
      name: string | null;
      created_at: string;
      commission_pct?: number | null;
      applyfy_account_id?: string | null;
    };
    const list = (cols: string) =>
      c.admin.from("profiles").select(cols).order("created_at", { ascending: false }).limit(1000);
    // Sem as migrações da conta Applyfy ou da comissão, lista com o que existir.
    let { data, error } = await list("id, email, name, created_at, commission_pct, applyfy_account_id");
    if (error) ({ data, error } = await list("id, email, name, created_at, commission_pct"));
    if (error) ({ data, error } = await list("id, email, name, created_at"));
    if (error) return fail(error);
    const profiles = (data ?? []) as unknown as Row[];
    const { data: subs, error: subError } = await c.admin
      .from("subscriptions")
      .select("user_id, email, plan, status, gateway, expires_at")
      .eq("status", "active");
    if (subError) return fail(subError);

    // Vendas atribuídas pelos links de convite: comissão a repassar e total de vendas pagas.
    const { data: sales } = await c.admin
      .from("affiliate_sales")
      .select("affiliate_id, commission_cents, status, payout_status")
      .eq("status", "paid");
    const totals = new Map<string, { vendas: number; aReceberCents: number }>();
    for (const s of sales ?? []) {
      if (!s.affiliate_id) continue;
      const t = totals.get(s.affiliate_id) ?? { vendas: 0, aReceberCents: 0 };
      t.vendas++;
      if (s.payout_status === "a_receber") t.aReceberCents += s.commission_cents;
      totals.set(s.affiliate_id, t);
    }

    const now = Date.now();
    const valid = (subs ?? []).filter((s) => s.plan === "lifetime" || (s.expires_at && Date.parse(s.expires_at) > now));
    return json({
      afiliados: profiles.map((p) => {
        const mine = valid.filter((s) => s.user_id === p.id || s.email?.toLowerCase() === p.email?.toLowerCase());
        const paid = mine.some((s) => s.gateway !== "manual");
        const approved = mine.some((s) => s.gateway === "manual");
        return {
          id: p.id,
          email: p.email,
          name: p.name,
          createdAt: p.created_at,
          commissionPct: p.commission_pct == null ? null : Number(p.commission_pct),
          applyfyAccountId: p.applyfy_account_id ?? null,
          situacao: paid ? "pago" : approved ? "aprovado" : "pendente",
          vendas: totals.get(p.id)?.vendas ?? 0,
          aReceberCents: totals.get(p.id)?.aReceberCents ?? 0,
        };
      }),
    });
  } catch (err) {
    return fail(err);
  }
}

const Body = z.discriminatedUnion("action", [
  z.object({ userId: z.string().uuid(), action: z.literal("aprovar") }),
  z.object({ userId: z.string().uuid(), action: z.literal("revogar") }),
  // Comissões pagas e ainda não repassadas passam a "repassada" (o Pix é feito fora do sistema).
  z.object({ userId: z.string().uuid(), action: z.literal("repassar") }),
  // null volta ao padrão
  z.object({ userId: z.string().uuid(), action: z.literal("comissao"), pct: z.number().min(0).max(100).nullable() }),
]);

export async function POST(req: Request) {
  const c = await adminCtx();
  if (!c) return unauthorized();
  try {
    const body = Body.parse(await req.json());
    const { userId, action } = body;
    const { data: profile } = await c.admin.from("profiles").select("email").eq("id", userId).maybeSingle();
    if (!profile) return json({ error: "Conta não encontrada" }, 404);

    if (body.action === "comissao") {
      const { error } = await c.admin.from("profiles").update({ commission_pct: body.pct }).eq("id", userId);
      if (error) return json({ error: "Rode supabase/migration-2026-10-afiliados.sql para mudar comissões." }, 409);
      return json({ ok: true });
    }

    if (body.action === "repassar") {
      const { error } = await c.admin
        .from("affiliate_sales")
        .update({ payout_status: "repassada", updated_at: new Date().toISOString() })
        .eq("affiliate_id", userId)
        .eq("status", "paid")
        .eq("payout_status", "a_receber");
      if (error) return fail(error);
      return json({ ok: true });
    }

    if (action === "aprovar") {
      const { error } = await c.admin.from("subscriptions").upsert(
        {
          user_id: userId,
          email: profile.email.toLowerCase(),
          plan: "lifetime",
          status: "active",
          gateway: "manual",
          gateway_ref: manualRef(userId),
          expires_at: null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "gateway,gateway_ref" },
      );
      if (error) return fail(error);
    } else {
      const { error } = await c.admin
        .from("subscriptions")
        .update({ status: "canceled", updated_at: new Date().toISOString() })
        .eq("gateway", "manual")
        .eq("gateway_ref", manualRef(userId));
      if (error) return fail(error);
    }
    return json({ ok: true });
  } catch (err) {
    return fail(err);
  }
}
