import { json, licenseAuth } from "@/lib/http";
import { createAdminClient } from "@/lib/supabase/server";
import { CATALOGO_ORIGINAL } from "@/lib/catalogo-original";

export const OPTIONS = () => new Response(null, { status: 204 });

const DEMO = [
  "Creme Gel Regenerador Facial Gota de Colágeno Kokeshi",
  "Hidrabene Protetor solar facial fps 70 Uniformizador",
  "BIORE UV AQUA RICH WATERY ESSENCE 50g",
  "Mounjarin Psyllium 60/90 e 120 Caps - Etron",
];

const urlFor = (productId: number) => CATALOGO_ORIGINAL.find((p) => p.id === productId)?.affiliateUrl ?? null;

// Lives preparadas no Assistente de Live, para escolher em "Live do Zaalys" no painel da extensão.
export async function GET(req: Request) {
  const auth = await licenseAuth(req);
  if (!auth) return json({ error: "Licença inválida" }, 401);
  if ("demo" in auth) {
    return json({
      preps: DEMO.map((title, i) => {
        const p = CATALOGO_ORIGINAL.find((x) => x.title.toLowerCase().startsWith(title.toLowerCase().slice(0, 20)));
        return { id: `demo-${i}`, title, productUrl: p?.affiliateUrl ?? null };
      }),
    });
  }
  const { data } = await createAdminClient()
    .from("live_preps")
    .select("id, title, product_id")
    .eq("user_id", auth.userId)
    .order("created_at", { ascending: false })
    .limit(30);
  return json({ preps: (data ?? []).map((r) => ({ id: r.id, title: r.title, productUrl: urlFor(r.product_id) })) });
}
