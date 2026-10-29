import type { SupabaseClient } from "@supabase/supabase-js";
import { isEmailConfigured, sendEmail } from "@/lib/email";

/**
 * Convite de quem teve o acesso liberado pelo admin. Com RESEND_API_KEY, o e-mail sai daqui com um link direto para
 * /definir-senha?token_hash=… (não depende das Redirect URLs nem do Site URL do Supabase). Sem ele, usa o e-mail do
 * próprio Supabase, voltando para /definir-senha (essa URL precisa estar nas Redirect URLs do projeto).
 * `existing`: a conta já existe mas nunca entrou (convite antigo): manda um link de "criar senha" (recovery).
 */
export async function sendInvite(db: SupabaseClient, email: string, origin: string, existing = false): Promise<boolean> {
  const redirectTo = `${origin}/definir-senha`;
  const type = existing ? "recovery" : "invite";
  if (isEmailConfigured()) {
    const { data, error } = await db.auth.admin.generateLink({ type, email, options: { redirectTo } });
    const hashed = data?.properties?.hashed_token;
    if (!error && hashed) {
      const link = `${redirectTo}?token_hash=${encodeURIComponent(hashed)}&type=${type}`;
      const { sent } = await sendEmail({
        to: email,
        subject: "Seu acesso à MediaFlowMZ foi liberado",
        text: `Seu acesso à MediaFlowMZ foi liberado.\n\nCrie sua senha para entrar: ${link}\n\nSe você não esperava este e-mail, pode ignorá-lo.`,
        html: `<p>Seu acesso à <strong>MediaFlowMZ</strong> foi liberado.</p><p><a href="${link}" style="display:inline-block;padding:12px 20px;border-radius:12px;background:#b6f36a;color:#111;font-weight:600;text-decoration:none">Criar minha senha</a></p><p style="color:#666;font-size:13px">Se o botão não abrir, copie este link: ${link}</p><p style="color:#666;font-size:13px">Se você não esperava este e-mail, pode ignorá-lo.</p>`,
      });
      if (sent) return true;
    }
    if (error) console.error("[convite] link:", error.message);
  }
  const { error } = existing
    ? await db.auth.resetPasswordForEmail(email, { redirectTo })
    : await db.auth.admin.inviteUserByEmail(email, { redirectTo });
  if (error) console.error("[convite] supabase:", error.message);
  return !error;
}
