import { z } from "zod";
import { apiAccess } from "@/lib/access";
import { generateObject } from "@/lib/ai";
import { TrendScripts, trendScriptPrompt } from "@/lib/ai/prompts";
import { fail, json, unauthorized } from "@/lib/http";
import { TREND_CTAS, TREND_FORMATS_ORIGINAL, TREND_TONES } from "@/lib/trend-formats";

export const maxDuration = 120;

const Body = z.object({
  format: z.string(),
  character: z.string().max(120),
  tone: z.string(),
  cta: z.string(),
});

// Trend AI: 3 roteiros de 8 segundos para o personagem escolhido.
export async function POST(req: Request) {
  const access = await apiAccess();
  if (!access) return unauthorized();
  try {
    const body = Body.parse(await req.json());
    const format = TREND_FORMATS_ORIGINAL.find((f) => f.slug === body.format);
    const tone = TREND_TONES.find((t) => t.key === body.tone);
    const cta = TREND_CTAS.find((c) => c.key === body.cta);
    if (!format || !tone || !cta || !format.characters.some((c) => c.name === body.character)) {
      return json({ error: "Formato, personagem, tom ou chamada inválidos" }, 400);
    }
    const result = await generateObject(
      TrendScripts,
      trendScriptPrompt({ format, character: body.character, tone, cta: cta.line }),
    );
    return json(result);
  } catch (err) {
    return fail(err);
  }
}
