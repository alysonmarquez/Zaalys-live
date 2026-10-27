import { OpenAICompatibleProvider } from "./openai";

/** Groq: mesma API da OpenAI (chat com JSON e transcrição Whisper), em https://api.groq.com/openai/v1. */
export class GroqProvider extends OpenAICompatibleProvider {
  constructor() {
    super({
      name: "groq",
      label: "Groq",
      base: "https://api.groq.com/openai/v1",
      apiKey: process.env.GROQ_API_KEY ?? "",
      keyVar: "GROQ_API_KEY",
      model: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
      transcriptionModel: process.env.GROQ_TRANSCRIPTION_MODEL ?? "whisper-large-v3-turbo",
    });
  }
}
