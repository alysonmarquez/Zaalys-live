"use client";
import { useState } from "react";
import { CopyButton } from "@/components/copy-button";
import type { VideoAnalysis } from "@/lib/ai/prompts";
import { postJSON } from "@/lib/fetch-json";

export function RaioX() {
  const [result, setResult] = useState<VideoAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { analysis } = await postJSON<{ analysis: VideoAnalysis }>("/api/ai/raio-x", new FormData(e.currentTarget));
      setResult(analysis);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const recreatedText = result
    ? [result.recreated.hook, ...result.recreated.structure.map((s) => s.speech), result.recreated.cta].join("\n\n")
    : "";

  return (
    <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
      <form onSubmit={submit} className="panel h-fit space-y-4 p-5">
        <div>
          <label className="label" htmlFor="url">Link do vídeo (para referência)</label>
          <input id="url" name="url" type="url" className="field" placeholder="https://www.tiktok.com/@..." />
        </div>
        <div>
          <label className="label" htmlFor="transcript">Fala do vídeo</label>
          <textarea id="transcript" name="transcript" rows={6} className="field" placeholder="Cole aqui o que é dito no vídeo." />
        </div>
        <div>
          <label className="label" htmlFor="file">Ou envie o áudio/vídeo (até 25 MB)</label>
          <input id="file" name="file" type="file" accept="audio/*,video/*" className="text-sm" />
        </div>
        <hr className="border-line" />
        <div>
          <label className="label" htmlFor="productName">Seu produto (opcional)</label>
          <input id="productName" name="productName" className="field" />
        </div>
        <div>
          <label className="label" htmlFor="productDetails">Detalhes do seu produto</label>
          <textarea id="productDetails" name="productDetails" rows={2} className="field" />
        </div>
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? "Analisando..." : "Fazer Raio-X"}
        </button>
        {error && <p className="text-sm text-onair">{error}</p>}
      </form>

      <section aria-live="polite">
        {!result ? (
          <div className="panel flex h-full min-h-64 items-center justify-center p-8 text-center text-muted">
            A análise aparece aqui: gancho, partes do roteiro, argumentos e a versão para o seu produto.
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <p className="text-sm font-semibold text-muted">Gancho · {result.hookType}</p>
              <p className="mt-1 font-display text-2xl font-bold">“{result.hook}”</p>
            </div>
            <ol className="relative space-y-4 border-l-2 border-violet pl-6">
              {result.structure.map((s, i) => (
                <li key={i}>
                  <p className="font-bold">{s.part}</p>
                  <p className="text-sm text-muted">{s.purpose}</p>
                  <p className="mt-1 text-sm italic">“{s.excerpt}”</p>
                </li>
              ))}
            </ol>
            <div>
              <h3 className="mb-2 font-bold">Argumentos de venda</h3>
              <ul className="list-disc space-y-1 pl-5">
                {result.arguments.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
              <p className="mt-3"><span className="font-semibold">Chamada final:</span> {result.cta}</p>
            </div>
            <div className="panel bg-violet-soft p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="font-bold">A mesma estrutura, para o seu produto</h3>
                <CopyButton text={recreatedText} />
              </div>
              <p className="font-semibold">{result.recreated.hook}</p>
              <ol className="mt-3 space-y-2">
                {result.recreated.structure.map((s, i) => (
                  <li key={i}>
                    <span className="text-sm font-semibold text-violet">{s.part}:</span> {s.speech}
                  </li>
                ))}
              </ol>
              <p className="mt-3 font-semibold">{result.recreated.cta}</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
