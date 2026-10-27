import type { z } from "zod";
import { AnthropicProvider } from "./anthropic";
import { GroqProvider } from "./groq";
import { OpenAIProvider } from "./openai";
import { AIError, type AIProvider, type GenerateOptions } from "./types";

export { AIError } from "./types";

// Registro de adaptadores. Para um novo provedor, implemente AIProvider e adicione aqui.
const registry: Record<string, () => AIProvider> = {
  anthropic: () => new AnthropicProvider(),
  groq: () => new GroqProvider(),
  openai: () => new OpenAIProvider(),
};

// Padrão: Groq (GROQ_API_KEY). AI_PROVIDER troca para anthropic ou openai.
export function getAI(name = process.env.AI_PROVIDER || "groq"): AIProvider {
  const make = registry[name];
  if (!make) throw new AIError(`Provedor de IA desconhecido: ${name}`);
  return make();
}

export function getTranscriber(): AIProvider {
  const ai = getAI(process.env.TRANSCRIPTION_PROVIDER || "groq");
  if (!ai.transcribe) throw new AIError(`O provedor ${ai.name} não faz transcrição`);
  return ai;
}

/** Extrai o primeiro objeto JSON do texto (tolera cercas de código). */
function extractJSON(text: string): unknown {
  const cleaned = text.replace(/```(?:json)?/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end < start) throw new AIError("A IA não devolveu JSON", 502);
  return JSON.parse(cleaned.slice(start, end + 1));
}

/** Gera e valida JSON contra um schema zod, com uma nova tentativa em caso de falha. */
export async function generateObject<T>(schema: z.ZodType<T>, opts: GenerateOptions): Promise<T> {
  const ai = getAI();
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const text = await ai.generateJSONText(opts);
      return schema.parse(extractJSON(text));
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError instanceof AIError ? lastError : new AIError("Resposta da IA fora do formato", 502);
}
