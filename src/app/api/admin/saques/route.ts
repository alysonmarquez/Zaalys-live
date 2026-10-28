import { z } from "zod";
import { fail, json, unauthorized } from "@/lib/http";
import { adminCtx } from "@/lib/admin";

// Pedidos de saque (Admin): lista e marca como pago (as comissões viram "repassada") ou recusa.
export async function GET() {
  const c = await adminCtx();
  if (!c) return unauthorized();
  const { data, error } = await c.db
    .from("payout_requests")
    .select("id, user_id, amount_cents, pix_type, pix_key, sale_ids, status, note, created_at, paid_at")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) return json({ error: "Saques indisponíveis: falta aplicar a migração de saques." }, 503);
  const ids = [...new Set((data ?? []).map((r) => r.user_id))];
  const { data: profiles } = ids.length ? await c.db.from("profiles").select("id, email, name").in("id", ids) : { data: [] };
  const who = new Map((profiles ?? []).map((p) => [p.id, p]));
  return json({
    saques: (data ?? []).map((r) => ({
      id: r.id,
      email: who.get(r.user_id)?.email ?? "—",
      nome: who.get(r.user_id)?.name ?? null,
      valorCents: r.amount_cents,
      pixTipo: r.pix_type,
      pixChave: r.pix_key,
      comissoes: (r.sale_ids as string[]).length,
      status: r.status,
      nota: r.note,
      criado: r.created_at,
      pago: r.paid_at,
    })),
  });
}

const Body = z.object({ id: z.string().uuid(), action: z.enum(["pagar", "recusar"]), nota: z.string().max(300).optional() });

export async function POST(req: Request) {
  const c = await adminCtx();
  if (!c) return unauthorized();
  try {
    const b = Body.safeParse(await req.json().catch(() => null));
    if (!b.success) return json({ error: "Dados inválidos" }, 400);
    const { data: r } = await c.db.from("payout_requests").select("id, sale_ids, status").eq("id", b.data.id).maybeSingle();
    if (!r) return json({ error: "Pedido não encontrado" }, 404);
    if (r.status !== "pending") return json({ error: "Esse pedido já foi resolvido." }, 409);
    const now = new Date().toISOString();
    if (b.data.action === "pagar") {
      const ids = (r.sale_ids as string[]) ?? [];
      if (ids.length) {
        const { error } = await c.db.from("affiliate_sales").update({ payout_status: "repassada", updated_at: now }).in("id", ids);
        if (error) return fail(error);
      }
    }
    const { error } = await c.db
      .from("payout_requests")
      .update({ status: b.data.action === "pagar" ? "paid" : "rejected", paid_at: b.data.action === "pagar" ? now : null, note: b.data.nota ?? null })
      .eq("id", r.id);
    if (error) return fail(error);
    return json({ ok: true });
  } catch (err) {
    return fail(err);
  }
}
