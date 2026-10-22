import { AIError, type AIProvider, type GenerateOptions } from "./types";

const API = "https://api.anthropic.com/v1/messages";

export class AnthropicProvider implements AIProvider {
  readonly name = "anthropic";

  constructor(
    private apiKey = process.env.ANTHROPIC_API_KEY ?? "",
    private model = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5-5",
  ) {
    if (!this.apiKey) throw new AIError("ANTHROPIC_API_KEY não configurada");
  }

  private async call(opts: GenerateOptions, json: boolean): Promise<string> {
    const res = await fetch(API, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: opts.maxTokens ?? 2000,
        temperature: opts.temperature ?? 0.7,
        system: json
          ? `${opts.system}\n\nResponda APENAS com um objeto JSON válido, sem texto antes ou depois e sem blocos de código.`
          : opts.system,
        messages: [{ role: "user", content: opts.prompt }],
      }),
    });
    if (!res.ok) throw new AIError(`Anthropic ${res.status}: ${await res.text()}`, 502);
    const data = (await res.json()) as { content: { type: string; text?: string }[] };
    return data.content
      .filter((c) => c.type === "text")
      .map((c) => c.text)
      .join("");
  }

  generateText(opts: GenerateOptions) {
    return this.call(opts, false);
  }

  generateJSONText(opts: GenerateOptions) {
    return this.call(opts, true);
  }
}
