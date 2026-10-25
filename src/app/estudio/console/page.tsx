"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  Gift,
  Maximize2,
  Pencil,
  Pin,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShoppingBag,
  Sparkles,
  Tag,
  Ticket,
  Trash2,
  TriangleAlert,
  Video,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/components/brand";
import { CATALOGO_ORIGINAL, CATEGORY_LABELS } from "@/lib/catalogo-original";
import { formatBRL } from "@/lib/zaalys-data";

const PANEL = "rounded-xl border border-border/60 bg-card";

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
  const [tip, setTip] = useState(true);

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

  function sendChat(e: React.FormEvent) {
    e.preventDefault();
    const text = chatInput.trim();
    if (!text) return;
    setChat((c) => [...c, { id: Date.now(), text }]);
    setChatInput("");
  }

  return (
    <div className="flex h-[calc(100svh-5.5rem)] min-h-[620px] flex-col gap-3">
      {/* Barra do console */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">Console de LIVE</h1>
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
          </div>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <button type="button" className="h-8 rounded-full border border-border px-3 text-xs font-semibold text-foreground">
            Alternar modo
          </button>
          <Maximize2 size={17} />
          <Settings size={17} />
          <TriangleAlert size={17} />
        </div>
      </div>

      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[minmax(260px,1fr)_minmax(300px,1.1fr)_minmax(280px,1fr)]">
        {/* Coluna 1: produtos */}
        <section className={cn(PANEL, "relative flex min-h-0 flex-col")}>
          <div className="grid grid-cols-4 gap-1.5 border-b border-border/60 p-3">
            {[
              [Zap, "Oferta relâmpago"],
              [Gift, "Recompensa"],
              [Tag, "Cartaz"],
              [Ticket, "Cupom"],
            ].map(([Icon, l]) => {
              const I = Icon as typeof Zap;
              return (
                <button
                  key={l as string}
                  type="button"
                  title={l as string}
                  className="flex h-9 items-center justify-center gap-1 truncate rounded-lg border border-border/70 px-1.5 text-[11px] font-semibold hover:bg-muted cursor-pointer"
                >
                  <I size={13} className="shrink-0" />
                  <span className="truncate">{l as string}</span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-between px-3 pt-3">
            <span className="flex items-center gap-2 border-b-2 border-primary pb-1.5 text-sm font-semibold">
              Produto <RefreshCw size={13} className="text-muted-foreground" />
            </span>
            <button type="button" onClick={() => setPickerOpen(true)} className="flex items-center gap-1 text-sm font-semibold text-primary cursor-pointer">
              <Plus size={15} /> Adicionar
            </button>
          </div>

          {products.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
              <ShoppingBag size={40} className="text-primary" />
              <p className="font-semibold">Ainda não há produtos</p>
              <p className="text-xs text-muted-foreground">Os produtos adicionados aparecerão aqui</p>
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="mt-2 h-9 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground cursor-pointer"
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

          <p className="border-t border-border/60 px-3 py-2 text-center text-[11px] text-muted-foreground">
            LIVE com produtos estarão disponíveis apenas para espectadores com 18 anos ou mais.
          </p>

          {tip && (
            <div className="absolute left-3 right-3 top-14 z-10 rounded-xl bg-primary p-4 text-primary-foreground shadow-lg">
              <p className="font-semibold">Gerencie diferentes transmissões ao vivo em um só lugar</p>
              <p className="mt-1.5 text-sm opacity-90">
                Alterne entre eventos agendados e transmissões ao vivo rápidas diretamente no console de LIVE.
              </p>
              <button
                type="button"
                onClick={() => setTip(false)}
                className="mt-3 h-8 rounded-lg border border-current px-4 text-xs font-semibold cursor-pointer"
              >
                Entendi
              </button>
            </div>
          )}
        </section>

        {/* Coluna 2: prévia + chat */}
        <section className="flex min-h-0 flex-col gap-3">
          <div className="relative flex aspect-[4/3] min-h-[220px] flex-col overflow-hidden rounded-xl bg-neutral-900 lg:aspect-auto lg:flex-[1.2]">
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center gap-4">
                <Toggle label="Vídeo" on={videoOn} onChange={setVideoOn} />
                <Toggle label="Roteiro" on={scriptOn} onChange={setScriptOn} />
              </div>
              <button
                type="button"
                disabled={products.length === 0}
                onClick={() => setOnAir((v) => !v)}
                className={cn(
                  "h-8 rounded-md px-4 text-xs font-semibold cursor-pointer disabled:cursor-not-allowed disabled:opacity-40",
                  onAir ? "bg-red-500 text-white" : "bg-primary text-primary-foreground",
                )}
              >
                {onAir ? "Encerrar prévia" : "Iniciar LIVE"}
              </button>
            </div>

            <div className="relative flex flex-1 items-center justify-center text-center text-white/70">
              {videoOn && pinnedProduct && onAir ? (
                <img src={pinnedProduct.imageUrl} alt="" className="absolute inset-0 size-full object-contain opacity-80" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-sm">
                  <Video size={28} />
                  Sem feed de vídeo
                </div>
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
          </div>

          <div className={cn(PANEL, "flex min-h-[200px] flex-1 flex-col")}>
            <div className="flex items-center justify-between border-b border-border/60 px-3 py-2">
              <span className="text-sm font-semibold">Chat</span>
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
                <ul className="space-y-1.5 text-sm">
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
            <form onSubmit={sendChat} className="flex items-center gap-2 border-t border-border/60 p-2">
              <input
                value={chatInput}
                maxLength={100}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Digite algo..."
                className="h-9 flex-1 rounded-lg bg-muted/60 px-3 text-sm outline-none"
              />
              <span className="text-xs tabular-nums text-muted-foreground">{chatInput.length}/100</span>
            </form>
          </div>
        </section>

        {/* Coluna 3: análise + atividade */}
        <section className="flex min-h-0 flex-col gap-3">
          <div className={cn(PANEL, "p-3")}>
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
              <p className="flex items-center gap-1.5 text-xs font-semibold">
                <Sparkles size={13} className="text-primary" /> Sugestão
              </p>
              <p className="mt-2 text-center text-xs text-muted-foreground">Receba sugestões em tempo real durante sua LIVE.</p>
            </div>
          </div>

          <div className={cn(PANEL, "flex min-h-[180px] flex-1 flex-col p-3")}>
            <h2 className="text-sm font-semibold">Atividade</h2>
            <p className="flex-1 py-6 text-center text-sm text-muted-foreground">Os pedidos feitos durante a sua LIVE aparecerão aqui</p>
            <div className="border-t border-border/60 pt-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2.5 py-1 text-xs font-semibold">
                Todas as atividades <ChevronDown size={12} />
              </span>
              <p className="py-6 text-center text-sm text-muted-foreground">As atividades dos espectadores aparecerão aqui durante sua LIVE.</p>
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
