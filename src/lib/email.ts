// Envio de e-mail plugável. Hoje: Resend (https://resend.com) via API HTTP.
// Sem RESEND_API_KEY, o e-mail é só registrado no log (útil para testar local).

export type EmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  /** Link de descadastro, enviado também no cabeçalho List-Unsubscribe. */
  unsubscribeUrl?: string;
  /** Para onde vai a resposta (padrão: suporte). */
  replyTo?: string;
};

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

export async function sendEmail(input: EmailInput): Promise<{ sent: boolean }> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "MediaFlowMZ <radar@mediaflowmz.com>";
  if (!key) {
    console.info(`[email:dev] para=${input.to} assunto="${input.subject}"\n${input.text}`);
    return { sent: false };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({
      from,
      to: Array.isArray(input.to) ? input.to : [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
      reply_to: input.replyTo ?? process.env.EMAIL_REPLY_TO ?? "suporte@mediaflowmz.com",
      headers: input.unsubscribeUrl
        ? {
            "List-Unsubscribe": `<${input.unsubscribeUrl}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          }
        : undefined,
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
  return { sent: true };
}

export const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Moldura simples para todos os e-mails da MediaFlowMZ. */
export function emailLayout(title: string, bodyHtml: string, footerHtml = "") {
  return `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#0f110d;font-family:Arial,Helvetica,sans-serif;color:#e9eee2">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" style="max-width:560px;background:#171a13;border-radius:16px;padding:28px">
<tr><td style="font-size:20px;font-weight:bold;color:#c6f36b;padding-bottom:16px">MediaFlowMZ</td></tr>
<tr><td style="font-size:18px;font-weight:bold;padding-bottom:12px">${escapeHtml(title)}</td></tr>
<tr><td style="font-size:15px;line-height:1.55">${bodyHtml}</td></tr>
<tr><td style="font-size:12px;color:#8b9282;padding-top:24px;line-height:1.5">${footerHtml}
A MediaFlowMZ é uma plataforma independente, sem vínculo com o TikTok.</td></tr>
</table></td></tr></table></body></html>`;
}
