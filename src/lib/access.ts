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
};

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
  return process.env.NODE_ENV !== "production" || process.env.ZAALYS_DEMO_MODE === "true";
}

const DEMO: Access = {
  userId: "00000000-0000-0000-0000-000000000000",
  email: "criador@zaalys.com",
  name: "Criador Zaalys",
  handle: "criador",
  active: true,
  plan: "lifetime",
  expiresAt: null,
  demo: true,
};

const handleOf = (email: string) =>
  email.split("@")[0]?.toLowerCase().replace(/[^a-z0-9._-]/g, "") || "criador";

/** Lê a sessão do Supabase e a assinatura. Devolve null se não houver login. */
export async function getAccess(): Promise<Access | null> {
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

  try {
    const admin = createAdminClient();
    // Vincula pagamentos feitos antes do cadastro (mesmo e-mail).
    await admin.from("subscriptions").update({ user_id: user.id }).is("user_id", null).eq("email", email);

    const { data: subs } = await admin
      .from("subscriptions")
      .select("plan, expires_at")
      .eq("user_id", user.id)
      .eq("status", "active");

    const now = Date.now();
    const valid =
      (subs ?? []).find((s) => s.plan === "lifetime") ??
      (subs ?? []).find((s) => s.expires_at && Date.parse(s.expires_at) > now);
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

  return { userId: user.id, email, name, handle: handleOf(email), active: plan !== null, plan, expiresAt };
}

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
