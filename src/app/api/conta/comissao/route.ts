import { apiAccess } from "@/lib/access";
import { json, unauthorized } from "@/lib/http";
import { createAdminClient } from "@/lib/supabase/server";

// Porcentagem de comissão da conta (definida no Painel do Afiliado; sem definição, o padrão).
const DEFAULT_COMMISSION_PCT = 40;

export async function GET() {
  const access = await apiAccess();
  if (!access) return unauthorized();
  if (access.demo) return json({ pct: DEFAULT_COMMISSION_PCT });
  const { data, error } = await createAdminClient().from("profiles").select("commission_pct").eq("id", access.userId).maybeSingle();
  const pct = !error && data?.commission_pct != null ? Number(data.commission_pct) : DEFAULT_COMMISSION_PCT;
  return json({ pct });
}
