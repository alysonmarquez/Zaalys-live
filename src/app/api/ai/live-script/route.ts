import { z } from "zod";
import { apiAccess } from "@/lib/access";
import { generateObject } from "@/lib/ai";
import { LiveScript, liveScriptPrompt } from "@/lib/ai/prompts";
import { fail, json, unauthorized } from "@/lib/http";
import { createClient } from "@/lib/supabase/server";

const Product = z.object({ name: z.string().min(2), price: z.string().optional(), details: z.string().optional() });
const Body = z.object({
  products: z.array(Product).min(1).max(5),
  minutesPerProduct: z.number().int().min(2).max(30).default(8),
});

export async function POST(req: Request) {
  const access = await apiAccess();
  if (!access) return unauthorized();
  try {
    const body = Body.parse(await req.json());
    const script = await generateObject(LiveScript, liveScriptPrompt(body));
    const supabase = await createClient();
    const { data: saved } = await supabase
      .from("scripts")
      .insert({
        user_id: access.userId,
        kind: "live",
        title: `Live: ${body.products.map((p) => p.name).join(", ")}`.slice(0, 120),
        input: body,
        content: script,
      })
      .select("id")
      .single();
    return json({ id: saved?.id, script });
  } catch (err) {
    return fail(err);
  }
}
