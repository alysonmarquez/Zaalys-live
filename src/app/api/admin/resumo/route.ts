import { fail, json, unauthorized } from "@/lib/http";
import { adminCtx, validSub, type SubRow } from "@/lib/admin";

// Visão geral do Admin: números reais do banco (contas, acessos, receita, comissões, suporte, lives).
const DAY = 86400_000;

/** Evento de pagamento confirmado / estornado, pelo nome gravado no webhook ("applyfy.<status>"). */
const isPaid = (e: string) => /paid|pago|aprov|approv|complet|success|active|ativ|renew/i.test(e) && !/refund|reembols|chargeback|estorn/i.test(e);
const isRefund = (e: string) => /refund|reembols|chargeback|estorn/i.test(e);

export async function GET() {
  const c = await adminCtx();
  if (!c) return unauthorized();
  try {
    const now = Date.now();
    const since30 = new Date(now - 30 * DAY).toISOString();
    const [profiles, subs, payments, sales, tickets, lives, saques] = await Promise.all([
      c.db.from("profiles").select("id, email, created_at").limit(10000),
      c.db.from("subscriptions").select("*").limit(20000),
      c.db.from("payments").select("event, amount_cents, received_at").gte("received_at", new Date(now - 365 * DAY).toISOString()).limit(20000),
      c.db.from("affiliate_sales").select("status, payout_status, commission_cents, amount_cents, created_at").limit(20000),
      c.db.from("support_tickets").select("status").limit(5000),
      c.db.from("live_sessions").select("status, started_at").gte("started_at", since30).limit(20000),
      c.db.from("payout_requests").select("amount_cents").eq("status", "pending").limit(5000),
    ]);
    for (const r of [profiles, subs, payments]) if (r.error) return fail(r.error);

    const allSubs = (subs.data ?? []) as SubRow[];
    // Acesso de cada conta: a assinatura válida pelo user_id ou pelo e-mail.
    const byEmail = new Map<string, SubRow[]>();
    for (const s of allSubs) {
      const k = s.email.toLowerCase();
      byEmail.set(k, [...(byEmail.get(k) ?? []), s]);
    }
    const acessos = { vitalicio: 0, mensal: 0, manual: 0, sem: 0 };
    for (const p of profiles.data ?? []) {
      const v = validSub(byEmail.get(String(p.email).toLowerCase()) ?? [], now);
      if (!v) acessos.sem++;
      else if (v.gateway === "manual") acessos.manual++;
      else if (v.plan === "lifetime") acessos.vitalicio++;
      else acessos.mensal++;
    }
    // Pagaram mas ainda não criaram conta.
    const contas = new Set((profiles.data ?? []).map((p) => String(p.email).toLowerCase()));
    const semConta = [...byEmail.entries()].filter(([email, list]) => !contas.has(email) && validSub(list, now)).length;

    const pays = payments.data ?? [];
    const sum = (from: number, f: (e: string) => boolean) =>
      pays.filter((p) => Date.parse(p.received_at) >= from && f(p.event)).reduce((a, p) => a + (p.amount_cents ?? 0), 0);
    const inicioMes = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    const vendas = sales.data ?? [];
    const lv = lives.data ?? [];
    return json({
      contas: {
        total: profiles.data?.length ?? 0,
        ultimos7: (profiles.data ?? []).filter((p) => Date.parse(p.created_at) >= now - 7 * DAY).length,
        ultimos30: (profiles.data ?? []).filter((p) => Date.parse(p.created_at) >= now - 30 * DAY).length,
      },
      acessos: { ...acessos, pagosSemConta: semConta },
      receita: {
        mesCents: sum(inicioMes.getTime(), isPaid),
        dias30Cents: sum(now - 30 * DAY, isPaid),
        estornos30Cents: sum(now - 30 * DAY, isRefund),
        vendas30: pays.filter((p) => Date.parse(p.received_at) >= now - 30 * DAY && isPaid(p.event)).length,
      },
      afiliados: {
        vendas: vendas.filter((s) => s.status === "paid").length,
        aRepassarCents: vendas.filter((s) => s.status === "paid" && s.payout_status === "a_receber").reduce((a, s) => a + s.commission_cents, 0),
        repassadoCents: vendas.filter((s) => s.status === "paid" && s.payout_status === "repassada").reduce((a, s) => a + s.commission_cents, 0),
      },
      suporte: { abertos: (tickets.data ?? []).filter((t) => t.status === "open").length },
      saques: { pendentes: saques.data?.length ?? 0, valorCents: (saques.data ?? []).reduce((a, r) => a + (r.amount_cents ?? 0), 0) },
      lives: { dias30: lv.length, noAr: lv.filter((l) => l.status === "running").length },
    });
  } catch (err) {
    return fail(err);
  }
}
