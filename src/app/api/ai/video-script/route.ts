import { z } from "zod";
import { apiAccess } from "@/lib/access";
import { generateObject } from "@/lib/ai";
import { VideoScript, videoScriptPrompt } from "@/lib/ai/prompts";
import { fail, json, unauthorized } from "@/lib/http";
import { createClient } from "@/lib/supabase/server";

const Body = z.object({
  product: z.object({ name: z.string().min(2), price: z.string().optional(), details: z.string().optional() }),
  characterId: z.string().uuid().optional(),
  templateId: z.string().uuid().optional(),
  /** Alternativa aos ids: modelo e cena enviados direto pela tela (catálogo estático do estúdio). */
  character: z.object({ name: z.string().max(80), appearance: z.string().max(400) }).optional(),
  template: z.object({ scene: z.string().max(400), camera_motion: z.string().max(200) }).optional(),
  tone: z.string().max(40).optional(),
  angle: z.string().max(80).optional(),
  durationSeconds: z.number().int().min(8).max(90).default(20),
});

export async function POST(req: Request) {
  const access = await apiAccess();
  if (!access) return unauthorized();
  try {
    const body = Body.parse(await req.json());
    const supabase = access.demo ? null : await createClient();

    const [{ data: dbCharacter }, { data: dbTemplate }] = await Promise.all([
      supabase && body.characterId
        ? supabase.from("characters").select("name, appearance").eq("id", body.characterId).maybeSingle()
        : Promise.resolve({ data: null }),
      supabase && body.templateId
        ? supabase.from("templates").select("scene, camera_motion").eq("id", body.templateId).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    const script = await generateObject(
      VideoScript,
      videoScriptPrompt({
        product: body.product,
        character: dbCharacter ?? body.character,
        template: dbTemplate ?? body.template,
        durationSeconds: body.durationSeconds,
        tone: body.tone,
        angle: body.angle,
      }),
    );

    const saved = supabase
      ? (
          await supabase
            .from("scripts")
            .insert({ user_id: access.userId, kind: "video", title: script.title, input: body, content: script })
            .select("id")
            .single()
        ).data
      : null;

    return json({ id: saved?.id, script });
  } catch (err) {
    return fail(err);
  }
}
