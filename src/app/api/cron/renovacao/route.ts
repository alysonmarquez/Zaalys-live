import { NextResponse } from "next/server";
import { emailLayout, sendEmail } from "@/lib/email";
import { AVULSO_PREFIX } from "@/lib/payments/applyfy";
import { appUrl } from "@/lib/radar";
import { createAdminClient } from "@/lib/supabase/server";

export const maxDuration = 300;

const DAY = 86400_000;

// Mensal cobrado mês a mês: a Vercel chama uma vez por dia (vercel.json) com "Authorization: Bearer $CRON_SECRET" e o
// cliente recebe o link para pagar o próximo mês 3 dias antes do vencimento e no dia em que o acesso venceu.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const admin = createAdminClient();
  const now = Date.now();
  const { data: subs, error } = await admin
    .from("subscriptions")
    .select("email, plan, expires_at, gateway_ref")
    .eq("status", "active")
    .gte("expires_at", new Date(now - DAY).toISOString());
  if (error) return NextResponse.json({ error: "db" }, { status: 500 });
  const { data: lifetime } = await admin.from("subscriptions").select("email").eq("status", "active").eq("plan", "lifetime");
  const hasLifetime = new Set((lifetime ?? []).map((s) => String(s.email)));

  // Vale a data mais distante de cada e-mail: quem já renovou, ou também tem acesso de outro tipo, não recebe.
  const last = new Map<string, { at: number; avulso: boolean }>();
  for (const s of subs ?? []) {
    const at = Date.parse(s.expires_at as string);
    const cur = last.get(s.email as string);
    if (!cur || at > cur.at) last.set(s.email as string, { at, avulso: String(s.gateway_ref).startsWith(AVULSO_PREFIX) });
  }

  const base = appUrl(req);
  let sent = 0;
  let failed = 0;
  for (const [email, { at, avulso }] of last) {
    if (!avulso || hasLifetime.has(email)) continue;
    const left = at - now;
    const venceu = left <= 0;
    if (!venceu && !(left > 2 * DAY && left <= 3 * DAY)) continue;
    const { data: sale } = await admin
      .from("affiliate_sales")
      .select("ref_code")
      .eq("buyer_email", email)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const link = `${base}/checkout/vitalicio?plan=monthly&email=${encodeURIComponent(email)}${sale?.ref_code ? `&convite=${encodeURIComponent(sale.ref_code as string)}` : ""}`;
    const title = venceu ? "Seu acesso venceu" : "Seu acesso vence em 3 dias";
    const text = venceu ? "O seu mês de acesso à MediaFlowMZ terminou. Renove para voltar a usar." : "Renove agora: os 30 dias novos somam ao que ainda resta.";
    try {
      const { sent: ok } = await sendEmail({
        to: email,
        subject: `${title} · MediaFlowMZ`,
        text: `${text}\n\nRenovar: ${link}`,
        html: emailLayout(
          title,
          `<p>${text}</p><p style="padding:8px 0"><a href="${link}" style="display:inline-block;padding:12px 20px;border-radius:12px;background:#b6f36a;color:#111;font-weight:600;text-decoration:none">Renovar meu acesso</a></p>`,
        ),
      });
      if (ok) sent++;
      else failed++;
    } catch (err) {
      failed++;
      console.error("[renovacao] envio:", err);
    }
  }
  return NextResponse.json({ ok: true, sent, failed });
}
