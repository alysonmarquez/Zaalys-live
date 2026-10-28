import { z } from "zod";
import { apiAccess } from "@/lib/access";
import { fail, json, unauthorized } from "@/lib/http";
import { createAdminClient } from "@/lib/supabase/server";
import { PIX_TYPES } from "@/lib/payouts";

// Cadastro do afiliado: e-mail da conta Applyfy (split do vitalício) e chave Pix (saques do mensal).
export async function GET() {
  const access = await apiAccess();
  if (!access) return unauthorized();
  if (access.demo) return json({ applyfyEmail: null, pixType: null, pixKey: null, saques: [] });
  const db = createAdminClient();
  const { data, error } = await db.from("profiles").select("applyfy_email, pix_type, pix_key").eq("id", access.userId).maybeSingle();
  if (error) return json({ error: "Cadastro de afiliado indisponível: falta aplicar a migração de saques." }, 503);
  const { data: saques } = await db
    .from("payout_requests")
    .select("id, amount_cents, status, created_at, paid_at, note")
    .eq("user_id", access.userId)
    .order("created_at", { ascending: false })
    .limit(50);
  return json({ applyfyEmail: data?.applyfy_email ?? null, pixType: data?.pix_type ?? null, pixKey: data?.pix_key ?? null, saques: saques ?? [] });
}

const Body = z.object({
  applyfyEmail: z.string().trim().toLowerCase().email().nullable().optional(),
  pixType: z.enum(PIX_TYPES).optional(),
  pixKey: z.string().trim().min(3).max(140).optional(),
});

export async function POST(req: Request) {
  const access = await apiAccess();
  if (!access) return unauthorized();
  try {
    const b = Body.safeParse(await req.json().catch(() => null));
    if (!b.success) return json({ error: "Confira os dados: e-mail válido e chave Pix com pelo menos 3 caracteres." }, 400);
    if (access.demo) return json({ ok: true });
    const patch: Record<string, unknown> = {};
    if (b.data.applyfyEmail !== undefined) patch.applyfy_email = b.data.applyfyEmail;
    if (b.data.pixType && b.data.pixKey) Object.assign(patch, { pix_type: b.data.pixType, pix_key: b.data.pixKey });
    if (!Object.keys(patch).length) return json({ error: "Nada para salvar." }, 400);
    const { error } = await createAdminClient().from("profiles").update(patch).eq("id", access.userId);
    if (error) return json({ error: "Não deu para salvar agora. Tente de novo." }, 500);
    return json({ ok: true });
  } catch (err) {
    return fail(err);
  }
}
