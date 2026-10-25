import { apiAccess } from "@/lib/access";
import { json, unauthorized } from "@/lib/http";
import { createAdminClient } from "@/lib/supabase/server";

type Lic = { key: string; device_id: string | null; device_label: string | null; activated_at: string | null };
const out = (l: Lic | null) => ({
  key: l?.key ?? null,
  device: l?.device_id ? { label: l.device_label || "Navegador conectado", activatedAt: l.activated_at } : null,
});

// GET: chave e aparelho conectado. POST: cria a chave se não existir; ?unbind=1 desconecta o
// aparelho; ?rotate=1 gera uma chave nova (a antiga deixa de funcionar).
export async function GET() {
  const access = await apiAccess();
  if (!access || access.demo) return unauthorized();
  const admin = createAdminClient();
  const { data } = await admin.from("licenses").select("key, device_id, device_label, activated_at").eq("user_id", access.userId).maybeSingle();
  if (data) return json(out(data));
  const { data: created } = await admin.from("licenses").insert({ user_id: access.userId }).select("key, device_id, device_label, activated_at").single();
  return json(out(created));
}

export async function POST(req: Request) {
  const access = await apiAccess();
  if (!access || access.demo) return unauthorized();
  const admin = createAdminClient();
  const params = new URL(req.url).searchParams;
  const cols = "key, device_id, device_label, activated_at";

  const { data: existing } = await admin.from("licenses").select(cols).eq("user_id", access.userId).maybeSingle();
  if (!existing) {
    const { data } = await admin.from("licenses").insert({ user_id: access.userId }).select(cols).single();
    return json(out(data));
  }
  if (params.get("rotate") === "1") {
    const key = Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
    const { data } = await admin
      .from("licenses")
      .update({ key, device_id: null, device_label: null, activated_at: null })
      .eq("user_id", access.userId)
      .select(cols)
      .single();
    return json(out(data));
  }
  if (params.get("unbind") === "1") {
    const { data } = await admin
      .from("licenses")
      .update({ device_id: null, device_label: null, activated_at: null })
      .eq("user_id", access.userId)
      .select(cols)
      .single();
    return json(out(data));
  }
  return json(out(existing));
}
