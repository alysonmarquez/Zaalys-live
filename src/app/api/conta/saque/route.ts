import { apiAccess, adminEmails } from "@/lib/access";
import { emailLayout, escapeHtml, sendEmail } from "@/lib/email";
import { fail, json, unauthorized } from "@/lib/http";
import { availableSales } from "@/lib/payouts";
import { createAdminClient } from "@/lib/supabase/server";
import { formatBRL } from "@/lib/zaalys-data";

// Pedido de saque do afiliado: junta as comissões que o admin repassa e ainda não foram pedidas.
// O admin paga no Pix e marca como pago no Admin → Saques.
const MIN_CENTS = 1000;

export async function POST() {
  const access = await apiAccess();
  if (!access) return unauthorized();
  if (access.demo) return json({ error: "Saque indisponível no modo demonstração." }, 400);
  try {
    const db = createAdminClient();
    const { data: profile } = await db.from("profiles").select("pix_type, pix_key").eq("id", access.userId).maybeSingle();
    if (!profile?.pix_key || !profile.pix_type) return json({ error: "Cadastre sua chave Pix antes de pedir o saque." }, 400);
    const { list, totalCents } = await availableSales(db, access.userId);
    if (totalCents < MIN_CENTS) return json({ error: `O saque mínimo é ${formatBRL(MIN_CENTS)}. Seu saldo disponível é ${formatBRL(totalCents)}.` }, 400);
    const { data, error } = await db
      .from("payout_requests")
      .insert({ user_id: access.userId, amount_cents: totalCents, pix_type: profile.pix_type, pix_key: profile.pix_key, sale_ids: list.map((s) => s.id) })
      .select("id")
      .single();
    if (error) throw error;
    await sendEmail({
      to: adminEmails(),
      subject: `[Saque] ${formatBRL(totalCents)} — ${access.email}`,
      text: `${access.email} pediu saque de ${formatBRL(totalCents)} (${list.length} comissões).\nPix (${profile.pix_type}): ${profile.pix_key}\nAprove em Admin → Saques.`,
      html: emailLayout(
        "Novo pedido de saque",
        `<p><strong>${escapeHtml(access.email)}</strong> pediu <strong>${formatBRL(totalCents)}</strong> (${list.length} comissões).</p><p>Pix (${escapeHtml(profile.pix_type)}): ${escapeHtml(profile.pix_key)}</p><p>Pague e marque como pago em Admin → Saques.</p>`,
      ),
    }).catch(() => {});
    return json({ ok: true, id: data.id, amountCents: totalCents });
  } catch (err) {
    return fail(err);
  }
}
