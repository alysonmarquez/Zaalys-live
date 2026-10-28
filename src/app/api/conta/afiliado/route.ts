import { z } from "zod";
import { apiAccess } from "@/lib/access";
import { fail, json, unauthorized } from "@/lib/http";
import { createAdminClient } from "@/lib/supabase/server";
import { PIX_TYPES } from "@/lib/payouts";
import { seal } from "@/lib/secret-box";

type Row = {
  pix_type?: string | null;
  pix_key?: string | null;
  applyfy_account_id?: string | null;
  applyfy_client_id?: string | null;
  applyfy_client_secret_enc?: string | null;
  applyfy_linked_at?: string | null;
};

// Cadastro do afiliado: conta Applyfy vinculada (o vitalício cai direto nela pelo split) e chave Pix (saques do mensal).
export async function GET() {
  const access = await apiAccess();
  if (!access) return unauthorized();
  if (access.demo) return json({ applyfy: null, pixType: null, pixKey: null, saques: [] });
  const db = createAdminClient();
  // Sem a migração da conta Applyfy, lê só o Pix (vale "não vinculada").
  let { data, error } = await db
    .from("profiles")
    .select("pix_type, pix_key, applyfy_account_id, applyfy_client_id, applyfy_client_secret_enc, applyfy_linked_at")
    .eq("id", access.userId)
    .maybeSingle();
  if (error) ({ data, error } = await db.from("profiles").select("pix_type, pix_key").eq("id", access.userId).maybeSingle());
  if (error) return json({ error: "Cadastro de afiliado indisponível: falta aplicar a migração de saques." }, 503);
  const row = data as Row | null;
  const { data: saques } = await db
    .from("payout_requests")
    .select("id, amount_cents, status, created_at, paid_at, note")
    .eq("user_id", access.userId)
    .order("created_at", { ascending: false })
    .limit(50);
  return json({
    // O Client Secret nunca volta para a tela: só se ele já foi salvo.
    applyfy: row?.applyfy_account_id
      ? {
          accountId: row.applyfy_account_id,
          clientId: row.applyfy_client_id ?? null,
          hasSecret: Boolean(row.applyfy_client_secret_enc),
          linkedAt: row.applyfy_linked_at ?? null,
        }
      : null,
    pixType: row?.pix_type ?? null,
    pixKey: row?.pix_key ?? null,
    saques: saques ?? [],
  });
}

const Body = z.object({
  applyfy: z
    .object({
      accountId: z.string().trim().min(6).max(120),
      clientId: z.string().trim().min(6).max(200),
      // Vazio ao editar = mantém o segredo já salvo.
      clientSecret: z.string().trim().max(500).optional(),
    })
    .nullable()
    .optional(),
  pixType: z.enum(PIX_TYPES).optional(),
  pixKey: z.string().trim().min(3).max(140).optional(),
});

export async function POST(req: Request) {
  const access = await apiAccess();
  if (!access) return unauthorized();
  try {
    const b = Body.safeParse(await req.json().catch(() => null));
    if (!b.success) return json({ error: "Confira os dados: ID da conta, Client ID e chave Pix com pelo menos 3 caracteres." }, 400);
    if (access.demo) return json({ ok: true });
    const db = createAdminClient();
    const patch: Record<string, unknown> = {};
    if (b.data.applyfy === null) {
      Object.assign(patch, { applyfy_account_id: null, applyfy_client_id: null, applyfy_client_secret_enc: null, applyfy_linked_at: null });
    } else if (b.data.applyfy) {
      const { accountId, clientId, clientSecret } = b.data.applyfy;
      Object.assign(patch, { applyfy_account_id: accountId, applyfy_client_id: clientId, applyfy_linked_at: new Date().toISOString() });
      if (clientSecret) {
        if (clientSecret.length < 8) return json({ error: "O Client Secret parece curto demais. Copie de novo na Applyfy." }, 400);
        patch.applyfy_client_secret_enc = seal(clientSecret);
      } else {
        const { data: cur } = await db.from("profiles").select("applyfy_client_secret_enc").eq("id", access.userId).maybeSingle();
        if (!cur?.applyfy_client_secret_enc) return json({ error: "Cole o Client Secret (a chave privada da API)." }, 400);
      }
    }
    if (b.data.pixType && b.data.pixKey) Object.assign(patch, { pix_type: b.data.pixType, pix_key: b.data.pixKey });
    if (!Object.keys(patch).length) return json({ error: "Nada para salvar." }, 400);
    const { error } = await db.from("profiles").update(patch).eq("id", access.userId);
    if (error && "applyfy_account_id" in patch)
      return json({ error: "Vincular a conta Applyfy ainda não está disponível: rode supabase/migration-2026-10-applyfy-conta.sql." }, 503);
    if (error) return json({ error: "Não deu para salvar agora. Tente de novo." }, 500);
    return json({ ok: true });
  } catch (err) {
    return fail(err);
  }
}
