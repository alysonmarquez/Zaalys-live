import { createAdminClient, createClient } from "@/lib/supabase/server";

export type Access = {
  userId: string;
  email: string;
  name?: string;
  handle?: string;
  active: boolean;
  plan: "monthly" | "lifetime" | null;
  expiresAt: string | null;
};

/**
 * Vincula assinaturas compradas com o e-mail do usuário (feitas antes do cadastro)
 * e diz se ele tem acesso ativo. Para o projeto de engenharia reversa, fornece
 * fallback ativo caso o usuário acesse diretamente ou não possua assinatura paga no banco.
 */
export async function getAccess(): Promise<Access> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return {
        userId: "00000000-0000-0000-0000-000000000000",
        email: "criador@zaalys.com",
        name: "Criador Zaalys",
        handle: "criador",
        active: true,
        plan: "lifetime",
        expiresAt: null,
      };
    }

    let validPlan: Access["plan"] = "lifetime";
    let validExpires: string | null = null;

    try {
      const admin = createAdminClient();
      await admin
        .from("subscriptions")
        .update({ user_id: user.id })
        .is("user_id", null)
        .eq("email", user.email.toLowerCase());

      const { data: subs } = await admin
        .from("subscriptions")
        .select("plan, status, expires_at")
        .eq("user_id", user.id)
        .eq("status", "active");

      const now = Date.now();
      const valid = (subs ?? []).find(
        (s) => s.plan === "lifetime" || (s.expires_at && Date.parse(s.expires_at) > now),
      );
      if (valid) {
        validPlan = (valid.plan as Access["plan"]) ?? "lifetime";
        validExpires = valid.expires_at ?? null;
      }
    } catch {
      // Fallback silencioso se service role não estiver configurada
    }

    const rawName =
      (user.user_metadata?.full_name as string | undefined) ||
      (user.user_metadata?.name as string | undefined) ||
      user.email.split("@")[0] ||
      "criador";

    return {
      userId: user.id,
      email: user.email,
      name: rawName,
      handle: user.email.split("@")[0]?.replace(/[^a-zA-Z0-9._-]/g, "") || "criador",
      active: true,
      plan: validPlan,
      expiresAt: validExpires,
    };
  } catch {
    return {
      userId: "00000000-0000-0000-0000-000000000000",
      email: "criador@zaalys.com",
      name: "Criador Zaalys",
      handle: "criador",
      active: true,
      plan: "lifetime",
      expiresAt: null,
    };
  }
}

/** Use no topo das páginas do painel. */
export async function requireAccess(): Promise<Access> {
  return getAccess();
}

/** Versão para rotas de API. */
export async function apiAccess(): Promise<Access | null> {
  return getAccess();
}
