"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { Laptop, Search, Smartphone, Tablet, Trash2, Wand2 } from "lucide-react";
import { RaisedButton, cn } from "@/components/brand";
import { ZAALYS_PRODUCTS, formatBRL, type ZaalysProduct } from "@/lib/zaalys-data";
import { useIsDemo } from "@/lib/use-demo";
import { LiveTools } from "./live-tools";

// Assistente de Live no formato do original: 4 etapas, 6 passos, e as preparações salvas.

type Prep = { id: string; productId: number; title: string; clips: number; comments: number; createdAt: string; step: number };
type Device = "desktop" | "ios" | "android";

const STORAGE = "zaalys_live_preps";
const DEVICE_STORAGE = "zaalys_live_device";

const STAGES = ["Produto", "Aparelho", "Vídeos", "Abrir no TikTok"];
// Cada passo pertence a uma etapa (índice em STAGES).
const STEPS: { stage: number; title: string }[] = [
  { stage: 1, title: "Onde você vai fazer a live?" },
  { stage: 1, title: "Adicione a extensão ao Chrome" },
  { stage: 1, title: "Sua chave, se o painel pedir" },
  { stage: 2, title: "Quais vídeos você vai usar?" },
  { stage: 3, title: "Abra a live no TikTok Shop" },
  { stage: 3, title: "Confira a prévia e inicie pelo painel" },
];

const DEVICES: { key: Device; label: string; browser: string; icon: React.ReactNode }[] = [
  { key: "desktop", label: "Computador", browser: "Google Chrome", icon: <Laptop size={18} /> },
  { key: "ios", label: "iPhone ou iPad", browser: "navegador Orion", icon: <Tablet size={18} /> },
  { key: "android", label: "Android", browser: "navegador Quetta", icon: <Smartphone size={18} /> },
];

const readPreps = (): Prep[] => {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE) || "[]") as Prep[];
  } catch {
    return [];
  }
};

export default function LivePage() {
  const demo = useIsDemo();
  const [preps, setPreps] = useState<Prep[]>([]);
  const [current, setCurrent] = useState<Prep | null>(null);
  const [query, setQuery] = useState("");
  const [product, setProduct] = useState<ZaalysProduct | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [device, setDevice] = useState<Device>("desktop");
  const [videoSource, setVideoSource] = useState<"mine" | "flow">("mine");
  const [showTools, setShowTools] = useState(false);
  const [showObs, setShowObs] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setPreps(readPreps());
    try {
      const d = window.localStorage.getItem(DEVICE_STORAGE) as Device | null;
      if (d) setDevice(d);
      else if (/iPhone|iPad/i.test(navigator.userAgent)) setDevice("ios");
      else if (/Android/i.test(navigator.userAgent)) setDevice("android");
    } catch {}
  }, []);

  const save = (list: Prep[]) => {
    setPreps(list);
    try {
      window.localStorage.setItem(STORAGE, JSON.stringify(list.slice(0, 20)));
    } catch {}
  };

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return ZAALYS_PRODUCTS.filter((p) => p.title.toLowerCase().includes(q) || p.affiliateUrl.includes(q)).slice(0, 8);
  }, [query]);

  async function prepare() {
    if (!product) return;
    setError(null);
    setPreparing(true);
    try {
      let comments = 24;
      if (!demo) {
        // Gera o roteiro da live com a IA (o mesmo usado pelo modo "Eu apresento").
        const res = await fetch("/api/ai/live-script", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            products: [{ name: product.title.slice(0, 200), price: formatBRL(product.priceCents), details: product.facts.join("; ") }],
            minutesPerProduct: 8,
          }),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error(data?.error || "Não foi possível preparar a live agora.");
        comments = (data?.script?.products?.[0]?.faq?.length ?? 4) * 6;
      } else {
        await new Promise((r) => setTimeout(r, 900));
      }
      const prep: Prep = {
        id: crypto.randomUUID(),
        productId: product.id,
        title: product.title,
        clips: 6,
        comments,
        createdAt: new Date().toISOString(),
        step: 0,
      };
      save([prep, ...preps]);
      setCurrent(prep);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPreparing(false);
    }
  }

  function goTo(step: number) {
    if (!current) return;
    const next = { ...current, step };
    setCurrent(next);
    save(preps.map((p) => (p.id === next.id ? next : p)));
  }

  const header = (
    <>
      <Link href="/painel" className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">
        Voltar à Central
      </Link>
      <header>
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Assistente de Live</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Live infinita: vídeos do produto em ordem aleatória, narração, comentários e produto fixado no automático.
        </p>
      </header>
    </>
  );

  const extras = (
    <div className="space-y-2">
      <div>
        <Link
          href="/estudio/console"
          target="_blank"
          className="text-sm font-semibold text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Abrir o Estúdio de LIVE
        </Link>
        <p className="text-xs text-muted-foreground">Console e desempenho das transmissões, numa janela própria.</p>
      </div>
      <button
        type="button"
        onClick={() => setShowTools((v) => !v)}
        className="text-sm font-semibold text-muted-foreground underline underline-offset-4 hover:text-foreground cursor-pointer"
      >
        {showTools ? "Fechar comentários automáticos" : "Editar comentários automáticos"}
      </button>
      <div>
        <button
          type="button"
          onClick={() => setShowObs((v) => !v)}
          className="text-sm font-semibold text-muted-foreground underline underline-offset-4 hover:text-foreground cursor-pointer"
        >
          Transmitir pelo OBS ou LIVE Studio
        </button>
        <p className="text-xs text-muted-foreground">
          Só se o seu computador não transmite pelo navegador. Por esse caminho a extensão não comenta, não fixa o produto e não
          bloqueia ninguém.
        </p>
        {showObs && (
          <p className="mt-2 rounded-2xl bg-muted/50 p-3 text-xs text-muted-foreground">
            No OBS, adicione os clipes como fonte de mídia em loop e use a chave de transmissão do LIVE Studio. Comentários,
            produto fixado e respostas ficam por sua conta.
          </p>
        )}
      </div>
      {showTools && (
        <div className="pt-4">
          <LiveTools />
        </div>
      )}
    </div>
  );

  // Etapa 1: produto
  if (!current) {
    return (
      <div className="space-y-6">
        {header}
        <section className="space-y-4">
          <div>
            <h2 className="font-display text-xl font-bold">Do produto à sua LIVE</h2>
            <p className="text-sm text-muted-foreground">
              Um passo por vez. A configuração do aparelho fica salva neste navegador para as próximas transmissões.
            </p>
          </div>
          <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {STAGES.map((s, i) => (
              <li key={s} className="flex items-center gap-2 text-sm">
                <span
                  className={cn(
                    "grid size-6 place-items-center rounded-full text-xs font-bold",
                    i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                  )}
                >
                  {i + 1}
                </span>
                <span className={i === 0 ? "font-semibold" : "text-muted-foreground"}>{s}</span>
              </li>
            ))}
          </ol>

          {preps.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold">Continuar uma preparação</p>
              {preps.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setCurrent(p)}
                  className="flex w-full flex-col rounded-2xl border border-border bg-card/70 p-3 text-left hover:border-primary/40 cursor-pointer"
                >
                  <span className="line-clamp-1 text-sm font-semibold">{p.title}</span>
                  <span className="text-xs text-muted-foreground">
                    Roteiro com {p.clips} clipes · {p.comments} comentários · {new Date(p.createdAt).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}
                  </span>
                </button>
              ))}
            </div>
          )}

          <div className="apple-card space-y-3 p-5">
            <div>
              <h3 className="font-display text-base font-bold">Escolha o produto da sua LIVE</h3>
              <p className="text-xs text-muted-foreground">
                Vamos preparar o roteiro e os comentários deste produto. Depois, você escolhe o aparelho e os vídeos. A
                transmissão só começa quando você iniciar pelo painel no TikTok.
              </p>
            </div>
            <div className="relative">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setProduct(null);
                }}
                placeholder="Busque pelo nome ou cole o link do TikTok Shop"
                className="field pl-9 text-sm"
              />
            </div>
            {results.length > 0 && !product && (
              <div className="grid gap-2 sm:grid-cols-2">
                {results.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setProduct(p);
                      setQuery(p.title);
                    }}
                    className="flex items-center gap-3 rounded-2xl border border-border p-2.5 text-left hover:border-primary/40 cursor-pointer"
                  >
                    <img src={p.imageUrl} alt="" className="size-10 shrink-0 rounded-xl object-cover" />
                    <span className="line-clamp-2 text-xs font-semibold">{p.title}</span>
                  </button>
                ))}
              </div>
            )}
            {error && (
              <p role="alert" className="text-sm font-medium text-destructive">
                {error}
              </p>
            )}
            <RaisedButton onClick={prepare} disabled={!product || preparing}>
              <Wand2 size={16} /> {preparing ? "Preparando…" : "Preparar minha LIVE"}
            </RaisedButton>
            {!product && <p className="text-xs text-muted-foreground">Escolha um produto acima para criar a live.</p>}
          </div>
        </section>
        {extras}
      </div>
    );
  }

  // Etapas 2 a 4
  const step = STEPS[current.step]!;
  const stageIndex = step.stage;
  const inStage = STEPS.filter((s) => s.stage === stageIndex);
  const posInStage = inStage.indexOf(step) + 1;
  const isLast = current.step === STEPS.length - 1;
  const dev = DEVICES.find((d) => d.key === device)!;

  return (
    <div className="space-y-6">
      {header}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="line-clamp-1 font-semibold">{current.title}</p>
          <p className="text-xs text-muted-foreground">
            Roteiro com {current.clips} clipes · {current.comments} comentários
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            save(preps.filter((p) => p.id !== current.id));
            setCurrent(null);
          }}
          className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-destructive cursor-pointer"
        >
          <Trash2 size={13} /> Apagar
        </button>
      </div>

      <section className="apple-card space-y-4 p-5">
        <div>
          <h2 className="font-display text-xl font-bold">Prepare sua LIVE</h2>
          <p className="text-xs text-muted-foreground">
            Etapa {stageIndex + 1} de 4 · {STAGES[stageIndex]}. A transmissão começa no TikTok.
          </p>
        </div>

        <ol className="flex flex-wrap gap-1.5">
          {STEPS.map((s, i) => (
            <li key={s.title}>
              <button
                type="button"
                onClick={() => goTo(i)}
                className={cn(
                  "rounded-full px-3 py-1 text-[11px] font-semibold cursor-pointer",
                  i === current.step ? "bg-primary text-primary-foreground" : i < current.step ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
                )}
              >
                {i + 1} · {s.title}
              </button>
            </li>
          ))}
        </ol>

        <div className="space-y-3">
          <h3 className="font-display text-lg font-bold">{step.title}</h3>
          <p className="text-[11px] font-semibold text-muted-foreground">
            {posInStage} de {inStage.length} nesta etapa ·{" "}
            {stageIndex === 1 ? "configure uma vez por aparelho" : stageIndex === 2 ? "prepare uma vez por produto" : "confira a cada transmissão"}
          </p>

          {current.step === 0 && (
            <>
              <p className="text-sm text-muted-foreground">
                Este é o aparelho que vai transmitir, mesmo que você esteja lendo em outro. Instale a extensão nele uma vez;
                depois, você só confere a configuração.
              </p>
              <div className="grid gap-2 sm:grid-cols-3">
                {DEVICES.map((d) => (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => setDevice(d.key)}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border p-3 text-left cursor-pointer",
                      device === d.key ? "border-primary bg-primary/10" : "border-border hover:border-primary/40",
                    )}
                  >
                    {d.icon}
                    <span>
                      <span className="block text-sm font-semibold">{d.label}</span>
                      <span className="text-[11px] text-muted-foreground">{d.browser}</span>
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Sugerimos o aparelho em que você está. Confirme abaixo ou escolha outro.</p>
            </>
          )}

          {current.step === 1 && (
            <>
              <p className="text-sm text-muted-foreground">
                {device === "desktop"
                  ? "Na Chrome Web Store, clique em Usar no Chrome e depois em Adicionar extensão. Ela se atualiza sozinha."
                  : `No ${dev.browser}, abra a página da extensão Zaalys Live e toque em Adicionar.`}
              </p>
              <p className="text-xs text-muted-foreground">
                Sem acesso à loja? Baixe o .zip e carregue a pasta em chrome://extensions, com o Modo do desenvolvedor ligado.
              </p>
              <div className="flex flex-wrap gap-2">
                <a
                  href="/downloads/zaalys-live.zip"
                  className="inline-flex h-9 items-center rounded-xl border border-border px-3 text-xs font-semibold hover:bg-muted"
                  download
                >
                  Baixar extensão (.zip)
                </a>
              </div>
            </>
          )}

          {current.step === 2 && (
            <>
              <p className="text-sm text-muted-foreground">
                Se o painel do TikTok pedir a chave, copie em Conta e ative por lá. Copiar a chave não ativa a extensão.
              </p>
              <Link href="/painel/conta" className="text-sm font-semibold text-primary underline underline-offset-4">
                Ver minha chave em Conta
              </Link>
            </>
          )}

          {current.step === 3 && (
            <>
              <p className="text-sm text-muted-foreground">
                Escolha uma opção. Você seleciona os arquivos no painel Zaalys, dentro do TikTok.
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  { key: "mine" as const, label: "Usar meus vídeos", desc: "Tenha os MP4 deste produto no aparelho que vai transmitir." },
                  { key: "flow" as const, label: "Gerar no Google Flow", desc: "Vamos mostrar como baixar a foto e gerar os clipes, um por vez." },
                ].map((o) => (
                  <button
                    key={o.key}
                    type="button"
                    onClick={() => setVideoSource(o.key)}
                    className={cn(
                      "rounded-2xl border p-3 text-left cursor-pointer",
                      videoSource === o.key ? "border-primary bg-primary/10" : "border-border hover:border-primary/40",
                    )}
                  >
                    <span className="block text-sm font-semibold">{o.label}</span>
                    <span className="text-[11px] text-muted-foreground">{o.desc}</span>
                  </button>
                ))}
              </div>
              {videoSource === "flow" && (
                <Link href="/painel/influencers" className="text-sm font-semibold text-primary underline underline-offset-4">
                  Abrir os Templates para gerar os clipes
                </Link>
              )}
            </>
          )}

          {current.step === 4 && (
            <>
              <p className="text-sm text-muted-foreground">O painel Zaalys Live aparece no canto da página do TikTok.</p>
              <a
                href="https://shop.tiktok.com/streamer/live"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center rounded-xl border border-border px-3 text-xs font-semibold hover:bg-muted"
              >
                Abrir o TikTok Shop
              </a>
            </>
          )}

          {current.step === 5 && (
            <>
              <p className="text-sm text-muted-foreground">
                Confira vídeos, câmera, som e produto. Quando os itens do painel estiverem prontos, clique em Ligar live
                automática. Confirme no TikTok se a transmissão começou.
              </p>
              <ol className="space-y-1.5 text-sm">
                <li>1. Clipes da live → Escolher → selecione os MP4 que você baixou.</li>
                <li>2. Live do Zaalys → escolha “{current.title.slice(0, 60)}”.</li>
                <li>3. Câmera: no TikTok, escolha “Zaalys Live (vídeo)” e, no microfone, “Zaalys Live (áudio)”.</li>
                <li>4. Produto no carrinho → Copiar link → cole em Adicionar produtos.</li>
              </ol>
              <button
                type="button"
                onClick={() => {
                  const p = ZAALYS_PRODUCTS.find((x) => x.id === current.productId);
                  if (p) navigator.clipboard?.writeText(p.affiliateUrl).catch(() => {});
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="inline-flex h-9 items-center rounded-xl border border-border px-3 text-xs font-semibold hover:bg-muted cursor-pointer"
              >
                {copied ? "Copiado" : "Copiar link do produto"}
              </button>
            </>
          )}
        </div>

        <div className="flex gap-2 border-t border-border pt-4">
          <button
            type="button"
            onClick={() => (current.step === 0 ? setCurrent(null) : goTo(current.step - 1))}
            className="h-10 rounded-xl border border-border px-4 text-sm font-semibold hover:bg-muted cursor-pointer"
          >
            Voltar
          </button>
          <RaisedButton
            onClick={() => {
              if (current.step === 0) {
                try {
                  window.localStorage.setItem(DEVICE_STORAGE, device);
                } catch {}
              }
              if (isLast) setCurrent(null);
              else goTo(current.step + 1);
            }}
          >
            {current.step === 0 ? "Confirmar aparelho" : current.step === 3 ? "Continuar com estes vídeos" : isLast ? "Concluir passo a passo" : "Já fiz, continuar"}
          </RaisedButton>
        </div>
      </section>
      {extras}
    </div>
  );
}
