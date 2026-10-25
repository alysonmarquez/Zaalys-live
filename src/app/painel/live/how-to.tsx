"use client";

// Animações do "Como fazer" do Assistente de Live (mesma sequência das do original):
// 1) instalar a extensão na Chrome Web Store; 2) abrir a live no TikTok Shop com o painel Zaalys;
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
  <span className={`grid place-items-center rounded-md bg-[#ade74e] font-extrabold text-[#0f1a01] ${className}`}>Z</span>
);

export function ChromeStoreDemo() {
  return (
    <Browser tab="Chrome Web Store" url="chromewebstore.google.com/detail/zaalys-live">
      <div className="p-4">
        <div className="flex items-center gap-3 border-b border-neutral-200 pb-3">
          <Z className="size-9 text-base" />
          <div className="flex-1">
            <p className="text-[12px] font-semibold">Zaalys Live</p>
            <p className="text-[9px] text-neutral-500">zaalys.com · Ferramentas</p>
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
          <Z className="size-3.5 text-[7px]" /> Adicionar “Zaalys Live”?
        </p>
        <p className="mt-1 text-[8px] text-neutral-500">Ela pode ler e alterar seus dados em shop.tiktok.com e zaalys.com</p>
        <div className="mt-2 flex justify-end gap-2 text-[8px] font-semibold">
          <span className="rounded-full bg-[#1a73e8] px-2 py-1 text-white">Adicionar extensão</span>
          <span className="px-1 py-1 text-[#1a73e8]">Cancelar</span>
        </div>
      </div>

      <div className="absolute right-3 top-3 w-[190px] rounded-lg border border-neutral-200 bg-white p-2.5 shadow-xl" style={{ animationName: "zl-toast" }}>
        <p className="flex items-center gap-1.5 text-[10px] font-semibold">
          <Z className="size-3.5 text-[7px]" /> Zaalys Live foi adicionada ao Chrome
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
              <Z className="size-3 text-[6px]" /> Zaalys Live
            </span>
            <span className="text-neutral-400">–</span>
          </p>
          <PanelRow label="Conta conectada" at={34} />
          <PanelRow label="Clipes da live" at={100} done={false} />
          <PanelRow label="Live do Zaalys" at={100} done={false} />
          <PanelRow label="Câmera Zaalys no TikTok" at={100} done={false} />
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
              <Z className="size-3 text-[6px]" /> Zaalys Live
            </span>
            <span className="text-neutral-400">–</span>
          </p>
          <PanelRow label="Clipes da live" sub="3 clipes em ordem aleatória" at={12} />
          <PanelRow label="Live do Zaalys" sub={product} at={26} />
          <PanelRow label="Câmera Zaalys no TikTok" sub="Recebendo o vídeo e a voz" at={44} />
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
        <Swap at={36} a={<span className="block rounded border border-neutral-300 px-1.5 py-0.5 text-[8px]">Selecionar ▾</span>} b={<span className="block rounded border border-[#00a19c] px-1.5 py-0.5 text-[8px]">Zaalys Live (vídeo)</span>} />
        <p className="mt-0.5 text-[8px] text-neutral-500">Microfone</p>
        <Swap at={40} a={<span className="block rounded border border-neutral-300 px-1.5 py-0.5 text-[8px]">Selecionar ▾</span>} b={<span className="block rounded border border-[#00a19c] px-1.5 py-0.5 text-[8px]">Zaalys Live (áudio)</span>} />
      </div>
      <div>
        <p className="text-[9px] font-semibold">Dados e chat</p>
        <span className="mt-1.5 block h-2 w-3/4 rounded bg-neutral-100" />
        <span className="mt-1 block h-2 w-1/2 rounded bg-neutral-100" />
      </div>
    </LiveManagerFrame>
  );
}
