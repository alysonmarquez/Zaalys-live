import { redirect } from "next/navigation";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export type Access = {
  userId: string;
  email: string;
  active: boolean;
  plan: "monthly" | "lifetime" | null;
  expiresAt: string | null;
};

/**
 * Vincula assinaturas compradas com o e-mail do usuário (feitas antes do cadastro)
 * e diz se ele tem acesso ativo.
 */
export async function getAccess(): Promise<Access | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;

  const admin = createAdminClient();
  await admin
    .from("subscriptions")
    .update({ user_id: user.id })
    .is("user_id", null)
    .eq("email", user.email.toLowerCase()); // o webhook grava e-mails em minúsculas

  const { data: subs } = await admin
    .from("subscriptions")
    .select("plan, status, expires_at")
    .eq("user_id", user.id)
    .eq("status", "active");

  const now = Date.now();
  const valid = (subs ?? []).find(
    (s) => s.plan === "lifetime" || (s.expires_at && Date.parse(s.expires_at) > now),
  );

  return {
    userId: user.id,
    email: user.email,
    active: Boolean(valid),
    plan: (valid?.plan as Access["plan"]) ?? null,
    expiresAt: valid?.expires_at ?? null,
  };
}

/** Use no topo das páginas do painel que exigem plano pago. */
export async function requireAccess(): Promise<Access> {
  const access = await getAccess();
  if (!access) redirect("/login");
  if (!access.active) redirect("/painel/assinar");
  return access;
}

/** Versão para rotas de API: devolve null em vez de redirecionar. */
export async function apiAccess(): Promise<Access | null> {
  const access = await getAccess();
  return access?.active ? access : null;
}
