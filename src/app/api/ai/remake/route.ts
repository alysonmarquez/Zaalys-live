import { z } from "zod";
import { apiAccess } from "@/lib/access";
import { generateObject } from "@/lib/ai";
import { VideoRemake, videoRemakePrompt } from "@/lib/ai/prompts";
import { fail, json, unauthorized } from "@/lib/http";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 120;

const Body = z.object({
  analysisId: z.string().uuid().optional(),
  reference: z.object({
    hook: z.string().min(3).max(500),
    structure: z
      .array(z.object({ stage: z.string().max(120), whatHappens: z.string().max(600) }))
      .min(1)
      .max(12),
  }),
  product: z.object({
    name: z.string().min(2).max(200),
    price: z.string().max(40).optional(),
    details: z.string().max(1500).optional(),
  }),
});

// Remake: a estrutura de um vídeo que vende, recriada em 3 versões para o produto escolhido.
export async function POST(req: Request) {
  const access = await apiAccess();
  if (!access) return unauthorized();
  try {
    const body = Body.parse(await req.json());
    const remake = await generateObject(VideoRemake, videoRemakePrompt(body));

    let id: string | undefined;
    if (!access.demo) {
      const supabase = await createClient();
      const { data } = await supabase
        .from("video_remakes")
        .insert({
          user_id: access.userId,
          analysis_id: body.analysisId ?? null,
          product: body.product,
          content: remake,
        })
        .select("id")
        .single();
      id = data?.id;
    }
    return json({ id, ...remake });
  } catch (err) {
    return fail(err);
  }
}
