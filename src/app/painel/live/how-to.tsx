"use client";

// Animações do "Como fazer" do Assistente de Live (mesma sequência das do original):
// 1) instalar a extensão na Chrome Web Store; 2) abrir a live no TikTok Shop com o painel MediaFlowMZ;
// 3) conferir câmera, som e produto e ligar a live automática. Loop de ~8 s, só com CSS.

const CSS = `
@keyframes zl-in1 { 0%,18% {opacity:0; transform:translateY(6px)} 24%,100% {opacity:1; transform:none} }
@keyframes zl-dialog { 0%,22% {opacity:0; transform:scale(.96)} 28%,52% {opacity:1; transform:none} 58%,100% {opacity:0; transform:scale(.98)} }
@keyframes zl-toast { 0%,58% {opacity:0; transform:translateY(-6px)} 64%,92% {opacity:1; transform:none} 98%,100% {opacity:0} }
@keyframes zl-btn-a { 0%,56% {opacity:1} 60%,100% {opacity:0} }
@keyframes zl-btn-b { 0%,56% {opacity:0} 60%,100% {opacity:1} }
@keyframes zl-cursor1 { 0%,10% {transform:translate(0,60px)} 20%,26% {transform:translate(150px,-38px)} 34%,48% {transform:translate(120px,46px)} 60%,100% {transform:translate(210px,120px)} }
@keyframes zl-panel { 0%,20% {opacity:0; transform:translateX(16px)} 30%,100% {opacity:1; transform:none} }
.zl-anim * { animation-duration: 8s; animation-iteration-count: infinite; animation-timing-function: ease-out; animation-fill-mode: both; }
@media (prefers-reduced-motion: reduce) { .zl-anim * { animation: none !important; } }
`;

/** Keyframes com o instante "at" (em % do ciclo) fixo no nome, já que seletores de keyframe não aceitam variáveis. */
function kf(kind: "row" | "check" | "a" | "b", at: number) {
  const name = `zl-${kind}-${at}`;
  const t = Math.min(at + 5, 99);
  const body =
    kind === "row"
      ? `0%,${at}%{opacity:.35}${t}%,100%{opacity:1}`
      : kind === "check"
        ? `0%,${at}%{background:#d9d9d9}${t}%,100%{background:#22c55e}`
        : kind === "a"
          ? `0%,${at}%{opacity:1}${t}%,100%{opacity:0}`
          : `0%,${at}%{opacity:0}${t}%,100%{opacity:1}`;
  return { name, css: `@keyframes ${name}{${body}}` };
}

function Anim({ kind, at, className, children }: { kind: "row" | "a" | "b"; at: number; className?: string; children: React.ReactNode }) {
  const k = kf(kind, at);
  return (
    <span className={className} style={{ animationName: k.name }}>
      <style>{k.css}</style>
      {children}
    </span>
  );
}

function Browser({ tab, url, children }: { tab: string; url: string; children: React.ReactNode }) {
  return (
    <div className="zl-anim relative mx-auto w-full max-w-[420px] overflow-hidden rounded-lg bg-white text-[10px] text-neutral-800 shadow-lg">
      <style>{CSS}</style>
      <div className="flex items-center gap-2 bg-neutral-200 px-2 pt-1.5">
        <span className="flex gap-1">
          <span className="size-1.5 rounded-full bg-neutral-400" />
          <span className="size-1.5 rounded-full bg-neutral-400" />
          <span className="size-1.5 rounded-full bg-neutral-400" />
        </span>
        <span className="rounded-t-md bg-white px-3 py-1 text-[9px] font-medium">{tab}</span>
      </div>
      <div className="flex items-center gap-2 border-b border-neutral-200 px-2 py-1.5">
        <span className="text-neutral-400">‹ › ↻</span>
        <span className="flex-1 truncate rounded-full bg-neutral-100 px-3 py-0.5 text-[9px] text-neutral-500">{url}</span>
      </div>
      <div className="relative h-[190px]">{children}</div>
    </div>
  );
}

const Z = ({ className = "" }: { className?: string }) => (
  <span className={`grid place-items-center rounded-md bg-[#ade74e] font-extrabold text-[#0f1a01] ${className}`}>M</span>
);

export function ChromeStoreDemo() {
  return (
    <Browser tab="Chrome Web Store" url="chromewebstore.google.com/detail/mediaflowmz-live">
      <div className="p-4">
        <div className="flex items-center gap-3 border-b border-neutral-200 pb-3">
          <Z className="size-9 text-base" />
          <div className="flex-1">
            <p className="text-[12px] font-semibold">MediaFlowMZ Live</p>
            <p className="text-[9px] text-neutral-500">mediaflowmz.com · Ferramentas</p>
          </div>
          <span className="relative h-6 w-24">
            <span className="absolute inset-0 grid place-items-center rounded-full bg-[#1a73e8] text-[9px] font-semibold text-white" style={{ animationName: "zl-btn-a" }}>
              Usar no Chrome
            </span>
            <span className="absolute inset-0 grid place-items-center rounded-full border border-[#1a73e8] text-[9px] font-semibold text-[#1a73e8]" style={{ animationName: "zl-btn-b" }}>
              Remover do Chrome
            </span>
          </span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <span className="h-[70px] rounded bg-neutral-100" />
          <span className="relative h-[70px] rounded bg-neutral-900">
            <Z className="absolute left-1.5 top-1.5 size-3.5 text-[7px]" />
          </span>
          <span className="h-[70px] rounded bg-neutral-100" />
        </div>
      </div>

      <div className="absolute right-3 top-3 w-[190px] rounded-lg border border-neutral-200 bg-white p-3 shadow-xl" style={{ animationName: "zl-dialog" }}>
        <p className="flex items-center gap-1.5 text-[10px] font-semibold">
          <Z className="size-3.5 text-[7px]" /> Adicionar “MediaFlowMZ Live”?
        </p>
        <p className="mt-1 text-[8px] text-neutral-500">Ela pode ler e alterar seus dados em shop.tiktok.com e mediaflowmz.com</p>
        <div className="mt-2 flex justify-end gap-2 text-[8px] font-semibold">
          <span className="rounded-full bg-[#1a73e8] px-2 py-1 text-white">Adicionar extensão</span>
          <span className="px-1 py-1 text-[#1a73e8]">Cancelar</span>
        </div>
      </div>

      <div className="absolute right-3 top-3 w-[190px] rounded-lg border border-neutral-200 bg-white p-2.5 shadow-xl" style={{ animationName: "zl-toast" }}>
        <p className="flex items-center gap-1.5 text-[10px] font-semibold">
          <Z className="size-3.5 text-[7px]" /> MediaFlowMZ Live foi adicionada ao Chrome
        </p>
        <p className="mt-0.5 pl-5 text-[8px] text-neutral-500">Ela se atualiza sozinha.</p>
      </div>

      <svg viewBox="0 0 12 16" className="absolute left-6 top-8 size-4 drop-shadow" style={{ animationName: "zl-cursor1" }}>
        <path d="M0 0v13l3.5-3.2L6 16l2-1-2.5-6H10z" fill="#111" stroke="#fff" strokeWidth=".8" />
      </svg>
    </Browser>
  );
}

function PanelRow({ label, sub, at, done = true }: { label: string; sub?: string; at: number; done?: boolean }) {
  const row = kf("row", at);
  const check = kf("check", at);
  return (
    <div className="flex items-center gap-1.5 py-0.5" style={{ animationName: done ? row.name : undefined, opacity: done ? undefined : 0.45 }}>
      <style>{row.css + check.css}</style>
      <span className="size-2 shrink-0 rounded-full" style={{ animationName: done ? check.name : undefined, background: done ? undefined : "#d9d9d9" }} />
      <span className="min-w-0">
        <span className="block truncate text-[8.5px] font-semibold">{label}</span>
        {sub && <span className="block truncate text-[7.5px] text-neutral-500">{sub}</span>}
      </span>
    </div>
  );
}

function LiveManagerFrame({ children, right }: { children: React.ReactNode; right: React.ReactNode }) {
  return (
    <Browser tab="♪ LIVE Manager" url="shop.tiktok.com/streamer/live">
      <div className="flex items-center justify-between border-b border-neutral-200 px-3 py-1.5">
        <span className="text-[10px] font-semibold">LIVE Manager</span>
        <span className="rounded bg-[#fe2c55] px-2 py-0.5 text-[8px] font-semibold text-white">Iniciar LIVE</span>
      </div>
      <div className="grid h-[160px] grid-cols-[1fr_1.1fr_1fr] gap-2 p-2">{children}</div>
      {right}
    </Browser>
  );
}

export function OpenTikTokDemo() {
  return (
    <LiveManagerFrame
      right={
        <div className="absolute bottom-2 right-2 w-[132px] rounded-lg border border-neutral-200 bg-white p-2 shadow-xl" style={{ animationName: "zl-panel" }}>
          <p className="mb-1 flex items-center justify-between text-[9px] font-semibold">
            <span className="flex items-center gap-1">
              <Z className="size-3 text-[6px]" /> MediaFlowMZ Live
            </span>
            <span className="text-neutral-400">–</span>
          </p>
          <PanelRow label="Conta conectada" at={34} />
          <PanelRow label="Clipes da live" at={100} done={false} />
          <PanelRow label="Live do MediaFlowMZ" at={100} done={false} />
          <PanelRow label="Câmera MediaFlowMZ no TikTok" at={100} done={false} />
          <PanelRow label="Produto no carrinho" at={100} done={false} />
          <span className="mt-1 block rounded bg-neutral-200 py-1 text-center text-[8px] font-semibold text-neutral-500">Ligar live automática</span>
        </div>
      }
    >
      <div>
        <p className="text-[9px] font-semibold">Produtos</p>
        <span className="mt-1.5 block h-5 rounded bg-neutral-100" />
        <span className="mt-1 block h-5 rounded bg-neutral-100" />
      </div>
      <div className="flex flex-col">
        <span className="grid flex-1 place-items-center rounded bg-neutral-900 text-[8px] text-white/60">Prévia da live</span>
        <p className="mt-1 text-[8px] text-neutral-500">Câmera</p>
        <span className="rounded border border-neutral-300 px-1.5 py-0.5 text-[8px]">Selecionar ▾</span>
      </div>
      <div>
        <p className="text-[9px] font-semibold">Dados e chat</p>
        <span className="mt-1.5 block h-2 w-3/4 rounded bg-neutral-100" />
        <span className="mt-1 block h-2 w-1/2 rounded bg-neutral-100" />
      </div>
    </LiveManagerFrame>
  );
}

function Swap({ a, b, at, className = "" }: { a: React.ReactNode; b: React.ReactNode; at: number; className?: string }) {
  return (
    <span className={`relative block ${className}`}>
      <Anim kind="a" at={at} className="block">{a}</Anim>
      <Anim kind="b" at={at} className="absolute inset-0 block">{b}</Anim>
    </span>
  );
}

export function PreviewDemo({ product }: { product: string }) {
  return (
    <LiveManagerFrame
      right={
        <div className="absolute bottom-2 right-2 w-[140px] rounded-lg border border-neutral-200 bg-white p-2 shadow-xl">
          <p className="mb-1 flex items-center justify-between text-[9px] font-semibold">
            <span className="flex items-center gap-1">
              <Z className="size-3 text-[6px]" /> MediaFlowMZ Live
            </span>
            <span className="text-neutral-400">–</span>
          </p>
          <PanelRow label="Clipes da live" sub="3 clipes em ordem aleatória" at={12} />
          <PanelRow label="Live do MediaFlowMZ" sub={product} at={26} />
          <PanelRow label="Câmera MediaFlowMZ no TikTok" sub="Recebendo o vídeo e a voz" at={44} />
          <PanelRow label="Produto no carrinho" sub="Na lista, será fixado" at={60} />
          <Swap
            at={74}
            className="mt-1"
            a={<span className="block rounded bg-[#ade74e] py-1 text-center text-[8px] font-semibold text-[#0f1a01]">Ligar live automática</span>}
            b={<span className="block rounded bg-neutral-800 py-1 text-center text-[8px] font-semibold text-white">■ Parar live automática</span>}
          />
        </div>
      }
    >
      <div>
        <p className="text-[9px] font-semibold">Produtos</p>
        <p className="mt-1 text-[8px] text-[#00a19c]">+ Adicionar produtos</p>
        <Anim kind="row" at={58} className="mt-1 flex items-center gap-1 rounded bg-neutral-100 p-1">
          <span className="line-clamp-2 flex-1 text-[7.5px]">{product}</span>
          <span className="rounded bg-white px-1 text-[7px] font-semibold">Fixar</span>
        </Anim>
      </div>
      <div className="flex flex-col">
        <span className="relative grid flex-1 place-items-center overflow-hidden rounded bg-neutral-900 text-[8px] text-white/60">
          <Swap at={40} a={<span>Sem câmera</span>} b={<span className="text-white">▶ Clipe do produto</span>} />
          <Anim kind="b" at={74} className="absolute left-1 top-1">
            <span className="rounded bg-[#fe2c55] px-1 text-[7px] font-bold text-white">AO VIVO</span>
          </Anim>
        </span>
        <p className="mt-1 text-[8px] text-neutral-500">Câmera</p>
        <Swap at={36} a={<span className="block rounded border border-neutral-300 px-1.5 py-0.5 text-[8px]">Selecionar ▾</span>} b={<span className="block rounded border border-[#00a19c] px-1.5 py-0.5 text-[8px]">MediaFlowMZ Live (vídeo)</span>} />
        <p className="mt-0.5 text-[8px] text-neutral-500">Microfone</p>
        <Swap at={40} a={<span className="block rounded border border-neutral-300 px-1.5 py-0.5 text-[8px]">Selecionar ▾</span>} b={<span className="block rounded border border-[#00a19c] px-1.5 py-0.5 text-[8px]">MediaFlowMZ Live (áudio)</span>} />
      </div>
      <div>
        <p className="text-[9px] font-semibold">Dados e chat</p>
        <span className="mt-1.5 block h-2 w-3/4 rounded bg-neutral-100" />
        <span className="mt-1 block h-2 w-1/2 rounded bg-neutral-100" />
      </div>
    </LiveManagerFrame>
  );
}

// ---------- Celular (iPhone/Orion e Android/Quetta) ----------

/** Mostra as telas em sequência, cada uma por uma fatia igual do ciclo de 8 s. */
function Frames({ frames }: { frames: React.ReactNode[] }) {
  const n = frames.length;
  const css = frames
    .map((_, i) => {
      const a = Math.round((i / n) * 100);
      const b = Math.round(((i + 1) / n) * 100);
      const name = `zl-fr-${n}-${i}`;
      const on = i === 0 ? `0%,${Math.max(b - 3, 1)}%{opacity:1}${b}%,100%{opacity:0}` : `0%,${a}%{opacity:0}${a + 3}%,${i === n - 1 ? 97 : b - 3}%{opacity:1}${i === n - 1 ? "100%{opacity:0}" : `${b}%,100%{opacity:0}`}`;
      return `@keyframes ${name}{${on}}`;
    })
    .join("");
  return (
    <div className="relative h-full">
      <style>{css}</style>
      {frames.map((f, i) => (
        <div key={i} className="absolute inset-0" style={{ animationName: `zl-fr-${n}-${i}` }}>
          {f}
        </div>
      ))}
    </div>
  );
}

function Phone({ url, frames, dark = false }: { url?: string; frames: React.ReactNode[]; dark?: boolean }) {
  return (
    <div className="zl-anim w-[150px] rounded-[26px] bg-neutral-900 p-[5px] shadow-xl">
      <style>{CSS}</style>
      <div className={`relative h-[300px] overflow-hidden rounded-[22px] ${dark ? "bg-neutral-900 text-white" : "bg-white text-neutral-900"} text-[8px]`}>
        <div className="flex items-center justify-between px-4 pt-2 text-[7px] font-semibold">
          <span>9:41</span>
          <span className="h-3 w-12 rounded-full bg-neutral-900" />
          <span>▮</span>
        </div>
        {url && <div className="mx-2 mt-1 truncate rounded-md bg-neutral-100 px-2 py-0.5 text-[7px] text-neutral-500">{url}</div>}
        <div className="absolute inset-x-0 bottom-0 top-[34px]">
          <Frames frames={frames} />
        </div>
      </div>
    </div>
  );
}

const Row = ({ children, check = false }: { children: React.ReactNode; check?: boolean }) => (
  <div className="flex items-center justify-between border-b border-neutral-100 px-2 py-1.5">
    <span>{children}</span>
    {check && <span className="text-[#00a19c]">✓</span>}
  </div>
);
const Toggle = ({ on }: { on: boolean }) => (
  <span className={`inline-block h-3 w-5 rounded-full ${on ? "bg-[#34c759]" : "bg-neutral-300"} relative`}>
    <span className={`absolute top-0.5 size-2 rounded-full bg-white ${on ? "left-2.5" : "left-0.5"}`} />
  </span>
);
const Sheet = ({ children }: { children: React.ReactNode }) => (
  <div className="absolute inset-x-1 bottom-1 rounded-xl bg-white p-2 shadow-[0_-4px_20px_rgba(0,0,0,.15)]">{children}</div>
);
const ZRow = ({ v = "3.12.0" }: { v?: string }) => (
  <div className="flex items-center gap-1.5 px-2 py-1.5">
    <Z className="size-4 text-[7px]" />
    <span className="flex-1 font-semibold">MediaFlowMZ Live</span>
    <span className="text-neutral-400">{v}</span>
    <Toggle on />
  </div>
);
const Crx = () => (
  <div className="flex items-center gap-1.5 rounded-md border border-neutral-200 p-1.5">
    <span className="rounded bg-neutral-200 px-1 text-[6px] font-bold">CRX</span>
    <span className="flex-1">
      <span className="block font-semibold">mediaflowmz-live.crx</span>
      <span className="text-[6.5px] text-neutral-400">2,6 MB · agora</span>
    </span>
  </div>
);

export function StoreDemo({ os }: { os: "ios" | "android" }) {
  const ios = os === "ios";
  const card = (btn: string, filled: boolean) => (
    <div className="p-2">
      {ios && <p className="text-[13px] font-bold">Buscar</p>}
      <div className="mt-1 flex items-center gap-2 border-b border-neutral-100 pb-2">
        <span className={`grid size-9 place-items-center rounded-xl ${ios ? "bg-[#5b3fd6]" : "bg-[#2b6cf6]"} text-white`}>{ios ? "✦" : "Q"}</span>
        <span className="flex-1">
          <span className="block font-semibold">{ios ? "Orion Browser by Kagi" : "Quetta: Kiwi Alternative&Video"}</span>
          <span className="block text-[6.5px] text-neutral-500">{ios ? "Utilidades · ★★★★☆ 83" : "Quetta Networks · 4,8 ★ · 1 mi+ downloads"}</span>
        </span>
        {ios && <span className={`rounded-full px-2 py-0.5 text-[7px] font-bold ${filled ? "bg-[#007aff] text-white" : "bg-neutral-100 text-[#007aff]"}`}>{btn}</span>}
      </div>
      {!ios && <span className={`mt-2 block rounded-full py-1 text-center text-[8px] font-semibold ${filled ? "bg-[#01875f] text-white" : "border border-[#01875f] text-[#01875f]"}`}>{btn}</span>}
      <div className="mt-2 h-[120px] rounded-lg bg-neutral-100" />
    </div>
  );
  return <Phone frames={ios ? [card("OBTER", false), card("ABRIR", true)] : [card("Instalar", true), card("Abrir", false)]} />;
}

export function OrionSettingsDemo() {
  const screen = (chrome: boolean) => (
    <div className="bg-neutral-50">
      <p className="px-2 pb-1 text-[12px] font-bold">Ajustes</p>
      <p className="px-2 pt-1 text-[6.5px] text-neutral-400">EXTENSÕES</p>
      <div className="bg-white">
        <div className="flex items-center justify-between px-2 py-1.5">Extensões do Chrome <Toggle on={chrome} /></div>
        <div className="flex items-center justify-between px-2 py-1.5">Extensões do Firefox <Toggle on={false} /></div>
      </div>
      <p className="px-2 pt-2 text-[6.5px] text-neutral-400">SITES</p>
      <div className="bg-white">
        <Row check>Modo de compatibilidade · Desligado</Row>
      </div>
    </div>
  );
  return <Phone frames={[screen(false), screen(true)]} />;
}

export function DownloadCrxDemo() {
  const page = (
    <div className="p-2 text-center">
      <Z className="mx-auto mt-2 size-8 text-[13px]" />
      <p className="mt-1 font-semibold">MediaFlowMZ Live</p>
      <p className="text-[6.5px] text-neutral-500">para iPhone, iPad e Android</p>
      <span className="mt-2 inline-block rounded-md bg-[#ade74e] px-3 py-1 font-semibold">Baixar extensão</span>
    </div>
  );
  return (
    <Phone
      url="🔒 mediaflowmz.com/ferramentas"
      frames={[
        page,
        <div key="d" className="relative h-full">
          {page}
          <Sheet>
            <p className="font-semibold">Baixar “mediaflowmz-live.crx”?</p>
            <p className="text-[6.5px] text-neutral-500">2,6 MB</p>
            <div className="mt-1.5 flex justify-end gap-3 text-[7px] font-semibold text-[#007aff]">
              <span>Cancelar</span>
              <span>Baixar</span>
            </div>
          </Sheet>
        </div>,
        <div key="ok" className="relative h-full">
          {page}
          <Sheet>
            <p className="flex items-center gap-1 font-semibold">⬇︎ mediaflowmz-live.crx <span className="text-[#00a19c]">✓</span></p>
          </Sheet>
        </div>,
      ]}
    />
  );
}

export function OrionInstallDemo() {
  const menu = (
    <div className="relative h-full">
      <Sheet>
        {["🧩 Extensões", "☆ Favoritos", "↺ Histórico", "⚙︎ Ajustes"].map((t) => (
          <p key={t} className="py-1">{t}</p>
        ))}
      </Sheet>
    </div>
  );
  const list = (installed: boolean) => (
    <div>
      <p className="flex justify-between px-2 text-[11px] font-bold">Extensões <span className="text-[#007aff]">+</span></p>
      {installed ? <ZRow /> : <p className="px-2 py-6 text-center text-neutral-400">Nenhuma extensão instalada</p>}
    </div>
  );
  return (
    <Phone
      url="🔒 shop.tiktok.com"
      frames={[
        menu,
        <div key="s" className="relative h-full">
          {list(false)}
          <Sheet>
            <p className="font-semibold">Adicionar extensão</p>
            <p className="py-1 text-[#007aff]">Instalar do arquivo</p>
            <p className="py-1 text-[#007aff]">Chrome Web Store</p>
            <p className="py-1 text-center text-neutral-500">Cancelar</p>
          </Sheet>
        </div>,
        <div key="f" className="p-2">
          <p className="text-[10px] font-bold">Recentes</p>
          <p className="mb-1 text-[6.5px] text-neutral-500">No iPhone › Downloads</p>
          <Crx />
        </div>,
        list(true),
      ]}
    />
  );
}

export function QuettaCheckDemo() {
  return (
    <Phone
      url="shop.tiktok.com"
      frames={[
        <div key="m" className="relative h-full">
          <Sheet>
            {["＋ Nova guia", "🧩 Extensões", "⬇︎ Downloads", "🖥 Site para computador", "⚙︎ Configurações"].map((t) => (
              <p key={t} className="py-1">{t}</p>
            ))}
          </Sheet>
        </div>,
        <div key="e">
          <p className="px-2 text-[11px] font-bold">Extensões</p>
          <p className="px-2 py-1 text-[#01875f]">⚙︎ Opções de desenvolvedor</p>
          <p className="px-2 py-6 text-center text-neutral-400">Nenhuma extensão ainda</p>
        </div>,
        <div key="d" className="p-2">
          <p className="text-[10px] font-bold">Opções de desenvolvedor</p>
          <div className="flex items-center justify-between py-1.5">Modo de desenvolvedor <Toggle on /></div>
          <p className="rounded-md bg-neutral-100 py-1.5 text-center font-semibold">⬆︎ Carregar arquivo .zip/.crx</p>
          <p className="mt-2 text-[8px] font-semibold">Downloads</p>
          <Crx />
        </div>,
        <div key="ok">
          <p className="px-2 text-[11px] font-bold">Extensões</p>
          <ZRow />
        </div>,
      ]}
    />
  );
}

export function ConnectDemo({ os }: { os: "ios" | "android" }) {
  const base = (btn: React.ReactNode, device = false) => (
    <div className="p-2">
      <p className="font-semibold">Extensão MediaFlowMZ Live</p>
      <p className="text-[6.5px] text-neutral-500">A chave abre dois aparelhos ao mesmo tempo.</p>
      <div className="mt-1.5 flex items-center justify-between rounded-md bg-neutral-100 px-1.5 py-1 font-mono text-[7px]">
        zlv_8f3k•••••••• <span className="font-sans font-semibold">Copiar</span>
      </div>
      <p className="mt-1.5 text-[6.5px] text-neutral-500">A extensão está instalada neste navegador. Conecte sem copiar a chave.</p>
      <div className="mt-1">{btn}</div>
      {device && (
        <div className="mt-2 flex items-center gap-1.5 rounded-md border border-neutral-200 p-1.5">
          📱 <span className="flex-1 font-semibold">{os === "ios" ? "iPhone · Orion" : "Android · Quetta"}</span>
          <span className="text-[6.5px] text-[#00a19c]">Em uso agora</span>
        </div>
      )}
    </div>
  );
  const b = (t: string, cls: string) => <span className={`block rounded-md py-1 text-center font-semibold ${cls}`}>{t}</span>;
  return (
    <Phone
      url={`${os === "ios" ? "🔒 " : ""}mediaflowmz.com/settings`}
      frames={[
        base(b("Conectar neste navegador", "bg-[#ade74e]")),
        base(b("Conectando…", "bg-neutral-200 text-neutral-500")),
        base(b("✓ Conectado", "bg-[#22c55e] text-white"), true),
      ]}
    />
  );
}

export function IphoneReadyDemo() {
  return (
    <Phone
      frames={[
        <div key="a" className="bg-neutral-50">
          <p className="px-2 pb-1 text-[12px] font-bold">Ajustes</p>
          <div className="bg-white">
            <Row>☀︎ Tela e Brilho ›</Row>
            <Row>🔋 Bateria ›</Row>
            <Row>✋ Privacidade ›</Row>
          </div>
        </div>,
        <div key="b" className="bg-neutral-50">
          <p className="px-2 pb-1 text-[11px] font-bold">Tela e Brilho</p>
          <div className="bg-white">
            <Row>Bloqueio automático · 30 s ›</Row>
          </div>
        </div>,
        <div key="c" className="bg-neutral-50">
          <p className="px-2 pb-1 text-[11px] font-bold">Bloqueio automático</p>
          <div className="bg-white">
            <Row>30 segundos</Row>
            <Row>1 minuto</Row>
            <Row>5 minutos</Row>
            <Row check>Nunca</Row>
          </div>
        </div>,
        <div key="d" className="grid h-full place-items-center bg-neutral-900 text-center text-white">
          <span>
            <span className="text-[22px] text-[#34c759]">⚡︎</span>
            <span className="block">Deixe carregando na live</span>
          </span>
        </div>,
      ]}
    />
  );
}

function MobileLiveManager({ children, live = false, cam = "Selecionar ▾" }: { children?: React.ReactNode; live?: boolean; cam?: string }) {
  return (
    <div className="relative h-full">
      <div className="flex items-center gap-2 px-2 py-1 font-semibold">☰ LIVE Manager</div>
      <div className="relative mx-2 grid h-[80px] place-items-center rounded-md bg-neutral-900 text-[7px] text-white/60">
        Prévia da live
        {live && <span className="absolute left-1 top-1 rounded bg-[#fe2c55] px-1 text-[6px] font-bold text-white">AO VIVO</span>}
      </div>
      <p className="mx-2 mt-1 rounded border border-neutral-300 px-1.5 py-0.5 text-[7px]">Câmera: {cam}</p>
      {children}
    </div>
  );
}

const PanelSheet = ({ items, btn }: { items: [string, string?][]; btn: React.ReactNode }) => (
  <Sheet>
    <p className="mb-1 flex items-center justify-between font-semibold">
      <span className="flex items-center gap-1">
        <Z className="size-3 text-[6px]" /> MediaFlowMZ Live
      </span>
      <span className="text-neutral-400">–</span>
    </p>
    {items.map(([t, s]) => (
      <p key={t} className="flex items-start gap-1 py-0.5">
        <span className="text-[#22c55e]">✓</span>
        <span>
          <span className="block font-semibold">{t}</span>
          {s && <span className="block text-[6.5px] text-neutral-500">{s}</span>}
        </span>
      </p>
    ))}
    <div className="mt-1">{btn}</div>
  </Sheet>
);

export function MobileOpenDemo({ os }: { os: "ios" | "android" }) {
  const btn = <span className="block rounded bg-[#ade74e] py-1 text-center font-semibold">Ligar live automática</span>;
  return (
    <Phone
      url={`${os === "ios" ? "🔒 " : ""}shop.tiktok.com/streamer/live`}
      frames={[
        <MobileLiveManager key="a" />,
        <MobileLiveManager key="b">
          <PanelSheet items={[["Clipes da live"], ["Narração pronta"], ["Câmera MediaFlowMZ no TikTok"]]} btn={btn} />
        </MobileLiveManager>,
      ]}
    />
  );
}

export function MobilePreviewDemo({ os }: { os: "ios" | "android" }) {
  const items: [string, string?][] = [
    ["Clipes da live", "3 clipes em ordem aleatória"],
    ["Live do MediaFlowMZ", "Pronta, com narração"],
    ["Câmera MediaFlowMZ no TikTok", "Recebendo o vídeo e a voz"],
    ["Produto no carrinho", "Na lista, será fixado"],
  ];
  return (
    <Phone
      url={`${os === "ios" ? "🔒 " : ""}shop.tiktok.com/streamer/live`}
      frames={[
        <MobileLiveManager key="a" />,
        <MobileLiveManager key="b" cam="MediaFlowMZ Live (vídeo)">
          <PanelSheet items={items} btn={<span className="block rounded bg-[#ade74e] py-1 text-center font-semibold">Ligar live automática</span>} />
        </MobileLiveManager>,
        <MobileLiveManager key="c" cam="MediaFlowMZ Live (vídeo)" live>
          <PanelSheet items={items} btn={<span className="block rounded bg-neutral-800 py-1 text-center font-semibold text-white">■ Parar live automática</span>} />
        </MobileLiveManager>,
      ]}
    />
  );
}

export function QuettaDesktopSiteDemo() {
  return (
    <Phone
      url="shop.tiktok.com/streamer"
      frames={[
        <div key="a" className="grid h-full place-items-center text-center text-neutral-500">
          <span>
            📱
            <span className="block">Versão para celular</span>
          </span>
        </div>,
        <div key="b" className="relative h-full">
          <Sheet>
            {["＋ Nova guia", "🧩 Extensões", "⬇︎ Downloads", "🖥 Site para computador ✓", "⚙︎ Configurações"].map((t) => (
              <p key={t} className={`py-1 ${t.includes("✓") ? "font-semibold text-[#01875f]" : ""}`}>{t}</p>
            ))}
          </Sheet>
        </div>,
        <MobileLiveManager key="c" />,
      ]}
    />
  );
}
