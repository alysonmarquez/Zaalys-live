import { AIError, type AIProvider, type GenerateOptions } from "./types";

const BASE = "https://api.openai.com/v1";

export class OpenAIProvider implements AIProvider {
  readonly name = "openai";

  constructor(
    private apiKey = process.env.OPENAI_API_KEY ?? "",
    private model = process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
  ) {
    if (!this.apiKey) throw new AIError("OPENAI_API_KEY não configurada");
  }

  private async chat(opts: GenerateOptions, json: boolean): Promise<string> {
    const res = await fetch(`${BASE}/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${this.apiKey}` },
      body: JSON.stringify({
        model: this.model,
        max_tokens: opts.maxTokens ?? 2000,
        temperature: opts.temperature ?? 0.7,
        ...(json ? { response_format: { type: "json_object" } } : {}),
        messages: [
          { role: "system", content: json ? `${opts.system}\n\nResponda em JSON.` : opts.system },
          { role: "user", content: opts.prompt },
        ],
      }),
    });
    if (!res.ok) throw new AIError(`OpenAI ${res.status}: ${await res.text()}`, 502);
    const data = (await res.json()) as { choices: { message: { content: string } }[] };
    return data.choices[0]?.message.content ?? "";
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
    form.append("model", "whisper-1");
    form.append("language", "pt");
    const res = await fetch(`${BASE}/audio/transcriptions`, {
      method: "POST",
      headers: { authorization: `Bearer ${this.apiKey}` },
      body: form,
    });
    if (!res.ok) throw new AIError(`Transcrição ${res.status}: ${await res.text()}`, 502);
    const data = (await res.json()) as { text: string };
    return data.text;
  }
}
