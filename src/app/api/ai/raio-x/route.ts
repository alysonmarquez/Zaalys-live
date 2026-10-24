import { apiAccess } from "@/lib/access";
import { AIError, generateObject, getTranscriber } from "@/lib/ai";
import { VideoAnalysis, videoAnalysisPrompt } from "@/lib/ai/prompts";
import { fail, json, unauthorized } from "@/lib/http";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 120;

const MAX_FILE = 25 * 1024 * 1024; // limite da API de transcrição

/**
 * Recebe multipart/form-data:
 * - url (opcional): link do vídeo analisado, só para referência
 * - transcript (opcional): a fala do vídeo colada
 * - file (opcional): áudio ou vídeo baixado, transcrito aqui
 * - productName, productDetails (opcionais): para recriar a estrutura
 */
export async function POST(req: Request) {
  const access = await apiAccess();
  if (!access) return unauthorized();
  try {
    const form = await req.formData();
    let transcript = String(form.get("transcript") ?? "").trim();
    const file = form.get("file");

    if (!transcript && file instanceof File && file.size > 0) {
      if (file.size > MAX_FILE) throw new AIError("Arquivo acima de 25 MB", 413);
      transcript = await getTranscriber().transcribe!(file, file.name);
    }
    if (transcript.length < 40) throw new AIError("Envie a fala do vídeo ou o arquivo de áudio/vídeo", 400);

    const productName = String(form.get("productName") ?? "").trim();
    const analysis = await generateObject(
      VideoAnalysis,
      videoAnalysisPrompt({
        transcript,
        myProduct: productName
          ? { name: productName, details: String(form.get("productDetails") ?? "") }
          : undefined,
      }),
    );

    if (access.demo) return json({ transcript, analysis });
    const supabase = await createClient();
    const { data: saved } = await supabase
      .from("video_analyses")
      .insert({
        user_id: access.userId,
        source_url: String(form.get("url") ?? "") || null,
        transcript,
        analysis,
      })
      .select("id")
      .single();

    return json({ id: saved?.id, transcript, analysis });
  } catch (err) {
    return fail(err);
  }
}
