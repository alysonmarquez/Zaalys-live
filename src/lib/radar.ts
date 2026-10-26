import { createAdminClient } from "@/lib/supabase/server";
import { emailLayout, escapeHtml } from "@/lib/email";
import { formatBRL } from "@/lib/pricing";

export function isSupabaseServerConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  return url.startsWith("http") && !url.includes("SEU-PROJETO") && key.length > 20;
}

export const appUrl = (req?: Request) =>
  (process.env.NEXT_PUBLIC_APP_URL ?? (req ? new URL(req.url).origin : "http://localhost:3000")).replace(/\/$/, "");

export function confirmEmail(base: string, token: string) {
  const link = `${base}/api/radar/confirm?token=${token}`;
  return {
    subject: "Confirme seu e-mail para receber o Radar",
    text: `Falta um clique: confirme seu e-mail para receber o Radar da MediaFlowMZ toda segunda.\n\n${link}\n\nSe não foi você, ignore esta mensagem.`,
    html: emailLayout(
      "Falta um clique",
      `<p>Confirme seu e-mail para receber, toda segunda, os produtos do TikTok Shop que mais pagam por venda.</p>
<p style="padding:12px 0"><a href="${link}" style="background:#c6f36b;color:#11140c;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:bold">Confirmar e-mail</a></p>
<p style="color:#8b9282;font-size:13px">Se não foi você, é só ignorar.</p>`,
    ),
  };
}

type Top = { name: string; niche: string; price_cents: number; commission_pct: number };
type Change = {
  name: string;
  old_price_cents: number;
  new_price_cents: number;
  old_commission_pct: number;
  new_commission_pct: number;
};

/** Monta o conteúdo da semana a partir do catálogo (maior valor por venda + mudanças). */
export async function buildWeeklyRadar() {
  const admin = createAdminClient();
  const { data: products } = await admin
    .from("products")
    .select("name, niche, price_cents, commission_pct")
    .eq("active", true)
    .limit(500);
  const top = ((products ?? []) as Top[])
    .map((p) => ({ ...p, perSale: Math.round((p.price_cents * Number(p.commission_pct)) / 100) }))
    .sort((a, b) => b.perSale - a.perSale)
    .slice(0, 10);
  const { data: changes } = await admin.from("product_changes").select("*").limit(5);
  return { top, changes: (changes ?? []) as Change[] };
}

export function weeklyEmail(base: string, token: string, radar: Awaited<ReturnType<typeof buildWeeklyRadar>>) {
  const unsubscribeUrl = `${base}/api/radar/unsubscribe?token=${token}`;
  const [highlight] = radar.top;
  const rows = radar.top
    .map(
      (p, i) =>
        `<tr><td style="padding:6px 0;color:#8b9282">${i + 1}.</td><td style="padding:6px 8px">${escapeHtml(p.name)}<br><span style="color:#8b9282;font-size:12px">${escapeHtml(p.niche)} · ${formatBRL(p.price_cents)} · ${Number(p.commission_pct)}%</span></td><td style="padding:6px 0;text-align:right;font-weight:bold;color:#c6f36b">${formatBRL(p.perSale)}</td></tr>`,
    )
    .join("");
  const changesHtml = radar.changes.length
    ? `<p style="padding-top:16px;font-weight:bold">Mudou desde a última leitura</p><ul style="padding-left:18px">${radar.changes
        .map(
          (c) =>
            `<li>${escapeHtml(c.name)}: comissão ${Number(c.old_commission_pct)}% → ${Number(c.new_commission_pct)}%, preço ${formatBRL(c.old_price_cents)} → ${formatBRL(c.new_price_cents)}</li>`,
        )
        .join("")}</ul>`
    : "";
  const text = [
    "Radar da semana — os produtos que mais pagam por venda",
    highlight ? `Destaque: ${highlight.name} (${formatBRL(highlight.perSale)} por venda)` : "",
    ...radar.top.map((p, i) => `${i + 1}. ${p.name} — ${formatBRL(p.price_cents)}, ${Number(p.commission_pct)}% = ${formatBRL(p.perSale)}`),
    "",
    `Sair da lista: ${unsubscribeUrl}`,
  ].join("\n");
  return {
    subject: highlight
      ? `Radar: ${highlight.name} paga ${formatBRL(highlight.perSale)} por venda`
      : "Radar da semana",
    text,
    unsubscribeUrl,
    html: emailLayout(
      "Radar da semana",
      `${highlight ? `<p>Destaque da semana: <strong>${escapeHtml(highlight.name)}</strong>, ${formatBRL(highlight.perSale)} por venda.</p>` : ""}
<table role="presentation" width="100%" style="font-size:14px;border-collapse:collapse">${rows}</table>
${changesHtml}
<p style="padding-top:16px"><a href="${base}/#acesso" style="color:#c6f36b">Ver o catálogo completo na MediaFlowMZ</a></p>`,
      `Você recebe porque pediu o Radar. <a href="${unsubscribeUrl}" style="color:#8b9282">Sair da lista com um clique</a>.<br>`,
    ),
  };
}
