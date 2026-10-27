import { getAccess } from "@/lib/access";
import { createAdminClient } from "@/lib/supabase/server";

/** Rotas /api/admin/*: só administradores (ADMIN_EMAILS) e com banco configurado. */
export async function adminCtx() {
  const access = await getAccess();
  if (!access?.admin || access.demo) return null;
  return { access, db: createAdminClient() };
}

export type SubRow = {
  id: string;
  user_id: string | null;
  email: string;
  plan: "monthly" | "lifetime";
  status: "pending" | "active" | "past_due" | "canceled" | "refunded";
  gateway: string;
  gateway_ref: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
};

/** A assinatura que vale agora (vitalício ativo, ou mensal ativo dentro do prazo). */
export function validSub(subs: SubRow[], now = Date.now()) {
  const active = subs.filter((s) => s.status === "active");
  return (
    active.find((s) => s.plan === "lifetime") ??
    active
      .filter((s) => s.expires_at && Date.parse(s.expires_at) > now)
      .sort((a, b) => Date.parse(b.expires_at!) - Date.parse(a.expires_at!))[0]
  );
}

export const manualRef = (email: string) => `manual:${email.toLowerCase()}`;
