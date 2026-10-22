import { json, licenseAuth } from "@/lib/http";
import { createAdminClient } from "@/lib/supabase/server";

export const OPTIONS = () => new Response(null, { status: 204 });

// Seletores da página de LIVE. Ficam no banco para corrigir sem publicar nova versão da extensão.
export async function GET(req: Request) {
  const auth = await licenseAuth(req);
  if (!auth) return json({ error: "Licença inválida ou usada em outro computador" }, 401);
  const { data } = await createAdminClient().from("extension_config").select("selectors").eq("id", 1).single();
  return json({ selectors: data?.selectors ?? {} });
}
