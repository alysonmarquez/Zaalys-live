"use client";

import React, { useMemo, useState } from "react";
import { RaisedButton, Segmented, cn } from "@/components/brand";
import {
  FASTMOSS_VIDEOS,
  type FastMossVideo,
  ZAALYS_PRODUCTS,
  compactNumber,
  formatBRL,
} from "@/lib/zaalys-data";
import type { VideoAnalysis, VideoRemake } from "@/lib/ai/prompts";

/** Vídeo da galeria de exemplos ou analisado de verdade pela IA (sem números de venda). */
type RaioXVideo = FastMossVideo & { analysisId?: string; analyzed?: boolean };

export default function RaioXPage() {
  const [pastedUrl, setPastedUrl] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [sort, setSort] = useState<"sales" | "views">("sales");
  const [selectedVideo, setSelectedVideo] = useState<RaioXVideo | null>(null);
  const [savedVideos, setSavedVideos] = useState<RaioXVideo[]>([]);
  const [transcript, setTranscript] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [recreateError, setRecreateError] = useState<string | null>(null);
  const [targetProductId, setTargetProductId] = useState<number>(ZAALYS_PRODUCTS[0]!.id);
  const [recreatedVersions, setRecreatedVersions] = useState<string[] | null>(null);
  const [recreating, setRecreating] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const categories = useMemo(() => {
    const set = new Set(FASTMOSS_VIDEOS.map((v) => v.category));
    return ["all", ...Array.from(set)];
  }, []);

  const filteredVideos = useMemo(() => {
    const q = search.trim().toLowerCase();
    return FASTMOSS_VIDEOS.filter((v) => (category === "all" ? true : v.category === category))
      .filter((v) =>
        !q
          ? true
          : v.title.toLowerCase().includes(q) ||
            v.creator.toLowerCase().includes(q) ||
            v.category.toLowerCase().includes(q),
      )
      .sort((a, b) => (sort === "sales" ? b.sales - a.sales : b.views - a.views));
  }, [search, category, sort]);

  async function handleAnalyzeLink(e: React.FormEvent) {
    e.preventDefault();
    setAnalyzeError(null);
    if (!transcript.trim() && !mediaFile) {
      setAnalyzeError(
        "O TikTok não deixa baixar o vídeo pelo link. Cole a fala do vídeo ou envie o áudio/vídeo baixado.",
      );
      return;
    }
    setAnalyzing(true);
    try {
      const form = new FormData();
      form.set("url", pastedUrl.trim());
      form.set("transcript", transcript.trim());
      if (mediaFile) form.set("file", mediaFile);
      const res = await fetch("/api/ai/raio-x", { method: "POST", body: form });
      const data = (await res.json().catch(() => null)) as
        | { id?: string; analysis?: VideoAnalysis; error?: string }
        | null;
      if (!res.ok || !data?.analysis) throw new Error(data?.error || "Não foi possível analisar.");
      const a = data.analysis;
      const url = pastedUrl.trim();
      const analyzed: RaioXVideo = {
        id: data.id ?? `raiox-${Date.now()}`,
        analysisId: data.id,
        analyzed: true,
        title: url ? `Raio-X: ${url.replace(/^https?:\/\//, "").slice(0, 40)}` : `Raio-X: ${a.hookType}`,
        creator: url.match(/@([\w.]+)/)?.[1] ?? "seu vídeo",
        category: a.hookType,
        thumbnail: "/media/central-raiox.webp",
        source: "TikTok",
        sourceUrl: url,
        tiktokUrl: url,
        views: 0,
        sales: 0,
        hook: a.hook,
        structure: a.structure.map((part) => ({
          stage: part.part,
          time: "",
          whatHappens: `${part.purpose} — “${part.excerpt}”`,
        })),
        takeaways: [...a.arguments, `Chamada final: ${a.cta}`],
      };
      setSavedVideos((prev) => [analyzed, ...prev]);
      setSelectedVideo(analyzed);
      setRecreatedVersions(null);
      setPastedUrl("");
      setTranscript("");
      setMediaFile(null);
    } catch (err) {
      setAnalyzeError((err as Error).message);
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleRecreate() {
    if (!selectedVideo) return;
    setRecreating(true);
    setRecreatedVersions(null);
    setRecreateError(null);
    const prod = ZAALYS_PRODUCTS.find((p) => p.id === targetProductId) ?? ZAALYS_PRODUCTS[0]!;
    try {
      const res = await fetch("/api/ai/remake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysisId: selectedVideo.analysisId,
          reference: {
            hook: selectedVideo.hook,
            structure: selectedVideo.structure.map((s) => ({
              stage: [s.stage, s.time].filter(Boolean).join(" "),
              whatHappens: s.whatHappens,
            })),
          },
          product: {
            name: prod.title,
            price: formatBRL(prod.priceCents),
            details: prod.facts.join("; "),
          },
        }),
      });
      const data = (await res.json().catch(() => null)) as (VideoRemake & { error?: string }) | null;
      if (!res.ok || !data?.versions) throw new Error(data?.error || "Não foi possível recriar agora.");
      setRecreatedVersions(
        data.versions.map((v, i) =>
          [
            `Versão ${i + 1} (${v.angle}):`,
            `• Gancho: "${v.hook}"`,
            ...v.beats.map((b) => `• ${b.time} — ${b.shot}: "${b.speech}"`),
            `• CTA: "${v.cta}"`,
            "",
            "Prompt para o Flow/Veo:",
            v.videoPrompt,
          ].join("\n"),
        ),
      );
    } catch (err) {
      setRecreateError((err as Error).message);
    } finally {
      setRecreating(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Top Paste Link Card */}
      <section className="apple-card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="inline-flex rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
              Já tem um vídeo? Cole o link
            </span>
            <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
              Cole o link de um vídeo do TikTok que está vendendo
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Pode ser de um concorrente ou seu. Extraímos os números, o gancho, a estrutura e
              recriamos para o seu produto.
            </p>
          </div>
        </div>

        <form onSubmit={handleAnalyzeLink} className="mt-4 flex flex-col gap-2.5 sm:flex-row">
          <input
            type="text"
            inputMode="url"
            value={pastedUrl}
            onChange={(e) => setPastedUrl(e.target.value)}
            placeholder="https://www.tiktok.com/@criador/video/..."
            className="field flex-1 text-sm"
          />
          <RaisedButton type="submit" size="default" className="shrink-0" disabled={analyzing}>
            {analyzing ? "Analisando…" : "Analisar no Raio-X"}
          </RaisedButton>
        </form>
        <div className="mt-2.5 grid gap-2.5 sm:grid-cols-[1fr_auto] sm:items-start">
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={3}
            placeholder="Cole aqui a fala do vídeo (o que é dito), ou envie o arquivo ao lado."
            className="field text-sm"
          />
          <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-border px-3 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground">
            {mediaFile ? mediaFile.name.slice(0, 28) : "Enviar áudio/vídeo (até 25 MB)"}
            <input
              type="file"
              accept="audio/*,video/*"
              className="sr-only"
              onChange={(e) => setMediaFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>
        {analyzeError && (
          <p role="alert" className="mt-2 text-xs font-medium text-destructive">
            {analyzeError}
          </p>
        )}

        {/* Meus Raio-X salvos */}
        <div className="mt-5 border-t border-border/70 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Meus Raio-X salvos
          </p>
          {savedVideos.length === 0 ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Os Raio-X que você salvar ficam listados aqui.
            </p>
          ) : (
            <div className="mt-2 flex flex-wrap gap-2">
              {savedVideos.map((sv) => (
                <button
                  key={sv.id}
                  type="button"
                  onClick={() => {
                    setSelectedVideo(sv);
                    setRecreatedVersions(null);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/60 px-3 py-1.5 text-xs font-medium hover:border-primary/40 cursor-pointer"
                >
                  <span className="max-w-[220px] truncate">{sv.title}</span>
                  <span className="tabular text-primary">
                    {sv.analyzed ? "analisado" : `${sv.sales} vendas`}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Encontre seu próximo vídeo (FastMoss BR) */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-2xl font-extrabold tracking-tight">
                Encontre seu próximo vídeo.
              </h2>
              <span className="rounded-full border border-border bg-card px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                FastMoss · BR
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Exemplos de vídeos que converteram no TikTok Shop Brasil. Abra um para estudar a
              estrutura e fazer o remake para o seu produto.
            </p>
          </div>

          <Segmented
            label="Ordenar vídeos"
            size="sm"
            value={sort}
            onChange={setSort}
            options={[
              { value: "sales", label: "Mais vendas" },
              { value: "views", label: "Mais visualizações" },
            ]}
          />
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-wrap items-center gap-2.5">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar vídeos…"
            className="field max-w-xs text-sm"
          />
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer",
                  category === cat
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "border border-border bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                {cat === "all" ? "Todas as categorias" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* FastMoss Video Cards Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filteredVideos.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => {
                setSelectedVideo(v);
                setRecreatedVersions(null);
              }}
              className="group flex flex-col overflow-hidden rounded-3xl border border-black/[0.06] bg-card text-left transition-[transform,border-color,box-shadow] duration-200 hover:border-primary/40 hover:shadow-[0_16px_36px_-12px_rgba(0,0,0,0.4)] active:scale-[0.98] cursor-pointer dark:border-white/[0.08]"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
                <img
                  src={v.thumbnail}
                  alt={v.title}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <span className="tabular absolute left-2.5 top-2.5 rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-bold text-primary-foreground shadow-xs">
                  {v.sales} vendas
                </span>
                <div className="absolute inset-x-2.5 bottom-2.5 flex items-center justify-between text-[11px] text-white/90">
                  <span className="truncate font-medium">@{v.creator}</span>
                  <span className="tabular shrink-0">{compactNumber(v.views)} views</span>
                </div>
              </div>

              <div className="flex flex-1 flex-col justify-between p-3.5">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {v.category}
                  </span>
                  <h3 className="mt-1 line-clamp-2 text-xs font-semibold leading-snug text-foreground">
                    {v.title}
                  </h3>
                </div>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                  Ver análise, estrutura e transcrição →
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Raio-X Full Analysis & Recreate Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="apple-card grid max-h-[90dvh] w-full max-w-3xl overflow-hidden shadow-2xl sm:grid-cols-[220px_1fr]">
            {/* Left Thumbnail & Stats */}
            <div className="relative flex flex-col justify-between bg-black p-4 text-white">
              <img
                src={selectedVideo.thumbnail}
                alt={selectedVideo.title}
                className="pointer-events-none absolute inset-0 size-full object-cover opacity-45"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />

              <div className="relative z-10">
                <span className="rounded-full bg-primary/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                  {selectedVideo.analyzed ? "Raio-X" : `${selectedVideo.source} · BR`}
                </span>
                <p className="mt-2 text-xs text-white/80">@{selectedVideo.creator}</p>
              </div>

              <div className="relative z-10 space-y-2">
                {selectedVideo.analyzed ? (
                  <p className="text-xs text-white/80">
                    Análise feita pela IA a partir da fala do vídeo. Vendas e views não são lidas do
                    TikTok.
                  </p>
                ) : (
                <>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-white/60">
                    Vendas atribuídas
                  </span>
                  <p className="tabular text-2xl font-extrabold text-primary">
                    {selectedVideo.sales} vendas
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-white/60">
                    Visualizações
                  </span>
                  <p className="tabular text-sm font-bold text-white">
                    {selectedVideo.views.toLocaleString("pt-BR")} views
                  </p>
                </div>
                </>
                )}
                <a
                  href={selectedVideo.tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-xs font-semibold text-primary underline"
                >
                  Abrir vídeo no TikTok ↗
                </a>
              </div>
            </div>

            {/* Right Analysis & Recreate */}
            <div className="flex flex-col space-y-5 overflow-y-auto p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {selectedVideo.category}
                  </span>
                  <h2 className="mt-1 font-display text-lg font-bold leading-snug">
                    {selectedVideo.title}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedVideo(null)}
                  className="rounded-lg p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Gancho */}
              <div className="rounded-2xl border border-primary/25 bg-primary/[0.06] p-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  Gancho falado nos primeiros 2 segundos
                </span>
                <p className="mt-1 text-sm font-medium text-foreground">
                  “{selectedVideo.hook}”
                </p>
              </div>

              {/* Estrutura cena a cena */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Estrutura e ritmo do vídeo
                </h3>
                <ul className="mt-2 space-y-2">
                  {selectedVideo.structure.map((s) => (
                    <li
                      key={s.stage}
                      className="rounded-xl border border-border bg-background/50 p-3 text-xs"
                    >
                      <div className="flex items-center justify-between font-semibold text-foreground">
                        <span>{s.stage}</span>
                        <span className="font-mono text-[11px] text-primary">{s.time}</span>
                      </div>
                      <p className="mt-1 text-muted-foreground">{s.whatHappens}</p>
                    </li>
                  ))}
                </ul>
              </div>

              {/* O que levar para o seu vídeo */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  O que levar para o seu vídeo
                </h3>
                <ul className="mt-1.5 space-y-1 text-xs text-foreground/90">
                  {selectedVideo.takeaways.map((t, i) => (
                    <li key={i}>• {t}</li>
                  ))}
                </ul>
              </div>

              {/* Recriar para o meu produto */}
              <div className="space-y-3 border-t border-border pt-4">
                <div>
                  <h3 className="font-display text-base font-bold">Recriar para o meu produto</h3>
                  <p className="text-xs text-muted-foreground">
                    A mesma estrutura e o mesmo ritmo, com falas novas.
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <select
                    value={targetProductId}
                    onChange={(e) => setTargetProductId(Number(e.target.value))}
                    className="field flex-1 text-xs"
                  >
                    {ZAALYS_PRODUCTS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                  <RaisedButton size="sm" onClick={handleRecreate} disabled={recreating}>
                    {recreating ? "Recriando…" : "✦ Recriar 3 versões"}
                  </RaisedButton>
                </div>
                {recreateError && (
                  <p role="alert" className="text-xs font-medium text-destructive">
                    {recreateError}
                  </p>
                )}

                {recreatedVersions && (
                  <div className="space-y-2.5 pt-2">
                    <p className="text-xs font-semibold text-muted-foreground">
                      O que testar nas três versões?
                    </p>
                    {recreatedVersions.map((ver, idx) => (
                      <div
                        key={idx}
                        className="rounded-2xl border border-border bg-background/60 p-3 text-xs"
                      >
                        <div className="mb-1.5 flex items-center justify-between">
                          <span className="font-semibold text-primary">Roteiro #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard?.writeText(ver).catch(() => {});
                              setCopiedIdx(idx);
                              setTimeout(() => setCopiedIdx(null), 2000);
                            }}
                            className="rounded-lg border border-border px-2 py-0.5 text-[11px] font-semibold hover:bg-foreground/[0.05] cursor-pointer"
                          >
                            {copiedIdx === idx ? "Copiado" : "Copiar"}
                          </button>
                        </div>
                        <pre className="whitespace-pre-wrap font-sans leading-relaxed text-foreground/90">
                          {ver}
                        </pre>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
