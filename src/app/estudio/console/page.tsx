"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeftRight,
  ChevronDown,
  ChevronUp,
  CircleHelp,
  Gift,
  Pencil,
  Pin,
  Send,
  Plus,
  RefreshCw,
  Search,
  ScanLine,
  Settings,
  Smartphone,
  Sparkles,
  Briefcase,
  Ticket,
  Trash2,
  TriangleAlert,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/components/brand";
import { CATALOGO_ORIGINAL, CATEGORY_LABELS } from "@/lib/catalogo-original";
import { formatBRL } from "@/lib/zaalys-data";


// Indicadores do painel lateral. Sem transmissão, ficam em "--" (o clone não gera vendas).
const METRICS = [
  "GMV atribuído",
  "Itens atribuídos vendidos",
  "Espectadores atuais",
  "Duração média de visualização",
  "Cliques no produto",
  "Porcentagem de visitantes",
];

type ChatMsg = { id: number; text: string };

function Toggle({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!on)} className="flex items-center gap-1.5 text-xs font-semibold text-white cursor-pointer">
      {label}
      <span className={cn("relative h-4 w-7 rounded-full transition-colors", on ? "bg-primary" : "bg-white/25")}>
        <span className={cn("absolute top-0.5 size-3 rounded-full bg-white transition-[left]", on ? "left-3.5" : "left-0.5")} />
      </span>
    </button>
  );
}

export default function ConsolePage() {
  const [productIds, setProductIds] = useState<number[]>([]);
  const [pinned, setPinned] = useState<number | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("todas");
  const [selected, setSelected] = useState<number[]>([]);
  const [videoOn, setVideoOn] = useState(true);
  const [scriptOn, setScriptOn] = useState(true);
  const [script, setScript] = useState("");
  const [editingScript, setEditingScript] = useState(false);
  const [mode, setMode] = useState<"rapida" | "agendada">("rapida");
  const [chatTab, setChatTab] = useState<"todos" | "produto">("todos");
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [onAir, setOnAir] = useState(false);
  const [camStream, setCamStream] = useState<MediaStream | null>(null);
  const [camError, setCamError] = useState<string | null>(null);

  // Iniciar LIVE pede câmera e microfone, como o TikTok: com a extensão Zaalys Live ligada,
  // quem responde é a câmera virtual dela (os clipes do produto).
  async function toggleLive() {
    if (onAir) {
      camStream?.getTracks().forEach((t) => t.stop());
      setCamStream(null);
      setOnAir(false);
      return;
    }
    setCamError(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setCamStream(s);
    } catch {
      setCamError("Sem câmera: a prévia mostra a foto do produto fixado.");
    }
    setOnAir(true);
  }
  const [tip, setTip] = useState(false);
  useEffect(() => {
    try {
      setTip(localStorage.getItem("zaalys_console_tip") !== "1");
    } catch {
      setTip(true);
    }
  }, []);
  function dismissTip() {
    setTip(false);
    try {
      localStorage.setItem("zaalys_console_tip", "1");
    } catch {}
  }
  const [chatSize, setChatSize] = useState(14);
  const [suggestOpen, setSuggestOpen] = useState(true);

  const products = productIds.map((id) => CATALOGO_ORIGINAL.find((p) => p.id === id)!).filter(Boolean);
  const pinnedProduct = products.find((p) => p.id === pinned);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CATALOGO_ORIGINAL.filter(
      (p) =>
        !productIds.includes(p.id) &&
        (category === "todas" || p.categoryKey === category) &&
        (!q || p.title.toLowerCase().includes(q) || String(p.id).includes(q)),
    ).slice(0, 40);
  }, [query, category, productIds]);

  function addSelected() {
    setProductIds((prev) => [...prev, ...selected]);
    setSelected([]);
    setPickerOpen(false);
  }

  // Lê o texto do próprio campo: quem digita pode ser a extensão, antes de o React atualizar o estado.
  function sendChat(e: React.FormEvent, value?: string) {
    e.preventDefault();
    const text = (value ?? chatInput).trim();
    if (!text) return;
    setChat((c) => [...c, { id: Date.now(), text }]);
    setChatInput("");
  }

  return (
    <div className="flex h-[calc(100svh-5.5rem)] min-h-[620px] flex-col overflow-hidden rounded-xl bg-card">
      {/* Barra do console */}
      <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <h1 className="text-[17px] font-semibold">Console de LIVE</h1>
          <div className="relative">
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as "rapida" | "agendada")}
              className="h-8 appearance-none rounded-full bg-muted pl-3 pr-7 text-xs font-semibold cursor-pointer"
            >
              <option value="rapida">LIVE rápida</option>
              <option value="agendada">Evento agendado</option>
            </select>
            <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-2.5" />
            {tip && (
              <div className="absolute left-1/2 top-11 z-20 w-80 -translate-x-1/2 rounded-xl bg-primary p-5 text-primary-foreground shadow-lg">
                <span className="absolute -top-1.5 left-1/2 size-3 -translate-x-1/2 rotate-45 bg-primary" />
                <p className="text-[17px] font-semibold leading-snug">Gerencie diferentes transmissões ao vivo em um só lugar</p>
                <p className="mt-3 text-sm leading-relaxed opacity-90">
                  Alterne entre eventos agendados e transmissões ao vivo rápidas diretamente no console de LIVE.
                </p>
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={dismissTip}
                    className="h-10 rounded-md border border-current px-5 text-sm font-semibold cursor-pointer"
                  >
                    Entendi
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 text-foreground/80">
          <button type="button" className="flex h-7 items-center gap-1.5 rounded-full border border-foreground/70 px-3 text-xs font-semibold text-foreground">
            Alternar modo <ArrowLeftRight size={13} />
          </button>
          <span className="h-5 w-px bg-border" />
          <ScanLine size={19} />
          <Settings size={19} />
          <span className="h-5 w-px bg-border" />
          <TriangleAlert size={19} />
        </div>
      </div>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[1.12fr_1fr_1fr] lg:divide-x lg:divide-border/60">
        {/* Coluna 1: produtos */}
        <section className="relative flex min-h-0 flex-col">
          <div className="flex flex-wrap gap-2.5 border-b border-border/60 p-4 pb-3">
            {[
              [Zap, "Oferta relâmpago"],
              [Gift, "Recompensa"],
              [Briefcase, "Cartaz"],
              [Ticket, "Cupom"],
            ].map(([Icon, l]) => {
              const I = Icon as typeof Zap;
              return (
                <button
                  key={l as string}
                  type="button"
                  title={l as string}
                  className="relative flex h-10 w-[120px] items-center justify-center gap-1.5 rounded-md bg-muted px-3 text-[14px] font-semibold hover:bg-accent cursor-pointer"
                >
                  <span className="absolute right-2.5 top-1.5 size-2 rounded-full bg-red-500" />
                  <I size={15} className="shrink-0" fill="currentColor" />
                  <span className="truncate">{l as string}</span>
                </button>
              );
            })}
          </div>
          <div className="flex items-start justify-between px-4 pt-4">
            <span className="flex items-center gap-4">
              <span className="border-b-2 border-primary pb-2.5 text-[17px] font-semibold">Produto</span>
              <span className="mb-2.5 flex items-center border-l border-border pl-4">
                <RefreshCw size={15} className="text-muted-foreground" />
              </span>
            </span>
            <button type="button" onClick={() => setPickerOpen(true)} className="flex items-center gap-1 text-[15px] font-semibold text-primary cursor-pointer">
              <Plus size={15} /> Adicionar
            </button>
          </div>

          {products.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
              <svg viewBox="0 0 64 64" className="mb-2 size-16" aria-hidden="true">
                <circle cx="10" cy="8" r="2.5" className="fill-primary" />
                <circle cx="56" cy="10" r="2" className="fill-red-500" />
                <path d="M22 22v-4a10 10 0 0 1 20 0v4" fill="none" className="stroke-red-400" strokeWidth="3" strokeLinecap="round" />
                <path d="M12 24h40l-3 32H15z" className="fill-primary/70" />
                <circle cx="25" cy="36" r="2.6" className="fill-white" />
                <circle cx="39" cy="36" r="2.6" className="fill-white" />
              </svg>
              <p className="text-[17px] font-semibold">Ainda não há produtos</p>
              <p className="text-sm text-muted-foreground">Os produtos adicionados aparecerão aqui</p>
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="mt-4 h-10 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground cursor-pointer"
              >
                Adicionar produtos
              </button>
            </div>
          ) : (
            <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
              {products.map((p, i) => (
                <li key={p.id} className={cn("flex gap-2.5 rounded-lg border p-2", pinned === p.id ? "border-primary bg-primary/5" : "border-border/60")}>
                  <span className="w-4 pt-1 text-center text-xs text-muted-foreground">{i + 1}</span>
                  <img src={p.imageUrl} alt="" className="size-14 shrink-0 rounded-md object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-xs font-medium">{p.title}</p>
                    <p className="mt-1 font-mono text-xs tabular-nums">{formatBRL(p.priceCents)}</p>
                    <div className="mt-1 flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPinned(pinned === p.id ? null : p.id)}
                        className={cn(
                          "flex h-6 items-center gap-1 rounded-md px-2 text-[11px] font-semibold cursor-pointer",
                          pinned === p.id ? "bg-primary text-primary-foreground" : "border border-border",
                        )}
                      >
                        <Pin size={11} /> {pinned === p.id ? "Fixado" : "Fixar"}
                      </button>
                      <button
                        type="button"
                        aria-label="Remover"
                        onClick={() => {
                          setProductIds((ids) => ids.filter((x) => x !== p.id));
                          if (pinned === p.id) setPinned(null);
                        }}
                        className="grid h-6 w-6 place-items-center rounded-md border border-border text-muted-foreground cursor-pointer"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <p className="px-4 py-4 text-center text-xs text-muted-foreground">
            LIVE com produtos estarão disponíveis apenas para espectadores com 18 anos ou mais.
          </p>

        </section>

        {/* Coluna 2: prévia + chat */}
        <section className="flex min-h-0 flex-col">
          <div className="relative flex h-[280px] shrink-0 flex-col overflow-hidden bg-neutral-950">
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center gap-4">
                <Toggle label="Vídeo" on={videoOn} onChange={setVideoOn} />
                <Toggle label="Roteiro" on={scriptOn} onChange={setScriptOn} />
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={products.length === 0}
                  onClick={toggleLive}
                  className={cn(
                    "h-8 rounded-md px-4 text-xs font-semibold cursor-pointer disabled:cursor-not-allowed disabled:bg-[#9fdcd9] disabled:text-white",
                    onAir ? "bg-red-500 text-white" : "bg-primary text-primary-foreground",
                  )}
                >
                  {onAir ? "Encerrar prévia" : "Iniciar LIVE"}
                </button>
                <span className="grid size-8 place-items-center rounded-md bg-white text-neutral-900">
                  <ChevronDown size={14} />
                </span>
              </div>
            </div>

            <div className="relative mx-2 flex flex-1 items-center justify-center rounded-lg bg-neutral-800 text-center text-white/70">
              {videoOn && onAir && camStream ? (
                <video
                  autoPlay
                  muted
                  playsInline
                  ref={(v) => {
                    if (v && v.srcObject !== camStream) v.srcObject = camStream;
                  }}
                  className="absolute inset-0 size-full rounded-lg object-contain"
                />
              ) : videoOn && pinnedProduct && onAir ? (
                <img src={pinnedProduct.imageUrl} alt="" className="absolute inset-0 size-full object-contain opacity-80" />
              ) : (
                <div className="-mt-10 text-xs text-white/25">Sem feed de vídeo</div>
              )}
              {scriptOn && (
                <div className="absolute inset-x-4 bottom-4">
                  {editingScript ? (
                    <div className="rounded-lg bg-black/70 p-2">
                      <textarea
                        autoFocus
                        rows={3}
                        value={script}
                        onChange={(e) => setScript(e.target.value)}
                        placeholder="Escreva o roteiro que você quer ler durante a LIVE"
                        className="w-full resize-none bg-transparent text-sm text-white outline-none placeholder:text-white/40"
                      />
                      <button type="button" onClick={() => setEditingScript(false)} className="text-xs font-semibold text-primary cursor-pointer">
                        Salvar roteiro
                      </button>
                    </div>
                  ) : script ? (
                    <button type="button" onClick={() => setEditingScript(true)} className="w-full rounded-lg bg-black/60 p-2 text-left text-sm text-white cursor-pointer">
                      {script}
                    </button>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditingScript(true)}
                        className="flex items-center gap-2 rounded-md bg-white/15 px-4 py-2 text-sm font-semibold text-white cursor-pointer"
                      >
                        <Pencil size={14} /> Adicionar roteiro
                      </button>
                      <span className="text-xs">Adicione seu roteiro aqui para vê-lo na tela durante a LIVE</span>
                    </div>
                  )}
                </div>
              )}
              {onAir && (
                <span className="absolute left-3 top-1 rounded bg-red-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white">Prévia</span>
              )}
            </div>
            {camError && <p className="px-4 pt-1 text-[11px] text-amber-300/80">{camError}</p>}
            <p className="flex items-start gap-1.5 px-4 py-2 text-[11px] text-white/45">
              <Smartphone size={12} className="mt-0.5 shrink-0" />
              <span>
                Se você <span className="underline">iniciar uma LIVE com o celular</span>, será feita a sincronização com o Estúdio de LIVE.
              </span>
            </p>
          </div>

          <div className="flex min-h-[200px] flex-1 flex-col">
            <div className="flex items-center justify-between px-4 pt-3 pb-1">
              <span className="text-[15px] font-semibold">Chat</span>
              <span className="flex items-center gap-3 text-sm text-muted-foreground/70">
                <button type="button" onClick={() => setChatSize((z) => Math.min(z + 1, 18))} className="cursor-pointer">A+</button>
                <button type="button" onClick={() => setChatSize((z) => Math.max(z - 1, 12))} className="cursor-pointer">A−</button>
                <span className="h-4 w-px bg-border" />
                <Settings size={16} className="text-foreground/70" />
              </span>
            </div>
            <div className="flex gap-1.5 px-3 pt-2">
              {(
                [
                  ["todos", "Todos os comentários"],
                  ["produto", "Relacionados ao produto"],
                ] as const
              ).map(([v, l]) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setChatTab(v)}
                  className={cn("rounded-md px-2.5 py-1 text-xs font-semibold cursor-pointer", chatTab === v ? "bg-muted" : "text-muted-foreground")}
                >
                  {l}
                </button>
              ))}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2">
              {chatTab === "todos" && chat.length > 0 ? (
                <ul className="space-y-1.5" style={{ fontSize: chatSize }}>
                  {chat.map((m) => (
                    <li key={m.id}>
                      <span className="font-semibold text-primary">Você</span> {m.text}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">Os comentários dos espectadores aparecerão aqui durante sua LIVE.</p>
              )}
            </div>
            <form onSubmit={sendChat} className="p-3">
              <label className="flex h-10 items-center gap-2 rounded-md border border-border bg-muted/40 px-3">
                <textarea
                  data-tid="m4b_input_textarea"
                  rows={1}
                  value={chatInput}
                  maxLength={100}
                  disabled={!onAir}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendChat(e as unknown as React.FormEvent, e.currentTarget.value);
                    }
                  }}
                  placeholder="Digite algo..."
                  className="h-5 flex-1 resize-none bg-transparent text-sm outline-none disabled:cursor-not-allowed"
                />
                <span className="text-xs tabular-nums text-muted-foreground/70">{chatInput.length}/100</span>
                <button type="submit" aria-label="Enviar" className="text-muted-foreground/70 cursor-pointer">
                  <Send size={15} />
                </button>
              </label>
            </form>
          </div>
        </section>

        {/* Coluna 3: análise + atividade */}
        <section className="flex min-h-0 flex-col">
          <div className="border-b border-border/60 p-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Análise de transmissões ao vivo</h2>
              <a href="/estudio/desempenho" className="text-xs font-semibold text-primary">
                Painel de LIVE
              </a>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 xl:grid-cols-3">
              {METRICS.map((m) => (
                <div key={m} className="rounded-lg bg-muted/50 p-2.5">
                  <p className="truncate text-[11px] text-muted-foreground" title={m}>
                    {m}
                  </p>
                  <p className="mt-1 text-sm font-semibold">--</p>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-lg bg-muted/40 p-3">
              <button type="button" onClick={() => setSuggestOpen((o) => !o)} className="flex w-full items-center justify-between cursor-pointer">
                <span className="flex items-center gap-1.5 text-xs font-semibold">
                  <Sparkles size={13} className="text-primary" /> Sugestão <CircleHelp size={12} className="text-muted-foreground" />
                </span>
                {suggestOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {suggestOpen && <p className="mt-3 py-2 text-center text-xs text-muted-foreground">Receba sugestões em tempo real durante sua LIVE.</p>}
            </div>
          </div>

          <div className="flex min-h-[180px] flex-1 flex-col">
            <div className="flex h-44 shrink-0 flex-col px-4 pt-4">
              <h2 className="text-[15px] font-semibold">Atividade</h2>
              <p className="flex flex-1 items-center justify-center text-center text-sm text-muted-foreground">Os pedidos feitos durante a sua LIVE aparecerão aqui</p>
              <p className="pb-1 text-center text-xs text-muted-foreground/70">Arraste para redimensionar</p>
            </div>
            <span className="relative border-t border-border/60">
              <span className="absolute -top-px left-1/2 h-0.5 w-9 -translate-x-1/2 rounded bg-muted-foreground/40" />
            </span>
            <div className="flex flex-1 flex-col px-4 pt-3">
              <span className="inline-flex self-start items-center gap-1 rounded-md bg-muted px-2.5 py-1 text-xs font-semibold">
                Todas as atividades <ChevronDown size={12} />
              </span>
              <p className="flex flex-1 items-center justify-center text-center text-sm text-muted-foreground">As atividades dos espectadores aparecerão aqui durante sua LIVE.</p>
            </div>
          </div>
        </section>
      </div>

      {/* Adicionar produtos (catálogo do clone) */}
      {pickerOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => setPickerOpen(false)}>
          <div className="flex max-h-[85svh] w-full max-w-2xl flex-col rounded-2xl bg-card shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-border/60 p-4">
              <h2 className="font-semibold">Adicionar produtos</h2>
              <button type="button" aria-label="Fechar" onClick={() => setPickerOpen(false)} className="cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 p-4 pb-2">
              <label className="flex h-9 min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-border px-3">
                <Search size={14} className="text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Pesquisar ID ou nome do produto"
                  className="flex-1 bg-transparent text-sm outline-none"
                />
              </label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-9 rounded-lg border border-border bg-card px-2 text-sm cursor-pointer">
                <option value="todas">Todas as categorias</option>
                {Object.entries(CATEGORY_LABELS).map(([k, l]) => (
                  <option key={k} value={k}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <ul className="min-h-0 flex-1 divide-y divide-border/50 overflow-y-auto px-4">
              {results.map((p) => (
                <li key={p.id}>
                  <label className="flex cursor-pointer items-center gap-3 py-2.5">
                    <input
                      type="checkbox"
                      checked={selected.includes(p.id)}
                      onChange={(e) => setSelected((s) => (e.target.checked ? [...s, p.id] : s.filter((x) => x !== p.id)))}
                      className="size-4 accent-primary"
                    />
                    <img src={p.imageUrl} alt="" className="size-11 rounded-md object-cover" />
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-1 text-sm">{p.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {p.category} · {formatBRL(p.priceCents)} · {p.commissionPct}% de comissão
                      </span>
                    </span>
                  </label>
                </li>
              ))}
              {results.length === 0 && <li className="py-8 text-center text-sm text-muted-foreground">Nenhum produto encontrado.</li>}
            </ul>
            <div className="flex items-center justify-between border-t border-border/60 p-4">
              <span className="text-sm text-muted-foreground">{selected.length} selecionado(s)</span>
              <button
                type="button"
                disabled={selected.length === 0}
                onClick={addSelected}
                className="h-9 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-40 cursor-pointer"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
