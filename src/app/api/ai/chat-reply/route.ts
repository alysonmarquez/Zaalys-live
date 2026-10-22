import { z } from "zod";
import { apiAccess } from "@/lib/access";
import { generateObject } from "@/lib/ai";
import { ChatReply, chatReplyPrompt } from "@/lib/ai/prompts";
import { fail, json, unauthorized } from "@/lib/http";

const Body = z.object({
  question: z.string().min(1).max(500),
  product: z.object({ name: z.string(), price: z.string().optional(), details: z.string().optional() }),
  context: z.string().max(2000).optional(),
});

// Usado pelo painel de chat do modo apresentador.
export async function POST(req: Request) {
  if (!(await apiAccess())) return unauthorized();
  try {
    const body = Body.parse(await req.json());
    return json(await generateObject(ChatReply, chatReplyPrompt(body)));
  } catch (err) {
    return fail(err);
  }
}
