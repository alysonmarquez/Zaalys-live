import type { SupabaseClient } from "@supabase/supabase-js";
import type { PaymentEvent } from "@/lib/payments";
import { pick } from "@/lib/payments/applyfy";

// Indicações: cada conta tem um código fixo (profiles.ref_code). Os links /convite/<código> levam ao checkout
// com a marca "mfz_<código>"; quando a Applyfy avisa a venda, a marca (ou a sessão de checkout aberta por
// ela, ou o e-mail do comprador numa venda anterior) diz de qual afiliado é a comissão.

export const DEFAULT_COMMISSION_PCT = 40;
const MARK = "mfz_";
const PLAN_CENTS = { lifetime: 29700, monthly: 17000 } as const; // ofertas com desconto dos convites

const clean = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 20);

/** Código a partir do caminho do convite: "creator-ana-3x" → "ana"; "ANA30" (Indique) → "ana30". */
export function refFromInvite(code: string) {
  return clean(code.replace(/^creator-/i, "").replace(/-\d+x$/i, ""));
}

/** Marca que vai no link do checkout e volta no postback. */
export const refMark = (ref: string) => `${MARK}${ref}`;

/** Procura a marca em qualquer texto do postback (URL do checkout, src, utm, metadados). */
export function findRefMark(raw: unknown): string | null {
  const seen = new Set<unknown>();
  const walk = (v: unknown, depth: number): string | null => {
    if (depth > 8 || v == null || seen.has(v)) return null;
    if (typeof v === "string") {
      let text = v;
      try {
        text = decodeURIComponent(v);
      } catch {}
      const m = text.match(/mfz_([a-z0-9]{2,20})/i);
      return m ? m[1]!.toLowerCase() : null;
    }
    if (typeof v !== "object") return null;
    seen.add(v);
    for (const x of Array.isArray(v) ? v : Object.values(v as Record<string, unknown>)) {
      const r = walk(x, depth + 1);
      if (r) return r;
    }
    return null;
  };
  try {
    return walk(raw, 0);
  } catch {
    return null;
  }
}

/** Devolve (e cria na primeira vez) o código da conta. */
export async function ensureRefCode(admin: SupabaseClient, userId: string, handle: string): Promise<string> {
  const { data } = await admin.from("profiles").select("ref_code").eq("id", userId).maybeSingle();
  if (data?.ref_code) return data.ref_code as string;
  const base = clean(handle) || "creator";
  for (let i = 0; i < 30; i++) {
    const code = i === 0 ? base : i < 20 ? `${base.slice(0, 18)}${i + 1}` : `${base.slice(0, 14)}${Math.random().toString(36).slice(2, 8)}`;
    const { error } = await admin.from("profiles").update({ ref_code: code }).eq("id", userId).is("ref_code", null);
    if (!error) {
      const { data: again } = await admin.from("profiles").select("ref_code").eq("id", userId).maybeSingle();
      if (again?.ref_code) return again.ref_code as string;
    } else if (error.code !== "23505") {
      throw error;
    }
  }
  throw new Error("Não foi possível criar o código de indicação");
}

const sessionOf = (raw: unknown) =>
  pick(raw, ["checkoutSessionGuid", "data.checkoutSessionGuid", "data.sessionGuid", "sessionGuid", "data.session.id"]);

/** Checkout aberto por um link de afiliado: guarda a sessão (e o e-mail, se já veio) para a venda que vier depois. */
export async function rememberCheckout(admin: SupabaseClient, raw: unknown) {
  const ref = findRefMark(raw);
  const session = sessionOf(raw);
  if (!ref || !session) return;
  const email = pick(raw, ["data.client.email", "data.customer.email", "client.email", "customer.email", "email"])?.toLowerCase();
  await admin
    .from("checkout_refs")
    .upsert({ session_guid: session, ref_code: ref, ...(email ? { buyer_email: email } : {}) }, { onConflict: "session_guid" });
}

const SALE_STATUS: Record<PaymentEvent["status"], "pending" | "paid" | "canceled" | "refunded"> = {
  active: "paid",
  refunded: "refunded",
  canceled: "canceled",
  past_due: "pending",
  pending: "pending",
};

/** Venda notificada: grava (ou atualiza) a comissão do afiliado que indicou, se houver. */
export async function attributeSale(admin: SupabaseClient, event: PaymentEvent) {
  const raw = event.raw;
  // Cada cobrança é uma comissão (renovações do mensal também).
  const saleRef = pick(raw, ["data.orderId", "orderId", "data.transaction.id", "data.transactionId", "transactionId", "data.id", "id"]) || event.ref;

  // 1) marca no próprio postback; 2) sessão aberta pelo link; 3) e-mail numa sessão do link;
  // 4) venda anterior do mesmo comprador (renovação, reembolso).
  let ref = findRefMark(raw);
  const session = sessionOf(raw);
  if (!ref && session) {
    const { data } = await admin.from("checkout_refs").select("ref_code").eq("session_guid", session).maybeSingle();
    ref = (data?.ref_code as string | undefined) ?? null;
  }
  if (!ref) {
    const since = new Date(Date.now() - 30 * 86400_000).toISOString();
    const { data } = await admin
      .from("checkout_refs")
      .select("ref_code")
      .eq("buyer_email", event.email)
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(1);
    ref = (data?.[0]?.ref_code as string | undefined) ?? null;
  }
  if (!ref) {
    const { data } = await admin
      .from("affiliate_sales")
      .select("ref_code")
      .eq("gateway", event.gateway)
      .eq("buyer_email", event.email)
      .order("created_at", { ascending: false })
      .limit(1);
    ref = (data?.[0]?.ref_code as string | undefined) ?? null;
  }
  if (!ref) return null;

  // applyfy_email pode não existir em bancos sem a migração de saques: tenta com e sem.
  let { data: affiliate } = await admin.from("profiles").select("id, email, commission_pct, applyfy_email").eq("ref_code", ref).maybeSingle();
  if (!affiliate) ({ data: affiliate } = await admin.from("profiles").select("id, email, commission_pct").eq("ref_code", ref).maybeSingle());
  if (!affiliate) return null;
  // Quem compra pelo próprio link não ganha comissão.
  if (String(affiliate.email).toLowerCase() === event.email) return null;

  const pct = affiliate.commission_pct != null ? Number(affiliate.commission_pct) : DEFAULT_COMMISSION_PCT;
  const amount = event.amountCents ?? PLAN_CENTS[event.plan];
  const status = SALE_STATUS[event.status];
  const row = {
    affiliate_id: affiliate.id,
    ref_code: ref,
    gateway: event.gateway,
    gateway_ref: saleRef,
    buyer_email: event.email,
    buyer_name: pick(raw, ["data.client.name", "data.customer.name", "client.name", "customer.name", "buyer.name"]) ?? null,
    plan: event.plan,
    method: pick(raw, ["data.paymentMethod", "paymentMethod", "data.payment.method", "data.method", "payment_method", "method"])?.toUpperCase() ?? null,
    amount_cents: amount,
    commission_pct: pct,
    commission_cents: Math.round((amount * pct) / 100),
    status,
    updated_at: new Date().toISOString(),
  };
  // Vitalício com o afiliado cadastrado na Applyfy: a comissão sai no split, direto para ele.
  // Mensal (a Applyfy não divide recorrência) ou sem cadastro: o admin repassa.
  const split = event.plan === "lifetime" && Boolean((affiliate as { applyfy_email?: string | null }).applyfy_email);
  // payout_status fica como está (o admin marca "repassada").
  let { error } = await admin.from("affiliate_sales").upsert({ ...row, split }, { onConflict: "gateway,gateway_ref" });
  if (error?.code === "PGRST204" || error?.code === "42703") ({ error } = await admin.from("affiliate_sales").upsert(row, { onConflict: "gateway,gateway_ref" }));
  if (error) throw error;
  return row;
}
