"use client";

import { useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";
import { RaisedButton, cn } from "@/components/brand";
import {
  PROOF_GOAL_LABELS,
  type ProofGoal,
  ZAALYS_MODELS,
  ZAALYS_PRODUCTS,
  ZAALYS_TEMPLATES,
  type ZaalysTemplate,
  formatBRL,
} from "@/lib/zaalys-data";
import { useIsDemo } from "@/lib/use-demo";

const FORMATS = [
  { key: "todos", label: "Todos" },
  { key: "presenter", label: "Apresentando" },
  { key: "application", label: "Aplicação" },
  { key: "hands-demo", label: "Demonstração" },
  { key: "unboxing", label: "Unboxing" },
  { key: "try-on", label: "Provando" },
  { key: "pov", label: "POV" },
  { key: "pet", label: "Pet" },
];

function TemplatesInner() {
  const searchParams = useSearchParams();
  const initialProdId = Number(searchParams.get("produto") ?? "0") || ZAALYS_PRODUCTS[0]!.id;

  const [format, setFormat] = useState("todos");
  const [goal, setGoal] = useState<ProofGoal | null>(null);
  const [activeTemplate, setActiveTemplate] = useState<ZaalysTemplate | null>(null);
  const [selectedProdId, setSelectedProdId] = useState<number>(initialProdId);
  const [selectedModelId, setSelectedModelId] = useState<string>(ZAALYS_MODELS[0]!.id);
  const [selectedGoal, setSelectedGoal] = useState<ProofGoal>("use");
  const [generating, setGenerating] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (searchParams.get("produto")) {
      setSelectedProdId(Number(searchParams.get("produto")));
      setActiveTemplate(ZAALYS_TEMPLATES[1]!);
    }
  }, [searchParams]);

  const filteredTemplates = ZAALYS_TEMPLATES.filter(
    (t) =>
      (format === "todos" || t.format === format) &&
      (!goal || t.proofGoals.includes(goal)),
  );

  const selectedProduct =
    ZAALYS_PRODUCTS.find((p) => p.id === selectedProdId) ?? ZAALYS_PRODUCTS[0]!;
  const selectedModel =
    ZAALYS_MODELS.find((m) => m.id === selectedModelId) ?? ZAALYS_MODELS[0]!;

  const [generateError, setGenerateError] = useState<string | null>(null);
  const demo = useIsDemo();

  // Modo demonstração: mesmo prompt de exemplo do sistema original.
  function demoGenerate() {
    if (!activeTemplate) return;
    setGenerating(true);
    setGeneratedPrompt(null);
    setTimeout(() => {
      const modelDesc = activeTemplate.needsModel
        ? `Creator: ${selectedModel.name} (${selectedModel.appearance}).`
        : `Hands-only POV shot on a clean sunlit countertop, no face visible.`;

      const prompt = `[PLANO DE CENA · 8 SEGUNDOS · ${activeTemplate.formatLabel.toUpperCase()}]
Pergunta respondida: ${PROOF_GOAL_LABELS[selectedGoal]}
Produto: ${selectedProduct.title}

0.0s – 2.0s (Gancho visual):
${modelDesc} Segura o produto "${selectedProduct.title}" próximo à lente em 9:16 vertical, luz natural suave de janela, foco nítido na textura real do item.
Fala em português brasileiro natural: "Se você estava procurando saber se vale a pena, olha esse detalhe de perto."

2.0s – 6.0s (Prova · ${PROOF_GOAL_LABELS[selectedGoal]}):
Demonstração contínua mostrando: ${selectedProduct.facts[0]}. Movimento de câmera orgânico estilo iPhone 16 Pro UGC, sem cortes bruscos.

6.0s – 8.0s (Chamada para a sacola):
Sorriso confiante apontando sutilmente para o canto inferior esquerdo (sacola do TikTok Shop): "Deixei o link com desconto aqui no carrinho laranja."`;

      setGeneratedPrompt(prompt);
      setGenerating(false);
    }, 900);
  }


  async function handleGenerate() {
    if (!activeTemplate) return;
    if (demo) {
      demoGenerate();
      return;
    }
    setGenerating(true);
    setGeneratedPrompt(null);
    setGenerateError(null);

    try {
      const res = await fetch("/api/ai/video-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: {
            name: selectedProduct.title,
            price: formatBRL(selectedProduct.priceCents),
            details: selectedProduct.facts.join("; "),
          },
          character: activeTemplate.needsModel
            ? { name: selectedModel.name, appearance: selectedModel.appearance }
            : { name: "Só as mãos", appearance: "Plano POV só com as mãos, sem rosto, bancada clara com luz natural" },
          template: {
            scene: `${activeTemplate.title} (${activeTemplate.formatLabel}): ${activeTemplate.description}`,
            camera_motion: "vertical 9:16, câmera orgânica estilo celular",
          },
          angle: `responder: ${PROOF_GOAL_LABELS[selectedGoal]}`,
          durationSeconds: 8,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.script?.videoPrompt) {
        throw new Error(data?.error || "Não foi possível gerar o roteiro agora.");
      }
      const sc = data.script as {
        hook: string;
        scenes: { shot: string; action: string; speech: string; seconds: number }[];
        cta: string;
        videoPrompt: string;
      };
      setGeneratedPrompt(
        `[ROTEIRO FALADO — 8s]\nGancho: "${sc.hook}"\n${sc.scenes
          .map((c, i) => `Cena ${i + 1} (${c.seconds}s): ${c.shot}, ${c.action} — "${c.speech}"`)
          .join("\n")}\nCTA: "${sc.cta}"\n\n[PROMPT GOOGLE FLOW / VEO 3]\n${sc.videoPrompt}`,
      );
    } catch (err) {
      setGenerateError((err as Error).message);
    } finally {
      setGenerating(false);
    }
  }

  function handleCopyPrompt() {
    if (!generatedPrompt) return;
    navigator.clipboard?.writeText(generatedPrompt).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleOpenFlow() {
    if (generatedPrompt) {
      navigator.clipboard?.writeText(generatedPrompt).catch(() => {});
    }
    window.open("https://labs.google/fx/tools/flow", "_blank", "noopener,noreferrer");
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <header>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Templates Virais</h1>
        <p className="mt-1 max-w-2xl text-muted-foreground">
          Escolha um movimento, combine com o seu produto — a IA escreve o roteiro plano a plano e
          você gera no Google Flow enviando as imagens.
        </p>
      </header>

      {/* Pergunta de compra filter */}
      <fieldset className="flex flex-wrap gap-2">
        <legend className="mb-2 text-sm font-medium">
          Qual pergunta o vídeo deve responder?
        </legend>
        <button
          type="button"
          onClick={() => setGoal(null)}
          aria-pressed={goal === null}
          className={cn(
            "rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer",
            goal === null
              ? "bg-primary text-primary-foreground shadow-xs"
              : "border border-border bg-card text-muted-foreground hover:text-foreground",
          )}
        >
          Todas
        </button>
        {(Object.entries(PROOF_GOAL_LABELS) as [ProofGoal, string][]).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setGoal(k)}
            aria-pressed={goal === k}
            className={cn(
              "rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer",
              goal === k
                ? "bg-primary text-primary-foreground shadow-xs"
                : "border border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </fieldset>

      {goal === "fit" && (
        <p className="text-xs text-muted-foreground">
          As cenas ilustram a peça. Confira a tabela de medidas para escolher o tamanho.
        </p>
      )}

      {/* Format Filter Pills */}
      <div className="-mx-1 flex gap-1.5 overflow-x-auto rounded-full bg-muted/40 p-1 px-1.5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {FORMATS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFormat(f.key)}
            className={cn(
              "shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide transition-[transform,color,background-color,border-color] duration-150 ease-out active:scale-[0.96] cursor-pointer",
              format === f.key
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {filteredTemplates.map((tpl) => (
          <button
            key={tpl.id}
            type="button"
            onClick={() => {
              setActiveTemplate(tpl);
              setGeneratedPrompt(null);
            }}
            className="group relative flex flex-col overflow-hidden rounded-3xl border border-black/[0.06] bg-card text-left transition-[transform,border-color,box-shadow] duration-200 hover:border-primary/40 hover:shadow-[0_16px_36px_-12px_rgba(0,0,0,0.4)] active:scale-[0.98] cursor-pointer dark:border-white/[0.08]"
          >
            <div className="relative aspect-[9/16] w-full overflow-hidden bg-black">
              <video
                src={tpl.video}
                poster={tpl.poster}
                muted
                loop
                playsInline
                autoPlay
                className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
              <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/55 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary backdrop-blur-md">
                {tpl.formatLabel}
              </span>
              <div className="absolute inset-x-3 bottom-3">
                <h3 className="font-display text-sm font-bold leading-snug text-white">
                  {tpl.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-[11px] text-white/75">{tpl.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Elenco do Estúdio (AI Influencers & Models) */}
      <section className="pt-4">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight">
              Elenco do Estúdio · Influencers de IA
            </h2>
            <p className="text-xs text-muted-foreground">
              Escolha um rosto fixo para aparecer apresentando os produtos nos seus vídeos.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {ZAALYS_MODELS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setSelectedModelId(m.id);
                setActiveTemplate(ZAALYS_TEMPLATES[1]!);
                setGeneratedPrompt(null);
              }}
              className="group relative aspect-[3/4] overflow-hidden rounded-3xl border border-black/[0.06] bg-muted text-left transition-[transform,border-color] duration-200 hover:border-primary/50 active:scale-[0.97] cursor-pointer dark:border-white/[0.08]"
            >
              <img
                src={m.image}
                alt={m.name}
                loading="lazy"
                className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
              <div className="absolute inset-x-3 bottom-3">
                <span className="block truncate text-sm font-bold text-white">{m.name}</span>
                <span className="block truncate text-[10px] uppercase tracking-wider text-white/70">
                  {m.style}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Split-View Template Generator Modal (Exact 32je0ui0vbk-h.js layout) */}
      {activeTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="apple-card grid max-h-[90dvh] w-full max-w-3xl grid-rows-[auto_minmax(0,1fr)] overflow-hidden shadow-2xl sm:grid-cols-[210px_1fr] sm:grid-rows-1">
            {/* Left Video Preview Column */}
            <div className="relative h-[190px] w-full overflow-hidden bg-black sm:h-full">
              <video
                src={activeTemplate.video}
                poster={activeTemplate.poster}
                autoPlay
                muted
                loop
                playsInline
                className="size-full object-cover"
              />
              {activeTemplate.needsModel && selectedModel && (
                <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3">
                  <img
                    src={selectedModel.image}
                    alt={selectedModel.name}
                    className="size-10 shrink-0 rounded-full object-cover ring-2 ring-primary"
                  />
                  <span className="min-w-0">
                    <span className="block text-[10px] uppercase tracking-wide text-white/60">
                      Modelo
                    </span>
                    <span className="block truncate text-sm font-semibold text-white">
                      {selectedModel.name}
                    </span>
                  </span>
                </div>
              )}
            </div>

            {/* Right Controls & Generated Prompt Column */}
            <div className="flex min-h-0 flex-col overflow-y-auto p-5 sm:p-6">
              <div className="flex items-start justify-between gap-2">
                <span className="w-fit rounded-full border border-black/[0.04] bg-primary/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary dark:border-white/[0.06]">
                  Movimento · {activeTemplate.formatLabel}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTemplate(null)}
                  className="rounded-lg p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <h2 className="mt-3 font-display text-xl font-bold tracking-tight">
                {activeTemplate.title}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {activeTemplate.needsModel
                  ? "Escolha o produto e o modelo — a IA adapta este movimento para você."
                  : "Escolha o produto — este movimento mostra só as mãos, sem modelo."}
              </p>

              <fieldset disabled={generating} className="mt-4 min-w-0 space-y-4">
                {/* Product Selector */}
                <div className="block space-y-1.5">
                  <span className="text-xs font-medium text-muted-foreground">Produto</span>
                  <select
                    value={selectedProdId}
                    onChange={(e) => {
                      setSelectedProdId(Number(e.target.value));
                      setGeneratedPrompt(null);
                    }}
                    className="field text-sm"
                  >
                    {ZAALYS_PRODUCTS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({formatBRL(p.priceCents)})
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-muted-foreground">
                    Este movimento combina com {activeTemplate.categories.join(", ")}.
                  </p>
                </div>

                {/* Pergunta de compra */}
                <fieldset className="flex flex-wrap gap-2">
                  <legend className="mb-1.5 text-xs font-medium text-muted-foreground">
                    Pergunta de compra
                  </legend>
                  {activeTemplate.proofGoals.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => {
                        setSelectedGoal(g);
                        setGeneratedPrompt(null);
                      }}
                      className={cn(
                        "rounded-xl px-3 py-1 text-xs font-semibold transition-colors cursor-pointer",
                        selectedGoal === g
                          ? "bg-primary text-primary-foreground"
                          : "border border-border bg-card text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {PROOF_GOAL_LABELS[g]}
                    </button>
                  ))}
                </fieldset>

                {/* Model Selector Grid */}
                {activeTemplate.needsModel && (
                  <div className="space-y-2">
                    <span className="text-xs font-medium text-muted-foreground">Modelo</span>
                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                      {ZAALYS_MODELS.slice(0, 5).map((m) => {
                        const isSel = m.id === selectedModelId;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => {
                              setSelectedModelId(m.id);
                              setGeneratedPrompt(null);
                            }}
                            className={cn(
                              "group relative overflow-hidden rounded-2xl border text-left transition-all cursor-pointer",
                              isSel
                                ? "border-primary ring-2 ring-primary/40 shadow-xs"
                                : "border-black/[0.06] hover:border-black/[0.12] dark:border-white/[0.08]",
                            )}
                          >
                            <div className="relative aspect-[3/4] overflow-hidden bg-muted/40">
                              <img
                                src={m.image}
                                alt={m.name}
                                className="size-full object-cover"
                              />
                              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
                              <div className="absolute inset-x-0 bottom-0 p-1.5">
                                <span className="block truncate text-[10px] font-semibold text-white">
                                  {m.name}
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </fieldset>

              <div className="mt-4">
                <RaisedButton
                  size="lg"
                  className="w-full"
                  disabled={generating}
                  onClick={handleGenerate}
                >
                  {generating ? "Gerando roteiro…" : "✦ Gerar roteiro"}
                </RaisedButton>
              </div>

              {generateError && (
                <p role="alert" className="mt-3 text-xs font-medium text-destructive">
                  {generateError}
                </p>
              )}

              {generatedPrompt && (
                <div className="mt-5 space-y-4">
                  <div className="rounded-2xl border border-border bg-card/60 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                        Roteiro gerado
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyPrompt}
                        className="rounded-lg border border-border px-2.5 py-1 text-xs font-semibold hover:bg-foreground/[0.05] cursor-pointer"
                      >
                        {copied ? "✓ Copiado" : "Copiar"}
                      </button>
                    </div>
                    <pre className="max-h-[24vh] overflow-y-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-foreground/90">
                      {generatedPrompt}
                    </pre>
                  </div>

                  {/* Agora gere no Google Flow */}
                  <div className="rounded-2xl border border-border bg-card/40 p-4">
                    <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Agora gere no Google Flow
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {activeTemplate.needsModel && (
                          <img
                            src={selectedModel.image}
                            alt={selectedModel.name}
                            className="size-8 rounded-lg object-cover"
                          />
                        )}
                        <img
                          src={selectedProduct.imageUrl}
                          alt={selectedProduct.title}
                          className="size-8 rounded-lg object-cover"
                        />
                        <span>Ingredientes prontos para colar (Ctrl/Cmd + V)</span>
                      </div>
                      <RaisedButton size="sm" onClick={handleOpenFlow}>
                        Copiar e abrir Google Flow ↗
                      </RaisedButton>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InfluencersPage() {
  return (
    <Suspense fallback={null}>
      <TemplatesInner />
    </Suspense>
  );
}
