import { cache } from "react";
import { redirect } from "next/navigation";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export type Access = {
  userId: string;
  email: string;
  name?: string;
  handle?: string;
  /** true só com assinatura ativa (vitalício, ou mensal dentro do prazo). */
  active: boolean;
  plan: "monthly" | "lifetime" | null;
  expiresAt: string | null;
  demo?: boolean;
  /** Conta de demonstração (vitrine): só ela vê os dados de exemplo e as ferramentas de demonstração. */
  showcase?: boolean;
  /** Pode aprovar afiliados (página Aprovar afiliados). */
  admin?: boolean;
  /** Pode abrir o Estúdio de LIVE: quem aprova afiliados, contas de demonstração e afiliados aprovados pela Nat. */
  studio?: boolean;
};

/**
 * Contas de demonstração. Só elas veem os números de exemplo (dashboard, vendas ao vivo, Estúdio de LIVE,
 * comissões) e as opções de demonstração; as demais veem só o próprio faturamento.
 * SHOWCASE_EMAILS (separados por vírgula) substitui a lista.
 */
const SHOWCASE_EMAILS = (process.env.SHOWCASE_EMAILS || "nathalyahoff@gmail.com")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const isShowcaseEmail = (email: string) => SHOWCASE_EMAILS.includes(email.trim().toLowerCase());

/** Administradores (página Admin e aprovação de afiliados). ADMIN_EMAILS (separados por vírgula) substitui a lista. */
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "allypda@gmail.com,nathalyahoff@gmail.com")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const isAdminEmail = (email: string) => ADMIN_EMAILS.includes(email.trim().toLowerCase());
export const adminEmails = () => [...ADMIN_EMAILS];

export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return url.startsWith("http") && !url.includes("SEU-PROJETO") && !url.includes("placeholder") && key.length > 20;
}

/**
 * Modo demonstração: painel com usuário fictício, sem login.
 * Só liga sem Supabase configurado E fora de produção (ou com ZAALYS_DEMO_MODE=true explícito).
 */
export function isDemoMode() {
  if (isSupabaseConfigured()) return false;
  const flag = (process.env.ZAALYS_DEMO_MODE || "").trim().toLowerCase();
  return process.env.NODE_ENV !== "production" || flag === "true" || flag === "1";
}

const DEMO: Access = {
  userId: "00000000-0000-0000-0000-000000000000",
  email: "criador@mediaflowmz.com",
  name: "Criador MediaFlowMZ",
  handle: "criador",
  active: true,
  plan: "lifetime",
  expiresAt: null,
  demo: true,
  // Sem banco (desenvolvimento local), o usuário fictício também mostra os dados de exemplo.
  showcase: true,
  // e vê a página Admin (as APIs de admin exigem banco: sem ele respondem 401).
  admin: true,
  studio: true,
};

const handleOf = (email: string) =>
  email.split("@")[0]?.toLowerCase().replace(/[^a-z0-9._-]/g, "") || "criador";

/**
 * Lê a sessão do Supabase e a assinatura. Devolve null se não houver login.
 * Uma vez por requisição (layout e página reaproveitam o mesmo resultado).
 */
export const getAccess = cache(async (): Promise<Access | null> => {
  if (isDemoMode()) return DEMO;
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;

  const email = user.email.toLowerCase();
  let plan: Access["plan"] = null;
  let expiresAt: string | null = null;
  let approved = false;

  try {
    const admin = createAdminClient();
    const now = Date.now();
    const readValid = async () => {
      const { data: subs } = await admin
        .from("subscriptions")
        .select("plan, expires_at, gateway")
        .eq("user_id", user.id)
        .eq("status", "active");
      const current = (subs ?? []).filter((s) => s.plan === "lifetime" || (s.expires_at && Date.parse(s.expires_at) > now));
      // Aprovação manual da Nat (aba Afiliados) libera também o Estúdio de LIVE.
      approved = current.some((s) => s.gateway === "manual");
      return current.find((s) => s.plan === "lifetime") ?? current[0];
    };

    let valid = await readValid();
    if (!valid) {
      // Vincula pagamentos feitos antes do cadastro (mesmo e-mail). Só quando ainda não há assinatura válida,
      // para não gravar no banco a cada página.
      const { data: linked } = await admin
        .from("subscriptions")
        .update({ user_id: user.id })
        .is("user_id", null)
        .eq("email", email)
        .select("id");
      if (linked?.length) valid = await readValid();
    }
    if (valid) {
      plan = valid.plan as Access["plan"];
      expiresAt = valid.expires_at ?? null;
    }
  } catch (err) {
    // Sem service role não dá para confirmar a assinatura: nega o acesso.
    console.error("getAccess: falha ao ler assinaturas", err);
  }

  const name =
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    handleOf(email);

  const handle = ((user.user_metadata?.handle as string | undefined) || handleOf(email)).replace(/^@/, "");
  return {
    userId: user.id,
    email,
    name,
    handle,
    // Quem aprova afiliados sempre entra no painel.
    active: plan !== null || isAdminEmail(email),
    plan,
    expiresAt,
    showcase: isShowcaseEmail(email),
    admin: isAdminEmail(email),
    studio: approved || isAdminEmail(email) || isShowcaseEmail(email),
  };
});

/** Topo das páginas do painel: sem login → /login; sem plano → checkout com o e-mail. */
export async function requireAccess(next = "/painel"): Promise<Access> {
  const access = await getAccess();
  if (!access) redirect(`/login?next=${encodeURIComponent(next)}`);
  if (!access.active) redirect(`/checkout/vitalicio?email=${encodeURIComponent(access.email)}`);
  return access;
}

/** Rotas de API: devolve o acesso só com plano ativo. */
export async function apiAccess(): Promise<Access | null> {
  const access = await getAccess();
  return access?.active ? access : null;
}
