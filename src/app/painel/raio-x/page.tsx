"use client";

import Link from "next/link";
import React, { useMemo, useState } from "react";
import { ExternalLink, Play, Search } from "lucide-react";
import { RaisedButton, cn } from "@/components/brand";
import { ZAALYS_PRODUCTS, compactNumber, formatBRL, type ZaalysProduct } from "@/lib/zaalys-data";
import { RAIOX_CATEGORIES, RAIOX_COLLECTED_AT, RAIOX_REFERENCES, type RaioXReference } from "@/lib/raiox-videos";
import type { VideoAnalysis, VideoRemake } from "@/lib/ai/prompts";
import { useIsDemo } from "@/lib/use-demo";

const PAGE = 12;

type Reference = {
  title: string;
  hook: string;
  structure: { stage: string; whatHappens: string }[];
  analysisId?: string;
};

/** Mesma tela do original: galeria de referências → produto → roteiro. */
export default function RaioXPage() {
  const demo = useIsDemo();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<"sales" | "views">("sales");
  const [visible, setVisible] = useState(PAGE);
  const [selected, setSelected] = useState<RaioXReference | null>(null);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [reference, setReference] = useState<Reference | null>(null);
  const [productQuery, setProductQuery] = useState("");
  const [product, setProduct] = useState<ZaalysProduct | null>(null);
  const [versions, setVersions] = useState<string[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [copied, setCopied] = useState<number | null>(null);

  // Analisar a fala de um vídeo próprio (link + transcrição ou arquivo).
  const [ownUrl, setOwnUrl] = useState("");
  const [ownTranscript, setOwnTranscript] = useState("");
  const [ownFile, setOwnFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<(VideoAnalysis & { id?: string }) | null>(null);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return RAIOX_REFERENCES.filter((v) => category === "all" || v.category === category)
      .filter((v) => !q || v.title.toLowerCase().includes(q) || v.creator.toLowerCase().includes(q))
      .sort((a, b) => (sort === "sales" ? b.sales - a.sales : b.views - a.views));
  }, [search, category, sort]);

  const products = useMemo(() => {
    const q = productQuery.trim().toLowerCase();
    return ZAALYS_PRODUCTS.filter((p) => !q || p.title.toLowerCase().includes(q)).slice(0, 12);
  }, [productQuery]);

  function pickVideo(v: RaioXReference) {
    setReference({
      title: v.title,
      hook: `Vídeo de ${v.creator} sobre "${v.title.slice(0, 80)}"`,
      structure: [
        { stage: "Referência", whatHappens: `${v.title} — ${compactNumber(v.views)} views e ${compactNumber(v.sales)} vendas registradas (${v.category}).` },
        { stage: "Gancho", whatHappens: "Mostra o resultado ou o problema nos primeiros 2 segundos." },
        { stage: "Prova", whatHappens: "Demonstra o produto em uso real, sem cortes longos." },
        { stage: "Chamada", whatHappens: "Aponta para o carrinho laranja no final." },
      ],
    });
    setVersions(null);
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function pickAnalysis(a: VideoAnalysis & { id?: string }) {
    setReference({
      title: ownUrl || "Vídeo analisado",
      hook: a.hook,
      structure: a.structure.map((s) => ({ stage: s.part, whatHappens: `${s.purpose} — “${s.excerpt}”` })),
      analysisId: a.id,
    });
    setVersions(null);
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function demoVersions(p: ZaalysProduct) {
    return [
      `Versão 1 (Foco na Dor + Prova Rápida):\n• 0–2s (Gancho): "Se você ia comprar sem olhar esse detalhe, para agora e vê isso aqui."\n• 2–6s (Prova): Mostra ${p.title} em close: ${p.facts[0]}.\n• 6–8s (CTA): "Deixei o link oficial por ${formatBRL(p.priceCents)} aqui no carrinho laranja."`,
      `Versão 2 (Teste de Risco / Curiosidade):\n• 0–2s (Gancho): "Testei na prática pra ver se valia o hype do TikTok Shop…"\n• 2–6s (Prova): Demonstra ${p.facts[1] ?? p.facts[0]} sem corte.\n• 6–8s (CTA): "Tá com frete e cupom na sacolinha aqui embaixo."`,
      `Versão 3 (Comparação de Custo-Benefício):\n• 0–2s (Gancho): "Por ${formatBRL(p.priceCents)}, isso aqui entregou mais que o dobro do preço."\n• 2–6s (Prova): Mostra acabamento e uso real de ${p.title}.\n• 6–8s (CTA): "Corre no link do carrinho antes que acabe o lote."`,
    ];
  }

  async function createScripts() {
    if (!reference || !product) return;
    setStep(3);
    setCreateError(null);
    setVersions(null);
    if (demo) {
      setCreating(true);
      setTimeout(() => {
        setVersions(demoVersions(product));
        setCreating(false);
      }, 750);
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/ai/remake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysisId: reference.analysisId,
          reference: { hook: reference.hook.slice(0, 500), structure: reference.structure.slice(0, 12) },
          product: { name: product.title.slice(0, 200), price: formatBRL(product.priceCents), details: product.facts.join("; ") },
        }),
      });
      const data = (await res.json().catch(() => null)) as (VideoRemake & { error?: string }) | null;
      if (!res.ok || !data?.versions) throw new Error(data?.error || "Não foi possível criar o roteiro agora.");
      setVersions(
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
      setCreateError((err as Error).message);
    } finally {
      setCreating(false);
    }
  }

  async function analyzeOwn(e: React.FormEvent) {
    e.preventDefault();
    setAnalyzeError(null);
    if (!ownTranscript.trim() && !ownFile) {
      setAnalyzeError("O TikTok não deixa baixar o vídeo pelo link. Cole a fala do vídeo ou envie o áudio/vídeo.");
      return;
    }
    if (demo) {
      setAnalyzeError("No modo demonstração, use um dos vídeos da galeria acima.");
      return;
    }
    setAnalyzing(true);
    try {
      const form = new FormData();
      form.set("url", ownUrl.trim());
      form.set("transcript", ownTranscript.trim());
      if (ownFile) form.set("file", ownFile);
      const res = await fetch("/api/ai/raio-x", { method: "POST", body: form });
      const data = (await res.json().catch(() => null)) as { id?: string; analysis?: VideoAnalysis; error?: string } | null;
      if (!res.ok || !data?.analysis) throw new Error(data?.error || "Não foi possível analisar.");
      setAnalysis({ ...data.analysis, id: data.id });
    } catch (err) {
      setAnalyzeError((err as Error).message);
    } finally {
      setAnalyzing(false);
    }
  }

  const steps = ["Escolha um vídeo", "Selecione seu produto", "Crie seu roteiro"];

  return (
    <div className="space-y-6">
      <Link href="/painel" className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">
        Voltar à Central
      </Link>

      <header>
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Raio-X de Vídeo</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Cole o link de um vídeo que está vendendo: veja os números, o gancho e a estrutura, e recrie o roteiro para um
          produto seu.
        </p>
      </header>

      <section className="space-y-4">
        <p className="text-xs font-semibold text-primary">{RAIOX_REFERENCES.length} referências reais · TikTok Shop Brasil</p>
        <div>
          <h2 className="font-display text-2xl font-extrabold tracking-tight">Encontre seu próximo vídeo.</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Assista a um vídeo com vendas registradas e adapte a estrutura para o seu produto.
          </p>
        </div>

        <ol className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          {steps.map((label, i) => {
            const n = (i + 1) as 1 | 2 | 3;
            const done = step > n;
            return (
              <li key={label} className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={n > step}
                  onClick={() => setStep(n)}
                  className={cn(
                    "grid size-6 place-items-center rounded-full text-xs font-bold",
                    step === n || done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                    n <= step && "cursor-pointer",
                  )}
                >
                  {done ? "✓" : n}
                </button>
                <span className={step === n ? "font-semibold text-foreground" : "text-muted-foreground"}>{label}</span>
              </li>
            );
          })}
        </ol>

        {/* Passo 2: produto */}
        {step === 2 && reference && (
          <div className="apple-card space-y-4 p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Vídeo escolhido</p>
              <p className="mt-1 line-clamp-2 text-sm font-semibold">{reference.title}</p>
            </div>
            <div className="relative">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={productQuery}
                onChange={(e) => setProductQuery(e.target.value)}
                placeholder="Busque o produto que você vai divulgar"
                className="field pl-9 text-sm"
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {products.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProduct(p)}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border p-2.5 text-left transition-colors cursor-pointer",
                    product?.id === p.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/40",
                  )}
                >
                  <img src={p.imageUrl} alt="" className="size-11 shrink-0 rounded-xl object-cover" />
                  <span className="min-w-0">
                    <span className="line-clamp-1 text-xs font-semibold">{p.title}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {formatBRL(p.priceCents)} · {p.commissionPct}% comissão
                    </span>
                  </span>
                </button>
              ))}
            </div>
            <RaisedButton onClick={createScripts} disabled={!product} className="w-full sm:w-auto">
              Criar meu roteiro
            </RaisedButton>
          </div>
        )}

        {/* Passo 3: roteiro */}
        {step === 3 && (
          <div className="apple-card space-y-3 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Roteiro para</p>
                <p className="line-clamp-1 text-sm font-semibold">{product?.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs font-semibold text-muted-foreground underline underline-offset-4 hover:text-foreground cursor-pointer"
              >
                Trocar produto
              </button>
            </div>
            {creating && <p className="text-sm text-muted-foreground">Criando 3 versões com a mesma estrutura…</p>}
            {createError && (
              <p role="alert" className="text-sm font-medium text-destructive">
                {createError}
              </p>
            )}
            {versions?.map((ver, idx) => (
              <div key={idx} className="rounded-2xl border border-border bg-background/60 p-3 text-xs">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="font-semibold text-primary">Roteiro #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(ver).catch(() => {});
                      setCopied(idx);
                      setTimeout(() => setCopied(null), 2000);
                    }}
                    className="rounded-lg border border-border px-2 py-0.5 text-[11px] font-semibold hover:bg-foreground/[0.05] cursor-pointer"
                  >
                    {copied === idx ? "Copiado" : "Copiar"}
                  </button>
                </div>
                <pre className="whitespace-pre-wrap font-sans leading-relaxed text-foreground/90">{ver}</pre>
              </div>
            ))}
          </div>
        )}

        {/* Painel do vídeo selecionado */}
        {step === 1 && selected && (
          <div className="apple-card grid gap-4 overflow-hidden p-4 sm:grid-cols-[260px_1fr] sm:p-5">
            <div className="aspect-[9/16] w-full overflow-hidden rounded-2xl bg-black">
              <iframe
                key={selected.id}
                src={`https://www.tiktok.com/embed/v2/${selected.id}`}
                title={selected.title}
                className="size-full"
                allow="encrypted-media; fullscreen"
              />
            </div>
            <div className="flex flex-col">
              <p className="text-xs text-muted-foreground">
                {selected.creator} · {selected.category}
              </p>
              <h3 className="mt-1 font-display text-lg font-bold leading-snug">{selected.title}</h3>
              <div className="mt-3 flex gap-6">
                <div>
                  <p className="font-mono text-xl font-bold tabular-nums">{compactNumber(selected.views)}</p>
                  <p className="text-xs text-muted-foreground">visualizações</p>
                </div>
                <div>
                  <p className="font-mono text-xl font-bold tabular-nums text-primary">{compactNumber(selected.sales)}</p>
                  <p className="text-xs text-muted-foreground">vendas</p>
                </div>
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground">
                Números do vídeo informados pelo FastMoss, coletados em {RAIOX_COLLECTED_AT}. Não garantem o resultado de
                uma recriação.
              </p>
              <div className="mt-auto flex flex-wrap gap-2 pt-4">
                <a
                  href={selected.tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-border px-3 text-xs font-semibold hover:bg-muted"
                >
                  Abrir no TikTok <ExternalLink size={13} />
                </a>
                <a
                  href={selected.fastmossUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-border px-3 text-xs font-semibold hover:bg-muted"
                >
                  Conferir no FastMoss <ExternalLink size={13} />
                </a>
                <RaisedButton size="sm" onClick={() => pickVideo(selected)}>
                  Usar este vídeo
                </RaisedButton>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">Se o player não carregar, abra o vídeo no TikTok.</p>
            </div>
          </div>
        )}

        {/* Filtros */}
        {step === 1 && (
          <>
            <div className="grid gap-2.5 sm:grid-cols-[1fr_auto_auto]">
              <div className="relative">
                <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setVisible(PAGE);
                  }}
                  placeholder="Busque um produto ou criador"
                  aria-label="Buscar vídeos"
                  className="field pl-9 text-sm"
                />
              </div>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setVisible(PAGE);
                }}
                aria-label="Categoria"
                className="field text-sm sm:w-56"
              >
                <option value="all">Todas as categorias</option>
                {RAIOX_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as "sales" | "views")}
                aria-label="Ordenar"
                className="field text-sm sm:w-44"
              >
                <option value="sales">Mais vendas</option>
                <option value="views">Mais visualizações</option>
              </select>
            </div>

            <p className="text-xs text-muted-foreground">{filtered.length} vídeos encontrados</p>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {filtered.slice(0, visible).map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => {
                    setSelected(v);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={cn(
                    "group flex flex-col overflow-hidden rounded-3xl border bg-card text-left transition-[transform,border-color] duration-200 hover:border-primary/40 active:scale-[0.98] cursor-pointer",
                    selected?.id === v.id ? "border-primary" : "border-black/[0.06] dark:border-white/[0.08]",
                  )}
                >
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
                    <img src={v.thumbnail} alt="" loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20" />
                    <span className="absolute left-2.5 top-2.5 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-md">
                      FastMoss · BR
                    </span>
                    <span className="absolute left-1/2 top-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white backdrop-blur-sm">
                      <Play size={18} className="ml-0.5 fill-white" />
                    </span>
                    <div className="absolute inset-x-2.5 bottom-2.5 flex items-center justify-between text-[11px] font-semibold text-white">
                      <span className="tabular-nums">{compactNumber(v.views)} views</span>
                      <span className="tabular-nums">{compactNumber(v.sales)} vendas</span>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="line-clamp-2 text-xs font-semibold leading-snug">{v.title}</h3>
                    <p className="mt-1 truncate text-[11px] text-muted-foreground">{v.creator}</p>
                  </div>
                </button>
              ))}
            </div>

            {visible < filtered.length && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisible((n) => n + PAGE)}
                  className="h-10 rounded-xl border border-border px-5 text-sm font-semibold hover:bg-muted cursor-pointer"
                >
                  Ver mais vídeos
                </button>
              </div>
            )}

            {/* Vídeo próprio */}
            <form onSubmit={analyzeOwn} className="apple-card space-y-3 p-5">
              <div>
                <h3 className="font-display text-base font-bold">Tem outro vídeo? Analise a fala dele</h3>
                <p className="text-xs text-muted-foreground">
                  Cole o link para referência e a fala do vídeo (ou envie o áudio/vídeo). A IA mostra o gancho e a estrutura.
                </p>
              </div>
              <input
                type="text"
                inputMode="url"
                value={ownUrl}
                onChange={(e) => setOwnUrl(e.target.value)}
                placeholder="https://www.tiktok.com/@criador/video/..."
                className="field text-sm"
              />
              <div className="grid gap-2.5 sm:grid-cols-[1fr_auto] sm:items-start">
                <textarea
                  value={ownTranscript}
                  onChange={(e) => setOwnTranscript(e.target.value)}
                  rows={3}
                  placeholder="Cole aqui a fala do vídeo (o que é dito)."
                  className="field text-sm"
                />
                <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-border px-3 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground">
                  {ownFile ? ownFile.name.slice(0, 28) : "Enviar áudio/vídeo (até 25 MB)"}
                  <input type="file" accept="audio/*,video/*" className="sr-only" onChange={(e) => setOwnFile(e.target.files?.[0] ?? null)} />
                </label>
              </div>
              {analyzeError && (
                <p role="alert" className="text-xs font-medium text-destructive">
                  {analyzeError}
                </p>
              )}
              <RaisedButton type="submit" size="sm" disabled={analyzing}>
                {analyzing ? "Analisando…" : "Analisar no Raio-X"}
              </RaisedButton>

              {analysis && (
                <div className="space-y-2 border-t border-border pt-3 text-sm">
                  <p className="text-xs font-semibold text-muted-foreground">Gancho · {analysis.hookType}</p>
                  <p className="font-semibold">“{analysis.hook}”</p>
                  <ol className="space-y-1 text-xs text-muted-foreground">
                    {analysis.structure.map((s, i) => (
                      <li key={i}>
                        <span className="font-semibold text-foreground">{s.part}:</span> {s.purpose}
                      </li>
                    ))}
                  </ol>
                  <RaisedButton size="sm" onClick={() => pickAnalysis(analysis)}>
                    Usar esta estrutura
                  </RaisedButton>
                </div>
              )}
            </form>
          </>
        )}
      </section>
    </div>
  );
}
