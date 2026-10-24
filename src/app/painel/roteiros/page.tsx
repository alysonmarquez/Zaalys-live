"use client";

import { useSearchParams } from "next/navigation";
import React, { Suspense, useState } from "react";
import { RaisedButton, cn } from "@/components/brand";
import {
  TREND_FORMATS,
  type TrendFormat,
  ZAALYS_PRODUCTS,
  formatBRL,
} from "@/lib/zaalys-data";

const TONES = [
  { key: "engracado", label: "Engraçado" },
  { key: "sarcastico", label: "Sarcástico" },
  { key: "absurdo", label: "Absurdo" },
  { key: "dramatico", label: "Dramático" },
  { key: "ternurinha", label: "Ternurinha" },
  { key: "nostalgico", label: "Nostálgico" },
];

type GeneratedScriptOption = {
  id: number;
  hook: string;
  body: string;
  cta: string;
  englishPrompt: string;
};

function TrendAiInner() {
  const searchParams = useSearchParams();
  const initialProdName = searchParams.get("produto") ?? "";

  const [selectedFormat, setSelectedFormat] = useState<TrendFormat | null>(null);
  const [selectedCharId, setSelectedCharId] = useState<string>("");
  const [selectedTone, setSelectedTone] = useState<string>("engracado");
  const [selectedProdId, setSelectedProdId] = useState<number>(() => {
    if (initialProdName) {
      const found = ZAALYS_PRODUCTS.find((p) =>
        p.title.toLowerCase().includes(initialProdName.toLowerCase()),
      );
      if (found) return found.id;
    }
    return ZAALYS_PRODUCTS[0]!.id;
  });
  const [generating, setGenerating] = useState(false);
  const [scripts, setScripts] = useState<GeneratedScriptOption[] | null>(null);
  const [pickedScriptIdx, setPickedScriptIdx] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  const product = ZAALYS_PRODUCTS.find((p) => p.id === selectedProdId) ?? ZAALYS_PRODUCTS[0]!;
  const character =
    selectedFormat?.characters.find((c) => c.id === selectedCharId) ??
    selectedFormat?.characters[0];

  const [generateError, setGenerateError] = useState<string | null>(null);

  async function handleGenerate() {
    if (!selectedFormat || !character) return;
    setGenerating(true);
    setScripts(null);
    setGenerateError(null);
    const toneLabel = TONES.find((t) => t.key === selectedTone)?.label ?? "Engraçado";
    const angles = ["pergunta provocativa", "segredo revelado", "POV antes e depois"];
    try {
      const results = await Promise.all(
        angles.map(async (angle) => {
          const res = await fetch("/api/ai/video-script", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              product: {
                name: product.title,
                price: formatBRL(product.priceCents),
                details: product.facts.join("; "),
              },
              character: { name: character.name, appearance: character.role },
              template: {
                scene: `${selectedFormat.title}: ${selectedFormat.desc}`,
                camera_motion: "vertical 9:16, ritmo de vídeo viral",
              },
              tone: toneLabel,
              angle,
              durationSeconds: 8,
            }),
          });
          const data = await res.json().catch(() => null);
          if (!res.ok || !data?.script) throw new Error(data?.error || "Não foi possível gerar agora.");
          return data.script as {
            hook: string;
            scenes: { shot: string; action: string; speech: string }[];
            cta: string;
            videoPrompt: string;
          };
        }),
      );
      setScripts(
        results.map((sc, i) => ({
          id: i + 1,
          hook: `"${sc.hook}"`,
          body: sc.scenes.map((c) => `${c.action} — "${c.speech}"`).join("\n"),
          cta: `"${sc.cta}"`,
          englishPrompt: sc.videoPrompt,
        })),
      );
      setPickedScriptIdx(0);
    } catch (err) {
      setGenerateError((err as Error).message);
    } finally {
      setGenerating(false);
    }
  }

  function handleCopyAndFlow(promptText: string) {
    navigator.clipboard?.writeText(promptText).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    window.open("https://labs.google/fx/tools/flow", "_blank", "noopener,noreferrer");
  }

  if (!selectedFormat) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Trend AI
          </h1>
          <p className="mt-1.5 max-w-2xl text-muted-foreground">
            Escolha uma estrutura feita para retenção, comentário e compartilhamento.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-3">
          {TREND_FORMATS.map((fmt) => (
            <button
              key={fmt.id}
              type="button"
              onClick={() => {
                setSelectedFormat(fmt);
                setSelectedCharId(fmt.characters[0]!.id);
                setScripts(null);
              }}
              className="group relative flex min-h-64 flex-col justify-end overflow-hidden rounded-3xl border border-black/[0.06] bg-card text-left shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] transition-[transform,border-color,box-shadow] duration-250 ease-out hover:border-primary/40 hover:shadow-[0_20px_48px_-16px_rgba(0,0,0,0.4)] active:scale-[0.98] cursor-pointer dark:border-white/[0.08]"
            >
              <img
                src={fmt.cover}
                alt=""
                loading="lazy"
                className="absolute inset-0 size-full object-cover opacity-55 transition-transform duration-500 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/70 to-card/20" />
              <div className="relative z-10 p-5">
                <span className="inline-flex rounded-full border border-black/[0.04] bg-primary/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary dark:border-white/[0.06]">
                  Template
                </span>
                <h3 className="mt-2 font-display text-xl font-bold tracking-tight">{fmt.title}</h3>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">{fmt.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const activeScript = scripts?.[pickedScriptIdx];

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => {
          setSelectedFormat(null);
          setScripts(null);
        }}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground active:scale-95 cursor-pointer"
      >
        ← Voltar para estruturas
      </button>

      <header>
        <span className="inline-flex rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
          8 segundos · 3 roteiros
        </span>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          {selectedFormat.title}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Escolha o {selectedFormat.castLabel.toLowerCase()} que vai protagonizar sua história, o
          tom e o produto.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
        {/* Left Controls */}
        <div className="apple-card space-y-5 p-5 sm:p-6">
          {/* Character Picker */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              1. {selectedFormat.castLabel}
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {selectedFormat.characters.map((c) => {
                const active = c.id === (character?.id ?? "");
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setSelectedCharId(c.id);
                      setScripts(null);
                    }}
                    className={cn(
                      "group relative flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-2xl border text-left transition-all cursor-pointer",
                      active
                        ? "border-primary ring-2 ring-primary/40"
                        : "border-black/[0.06] hover:border-primary/40 dark:border-white/[0.08]",
                    )}
                  >
                    <img src={c.image} alt={c.name} className="absolute inset-0 size-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                    <div className="relative z-10 p-2">
                      <span className="block truncate text-xs font-bold text-white">{c.name}</span>
                      <span className="block truncate text-[10px] text-white/70">{c.role}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tone Selector */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              2. Escolha o tom do vídeo
            </label>
            <div className="flex flex-wrap gap-2">
              {TONES.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => {
                    setSelectedTone(t.key);
                    setScripts(null);
                  }}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer",
                    selectedTone === t.key
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "border border-border bg-background/60 text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Selector */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              3. Produto do TikTok Shop
            </label>
            <select
              value={selectedProdId}
              onChange={(e) => {
                setSelectedProdId(Number(e.target.value));
                setScripts(null);
              }}
              className="field text-sm"
            >
              {ZAALYS_PRODUCTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({formatBRL(p.priceCents)})
                </option>
              ))}
            </select>
          </div>

          <RaisedButton
            size="lg"
            className="w-full"
            disabled={generating}
            onClick={handleGenerate}
          >
            {generating
              ? "A IA está estruturando cena, ritmo e fala…"
              : "✦ Gerar 3 roteiros e prompt cinematográfico"}
          </RaisedButton>
        </div>

        {/* Right Output */}
        <div className="space-y-4">
          {!scripts ? (
            <div className="apple-card flex min-h-80 flex-col items-center justify-center p-8 text-center">
              <p className="font-display text-lg font-bold">
                {generating ? "Gerando o roteiro viral…" : "Pronto para gerar"}
              </p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {generating
                  ? "Preparando o conteúdo de alta conversão para o seu personagem."
                  : "Clique no botão ao lado para receber 3 opções de roteiro de 8 segundos + o prompt pronto para o Google Flow."}
              </p>
              {generateError && (
                <p role="alert" className="mt-3 text-xs font-medium text-destructive">
                  {generateError}
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Escolha um roteiro
                </span>
                <div className="flex gap-1.5">
                  {scripts.map((s, idx) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setPickedScriptIdx(idx)}
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-semibold transition-colors cursor-pointer",
                        pickedScriptIdx === idx
                          ? "bg-primary text-primary-foreground"
                          : "border border-border bg-card text-muted-foreground hover:text-foreground",
                      )}
                    >
                      Opção {idx + 1}
                    </button>
                  ))}
                </div>
              </div>

              {activeScript && (
                <div className="apple-card space-y-4 p-5 sm:p-6">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                      Gancho (0–2s)
                    </span>
                    <p className="mt-1 text-sm font-medium text-foreground">{activeScript.hook}</p>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Cena & Resposta (2–6s)
                    </span>
                    <p className="mt-1 whitespace-pre-line text-sm text-foreground/90">{activeScript.body}</p>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Chamada no final (6–8s)
                    </span>
                    <p className="mt-1 text-sm font-medium text-primary">{activeScript.cta}</p>
                  </div>

                  <div className="border-t border-border pt-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Prompt gerado (em inglês)
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(activeScript.englishPrompt).catch(() => {});
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        className="rounded-lg border border-border px-2.5 py-1 text-xs font-semibold hover:bg-foreground/[0.05] cursor-pointer"
                      >
                        {copied ? "✓ Copiado" : "Copiar prompt"}
                      </button>
                    </div>
                    <pre className="whitespace-pre-wrap rounded-2xl border border-border bg-background/60 p-3.5 font-mono text-xs leading-relaxed text-foreground/90">
                      {activeScript.englishPrompt}
                    </pre>
                  </div>

                  <div className="flex flex-wrap justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleGenerate}
                      className="btn-ghost py-2 text-xs"
                    >
                      Gerar outro
                    </button>
                    <RaisedButton
                      size="sm"
                      onClick={() => handleCopyAndFlow(activeScript.englishPrompt)}
                    >
                      Copiar e abrir no Google Flow ↗
                    </RaisedButton>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RoteirosPage() {
  return (
    <Suspense fallback={null}>
      <TrendAiInner />
    </Suspense>
  );
}
