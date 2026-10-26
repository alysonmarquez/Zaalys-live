import { getPayments } from "@/lib/payments";
import { createAdminClient } from "@/lib/supabase/server";
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

  const { error } = await admin.from("subscriptions").upsert(row, { onConflict: "gateway,gateway_ref" });
  if (error) {
    console.error("[webhook] erro ao gravar:", error);
    return new Response("retry", { status: 500 }); // o gateway tenta de novo
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
