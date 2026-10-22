import { z } from "zod";
import { generateObject } from "@/lib/ai";
import { LoopComments, loopCommentsPrompt } from "@/lib/ai/prompts";
import { fail, json, licenseAuth } from "@/lib/http";

const Body = z.object({
  product: z.object({ name: z.string().min(2), price: z.string().optional(), details: z.string().optional() }),
  count: z.number().int().min(5).max(30).default(15),
});

export const OPTIONS = () => new Response(null, { status: 204 });

// Gera o banco de comentários do anfitrião para um produto da live infinita.
export async function POST(req: Request) {
  if (!(await licenseAuth(req))) return json({ error: "Licença inválida" }, 401);
  try {
    const body = Body.parse(await req.json());
    return json(await generateObject(LoopComments, loopCommentsPrompt(body)));
  } catch (err) {
    return fail(err);
  }
}
