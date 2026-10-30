import { json } from "@/lib/http";
import { AVULSO_PREFIX } from "@/lib/payments/applyfy";
import { createAdminClient } from "@/lib/supabase/server";

// Pix gerado no checkout: a página pergunta aqui se o webhook da Applyfy já confirmou o pagamento.
export async function GET(req: Request) {
  const tx = (new URL(req.url).searchParams.get("tx") ?? "").trim();
  if (!/^[\w-]{6,80}$/.test(tx)) return json({ paid: false }, 400);
  try {
    const { data } = await createAdminClient()
      .from("subscriptions")
      .select("status")
      .eq("gateway", "applyfy")
      .in("gateway_ref", [tx, `${AVULSO_PREFIX}${tx}`])
      .maybeSingle();
    return json({ paid: data?.status === "active" });
  } catch {
    return json({ paid: false });
  }
}
