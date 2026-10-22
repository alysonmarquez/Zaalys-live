"use client";
import { useState } from "react";
import { CopyButton } from "@/components/copy-button";
import type { VideoScript } from "@/lib/ai/prompts";
import { postJSON } from "@/lib/fetch-json";

type Props = {
  characters: { id: string; name: string; style: string | null }[];
  templates: { id: string; name: string; niche: string }[];
  initialProduct: string;
  initialPrice: string;
};

export function ScriptGenerator({ characters, templates, initialProduct, initialPrice }: Props) {
  const [script, setScript] = useState<VideoScript | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setLoading(true);
    setError("");
    try {
      const { script } = await postJSON<{ script: VideoScript }>("/api/ai/video-script", {
        product: {
          name: String(f.get("name")),
          price: String(f.get("price") || "") || undefined,
          details: String(f.get("details") || "") || undefined,
        },
        characterId: String(f.get("characterId") || "") || undefined,
        templateId: String(f.get("templateId") || "") || undefined,
        durationSeconds: Number(f.get("duration")),
      });
      setScript(script);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
      <form onSubmit={submit} className="panel h-fit space-y-4 p-5">
        <div>
          <label className="label" htmlFor="name">Produto</label>
          <input id="name" name="name" required minLength={2} defaultValue={initialProduct} className="field" />
        </div>
        <div>
          <label className="label" htmlFor="price">Preço</label>
          <input id="price" name="price" defaultValue={initialPrice} className="field" placeholder="R$ 49,90" />
        </div>
        <div>
          <label className="label" htmlFor="details">O que o produto tem de bom</label>
          <textarea id="details" name="details" rows={3} className="field" placeholder="Material, tamanho, para quem serve, diferencial." />
        </div>
        <div>
          <label className="label" htmlFor="characterId">Quem apresenta</label>
          <select id="characterId" name="characterId" className="field">
            <option value="">Livre</option>
            {characters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.style ? ` (${c.style})` : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="templateId">Cena</label>
          <select id="templateId" name="templateId" className="field">
            <option value="">Livre</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.niche})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="duration">Duração</label>
          <select id="duration" name="duration" defaultValue="20" className="field">
            {[8, 15, 20, 30, 45, 60].map((s) => (
              <option key={s} value={s}>{s} segundos</option>
            ))}
          </select>
        </div>
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? "Escrevendo roteiro..." : "Gerar roteiro"}
        </button>
        {error && <p className="text-sm text-onair">{error}</p>}
      </form>

      <section aria-live="polite">
        {!script ? (
          <div className="panel flex h-full min-h-64 items-center justify-center p-8 text-center text-muted">
            Preencha o produto e gere o roteiro. Ele aparece aqui, com o prompt pronto para copiar.
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">{script.title}</h2>
              <p className="mt-2 text-lg">
                <span className="font-semibold text-violet">Gancho:</span> {script.hook}
              </p>
            </div>
            <ol className="panel divide-y divide-line">
              {script.scenes.map((s, i) => (
                <li key={i} className="grid gap-1 px-5 py-4 sm:grid-cols-[90px_1fr]">
                  <span className="text-sm font-semibold text-muted">
                    Cena {i + 1} · {s.seconds}s
                  </span>
                  <div>
                    <p className="text-sm text-muted">{s.shot} — {s.action}</p>
                    <p className="mt-1">“{s.speech}”</p>
                  </div>
                </li>
              ))}
            </ol>
            <p>
              <span className="font-semibold text-violet">Fechamento:</span> {script.cta}
            </p>
            <div className="panel bg-night p-5 text-white">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="font-bold">Prompt do vídeo (9:16)</h3>
                <CopyButton text={script.videoPrompt} label="Copiar prompt" />
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/85">{script.videoPrompt}</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
