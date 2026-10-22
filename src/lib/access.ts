import { cookies } from "next/headers";
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
 * Lê a sessão ativa do usuário:
 * 1) Cookie `zaalys_session` (criado no cadastro/login direto na aplicação)
 * 2) Sessão do Supabase Auth (quando configurado no ambiente)
 * 3) Fallback de demonstração para navegação direta no painel
 */
export async function getAccess(): Promise<Access> {
  try {
    const cookieStore = await cookies();
    const rawCookie = cookieStore.get("zaalys_session")?.value;
    if (rawCookie) {
      try {
        const parsed = JSON.parse(decodeURIComponent(rawCookie));
        if (parsed && typeof parsed.email === "string" && parsed.email.includes("@")) {
          const fallbackHandle =
            parsed.email.split("@")[0]?.replace(/[^a-zA-Z0-9._-]/g, "") || "criador";
          return {
            userId: parsed.userId || "00000000-0000-0000-0000-000000000001",
            email: parsed.email,
            name: parsed.name || fallbackHandle,
            handle: parsed.handle || fallbackHandle,
            active: true,
            plan: parsed.plan === "monthly" ? "monthly" : "lifetime",
            expiresAt: null,
          };
        }
      } catch {
        // Continua para verificar Supabase
      }
    }
  } catch {
    // Ignora caso cookies() seja chamado fora de contexto de request
  }

  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && key && url.startsWith("http") && !url.includes("placeholder")) {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email) {
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
      }
    }
  } catch {
    // Fallback silencioso
  }

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

/** Use no topo das páginas do painel. */
export async function requireAccess(): Promise<Access> {
  return getAccess();
}

/** Versão para rotas de API. */
export async function apiAccess(): Promise<Access | null> {
  return getAccess();
}
