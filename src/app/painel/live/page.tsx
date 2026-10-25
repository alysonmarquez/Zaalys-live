"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { ChevronRight, Film, Laptop, Search, Smartphone, Tablet, Trash2, Wand2 } from "lucide-react";
import { RaisedButton, cn } from "@/components/brand";
import { formatBRL, type ZaalysProduct } from "@/lib/zaalys-data";
import { CATALOGO_ORIGINAL } from "@/lib/catalogo-original";
import { useIsDemo } from "@/lib/use-demo";
import { LiveTools } from "./live-tools";
import {
  ChromeStoreDemo,
  ConnectDemo,
  DownloadCrxDemo,
  IphoneReadyDemo,
  MobileOpenDemo,
  MobilePreviewDemo,
  OpenTikTokDemo,
  OrionInstallDemo,
  OrionSettingsDemo,
  PreviewDemo,
  QuettaCheckDemo,
  QuettaDesktopSiteDemo,
  StoreDemo,
} from "./how-to";

// Assistente de Live no formato do original: 4 etapas, 6 passos, e as preparações salvas.

type Prep = { id: string; productId: number; title: string; clips: number; comments: number; createdAt: string; step: number };
type Device = "desktop" | "ios" | "android";

const STORAGE = "zaalys_live_preps";
const DEVICE_STORAGE = "zaalys_live_device";

const STAGES = ["Produto", "Aparelho", "Vídeos", "Abrir no TikTok"];
// Os passos mudam conforme o aparelho (como no original): Computador 6, iPhone/iPad 10, Android 9.
// Cada passo pertence a uma etapa (índice em STAGES).
type StepKey =
  | "device" | "ext" | "key" | "videos" | "open" | "preview"
  | "orion-install" | "orion-ext" | "orion-download" | "orion-file" | "quetta-install" | "quetta-crx" | "quetta-check"
  | "connect" | "ios-ready" | "android-ready";
type Step = { key: StepKey; stage: number; title: string };

function flowFor(device: Device): Step[] {
  const first: Step = { key: "device", stage: 1, title: "Onde você vai fazer a live?" };
  const videos: Step = { key: "videos", stage: 2, title: "Quais vídeos você vai usar?" };
  const preview: Step = { key: "preview", stage: 3, title: "Confira a prévia e inicie pelo painel" };
  if (device === "ios")
    return [
      first,
      { key: "orion-install", stage: 1, title: "Instale o Orion" },
      { key: "orion-ext", stage: 1, title: "Ligue as extensões no Orion" },
      { key: "orion-download", stage: 1, title: "Baixe a extensão no Orion" },
      { key: "orion-file", stage: 1, title: "Instale no Orion" },
      { key: "connect", stage: 1, title: "Conecte a extensão à sua conta" },
      { key: "ios-ready", stage: 1, title: "Deixe o iPhone pronto para a live" },
      videos,
      { key: "open", stage: 3, title: "Abra a live no Orion" },
      preview,
    ];
  if (device === "android")
    return [
      first,
      { key: "quetta-install", stage: 1, title: "Instale o Quetta" },
      { key: "quetta-crx", stage: 1, title: "Instale a extensão no Quetta" },
      { key: "quetta-check", stage: 1, title: "Confira se a extensão entrou" },
      { key: "connect", stage: 1, title: "Conecte a extensão à sua conta" },
      { key: "android-ready", stage: 1, title: "Deixe o Android pronto para a live" },
      videos,
      { key: "open", stage: 3, title: "Abra a live no Quetta" },
      preview,
    ];
  return [
    first,
    { key: "ext", stage: 1, title: "Adicione a extensão ao Chrome" },
    { key: "key", stage: 1, title: "Sua chave, se o painel pedir" },
    videos,
    { key: "open", stage: 3, title: "Abra a live no TikTok Shop" },
    preview,
  ];
}

// Passos de celular: texto, lista numerada, botão e animação lidos do original.
const MOBILE: Partial<Record<StepKey, { desc: string; list?: string[]; action?: { label: string; href: string; download?: boolean } }>> = {
  "orion-install": {
    desc: "É o navegador de iPhone e iPad que aceita extensões do Chrome. Grátis, na App Store.",
    list: ["Toque em **Abrir a App Store**.", "Toque em **Obter** e espere instalar."],
    action: { label: "Abrir a App Store", href: "https://apps.apple.com/app/orion-browser-by-kagi/id1484498200" },
  },
  "orion-ext": {
    desc: "Uma vez só. Sem isso o Orion não aceita a Zaalys Live.",
    list: ["No Orion, toque em **•••** e depois em **Ajustes**.", "Em **Extensões**, ligue **Extensões do Chrome**.", "Em **Sites**, deixe o **Modo de compatibilidade** desligado."],
  },
  "orion-download": {
    desc: "Abra esta página no Orion, já logada na sua conta, e baixe o arquivo.",
    list: ["No Orion, entre em **zaalys.com** e abra este passo.", "Toque em **Baixar extensão** e confirme em **Baixar**.", "Se ele cair no iCloud Drive, mova para **No iPhone** no app Arquivos."],
    action: { label: "Baixar extensão (.crx)", href: "/downloads/zaalys-live.crx", download: true },
  },
  "orion-file": {
    desc: "Quatro toques no menu do Orion.",
    list: ["Toque em **•••** e depois em **Extensões**.", "Toque em **+** e escolha **Instalar do arquivo**.", "Escolha **zaalys-live.crx**. A Zaalys Live aparece na lista, ligada."],
  },
  "quetta-install": {
    desc: "É o navegador de Android que aceita extensões do Chrome. Grátis, na Play Store.",
    list: ["Toque em **Abrir a Play Store**.", "Toque em **Instalar** e espere terminar."],
    action: { label: "Abrir a Play Store", href: "https://play.google.com/store/search?q=Quetta%20browser&c=apps" },
  },
  "quetta-crx": {
    desc: "Abra esta página no Quetta, já logada na sua conta. O Quetta instala o arquivo na hora.",
    list: ["No Quetta, entre em **zaalys.com** e abra este passo.", "Toque em **Baixar extensão (.crx)**.", "O Quetta pergunta **Adicionar “Zaalys Live”?**. Toque em **Adicionar** (ou OK)."],
    action: { label: "Baixar extensão (.crx)", href: "/downloads/zaalys-live.crx", download: true },
  },
  "quetta-check": {
    desc: "Se o Quetta não perguntou nada ao baixar, instale pelo menu. Os nomes podem mudar um pouco de uma versão para outra.",
    list: ["Toque em **⋮** e depois em **Extensões**.", "Abra as **opções de desenvolvedor** e toque em **carregar arquivo .zip/.crx**.", "Escolha **zaalys-live.crx** em Downloads."],
  },
  "ios-ready": {
    desc: "A live roda dentro do Orion: ele precisa ficar aberto, na frente, e o celular carregando.",
    list: ["**Ajustes › Tela e Brilho › Bloqueio automático › Nunca**. A extensão também mantém a tela acesa enquanto a live está no ar.", "Deixe o carregador ligado a live inteira.", "Não abra outro app por cima nem divida a tela do iPad: o iOS desliga a câmera."],
  },
  "android-ready": {
    desc: "O TikTok só abre o LIVE Manager como site para computador, e a live roda com o Quetta na frente.",
    list: ["Na página do TikTok, toque em **⋮** e marque **Site para computador**.", "Quando o Quetta pedir, permita a **câmera** e o **microfone**.", "Deixe carregando e não troque de app. A extensão mantém a tela acesa durante a live."],
  },
};

/** Texto com **negrito** simples. */
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split("**").map((part, i) =>
        i % 2 ? (
          <b key={i} className="text-foreground">
            {part}
          </b>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

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
  const [detected, setDetected] = useState<Device>("desktop");
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
    const ua = navigator.userAgent;
    const det: Device = /iPhone|iPad/i.test(ua) ? "ios" : /Android/i.test(ua) ? "android" : "desktop";
    setDetected(det);
    try {
      const d = window.localStorage.getItem(DEVICE_STORAGE) as Device | null;
      setDevice(d || det);
    } catch {
      setDevice(det);
    }
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
  const flow = flowFor(device);
  const stepIdx = Math.min(current.step, flow.length - 1);
  const step = flow[stepIdx]!;
  const stageIndex = step.stage;
  const inStage = flow.filter((s) => s.stage === stageIndex);
  const posInStage = inStage.indexOf(step) + 1;
  const isLast = stepIdx === flow.length - 1;
  const dev = DEVICES.find((d) => d.key === device)!;
  const prod = CATALOGO_ORIGINAL.find((x) => x.id === current.productId);
  const deviceDone = stepIdx > flow.findIndex((s) => s.key === "videos");
  const mobile = device !== "desktop";
  const os = device === "ios" ? "ios" : "android";
  const browserName = device === "ios" ? "Orion" : "Quetta";
  const mob = MOBILE[step.key];

  const primaryLabel =
    step.key === "device"
      ? "Confirmar aparelho"
      : step.key === "ext" || step.key === "key"
        ? "Continuar"
        : step.key === "videos"
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
                {flow.every((s, i) => s.stage !== st || i < stepIdx) ? <span className="text-primary">✓</span> : <span>{STAGE_ICONS[st]}</span>}
                {STAGES[st]}
              </p>
              <ul className="mt-1.5 space-y-1">
                {flow.map((s, i) =>
                  s.stage !== st ? null : (
                    <li key={s.key}>
                      <button
                        type="button"
                        onClick={() => goTo(i)}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left cursor-pointer",
                          i === stepIdx ? "bg-muted font-semibold" : "hover:bg-muted/50",
                        )}
                      >
                        {i < stepIdx ? (
                          <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">✓</span>
                        ) : (
                          <span
                            className={cn(
                              "grid size-5 shrink-0 place-items-center rounded-full border text-[10px] font-bold",
                              i === stepIdx ? "border-foreground" : "border-border text-muted-foreground",
                            )}
                          >
                            {i + 1}
                          </span>
                        )}
                        <span className={i === stepIdx ? "" : "text-muted-foreground"}>{s.title}</span>
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
              {step.key === "device" && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Este é o aparelho que vai transmitir, mesmo que você esteja lendo em outro. Instale a extensão nele uma vez; depois, você só confere a configuração.
                </p>
              )}
              {step.key === "ext" && (
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
              {step.key === "key" && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Você já concluiu a configuração ou tem um aparelho registrado. Se o painel do TikTok pedir a chave novamente, copie aqui e ative por lá.
                </p>
              )}
              {step.key === "videos" && <p className="mt-1 text-sm text-muted-foreground">Escolha uma opção. Você seleciona os arquivos no painel Zaalys, dentro do TikTok.</p>}
              {step.key === "open" && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {mobile
                    ? "Toque no botão abaixo pelo navegador do celular. O painel Zaalys Live sobe da parte de baixo da tela."
                    : "O painel Zaalys Live aparece no canto da página do TikTok."}
                </p>
              )}
              {mob && <p className="mt-1 text-sm text-muted-foreground">{mob.desc}</p>}
              {step.key === "connect" && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Abra este passo no {browserName} do celular, com a extensão instalada, e toque em Conectar neste navegador. Não precisa copiar nada.
                </p>
              )}
              {step.key === "preview" && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Confira vídeos, câmera, som e produto. Quando os itens do painel estiverem prontos, clique em Ligar live automática. Confirme no TikTok se a transmissão começou.
                </p>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                {posInStage} de {inStage.length} nesta etapa ·{" "}
                {stageIndex === 1 ? "configure uma vez por aparelho" : stageIndex === 2 ? "prepare uma vez por produto" : "confira a cada transmissão"}
              </p>
            </div>

            {step.key === "device" && (
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
                <p className="text-sm text-muted-foreground">{device === detected ? "Sugerimos o aparelho em que você está. Confirme abaixo ou escolha outro." : "Aparelho escolhido. Você pode trocar quando precisar."}</p>
                {deviceDone && <p className="text-sm text-muted-foreground">Sua conta já tem um aparelho registrado. Vamos conferir a instalação neste navegador.</p>}
              </>
            )}

            {step.key === "ext" && (
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

            {step.key === "key" && <KeyBox demo={demo} />}

            {step.key === "connect" && (
              <>
                <p className="text-sm text-muted-foreground">Se preferir, copie a chave e cole no painel da extensão:</p>
                <KeyBox demo={demo} />
                <HowTo>
                  <ConnectDemo os={os} />
                </HowTo>
              </>
            )}

            {mob && (
              <>
                {mob.list && (
                  <ol className="space-y-3 text-sm">
                    {mob.list.map((t, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="grid size-5 shrink-0 place-items-center rounded-full bg-muted text-[11px] font-bold">{i + 1}</span>
                        <span>
                          <Rich text={t} />
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
                <HowTo>
                  {step.key === "orion-install" && <StoreDemo os="ios" />}
                  {step.key === "quetta-install" && <StoreDemo os="android" />}
                  {step.key === "orion-ext" && <OrionSettingsDemo />}
                  {(step.key === "orion-download" || step.key === "quetta-crx") && <DownloadCrxDemo />}
                  {step.key === "orion-file" && <OrionInstallDemo />}
                  {step.key === "quetta-check" && <QuettaCheckDemo />}
                  {step.key === "ios-ready" && <IphoneReadyDemo />}
                  {step.key === "android-ready" && <QuettaDesktopSiteDemo />}
                </HowTo>
                {mob.action && (
                  <a
                    href={mob.action.href}
                    target={mob.action.download ? undefined : "_blank"}
                    rel="noreferrer"
                    download={mob.action.download || undefined}
                    className="inline-flex h-11 items-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold hover:bg-muted"
                  >
                    ↗ {mob.action.label}
                  </a>
                )}
              </>
            )}

            {step.key === "videos" && (
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

            {step.key === "open" && (
              <>
                {mobile && (
                  <ol className="space-y-3 text-sm">
                    {[
                      "Toque em **Abrir o TikTok Shop** e entre com a conta do TikTok da live.",
                      "O painel sobe na parte de baixo. Toque no **–** para minimizar e ver a prévia inteira.",
                      "O menu do TikTok fica no **☰**, e as colunas Produtos, Vídeo e Dados e chat ficam nas abas logo abaixo.",
                    ].map((t, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="grid size-5 shrink-0 place-items-center rounded-full bg-muted text-[11px] font-bold">{i + 1}</span>
                        <span>
                          <Rich text={t} />
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
                {mobile && (
                  <HowTo>
                    <MobileOpenDemo os={os} />
                  </HowTo>
                )}
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
                    {mobile && (
                      <p>
                        <b>A tela de entrar do TikTok mostra um QR code?</b>
                        <br />
                        <span className="text-muted-foreground">
                          O celular não lê o QR da própria tela. Escolha entrar com telefone, e-mail ou nome de usuário, ou com Google ou Apple, do mesmo jeito que você entra no app.
                        </span>
                      </p>
                    )}
                    {device === "android" && (
                      <p>
                        <b>O TikTok mandou abrir o app ou mostrou a versão de celular?</b>
                        <br />
                        <span className="text-muted-foreground">No Quetta, toque em ⋮, marque Site para computador e toque em Abrir o TikTok Shop de novo.</span>
                      </p>
                    )}
                    <p>
                      <b>O painel Zaalys Live não apareceu?</b>
                      <br />
                      <span className="text-muted-foreground">
                        {mobile
                          ? `A página do TikTok precisa estar aberta no ${browserName}, o mesmo navegador onde a extensão foi instalada. Feche a aba, toque em Abrir o TikTok Shop aqui de novo e espere carregar inteira.`
                          : "Confira em chrome://extensions se a Zaalys Live está ligada e recarregue a página do TikTok (F5)."}
                      </span>
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
                {!mobile && (
                  <HowTo>
                    <OpenTikTokDemo />
                  </HowTo>
                )}
              </>
            )}

            {step.key === "preview" && (
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
                      ["O item Câmera não fica verde?", mobile ? "Na página do TikTok, na aba Vídeo, abra as fontes de vídeo e áudio e escolha Zaalys Live (vídeo) na câmera e Zaalys Live (áudio) no microfone." : "Na página do TikTok abra as fontes de vídeo e áudio e escolha Zaalys Live (vídeo) na câmera e Zaalys Live (áudio) no microfone."],
                      ["“Zaalys Live” não aparece na lista de câmeras?", "Escolha os clipes e a live no painel primeiro: a câmera só existe depois disso. Então recarregue a página do TikTok (" + (mobile ? "↻ no navegador" : "F5") + ")."],
                      ["O painel disse “Não consegui abrir a live”?", "O painel já escolheu a câmera e o som da Zaalys; só o clique em iniciar não pegou. Clique em Iniciar LIVE no próprio TikTok e deixe o painel ligado: ele continua comentando, fixando e narrando."],
                      ["O botão de iniciar LIVE do TikTok está cinza?", "Escolha os clipes no painel primeiro: sem eles não existe câmera para enviar. Se continuar cinza, recarregue a página do TikTok (" + (mobile ? "↻ no navegador" : "F5") + ") e ligue de novo. Se aparecer que iniciar LIVE está restrito, o bloqueio é do TikTok na sua conta: veja os avisos de violação no TikTok Shop."],
                      ["A live está sem som?", "Toque uma vez na página do TikTok e ligue de novo. O navegador só libera o som depois de um toque."],
                      ["A voz sai cortada ou some depois da primeira frase?", mobile ? `Atualize a extensão: no celular ela não se atualiza sozinha. No menu de extensões do ${browserName}, remova a Zaalys Live, baixe e instale de novo pelo passo da extensão e toque em Conectar neste navegador. Os clipes continuam lá.` : "Atualize a extensão. Pela Chrome Web Store ela se atualiza sozinha; se você instalou pelo .zip, troque pela loja no passo da extensão."],
                    ].map(([q, a]) => (
                      <p key={q}>
                        <b>{q}</b>
                        <br />
                        <span className="text-muted-foreground">{a}</span>
                      </p>
                    ))}
                  </div>
                </details>
                <HowTo>{mobile ? <MobilePreviewDemo os={os} /> : <PreviewDemo product={current.title} />}</HowTo>
              </>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-border px-6 py-4">
            <button
              type="button"
              disabled={stepIdx === 0}
              onClick={() => goTo(stepIdx - 1)}
              className="h-10 px-2 text-sm font-semibold text-muted-foreground hover:text-foreground disabled:opacity-40 cursor-pointer"
            >
              ← Voltar
            </button>
            <button
              type="button"
              onClick={() => {
                if (stepIdx === 0) {
                  try {
                    window.localStorage.setItem(DEVICE_STORAGE, device);
                  } catch {}
                }
                if (isLast) setCurrent(null);
                else goTo(stepIdx + 1);
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
