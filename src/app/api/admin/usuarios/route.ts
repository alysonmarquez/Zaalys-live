import { z } from "zod";
import { fail, json, unauthorized } from "@/lib/http";
import { adminCtx, manualRef, validSub, type SubRow } from "@/lib/admin";
import { DEFAULT_COMMISSION_PCT } from "@/lib/referrals";

// Usuários e acessos (Admin). GET: contas + quem pagou e ainda não criou conta, com o acesso de cada um.
// POST: conceder acesso (vitalício ou mensal por N dias, com convite por e-mail opcional), revogar acesso
// manual, desconectar o aparelho da extensão e mudar a comissão.

const DAY = 86400_000;

type Profile = { id: string; email: string; name: string | null; created_at: string; ref_code: string | null; commission_pct: number | null };

export async function GET() {
  const c = await adminCtx();
  if (!c) return unauthorized();
  try {
    const [profiles, subs, licenses, sales] = await Promise.all([
      c.db.from("profiles").select("id, email, name, created_at, ref_code, commission_pct").order("created_at", { ascending: false }).limit(5000),
      c.db.from("subscriptions").select("*").limit(20000),
      c.db.from("licenses").select("user_id, device_id, device_label, activated_at").limit(10000),
      c.db.from("affiliate_sales").select("affiliate_id, status, payout_status, commission_cents").eq("status", "paid").limit(20000),
    ]);
    for (const r of [profiles, subs, licenses]) if (r.error) return fail(r.error);

    const byEmail = new Map<string, SubRow[]>();
    for (const s of (subs.data ?? []) as SubRow[]) {
      const k = s.email.toLowerCase();
      byEmail.set(k, [...(byEmail.get(k) ?? []), s]);
    }
    const lic = new Map((licenses.data ?? []).map((l) => [l.user_id as string, l]));
    const aff = new Map<string, { vendas: number; aRepassarCents: number }>();
    for (const s of sales.data ?? []) {
      if (!s.affiliate_id) continue;
      const t = aff.get(s.affiliate_id) ?? { vendas: 0, aRepassarCents: 0 };
      t.vendas++;
      if (s.payout_status === "a_receber") t.aRepassarCents += s.commission_cents;
      aff.set(s.affiliate_id, t);
    }

    const now = Date.now();
    const accessOf = (list: SubRow[]) => {
      const v = validSub(list, now);
      const last = [...list].sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at))[0];
      return {
        acesso: v ? (v.gateway === "manual" ? "manual" : "pago") : last && ["refunded", "canceled"].includes(last.status) ? "encerrado" : "sem",
        plano: v?.plan ?? null,
        expira: v?.expires_at ?? null,
        origem: v?.gateway ?? null,
        temManual: list.some((s) => s.gateway === "manual" && s.status === "active"),
        historico: list.map((s) => ({ plano: s.plan, status: s.status, origem: s.gateway, expira: s.expires_at, atualizado: s.updated_at })),
      };
    };

    const seen = new Set<string>();
    const rows = ((profiles.data ?? []) as Profile[]).map((p) => {
      const email = p.email.toLowerCase();
      seen.add(email);
      const l = lic.get(p.id);
      return {
        id: p.id,
        email,
        nome: p.name,
        criado: p.created_at,
        conta: true,
        codigo: p.ref_code,
        comissaoPct: p.commission_pct == null ? null : Number(p.commission_pct),
        aparelho: l?.device_id ? { nome: l.device_label || "Aparelho conectado", desde: l.activated_at } : null,
        afiliado: aff.get(p.id) ?? { vendas: 0, aRepassarCents: 0 },
        ...accessOf(byEmail.get(email) ?? []),
      };
    });
    // Compraram (ou receberam acesso) e ainda não criaram a conta: entram ao se cadastrar com o e-mail.
    for (const [email, list] of byEmail) {
      if (seen.has(email)) continue;
      rows.push({
        id: `email:${email}`,
        email,
        nome: null,
        criado: list.map((s) => s.created_at).sort()[0]!,
        conta: false,
        codigo: null,
        comissaoPct: null,
        aparelho: null,
        afiliado: { vendas: 0, aRepassarCents: 0 },
        ...accessOf(list),
      });
    }
    return json({ usuarios: rows, comissaoPadrao: DEFAULT_COMMISSION_PCT });
  } catch (err) {
    return fail(err);
  }
}

const Email = z.string().trim().toLowerCase().email();
const Body = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("conceder"),
    email: Email,
    plano: z.enum(["lifetime", "monthly"]),
    dias: z.number().int().min(1).max(3650).optional(),
    convidar: z.boolean().optional(),
  }),
  z.object({ action: z.literal("revogar"), email: Email }),
  z.object({ action: z.literal("liberar-aparelho"), userId: z.string().uuid() }),
  z.object({ action: z.literal("comissao"), userId: z.string().uuid(), pct: z.number().min(0).max(100).nullable() }),
]);

export async function POST(req: Request) {
  const c = await adminCtx();
  if (!c) return unauthorized();
  try {
    const parsed = Body.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return json({ error: "Dados inválidos: confira o e-mail e os campos." }, 400);
    const body = parsed.data;
    const nowIso = new Date().toISOString();

    if (body.action === "conceder") {
      const { data: profile } = await c.db.from("profiles").select("id").eq("email", body.email).maybeSingle();
      let expires: string | null = null;
      if (body.plano === "monthly") {
        // Mensal: soma os dias a partir do fim do acesso manual atual, se ainda estiver valendo.
        const { data: cur } = await c.db
          .from("subscriptions")
          .select("expires_at, status")
          .eq("gateway", "manual")
          .eq("gateway_ref", manualRef(body.email))
          .maybeSingle();
        const base = cur?.status === "active" && cur.expires_at && Date.parse(cur.expires_at) > Date.now() ? Date.parse(cur.expires_at) : Date.now();
        expires = new Date(base + (body.dias ?? 30) * DAY).toISOString();
      }
      const { error } = await c.db.from("subscriptions").upsert(
        {
          email: body.email,
          plan: body.plano,
          status: "active",
          gateway: "manual",
          gateway_ref: manualRef(body.email),
          expires_at: expires,
          updated_at: nowIso,
          ...(profile ? { user_id: profile.id } : {}),
        },
        { onConflict: "gateway,gateway_ref" },
      );
      if (error) return fail(error);

      let convite: "enviado" | "ja-tem-conta" | "falhou" | null = null;
      if (body.convidar) {
        if (profile) convite = "ja-tem-conta";
        else {
          const origin = new URL(req.url).origin;
          const { error: invErr } = await c.db.auth.admin.inviteUserByEmail(body.email, {
            redirectTo: `${origin}/auth/callback?next=/redefinir-senha`,
          });
          convite = invErr ? "falhou" : "enviado";
          if (invErr) console.error("[admin] convite:", invErr.message);
        }
      }
      return json({ ok: true, expira: expires, convite });
    }

    if (body.action === "revogar") {
      // Só acessos dados pelo admin (pagamentos continuam valendo; reembolso é pela Applyfy).
      const { data: profile } = await c.db.from("profiles").select("id").eq("email", body.email).maybeSingle();
      const cancel = () => c.db.from("subscriptions").update({ status: "canceled", updated_at: nowIso }).eq("gateway", "manual").eq("status", "active");
      const r1 = await cancel().eq("email", body.email);
      if (r1.error) return fail(r1.error);
      if (profile) {
        const r2 = await cancel().eq("user_id", profile.id);
        if (r2.error) return fail(r2.error);
      }
      return json({ ok: true });
    }

    if (body.action === "liberar-aparelho") {
      const { error } = await c.db
        .from("licenses")
        .update({ device_id: null, device_label: null, activated_at: null })
        .eq("user_id", body.userId);
      if (error) return fail(error);
      return json({ ok: true });
    }

    const { error } = await c.db.from("profiles").update({ commission_pct: body.pct }).eq("id", body.userId);
    if (error) return fail(error);
    return json({ ok: true });
  } catch (err) {
    return fail(err);
  }
}
