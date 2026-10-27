import { z } from "zod";
import { fail, json, unauthorized } from "@/lib/http";
import { adminCtx } from "@/lib/admin";

// Chamados de suporte (Admin): lista e muda a situação (aberto, respondido, fechado).
export async function GET() {
  const c = await adminCtx();
  if (!c) return unauthorized();
  const { data, error } = await c.db
    .from("support_tickets")
    .select("id, email, topic, message, page, status, created_at")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) return fail(error);
  return json({ chamados: data ?? [] });
}

const Body = z.object({ id: z.string().uuid(), status: z.enum(["open", "answered", "closed"]) });

export async function POST(req: Request) {
  const c = await adminCtx();
  if (!c) return unauthorized();
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "Dados inválidos" }, 400);
  const { error } = await c.db.from("support_tickets").update({ status: parsed.data.status }).eq("id", parsed.data.id);
  if (error) return fail(error);
  return json({ ok: true });
}
