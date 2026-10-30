import { getPayments } from "@/lib/payments";
import { createAdminClient } from "@/lib/supabase/server";
import { sendPurchaseAccess } from "@/lib/invite-email";
import { AVULSO_PREFIX } from "@/lib/payments/applyfy";
import { attributeSale, rememberCheckout } from "@/lib/referrals";

// Recebe notificações do gateway e libera/revoga o acesso.
export async function POST(req: Request) {
  const provider = getPayments();
  const copy = req.clone();
  let event;
  try {
    event = await provider.handleWebhook(req);
  } catch (err) {
    console.error("[webhook] rejeitado:", (err as Error).message);
    return new Response("invalid", { status: 401 });
  }
  const admin = createAdminClient();
  // Checkout aberto por link de afiliado: guarda a sessão para atribuir a venda depois.
  try {
    const raw = event?.raw ?? (await copy.json().catch(() => null));
    if (raw) await rememberCheckout(admin, raw);
  } catch (err) {
    console.error("[webhook] indicação (sessão):", err);
  }
  if (!event) return new Response("ignored", { status: 200 });

  await admin.from("payments").insert({
    gateway: event.gateway,
    event: event.eventName,
    amount_cents: event.amountCents ?? null,
    payload: event.raw as object,
  });

  // Se a pessoa já tem conta com esse e-mail, já vincula.
  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .eq("email", event.email)
    .maybeSingle();

  const row: Record<string, unknown> = {
    gateway: event.gateway,
    gateway_ref: event.ref,
    email: event.email,
    plan: event.plan,
    status: event.status,
    updated_at: new Date().toISOString(),
    ...(profile ? { user_id: profile.id } : {}),
  };
  // Só mexe na validade quando o evento traz uma (não encurta acesso já pago).
  if (event.expiresAt) row.expires_at = event.expiresAt;

  // Situação anterior: o e-mail de acesso sai só quando a assinatura passa a ativa (não em aviso repetido nem renovação).
  const { data: before } = await admin
    .from("subscriptions")
    .select("status")
    .eq("gateway", event.gateway)
    .eq("gateway_ref", event.ref)
    .maybeSingle();

  // Mensal cobrado mês a mês: soma 30 dias ao que ainda resta, e aviso repetido não soma de novo.
  if (event.ref.startsWith(AVULSO_PREFIX) && event.status === "active") {
    if (before?.status === "active") delete row.expires_at;
    else {
      const { data: last } = await admin
        .from("subscriptions")
        .select("expires_at")
        .eq("email", event.email)
        .eq("status", "active")
        .eq("plan", "monthly")
        .order("expires_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      const base = Math.max(Date.now(), last?.expires_at ? Date.parse(last.expires_at) : 0);
      row.expires_at = new Date(base + 30 * 86400_000).toISOString();
    }
  }

  const { error } = await admin.from("subscriptions").upsert(row, { onConflict: "gateway,gateway_ref" });
  if (error) {
    console.error("[webhook] erro ao gravar:", error);
    return new Response("retry", { status: 500 }); // o gateway tenta de novo
  }

  // E-mail com o caminho para entrar (não bloqueia a liberação do acesso).
  if (event.status === "active" && before?.status !== "active") {
    try {
      const origin = (process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin).replace(/\/$/, "");
      const sent = await sendPurchaseAccess(admin, event.email, origin);
      if (!sent) console.error("[webhook] e-mail de acesso não enviado:", event.ref);
    } catch (err) {
      console.error("[webhook] e-mail de acesso:", err);
    }
  }

  // Comissão do afiliado que indicou (não bloqueia a liberação do acesso).
  try {
    const sale = await attributeSale(admin, event);
    if (sale) console.info("[webhook] venda atribuída a", sale.ref_code, sale.status, sale.commission_cents);
  } catch (err) {
    console.error("[webhook] indicação (venda):", err);
  }

  return new Response("ok", { status: 200 });
}
