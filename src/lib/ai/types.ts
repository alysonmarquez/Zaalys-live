export type GenerateOptions = {
  system: string;
  prompt: string;
  maxTokens?: number;
  temperature?: number;
};

/** Contrato que todo provedor de IA implementa. Para trocar de provedor, crie um adaptador. */
export interface AIProvider {
  readonly name: string;
  /** Texto livre. */
  generateText(opts: GenerateOptions): Promise<string>;
  /** Resposta em JSON (o texto é validado pelo chamador com zod). */
  generateJSONText(opts: GenerateOptions): Promise<string>;
  /** Transcrição de áudio/vídeo. Opcional: nem todo provedor oferece. */
  transcribe?(file: Blob, filename: string): Promise<string>;
}

export class AIError extends Error {
  constructor(message: string, readonly status = 500) {
    super(message);
  }
}
