import { OpenAICompatibleProvider } from "./openai";

// Modelos atuais do Groq (o llama-3.3-70b-versatile foi retirado em 16/08/2026).
// gpt-oss raciocina antes de responder: esforço baixo para ficar rápido, com folga de tokens para o raciocínio.
const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
const isGptOss = (m: string) => m.startsWith("openai/gpt-oss");

/** Groq: mesma API da OpenAI (chat com JSON e transcrição Whisper), em https://api.groq.com/openai/v1. */
export class GroqProvider extends OpenAICompatibleProvider {
  constructor() {
    super({
      name: "groq",
      label: "Groq",
      base: "https://api.groq.com/openai/v1",
      apiKey: process.env.GROQ_API_KEY ?? "",
      keyVar: "GROQ_API_KEY",
      model: MODEL,
      fallbackModel: process.env.GROQ_FALLBACK_MODEL || "openai/gpt-oss-20b",
      extraBody: isGptOss(MODEL) ? { reasoning_effort: "low" } : {},
      reasoningHeadroom: isGptOss(MODEL) ? 1500 : 0,
      transcriptionModel: process.env.GROQ_TRANSCRIPTION_MODEL || "whisper-large-v3-turbo",
    });
  }
}
