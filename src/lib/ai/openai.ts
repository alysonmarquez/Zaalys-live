import { AIError, type AIProvider, type GenerateOptions } from "./types";

/** Configuração de um provedor com a API da OpenAI (a própria OpenAI, a Groq…). */
export type OpenAICompatibleConfig = {
  name: string;
  label: string;
  base: string;
  apiKey: string;
  keyVar: string;
  model: string;
  transcriptionModel: string;
  /** Modelo usado se o principal não existir mais (404 model_not_found). */
  fallbackModel?: string;
  /** Campos extras do corpo do chat (ex.: reasoning_effort). */
  extraBody?: Record<string, unknown>;
  /** Tokens a mais para modelos que raciocinam antes de responder (o raciocínio conta no limite). */
  reasoningHeadroom?: number;
};

/** Provedores com a mesma API de chat e transcrição da OpenAI; muda o endereço, a chave e os modelos. */
export class OpenAICompatibleProvider implements AIProvider {
  readonly name: string;
  private readonly label: string;
  private readonly base: string;
  private readonly apiKey: string;
  private readonly model: string;
  private readonly transcriptionModel: string;
  private readonly fallbackModel?: string;
  private readonly extraBody: Record<string, unknown>;
  private readonly reasoningHeadroom: number;

  constructor(cfg: OpenAICompatibleConfig) {
    if (!cfg.apiKey) throw new AIError(`${cfg.keyVar} não configurada`);
    this.name = cfg.name;
    this.label = cfg.label;
    this.base = cfg.base;
    this.apiKey = cfg.apiKey;
    this.model = cfg.model;
    this.transcriptionModel = cfg.transcriptionModel;
    this.fallbackModel = cfg.fallbackModel;
    this.extraBody = cfg.extraBody ?? {};
    this.reasoningHeadroom = cfg.reasoningHeadroom ?? 0;
  }

  private async chat(opts: GenerateOptions, json: boolean): Promise<string> {
    let res = await this.request(this.model, opts, json);
    // Modelo retirado pelo provedor: tenta o reserva antes de falhar.
    if (res.status === 404 && this.fallbackModel && this.fallbackModel !== this.model) {
      console.warn(`[ai] ${this.label}: modelo ${this.model} indisponível, usando ${this.fallbackModel}`);
      res = await this.request(this.fallbackModel, opts, json);
    }
    if (!res.ok) throw new AIError(`${this.label} ${res.status}: ${await res.text()}`, 502);
    const data = (await res.json()) as { choices: { message: { content: string } }[] };
    return data.choices[0]?.message.content ?? "";
  }

  private request(model: string, opts: GenerateOptions, json: boolean) {
    return fetch(`${this.base}/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${this.apiKey}` },
      body: JSON.stringify({
        model,
        ...this.extraBody,
        max_tokens: (opts.maxTokens ?? 2000) + this.reasoningHeadroom,
        temperature: opts.temperature ?? 0.7,
        ...(json ? { response_format: { type: "json_object" } } : {}),
        messages: [
          { role: "system", content: json ? `${opts.system}\n\nResponda em JSON.` : opts.system },
          { role: "user", content: opts.prompt },
        ],
      }),
    });
  }

  generateText(opts: GenerateOptions) {
    return this.chat(opts, false);
  }

  generateJSONText(opts: GenerateOptions) {
    return this.chat(opts, true);
  }

  async transcribe(file: Blob, filename: string): Promise<string> {
    const form = new FormData();
    form.append("file", file, filename);
    form.append("model", this.transcriptionModel);
    form.append("language", "pt");
    const res = await fetch(`${this.base}/audio/transcriptions`, {
      method: "POST",
      headers: { authorization: `Bearer ${this.apiKey}` },
      body: form,
    });
    if (!res.ok) throw new AIError(`Transcrição ${res.status}: ${await res.text()}`, 502);
    const data = (await res.json()) as { text: string };
    return data.text;
  }
}

export class OpenAIProvider extends OpenAICompatibleProvider {
  constructor() {
    super({
      name: "openai",
      label: "OpenAI",
      base: "https://api.openai.com/v1",
      apiKey: process.env.OPENAI_API_KEY ?? "",
      keyVar: "OPENAI_API_KEY",
      model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
      transcriptionModel: "whisper-1",
    });
  }
}
