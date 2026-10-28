"use client";

import { LazyVideo } from "@/components/lazy-video";
import { useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";
import { RaisedButton, cn } from "@/components/brand";
import { DownloadImages, FlowGuide, type FlowImage } from "@/components/flow-guide";
import { ProductPicker } from "@/components/product-picker";
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
  { key: "try-on", label: "Provando" },
  { key: "unboxing", label: "Unboxing" },
  { key: "hands-demo", label: "Demonstração" },
  { key: "pov", label: "POV" },
  { key: "application", label: "Aplicação" },
  { key: "presenter", label: "Apresentando" },
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
  const [flowPrompt, setFlowPrompt] = useState<string | null>(null);
  const [tplStep, setTplStep] = useState(0);

  useEffect(() => {
    if (searchParams.get("produto")) {
      setSelectedProdId(Number(searchParams.get("produto")));
      setActiveTemplate(ZAALYS_TEMPLATES[1]!);
      setTplStep(1); // produto já escolhido na página anterior
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
      setFlowPrompt(prompt);
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
      setFlowPrompt(sc.videoPrompt);
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

  // Passo a passo do template: produto → avatar (se tiver modelo) → prompt → baixar → Flow.
  const STEPS = activeTemplate?.needsModel ? ["Produto", "Avatar", "Prompt", "Baixar", "Flow"] : ["Produto", "Prompt", "Baixar", "Flow"];
  const stepName = STEPS[Math.min(tplStep, STEPS.length - 1)]!;
  const images: FlowImage[] = [
    { src: selectedProduct.imageUrl, label: "Foto do produto", filename: `produto-${selectedProduct.title.slice(0, 40)}` },
    ...(activeTemplate?.needsModel ? [{ src: selectedModel.image, label: `Avatar ${selectedModel.name}`, filename: `avatar-${selectedModel.id}` }] : []),
  ];
  function openTemplate(tpl: ZaalysTemplate) {
    setActiveTemplate(tpl);
    setGeneratedPrompt(null);
    setFlowPrompt(null);
    setGenerateError(null);
    setTplStep(0);
  }
  const canNext = stepName === "Prompt" ? Boolean(flowPrompt) : stepName !== "Flow";

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
            onClick={() => openTemplate(tpl)}
            className="group relative flex flex-col overflow-hidden rounded-3xl border border-black/[0.06] bg-card text-left transition-[transform,border-color,box-shadow] duration-200 hover:border-primary/40 hover:shadow-[0_16px_36px_-12px_rgba(0,0,0,0.4)] active:scale-[0.98] cursor-pointer dark:border-white/[0.08]"
          >
            <div className="relative aspect-[9/16] w-full overflow-hidden bg-black">
              <LazyVideo
                src={tpl.videoLite}
                poster={tpl.poster}
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
                openTemplate(ZAALYS_TEMPLATES[1]!);
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

      {/* Template: passo a passo (produto → avatar → prompt → baixar → Flow) */}
      {activeTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm sm:p-4">
          <div className="apple-card grid max-h-[92dvh] w-full max-w-3xl grid-cols-[minmax(0,1fr)] overflow-hidden shadow-2xl sm:grid-cols-[200px_minmax(0,1fr)]">
            {/* Prévia do movimento */}
            <div className="relative hidden h-full w-full overflow-hidden bg-black sm:block">
              <LazyVideo src={activeTemplate.videoLite} poster={activeTemplate.poster} className="size-full object-cover" />
            </div>

            <div className="flex min-h-0 min-w-0 flex-col">
              <div className="border-b border-border/60 p-4 sm:p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">Movimento · {activeTemplate.formatLabel}</span>
                    <h2 className="truncate font-display text-lg font-bold tracking-tight">{activeTemplate.title}</h2>
                  </div>
                  <button type="button" aria-label="Fechar" onClick={() => setActiveTemplate(null)} className="rounded-lg p-1 text-muted-foreground hover:text-foreground cursor-pointer">
                    ✕
                  </button>
                </div>
                <ol className="mt-3 flex gap-1 overflow-x-auto [scrollbar-width:none]">
                  {STEPS.map((label, i) => {
                    const reachable = i <= tplStep || (i <= STEPS.indexOf("Prompt") ) || (Boolean(flowPrompt) && i > STEPS.indexOf("Prompt"));
                    return (
                      <li key={label}>
                        <button
                          type="button"
                          disabled={!reachable}
                          onClick={() => setTplStep(i)}
                          className={cn(
                            "flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold cursor-pointer disabled:cursor-not-allowed disabled:opacity-40",
                            i === tplStep ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                          )}
                        >
                          <span className={cn("grid size-4 place-items-center rounded-full text-[10px]", i === tplStep ? "bg-primary-foreground/20" : "bg-muted")}>
                            {i < tplStep ? "✓" : i + 1}
                          </span>
                          {label}
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
                {stepName === "Produto" && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Qual produto vai aparecer no vídeo? Este movimento combina com {activeTemplate.categories.join(", ")}.</p>
                    <ProductPicker
                      value={selectedProduct}
                      onChange={(p) => {
                        setSelectedProdId(p.id);
                        setGeneratedPrompt(null);
                        setFlowPrompt(null);
                      }}
                    />
                  </div>
                )}

                {stepName === "Avatar" && (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">Escolha o avatar de IA que vai apresentar o produto. Você baixa a foto dele no fim.</p>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {ZAALYS_MODELS.map((m) => {
                        const isSel = m.id === selectedModelId;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => {
                              setSelectedModelId(m.id);
                              setGeneratedPrompt(null);
                              setFlowPrompt(null);
                            }}
                            className={cn(
                              "relative overflow-hidden rounded-2xl border text-left cursor-pointer",
                              isSel ? "border-primary ring-2 ring-primary/40" : "border-border hover:border-primary/40",
                            )}
                          >
                            <div className="relative aspect-[3/4] bg-muted">
                              <img src={m.image} alt={m.name} loading="lazy" className="size-full object-cover" />
                              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                              <div className="absolute inset-x-0 bottom-0 p-1.5">
                                <span className="block truncate text-[11px] font-semibold text-white">{m.name}</span>
                                <span className="block truncate text-[9px] text-white/70">{m.style}</span>
                              </div>
                              {isSel && <span className="absolute right-1.5 top-1.5 grid size-5 place-items-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">✓</span>}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {stepName === "Prompt" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 rounded-2xl bg-muted/40 p-3">
                      <img src={selectedProduct.imageUrl} alt="" className="size-12 rounded-lg object-cover" />
                      {activeTemplate.needsModel && <img src={selectedModel.image} alt="" className="size-12 rounded-lg object-cover" />}
                      <p className="min-w-0 text-xs">
                        <span className="line-clamp-1 font-semibold">{selectedProduct.title}</span>
                        <span className="text-muted-foreground">{activeTemplate.needsModel ? `com ${selectedModel.name}` : "só as mãos, sem modelo"}</span>
                      </p>
                    </div>
                    <fieldset className="flex flex-wrap gap-2">
                      <legend className="mb-1.5 text-xs font-medium text-muted-foreground">Qual pergunta de compra o vídeo responde?</legend>
                      {activeTemplate.proofGoals.map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => {
                            setSelectedGoal(g);
                            setGeneratedPrompt(null);
                            setFlowPrompt(null);
                          }}
                          className={cn(
                            "rounded-xl px-3 py-1 text-xs font-semibold transition-colors cursor-pointer",
                            selectedGoal === g ? "bg-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground hover:text-foreground",
                          )}
                        >
                          {PROOF_GOAL_LABELS[g]}
                        </button>
                      ))}
                    </fieldset>
                    <RaisedButton size="lg" className="w-full" disabled={generating} onClick={handleGenerate}>
                      {generating ? "Gerando o prompt…" : generatedPrompt ? "↻ Gerar de novo" : "✦ Gerar prompt com IA"}
                    </RaisedButton>
                    {generateError && (
                      <p role="alert" className="text-xs font-medium text-destructive">
                        {generateError}
                      </p>
                    )}
                    {generatedPrompt && (
                      <pre className="max-h-[30vh] overflow-y-auto whitespace-pre-wrap rounded-2xl border border-border bg-card/60 p-3 font-mono text-[11px] leading-relaxed">{generatedPrompt}</pre>
                    )}
                  </div>
                )}

                {stepName === "Baixar" && (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Baixe {images.length > 1 ? "as duas fotos" : "a foto do produto"}: você vai enviar no Google Flow junto com o prompt.
                    </p>
                    <DownloadImages images={images} />
                  </div>
                )}

                {stepName === "Flow" && flowPrompt && (
                  <FlowGuide images={images} prompt={flowPrompt} finalStep="Poste o vídeo no feed do TikTok e marque o produto (carrinho laranja) na publicação." />
                )}
              </div>

              <div className="flex items-center justify-between gap-2 border-t border-border/60 p-3 sm:px-5">
                <button
                  type="button"
                  onClick={() => (tplStep === 0 ? setActiveTemplate(null) : setTplStep((s) => s - 1))}
                  className="h-10 rounded-xl px-3 text-sm font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {tplStep === 0 ? "Cancelar" : "← Voltar"}
                </button>
                {stepName !== "Flow" ? (
                  <button
                    type="button"
                    disabled={!canNext}
                    onClick={() => setTplStep((s) => s + 1)}
                    className="h-10 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {stepName === "Prompt" && !flowPrompt ? "Gere o prompt para continuar" : "Continuar →"}
                  </button>
                ) : (
                  <button type="button" onClick={() => setActiveTemplate(null)} className="h-10 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground cursor-pointer">
                    Concluir
                  </button>
                )}
              </div>
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
