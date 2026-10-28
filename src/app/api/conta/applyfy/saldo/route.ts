import { apiAccess } from "@/lib/access";
import { json, unauthorized } from "@/lib/http";
import { createAdminClient } from "@/lib/supabase/server";
import { open } from "@/lib/secret-box";
import { getBalance } from "@/lib/applyfy-api";

// Saldo da conta Applyfy vinculada pelo afiliado (Disponível e A liberar), consultado com as chaves dele.
export async function GET() {
  const access = await apiAccess();
  if (!access) return unauthorized();
  if (access.demo) return json({ saldo: null });
  const { data } = await createAdminClient()
    .from("profiles")
    .select("applyfy_client_id, applyfy_client_secret_enc")
    .eq("id", access.userId)
    .maybeSingle();
  const secretKey = open(data?.applyfy_client_secret_enc as string | null);
  if (!data?.applyfy_client_id || !secretKey) return json({ saldo: null });
  try {
    const b = await getBalance({ publicKey: data.applyfy_client_id as string, secretKey });
    const cents = (v: number) => Math.round((Number(v) || 0) * 100);
    return json({ saldo: { disponivelCents: cents(b.available), aLiberarCents: cents(b.pending), retidoCents: cents(b.fundLock) } });
  } catch (err) {
    return json({ saldo: null, error: `Não deu para consultar o saldo na Applyfy agora (${(err as Error).message}).` }, 502);
  }
}
