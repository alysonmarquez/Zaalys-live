import type { SupabaseClient } from "@supabase/supabase-js";
import { emailLayout, isEmailConfigured, sendEmail } from "@/lib/email";

const button = (href: string, label: string) =>
  `<p style="padding:8px 0"><a href="${href}" style="display:inline-block;padding:12px 20px;border-radius:12px;background:#b6f36a;color:#111;font-weight:600;text-decoration:none">${label}</a></p>`;

/**
 * Link de uso único para criar a senha, que o admin pode mandar por qualquer canal (não depende de e-mail). Gerar outro
 * invalida o anterior, então o mesmo link é o que vai por e-mail e na tela do admin.
 */
export async function createAccessLink(db: SupabaseClient, email: string, origin: string, existing = false): Promise<string | null> {
  const type = existing ? "recovery" : "invite";
  const redirectTo = `${origin}/definir-senha`;
  const { data, error } = await db.auth.admin.generateLink({ type, email, options: { redirectTo } });
  // A conta existe sem perfil (ou foi criada por outro caminho): o convite não serve, vai o link de criar senha.
  if (error && !existing && /already|registered|exists/i.test(error.message)) return createAccessLink(db, email, origin, true);
  const hashed = data?.properties?.hashed_token;
  if (error || !hashed) {
    console.error("[convite] link:", error?.message ?? "sem token");
    return null;
  }
  return `${redirectTo}?token_hash=${encodeURIComponent(hashed)}&type=${type}`;
}

/** Envia por e-mail um link já gerado (com RESEND_API_KEY). */
export async function sendAccessLink(email: string, link: string): Promise<boolean> {
  const { sent } = await sendEmail({
    to: email,
    subject: "Seu acesso à MediaFlowMZ foi liberado",
    text: `Seu acesso à MediaFlowMZ foi liberado.\n\nCrie sua senha para entrar: ${link}\n\nDepois, entre sempre com este e-mail e a senha criada.\n\nSe você não esperava este e-mail, pode ignorá-lo.`,
    html: emailLayout(
      "Seu acesso foi liberado",
      `<p>Falta só criar a sua senha para entrar na <strong>MediaFlowMZ</strong>.</p>${button(link, "Criar minha senha")}<p style="color:#8b9282;font-size:13px">Depois, entre sempre com este e-mail e a senha criada. Se o botão não abrir, copie este link: ${link}</p><p style="color:#8b9282;font-size:13px">Se você não esperava este e-mail, pode ignorá-lo.</p>`,
    ),
  }).catch((err) => {
    console.error("[convite] envio:", (err as Error).message);
    return { sent: false };
  });
  return sent;
}

/**
 * Convite de quem teve o acesso liberado pelo admin ou comprou. Com RESEND_API_KEY, o e-mail sai daqui com um link direto para
 * /definir-senha?token_hash=… (não depende das Redirect URLs nem do Site URL do Supabase). Sem ele, usa o e-mail do
 * próprio Supabase, voltando para /definir-senha (essa URL precisa estar nas Redirect URLs do projeto).
 * `existing`: a conta já existe mas nunca entrou (convite antigo): manda um link de "criar senha" (recovery).
 */
export async function sendInvite(db: SupabaseClient, email: string, origin: string, existing = false): Promise<boolean> {
  const redirectTo = `${origin}/definir-senha`;
  if (isEmailConfigured()) {
    const link = await createAccessLink(db, email, origin, existing);
    if (link && (await sendAccessLink(email, link))) return true;
  }
  const { error } = existing
    ? await db.auth.resetPasswordForEmail(email, { redirectTo })
    : await db.auth.admin.inviteUserByEmail(email, { redirectTo });
  if (error) console.error("[convite] supabase:", error.message);
  return !error;
}

/** Pagamento aprovado: quem já entrou alguma vez recebe o aviso para entrar; os demais, o link para criar a senha. */
export async function sendPurchaseAccess(db: SupabaseClient, email: string, origin: string): Promise<boolean> {
  const { data: profile } = await db.from("profiles").select("id").eq("email", email).maybeSingle();
  const { data: authUser } = profile ? await db.auth.admin.getUserById(profile.id) : { data: null };
  if (!authUser?.user?.last_sign_in_at) return sendInvite(db, email, origin, Boolean(profile));
  const link = `${origin}/login?mode=signin&email=${encodeURIComponent(email)}`;
  const { sent } = await sendEmail({
    to: email,
    subject: "Seu acesso à MediaFlowMZ foi liberado",
    text: `Pagamento aprovado! Seu acesso à MediaFlowMZ já está liberado.\n\nEntre com este e-mail e a sua senha: ${link}\n\nEsqueceu a senha? Use "Esqueci minha senha" na tela de entrada.`,
    html: emailLayout(
      "Pagamento aprovado",
      `<p>Seu acesso à <strong>MediaFlowMZ</strong> já está liberado. Entre com este e-mail e a sua senha.</p>${button(link, "Entrar agora")}<p style="color:#8b9282;font-size:13px">Esqueceu a senha? Use “Esqueci minha senha” na tela de entrada.</p>`,
    ),
  });
  return sent;
}
