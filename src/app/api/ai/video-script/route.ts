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
  durationSeconds: z.number().int().min(8).max(90).default(20),
});

export async function POST(req: Request) {
  const access = await apiAccess();
  if (!access) return unauthorized();
  try {
    const body = Body.parse(await req.json());
    const supabase = await createClient();

    const [{ data: character }, { data: template }] = await Promise.all([
      body.characterId
        ? supabase.from("characters").select("name, appearance").eq("id", body.characterId).maybeSingle()
        : Promise.resolve({ data: null }),
      body.templateId
        ? supabase.from("templates").select("scene, camera_motion").eq("id", body.templateId).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    const script = await generateObject(
      VideoScript,
      videoScriptPrompt({
        product: body.product,
        character: character ?? undefined,
        template: template ?? undefined,
        durationSeconds: body.durationSeconds,
      }),
    );

    const { data: saved } = await supabase
      .from("scripts")
      .insert({ user_id: access.userId, kind: "video", title: script.title, input: body, content: script })
      .select("id")
      .single();

    return json({ id: saved?.id, script });
  } catch (err) {
    return fail(err);
  }
}
