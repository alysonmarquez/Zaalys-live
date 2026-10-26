import { z } from "zod";
import { getAccess } from "@/lib/access";
import { fail, json, unauthorized } from "@/lib/http";
import { createAdminClient } from "@/lib/supabase/server";

// Aprovação de afiliados (só ADMIN_EMAILS). Aprovar cria uma assinatura vitalícia "manual" ativa para a conta,
// que libera o painel sem pagamento; revogar cancela só essa assinatura manual (pagamentos não são tocados).

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
    const { data: profiles, error } = await c.admin
      .from("profiles")
      .select("id, email, name, created_at")
      .order("created_at", { ascending: false })
      .limit(1000);
    if (error) return fail(error);
    const { data: subs, error: subError } = await c.admin
      .from("subscriptions")
      .select("user_id, email, plan, status, gateway, expires_at")
      .eq("status", "active");
    if (subError) return fail(subError);

    const now = Date.now();
    const valid = (subs ?? []).filter((s) => s.plan === "lifetime" || (s.expires_at && Date.parse(s.expires_at) > now));
    return json({
      afiliados: (profiles ?? []).map((p) => {
        const mine = valid.filter((s) => s.user_id === p.id || s.email?.toLowerCase() === p.email?.toLowerCase());
        const paid = mine.some((s) => s.gateway !== "manual");
        const approved = mine.some((s) => s.gateway === "manual");
        return {
          id: p.id,
          email: p.email,
          name: p.name,
          createdAt: p.created_at,
          situacao: paid ? "pago" : approved ? "aprovado" : "pendente",
        };
      }),
    });
  } catch (err) {
    return fail(err);
  }
}

const Body = z.object({ userId: z.string().uuid(), action: z.enum(["aprovar", "revogar"]) });

export async function POST(req: Request) {
  const c = await adminCtx();
  if (!c) return unauthorized();
  try {
    const { userId, action } = Body.parse(await req.json());
    const { data: profile } = await c.admin.from("profiles").select("email").eq("id", userId).maybeSingle();
    if (!profile) return json({ error: "Conta não encontrada" }, 404);

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
