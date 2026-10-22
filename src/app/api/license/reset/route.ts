import { apiAccess } from "@/lib/access";
import { json, unauthorized } from "@/lib/http";
import { createAdminClient } from "@/lib/supabase/server";

// Gera (ou devolve) a chave do usuário. Com ?unbind=1, desvincula o computador atual.
export async function POST(req: Request) {
  const access = await apiAccess();
  if (!access) return unauthorized();
  const admin = createAdminClient();
  const unbind = new URL(req.url).searchParams.get("unbind") === "1";

  const { data: existing } = await admin.from("licenses").select("key").eq("user_id", access.userId).maybeSingle();
  if (!existing) {
    const { data } = await admin.from("licenses").insert({ user_id: access.userId }).select("key").single();
    return json({ key: data?.key, device: null });
  }
  if (unbind) await admin.from("licenses").update({ device_id: null, activated_at: null }).eq("user_id", access.userId);
  return json({ key: existing.key, device: unbind ? null : undefined });
}
