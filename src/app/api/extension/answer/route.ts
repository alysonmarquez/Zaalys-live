import { z } from "zod";
import { generateObject } from "@/lib/ai";
import { ChatReply, chatReplyPrompt } from "@/lib/ai/prompts";
import { fail, json, licenseAuth } from "@/lib/http";

const Body = z.object({
  question: z.string().min(1).max(500),
  product: z.object({ name: z.string(), price: z.string().optional(), details: z.string().optional() }),
});

export const OPTIONS = () => new Response(null, { status: 204 });

// Resposta curta para uma pergunta do chat da live infinita.
export async function POST(req: Request) {
  if (!(await licenseAuth(req))) return json({ error: "Licença inválida" }, 401);
  try {
    const body = Body.parse(await req.json());
    return json(await generateObject(ChatReply, chatReplyPrompt(body)));
  } catch (err) {
    return fail(err);
  }
}
