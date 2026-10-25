"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { ChevronRight, Film, Laptop, Search, Smartphone, Tablet, Trash2, Wand2 } from "lucide-react";
import { RaisedButton, cn } from "@/components/brand";
import { formatBRL, type ZaalysProduct } from "@/lib/zaalys-data";
import { CATALOGO_ORIGINAL } from "@/lib/catalogo-original";
import { useIsDemo } from "@/lib/use-demo";
import { LiveTools } from "./live-tools";
import { ChromeStoreDemo, OpenTikTokDemo, PreviewDemo } from "./how-to";

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

// Modo demonstração: as mesmas preparações da conta de exemplo do original (produtos do catálogo).
const DEMO_PREPS: [string, number, number, string][] = [
  ["Creme Gel Regenerador Facial Gota de Colágeno Kokeshi", 6, 25, "2026-10-24"],
  ["Creme Gel Regenerador Facial Gota de Colágeno Kokeshi", 6, 25, "2026-10-24"],
  ["Hidrabene Protetor solar facial fps 70 Uniformizador", 6, 25, "2026-10-20"],
  ["Dark Lab Multivitamin 60 Tabletes - Suplemento de Minerais Essenciais para Saúde e Energia Diária - Essential Minerals S", 6, 23, "2026-10-20"],
  ["Hidrabene Protetor solar facial fps 70 Uniformizador", 6, 25, "2026-10-19"],
  ["Multivitamínico 90 Cápsulas Dux Nutrition Polivitamínico Sabor Sem Sabor", 6, 22, "2026-10-19"],
  ["BIORE UV AQUA RICH WATERY ESSENCE 50g", 6, 24, "2026-10-19"],
  ["Multivitamínico 90 Cápsulas Dux Nutrition Polivitamínico Sabor Sem Sabor", 6, 23, "2026-10-19"],
  ["Multivitamínico 90 Cápsulas Dux Nutrition Polivitamínico Sabor Sem Sabor", 5, 22, "2026-10-18"],
  ["Hidrabene Protetor solar facial fps 70 Uniformizador", 6, 24, "2026-10-17"],
  ["Creamy Skincare Protetor Solar 50g | FPS 60, Watery Lotion, Toque Seco, Efeito Matte, Rápida Absorção, Resistente à Agua", 6, 21, "2026-10-16"],
  ["Multivitamínico 90 Cápsulas Dux Nutrition Polivitamínico Sabor Sem Sabor", 6, 23, "2026-10-15"],
  ["Mounjarin Psyllium 60/90 e 120 Caps - Etron", 6, 23, "2026-10-15"],
];

function demoPreps(): Prep[] {
  return DEMO_PREPS.map(([title, clips, comments, date], i) => {
    const p = CATALOGO_ORIGINAL.find((x) => x.title.toLowerCase().startsWith(title.toLowerCase().slice(0, 24)));
    return { id: `demo-${i}`, productId: p?.id ?? 0, title, clips, comments, createdAt: `${date}T15:00:00.000Z`, step: 0 };
  });
}

const readPreps = (): Prep[] => {
  try {
    const raw = window.localStorage.getItem(STORAGE);
    return raw ? (JSON.parse(raw) as Prep[]) : demoPreps();
  } catch {
    return demoPreps();
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
  const [videoSource, setVideoSource] = useState<"real" | "mine" | "flow">("real");
  const [showTools, setShowTools] = useState(false);
  const [showObs, setShowObs] = useState(false);
  const [copied, setCopied] = useState(false);

  // Conta real: preparações vêm do banco (valem em qualquer aparelho). Demonstração: navegador.
  useEffect(() => {
    if (demo) {
      setPreps(readPreps());
      return;
    }
    fetch("/api/live/preps")
      .then((r) => (r.ok ? r.json() : { preps: [] }))
      .then((d) => setPreps(d.preps ?? []))
      .catch(() => {});
  }, [demo]);

  useEffect(() => {
    try {
      const d = window.localStorage.getItem(DEVICE_STORAGE) as Device | null;
      if (d) setDevice(d);
      else if (/iPhone|iPad/i.test(navigator.userAgent)) setDevice("ios");
      else if (/Android/i.test(navigator.userAgent)) setDevice("android");
    } catch {}
  }, []);

  const save = (list: Prep[]) => {
    setPreps(list);
    if (!demo) return;
    try {
      window.localStorage.setItem(STORAGE, JSON.stringify(list.slice(0, 20)));
    } catch {}
  };

  function removePrep(id: string) {
    save(preps.filter((p) => p.id !== id));
    if (!demo) fetch(`/api/live/preps?id=${encodeURIComponent(id)}`, { method: "DELETE" }).catch(() => {});
  }

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return CATALOGO_ORIGINAL.filter((p) => p.title.toLowerCase().includes(q) || p.affiliateUrl.includes(q)).slice(0, 8);
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
        if (res.ok) comments = (data?.script?.products?.[0]?.faq?.length ?? 4) * 6;
        // Sem IA configurada no servidor, segue com os comentários padrão em vez de travar.
        else if (!String(data?.error || "").includes("configurada"))
          throw new Error(data?.error || "Não foi possível preparar a live agora.");
      } else {
        await new Promise((r) => setTimeout(r, 900));
      }
      let prep: Prep = {
        id: crypto.randomUUID(),
        productId: product.id,
        title: product.title,
        clips: 6,
        comments,
        createdAt: new Date().toISOString(),
        step: 0,
      };
      if (!demo) {
        const res = await fetch("/api/live/preps", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: prep.productId, title: prep.title.slice(0, 300), clips: prep.clips, comments: prep.comments }),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.prep) throw new Error("Não foi possível salvar a preparação.");
        prep = data.prep;
      }
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
    if (!demo)
      fetch("/api/live/preps", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: next.id, step }),
      }).catch(() => {});
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
              <div className="grid gap-2 sm:grid-cols-2">
                {preps.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setCurrent(p)}
                    className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card/70 p-3 text-left hover:border-primary/40 cursor-pointer"
                  >
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                      <Film size={15} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-1 text-sm font-semibold">{p.title}</span>
                      <span className="block text-xs text-muted-foreground">
                        Roteiro com {p.clips} clipes · {p.comments} comentários ·{" "}
                        {new Date(p.createdAt).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}
                      </span>
                    </span>
                    <ChevronRight size={16} className="shrink-0 text-muted-foreground" />
                  </button>
                ))}
              </div>
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
  const prod = CATALOGO_ORIGINAL.find((x) => x.id === current.productId);
  const deviceDone = current.step >= 3;

  const primaryLabel =
    current.step === 0
      ? "Confirmar aparelho"
      : current.step === 1 || current.step === 2
        ? "Continuar"
        : current.step === 3
          ? "Continuar com estes vídeos"
          : isLast
            ? "Concluir passo a passo"
            : "Já fiz, continuar";

  const STAGE_ICONS = ["", "▭", "▣", "◉"];

  return (
    <div className="space-y-6">
      {header}

      {/* Produto da preparação */}
      <div className="flex items-center gap-4 rounded-2xl border border-border bg-card/70 p-4">
        <button type="button" aria-label="Voltar para a lista" onClick={() => setCurrent(null)} className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted cursor-pointer">
          ←
        </button>
        {prod ? (
          <img src={prod.imageUrl} alt="" className="size-14 shrink-0 rounded-xl bg-white object-cover" />
        ) : (
          <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
            <Film size={20} />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="line-clamp-1 font-semibold">{current.title}</p>
          <p className="text-xs text-muted-foreground">
            Roteiro com {current.clips} clipes · {current.comments} comentários
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            removePrep(current.id);
            setCurrent(null);
          }}
          className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-destructive cursor-pointer"
        >
          <Trash2 size={13} /> Apagar
        </button>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-bold">Prepare sua LIVE</h2>
          <p className="text-sm text-muted-foreground">
            Etapa {stageIndex + 1} de 4 · {STAGES[stageIndex]}. A transmissão começa no TikTok.
          </p>
        </div>
        {stageIndex === 3 && (
          <button type="button" onClick={() => goTo(0)} className="h-10 rounded-xl border border-border px-4 text-sm font-semibold hover:bg-muted cursor-pointer">
            Rever configuração
          </button>
        )}
      </div>

      {stageIndex === 3 && (
        <div className="rounded-2xl bg-card/70 p-4">
          <p className="text-sm font-semibold">Confira a extensão no aparelho que vai transmitir.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Você já marcou a configuração como concluída. Os arquivos, a conexão e o início da transmissão são conferidos no painel do TikTok.
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        {/* Etapas e progresso */}
        <nav className="space-y-4 text-sm">
          <div>
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              <span className="text-primary">✓</span> Produto
            </p>
            <p className="mt-1.5 pl-1 text-muted-foreground">Produto escolhido</p>
          </div>
          {[1, 2, 3].map((st) => (
            <div key={st}>
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {STEPS.every((s, i) => s.stage !== st || i < current.step) ? <span className="text-primary">✓</span> : <span>{STAGE_ICONS[st]}</span>}
                {STAGES[st]}
              </p>
              <ul className="mt-1.5 space-y-1">
                {STEPS.map((s, i) =>
                  s.stage !== st ? null : (
                    <li key={s.title}>
                      <button
                        type="button"
                        onClick={() => goTo(i)}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left cursor-pointer",
                          i === current.step ? "bg-muted font-semibold" : "hover:bg-muted/50",
                        )}
                      >
                        {i < current.step ? (
                          <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">✓</span>
                        ) : (
                          <span
                            className={cn(
                              "grid size-5 shrink-0 place-items-center rounded-full border text-[10px] font-bold",
                              i === current.step ? "border-foreground" : "border-border text-muted-foreground",
                            )}
                          >
                            {i + 1}
                          </span>
                        )}
                        <span className={i === current.step ? "" : "text-muted-foreground"}>{s.title}</span>
                      </button>
                    </li>
                  ),
                )}
              </ul>
            </div>
          ))}
        </nav>

        {/* Passo atual */}
        <section className="overflow-hidden rounded-2xl border border-border bg-card/70">
          <div className="space-y-4 p-6">
            <div>
              <h3 className="text-xl font-bold">{step.title}</h3>
              {current.step === 0 && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Este é o aparelho que vai transmitir, mesmo que você esteja lendo em outro. Instale a extensão nele uma vez; depois, você só confere a configuração.
                </p>
              )}
              {current.step === 1 && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {device === "desktop" ? (
                    <>
                      Na Chrome Web Store, clique em <b className="text-foreground">Usar no Chrome</b> e depois em <b className="text-foreground">Adicionar extensão</b>. Ela se atualiza sozinha.
                    </>
                  ) : (
                    `No ${dev.browser}, abra a página da extensão Zaalys Live e toque em Adicionar.`
                  )}
                </p>
              )}
              {current.step === 2 && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Você já concluiu a configuração ou tem um aparelho registrado. Se o painel do TikTok pedir a chave novamente, copie aqui e ative por lá.
                </p>
              )}
              {current.step === 3 && <p className="mt-1 text-sm text-muted-foreground">Escolha uma opção. Você seleciona os arquivos no painel Zaalys, dentro do TikTok.</p>}
              {current.step === 4 && <p className="mt-1 text-sm text-muted-foreground">O painel Zaalys Live aparece no canto da página do TikTok.</p>}
              {current.step === 5 && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Confira vídeos, câmera, som e produto. Quando os itens do painel estiverem prontos, clique em Ligar live automática. Confirme no TikTok se a transmissão começou.
                </p>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                {posInStage} de {inStage.length} nesta etapa ·{" "}
                {stageIndex === 1 ? "configure uma vez por aparelho" : stageIndex === 2 ? "prepare uma vez por produto" : "confira a cada transmissão"}
              </p>
            </div>

            {current.step === 0 && (
              <>
                <p className="text-xs font-semibold text-muted-foreground">Aparelho da live</p>
                <div className="grid gap-2 sm:grid-cols-3">
                  {DEVICES.map((d) => (
                    <button
                      key={d.key}
                      type="button"
                      onClick={() => setDevice(d.key)}
                      className={cn(
                        "relative rounded-2xl border p-4 text-left cursor-pointer",
                        device === d.key ? "border-primary bg-primary/10" : "border-border hover:border-primary/40",
                      )}
                    >
                      <span className={cn("absolute right-3 top-3 size-3.5 rounded-full border-2", device === d.key ? "border-primary bg-primary" : "border-muted-foreground/50")} />
                      <span className="grid size-9 place-items-center rounded-xl bg-primary/20 text-primary">{d.icon}</span>
                      <span className="mt-3 block text-sm font-semibold">{d.label}</span>
                      <span className="text-xs text-muted-foreground">{d.browser}</span>
                    </button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">Sugerimos o aparelho em que você está. Confirme abaixo ou escolha outro.</p>
                {deviceDone && <p className="text-sm text-muted-foreground">Sua conta já tem um aparelho registrado. Vamos conferir a instalação neste navegador.</p>}
              </>
            )}

            {current.step === 1 && (
              <>
                <p className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                  Funciona no Google Chrome, no computador.{" "}
                  <a href="https://www.google.com/chrome/" target="_blank" rel="noreferrer" className="font-semibold text-foreground underline underline-offset-2">
                    Baixar o Chrome
                  </a>{" "}
                  ·{" "}
                  <a href="/downloads/zaalys-live.zip" download className="underline underline-offset-2">
                    Sem acesso à loja? Baixe o .zip
                  </a>{" "}
                  e carregue a pasta em
                  <button
                    type="button"
                    onClick={() => navigator.clipboard?.writeText("chrome://extensions").catch(() => {})}
                    className="rounded-md bg-muted px-2 py-1 font-mono text-[11px] text-foreground cursor-pointer"
                    title="Copiar"
                  >
                    chrome://extensions ⧉
                  </button>
                  , com o Modo do desenvolvedor ligado.
                </p>
                <details className="group rounded-2xl bg-muted/40 p-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between">
                    <span>
                      <span className="block text-sm font-semibold">Instalou pelo .zip? Troque pela Chrome Web Store</span>
                      <span className="text-xs text-muted-foreground">Versão atual: 3.17.0. Pela loja, a extensão se atualiza sozinha, sempre fora da live.</span>
                    </span>
                    <span className="text-muted-foreground transition-transform group-open:rotate-180">⌄</span>
                  </summary>
                  <ol className="mt-4 space-y-3 text-sm">
                    <li className="flex gap-3"><span className="grid size-5 shrink-0 place-items-center rounded-full bg-muted text-[11px] font-bold">1</span>Na Chrome Web Store, clique em Usar no Chrome.</li>
                    <li className="flex gap-3"><span className="grid size-5 shrink-0 place-items-center rounded-full bg-muted text-[11px] font-bold">2</span>Em Configurações, desconecte o computador da cópia antiga: a nova ocupa a vaga dela.</li>
                    <li className="flex gap-3"><span className="grid size-5 shrink-0 place-items-center rounded-full bg-muted text-[11px] font-bold">3</span>Abra chrome://extensions e remova a Zaalys Live que tem o botão ↻ (recarregar). É a do .zip.</li>
                    <li className="flex gap-3"><span className="grid size-5 shrink-0 place-items-center rounded-full bg-muted text-[11px] font-bold">4</span>Recarregue a página do TikTok Shop (F5) e cole sua chave no painel. Seus clipes continuam lá.</li>
                  </ol>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Troque com a live encerrada: remover a cópia antiga derruba a live automática. Com as duas instaladas, o painel avisa e não abre live até você remover uma.
                  </p>
                </details>
                <a
                  href="https://chromewebstore.google.com/search/zaalys%20live"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold hover:bg-muted"
                >
                  ↗ Abrir na Chrome Web Store
                </a>
                <HowTo>
                  <ChromeStoreDemo />
                </HowTo>
              </>
            )}

            {current.step === 2 && <KeyBox demo={demo} />}

            {current.step === 3 && (
              <>
                <p className="text-xs font-semibold text-muted-foreground">Origem dos vídeos</p>
                <div className="space-y-2">
                  {[
                    { key: "real" as const, label: "Usar os 1 vídeo real do produto", tag: "Recomendado", desc: "Já disponíveis no painel Zaalys. Você não precisa gerar nem baixar." },
                    { key: "mine" as const, label: "Usar meus vídeos", desc: "Tenha os MP4 deste produto no aparelho que vai transmitir." },
                    { key: "flow" as const, label: "Gerar no Google Flow", desc: "Vamos mostrar como baixar a foto e gerar os clipes, um por vez." },
                  ].map((o) => (
                    <button
                      key={o.key}
                      type="button"
                      onClick={() => setVideoSource(o.key)}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-2xl border p-4 text-left cursor-pointer",
                        videoSource === o.key ? "border-primary bg-primary/10" : "border-border hover:border-primary/40",
                      )}
                    >
                      <span className={cn("mt-0.5 size-4 shrink-0 rounded-full border-2", videoSource === o.key ? "border-primary bg-primary" : "border-muted-foreground/50")} />
                      <span>
                        <span className="text-sm font-semibold">{o.label}</span>
                        {o.tag && <span className="ml-2 text-xs text-muted-foreground">{o.tag}</span>}
                        <span className="block text-xs text-muted-foreground">{o.desc}</span>
                      </span>
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
                <details className="group rounded-2xl bg-muted/40 p-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold">
                    Travou? Veja o que fazer <span className="text-muted-foreground transition-transform group-open:rotate-90">›</span>
                  </summary>
                  <div className="mt-3 space-y-3 text-sm">
                    <p>
                      <b>Apareceu “Desculpe, você não tem permissão de acesso” e um QR code?</b>
                      <br />
                      <span className="text-muted-foreground">
                        Não precisa ler o QR. A conta do TikTok ainda não entrou no TikTok Shop, que é o que libera o Gerenciador de LIVE. No app do TikTok, abra Perfil → ☰ → TikTok Studio → TikTok Shop para criadores e faça a inscrição. Aprovada, toque em Abrir o TikTok Shop de novo.
                      </span>
                    </p>
                    <p>
                      <b>Qual conta do TikTok usar?</b>
                      <br />
                      <span className="text-muted-foreground">
                        A conta onde a live vai passar. O e-mail dela não precisa ser o mesmo da sua conta Zaalys: a extensão se liga à Zaalys pela sua chave, não pelo e-mail.
                      </span>
                    </p>
                    <p>
                      <b>O painel Zaalys Live não apareceu?</b>
                      <br />
                      <span className="text-muted-foreground">Confira em chrome://extensions se a Zaalys Live está ligada e recarregue a página do TikTok (F5).</span>
                    </p>
                  </div>
                </details>
                <a
                  href="https://shop.tiktok.com/streamer/live"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold hover:bg-muted"
                >
                  ↗ Abrir o TikTok Shop
                </a>
                <HowTo>
                  <OpenTikTokDemo />
                </HowTo>
              </>
            )}

            {current.step === 5 && (
              <>
                <ol className="space-y-3 text-sm">
                  {[
                    "Clipes da live → Escolher → selecione os MP4 que você baixou.",
                    `Live do Zaalys → escolha “${current.title}”.`,
                    "Câmera: no TikTok, escolha “Zaalys Live (vídeo)” e, no microfone, “Zaalys Live (áudio)”.",
                    "Produto no carrinho → Copiar link → cole em Adicionar produtos.",
                  ].map((t, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="grid size-5 shrink-0 place-items-center rounded-full bg-muted text-[11px] font-bold">{i + 1}</span>
                      {t}
                    </li>
                  ))}
                </ol>
                {prod && (
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(prod.affiliateUrl).catch(() => {});
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="inline-flex h-9 items-center rounded-xl border border-border px-3 text-xs font-semibold hover:bg-muted cursor-pointer"
                  >
                    {copied ? "Copiado" : "Copiar link do produto"}
                  </button>
                )}
                <details className="group rounded-2xl bg-muted/40 p-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold">
                    Travou? Veja o que fazer <span className="text-muted-foreground transition-transform group-open:rotate-90">›</span>
                  </summary>
                  <div className="mt-3 space-y-3 text-sm">
                    {[
                      ["O item Câmera não fica verde?", "Na página do TikTok abra as fontes de vídeo e áudio e escolha Zaalys Live (vídeo) na câmera e Zaalys Live (áudio) no microfone."],
                      ["“Zaalys Live” não aparece na lista de câmeras?", "Escolha os clipes e a live no painel primeiro: a câmera só existe depois disso. Então recarregue a página do TikTok (F5)."],
                      ["O painel disse “Não consegui abrir a live”?", "O painel já escolheu a câmera e o som da Zaalys; só o clique em iniciar não pegou. Clique em Iniciar LIVE no próprio TikTok e deixe o painel ligado: ele continua comentando, fixando e narrando."],
                      ["O botão de iniciar LIVE do TikTok está cinza?", "Escolha os clipes no painel primeiro: sem eles não existe câmera para enviar. Se continuar cinza, recarregue a página do TikTok (F5) e ligue de novo. Se aparecer que iniciar LIVE está restrito, o bloqueio é do TikTok na sua conta: veja os avisos de violação no TikTok Shop."],
                      ["A live está sem som?", "Toque uma vez na página do TikTok e ligue de novo. O navegador só libera o som depois de um toque."],
                      ["A voz sai cortada ou some depois da primeira frase?", "Atualize a extensão. Pela Chrome Web Store ela se atualiza sozinha; se você instalou pelo .zip, troque pela loja no passo da extensão."],
                    ].map(([q, a]) => (
                      <p key={q}>
                        <b>{q}</b>
                        <br />
                        <span className="text-muted-foreground">{a}</span>
                      </p>
                    ))}
                  </div>
                </details>
                <HowTo>
                  <PreviewDemo product={current.title} />
                </HowTo>
              </>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-border px-6 py-4">
            <button
              type="button"
              disabled={current.step === 0}
              onClick={() => goTo(current.step - 1)}
              className="h-10 px-2 text-sm font-semibold text-muted-foreground hover:text-foreground disabled:opacity-40 cursor-pointer"
            >
              ← Voltar
            </button>
            <button
              type="button"
              onClick={() => {
                if (current.step === 0) {
                  try {
                    window.localStorage.setItem(DEVICE_STORAGE, device);
                  } catch {}
                }
                if (isLast) setCurrent(null);
                else goTo(current.step + 1);
              }}
              className="h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-xs cursor-pointer"
            >
              {primaryLabel} →
            </button>
          </div>
        </section>
      </div>
      {extras}
    </div>
  );
}

function HowTo({ children }: { children: React.ReactNode }) {
  return (
    <details open className="group rounded-2xl bg-muted/40">
      <summary className="flex cursor-pointer list-none items-center justify-between p-4 text-sm font-semibold">
        <span className="flex items-center gap-2">👁 Como fazer</span>
        <span className="text-muted-foreground transition-transform group-open:rotate-180">⌄</span>
      </summary>
      <div className="px-4 pb-5">{children}</div>
    </details>
  );
}

function KeyBox({ demo }: { demo: boolean }) {
  const [key, setKey] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (demo) {
      setKey("zlv_FCtW7q2mPd9xLk4vHs81");
      return;
    }
    fetch("/api/license/reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setKey(d?.key ?? null))
      .catch(() => {});
  }, [demo]);
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-background/60 p-3">
        <span className="text-muted-foreground">⚿</span>
        <span className="flex-1 truncate font-mono text-sm">{key ? (show ? key : `${key.slice(0, 8)}${"•".repeat(16)}`) : "Carregando…"}</span>
        <button type="button" onClick={() => setShow((v) => !v)} className="text-muted-foreground cursor-pointer" aria-label="Mostrar chave">
          👁
        </button>
        <button
          type="button"
          disabled={!key}
          onClick={() => {
            if (key) navigator.clipboard?.writeText(key).catch(() => {});
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          }}
          className="h-9 rounded-xl border border-border px-3 text-xs font-semibold hover:bg-muted cursor-pointer"
        >
          {copied ? "Copiada" : "⧉ Copiar chave"}
        </button>
      </div>
      <p className="text-sm text-muted-foreground">Copiar a chave não ativa a extensão. Conecte aqui ou cole e ative no painel do TikTok.</p>
    </div>
  );
}
