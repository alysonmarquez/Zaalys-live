import { getPayments } from "@/lib/payments";
import { createAdminClient } from "@/lib/supabase/server";

// Recebe notificações do gateway e libera/revoga o acesso.
export async function POST(req: Request) {
  const provider = getPayments();
  let event;
  try {
    event = await provider.handleWebhook(req);
  } catch (err) {
    console.error("[webhook] rejeitado:", (err as Error).message);
    return new Response("invalid", { status: 401 });
  }
  if (!event) return new Response("ignored", { status: 200 });

  const admin = createAdminClient();
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

  return new Response("ok", { status: 200 });
}
