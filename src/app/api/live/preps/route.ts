import { z } from "zod";
import { apiAccess } from "@/lib/access";
import { fail, json, unauthorized } from "@/lib/http";
import { createClient } from "@/lib/supabase/server";

// Preparações de live da conta (aparecem em "Continuar uma preparação", em qualquer aparelho).
// No modo demonstração não há banco: o painel guarda no navegador.

const COLS = "id, product_id, title, clips, comments, step, created_at";
type Row = { id: string; product_id: number; title: string; clips: number; comments: number; step: number; created_at: string };
const toPrep = (r: Row) => ({
  id: r.id,
  productId: r.product_id,
  title: r.title,
  clips: r.clips,
  comments: r.comments,
  step: r.step,
  createdAt: r.created_at,
});

async function ctx() {
  const access = await apiAccess();
  if (!access || access.demo) return null;
  return { access, supabase: await createClient() };
}

export async function GET() {
  const c = await ctx();
  if (!c) return unauthorized();
  const { data, error } = await c.supabase
    .from("live_preps")
    .select(COLS)
    .eq("user_id", c.access.userId)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) return fail(error);
  return json({ preps: (data as Row[]).map(toPrep) });
}

const Create = z.object({
  productId: z.number().int(),
  title: z.string().min(1).max(300),
  clips: z.number().int().min(1).max(20).default(6),
  comments: z.number().int().min(0).max(200).default(24),
});

export async function POST(req: Request) {
  const c = await ctx();
  if (!c) return unauthorized();
  try {
    const b = Create.parse(await req.json());
    const { data, error } = await c.supabase
      .from("live_preps")
      .insert({ user_id: c.access.userId, product_id: b.productId, title: b.title, clips: b.clips, comments: b.comments })
      .select(COLS)
      .single();
    if (error) throw error;
    return json({ prep: toPrep(data as Row) });
  } catch (err) {
    return fail(err);
  }
}

const Update = z.object({ id: z.string().uuid(), step: z.number().int().min(0).max(10) });

export async function PATCH(req: Request) {
  const c = await ctx();
  if (!c) return unauthorized();
  try {
    const b = Update.parse(await req.json());
    const { error } = await c.supabase.from("live_preps").update({ step: b.step }).eq("id", b.id).eq("user_id", c.access.userId);
    if (error) throw error;
    return json({ ok: true });
  } catch (err) {
    return fail(err);
  }
}

export async function DELETE(req: Request) {
  const c = await ctx();
  if (!c) return unauthorized();
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return json({ error: "id obrigatório" }, 400);
  const { error } = await c.supabase.from("live_preps").delete().eq("id", id).eq("user_id", c.access.userId);
  if (error) return fail(error);
  return json({ ok: true });
}
