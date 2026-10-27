"use client";

import { LazyVideo } from "@/components/lazy-video";
import React, { useState } from "react";
import { RaisedButton, Segmented, cn } from "@/components/brand";
import { ZAALYS_PRODUCTS, ZAALYS_TEMPLATES, formatBRL } from "@/lib/zaalys-data";
import { LiveAssistant } from "./live-assistant";

const DEFAULT_AUTO_COMMENTS = [
  "O link com cupom tá fixado na sacola laranja aqui embaixo 👇",
  "Envio rápido direto do Brasil com garantia do TikTok Shop!",
  "Qualquer dúvida sobre tamanho ou voltagem, manda aqui no chat!",
  "Últimas unidades do lote promocional na sacolinha #1 🔥",
];

export function LiveTools() {
  const [mode, setMode] = useState<"infinite" | "presenter">("infinite");
  const [selectedProdId, setSelectedProdId] = useState<number>(ZAALYS_PRODUCTS[0]!.id);
  const [comments, setComments] = useState<string[]>(DEFAULT_AUTO_COMMENTS);
  const [newComment, setNewComment] = useState("");
  const [voiceActive, setVoiceActive] = useState(true);
  const [chatAutoReply, setChatAutoReply] = useState(true);
  const [pinProduct, setPinProduct] = useState(true);
  const [rhythm, setRhythm] = useState<"calm" | "normal" | "intense">("normal");
  const [obsOpen, setObsOpen] = useState(false);
  const [liveRunning, setLiveRunning] = useState(false);

  const product = ZAALYS_PRODUCTS.find((p) => p.id === selectedProdId) ?? ZAALYS_PRODUCTS[0]!;

  function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newComment.trim();
    if (!trimmed || trimmed.length > 100) return;
    setComments((prev) => [...prev, trimmed]);
    setNewComment("");
  }

  function handleRemoveComment(idx: number) {
    setComments((prev) => prev.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Assistente de Live
          </h1>
          <p className="mt-1.5 max-w-2xl text-muted-foreground">
            {mode === "infinite"
              ? "A live infinita roda sozinha: vídeos do produto, narração, comentários e produto fixado."
              : "Gere o roteiro de vendas ao vivo e abra o teleprompter em tela cheia."}
          </p>
        </div>

        <Segmented
          label="Modo da live"
          value={mode}
          onChange={setMode}
          options={[
            { value: "infinite", label: "Live Infinita" },
            { value: "presenter", label: "Eu Apresento" },
          ]}
        />
      </header>

      {mode === "presenter" ? (
        <LiveAssistant saved={[]} />
      ) : (
        <div className="space-y-6">
          {/* MediaFlowMZ Live Extension Bar */}
          <section className="apple-card p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/15 text-primary">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
                  </svg>
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-lg font-bold">MediaFlowMZ Live · Extensão Oficial</h2>
                    <span className="rounded-full bg-primary/15 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-primary">
                      v3.17.0
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Roda no Chrome no computador ou no celular (iPhone/iPad via Orion Browser e
                    Android via Quetta Browser).
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <a
                  href="/downloads/mediaflowmz-live.zip"
                  download
                  className="btn-ghost py-2 text-xs"
                >
                  ⬇ Baixar extensão (.zip)
                </a>
                <a
                  href="/downloads/mediaflowmz-live.crx"
                  download
                  className="btn-primary py-2 text-xs"
                >
                  ⬇ Baixar mediaflowmz-live.crx
                </a>
              </div>
            </div>

            {/* Mobile Browsers Compatibility Row */}
            <div className="mt-5 grid gap-3 border-t border-border/70 pt-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-background/50 p-3">
                <img
                  src="/media/browsers/orion.webp"
                  alt="Orion Browser"
                  className="size-10 shrink-0 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1 text-xs">
                  <p className="font-semibold text-foreground">iPhone & iPad · Orion Browser</p>
                  <p className="text-muted-foreground">
                    Suporte nativo a extensões do Chrome com modo de compatibilidade.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-background/50 p-3">
                <img
                  src="/media/browsers/quetta.webp"
                  alt="Quetta Browser"
                  className="size-10 shrink-0 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1 text-xs">
                  <p className="font-semibold text-foreground">Android · Quetta Browser</p>
                  <p className="text-muted-foreground">
                    Instale o pacote .crx/.zip e abra mediaflowmz.com/ferramentas/live.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Clipes desta saída & Voz e chat na saída */}
          <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
            <section className="apple-card space-y-4 p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-display text-lg font-bold">Clipes desta saída</h3>
                  <p className="text-xs text-muted-foreground">
                    Os vídeos rodam em loop embaralhado (ClipShuffler) sem repetição seguida.
                  </p>
                </div>
                <RaisedButton
                  size="sm"
                  onClick={() => setLiveRunning((r) => !r)}
                  className={cn(liveRunning && "bg-destructive text-white")}
                >
                  {liveRunning ? "■ Parar transmissão demo" : "▶ Iniciar saída da live"}
                </RaisedButton>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Produto fixado na sacola #1
                </label>
                <select
                  value={selectedProdId}
                  onChange={(e) => setSelectedProdId(Number(e.target.value))}
                  className="field text-sm"
                >
                  {ZAALYS_PRODUCTS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({formatBRL(p.priceCents)} · {p.commissionPct}%)
                    </option>
                  ))}
                </select>
              </div>

              {/* Video Loop Preview */}
              <div className="grid grid-cols-4 gap-2">
                {ZAALYS_TEMPLATES.map((tpl, i) => (
                  <div
                    key={tpl.id}
                    className={cn(
                      "relative aspect-[9/16] overflow-hidden rounded-2xl border bg-black",
                      i === 0 ? "border-primary ring-2 ring-primary/40" : "border-white/10",
                    )}
                  >
                    <LazyVideo
                      src={tpl.videoLite}
                      poster={tpl.poster}
                      className="size-full object-cover"
                    />
                    <span className="absolute left-1.5 top-1.5 rounded-md bg-black/65 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-white">
                      Clipe #{i + 1}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Voz e chat na saída */}
            <section className="apple-card space-y-4 p-5 sm:p-6">
              <div>
                <h3 className="font-display text-lg font-bold">Voz e chat na saída</h3>
                <p className="text-xs text-muted-foreground">
                  Narração por IA e respostas automáticas para segurar audiência e conversão.
                </p>
              </div>

              <div className="space-y-2.5 text-sm">
                <label className="flex items-center justify-between rounded-2xl border border-border bg-background/50 p-3.5 cursor-pointer">
                  <div>
                    <p className="font-semibold">Narração contínua por IA</p>
                    <p className="text-xs text-muted-foreground">
                      Alterna benefícios, prova social e chamada para a sacola.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={voiceActive}
                    onChange={(e) => setVoiceActive(e.target.checked)}
                    className="size-4 accent-primary"
                  />
                </label>

                <label className="flex items-center justify-between rounded-2xl border border-border bg-background/50 p-3.5 cursor-pointer">
                  <div>
                    <p className="font-semibold">Responder perguntas do chat por voz</p>
                    <p className="text-xs text-muted-foreground">
                      Lê dúvidas sobre preço, frete, voltagem e garantia em tempo real.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={chatAutoReply}
                    onChange={(e) => setChatAutoReply(e.target.checked)}
                    className="size-4 accent-primary"
                  />
                </label>

                <label className="flex items-center justify-between rounded-2xl border border-border bg-background/50 p-3.5 cursor-pointer">
                  <div>
                    <p className="font-semibold">Fixar produto automaticamente</p>
                    <p className="text-xs text-muted-foreground">
                      Renova o destaque do item #1 na tela a cada 45 segundos.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={pinProduct}
                    onChange={(e) => setPinProduct(e.target.checked)}
                    className="size-4 accent-primary"
                  />
                </label>
              </div>

              <div>
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Ritmo de comentários no chat
                </span>
                <Segmented
                  label="Ritmo de comentários"
                  size="sm"
                  value={rhythm}
                  onChange={setRhythm}
                  options={[
                    { value: "calm", label: "Calmo (3–5 min)" },
                    { value: "normal", label: "Normal (1–2 min)" },
                    { value: "intense", label: "Intenso (30–60s)" },
                  ]}
                />
              </div>

              {liveRunning && (
                <div className="zd zd-live rounded-2xl border border-primary/30 bg-primary/[0.06] p-3.5">
                  <div className="zd-eyebrow">
                    <span className="zd-dot" />
                    <span>No ar · {product.title.slice(0, 34)}…</span>
                  </div>
                  <div className="mt-2 space-y-1 text-xs">
                    <p className="zd-msg">
                      <span className="zd-dim">@mari.c:</span>{" "}
                      <span>funciona em 220v?</span>
                    </p>
                    <p className="zd-msg">
                      <span className="zd-acc font-semibold">Voz IA:</span>{" "}
                      <span>É bivolt automático! Pode ligar no 110v ou 220v direto.</span>
                    </p>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Comentários automáticos (Exact 14vn4n-oycf8e.js component) */}
          <section className="apple-card space-y-3 p-5 sm:p-6">
            <div>
              <h3 className="font-semibold">Comentários automáticos</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                A extensão posta um por vez, em ordem aleatória, no ritmo escolhido no painel
                (Normal, o padrão: a cada 1 a 2 min). Até 100 caracteres cada.
              </p>
            </div>

            <ul className="flex flex-wrap gap-2">
              {comments.map((c, idx) => (
                <li
                  key={`${c}-${idx}`}
                  className="flex max-w-full items-center gap-1 rounded-full border border-border/70 bg-background/60 py-1 pl-3 pr-1 text-sm"
                >
                  <span className="truncate">{c}</span>
                  <button
                    type="button"
                    aria-label={`Remover "${c}"`}
                    onClick={() => handleRemoveComment(idx)}
                    className="grid size-6 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>

            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                value={newComment}
                maxLength={100}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Adicionar comentário"
                aria-label="Novo comentário automático"
                className="min-h-10 min-w-0 flex-1 rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="btn-ghost py-2 text-xs disabled:opacity-50"
              >
                + Adicionar
              </button>
            </form>
            <p className="text-right text-xs tabular-nums text-muted-foreground">
              {newComment.length}/100
            </p>
          </section>

          {/* OBS Fallback Accordion (Exact 14vn4n-oycf8e.js section) */}
          <section className="apple-card overflow-hidden">
            <button
              type="button"
              onClick={() => setObsOpen((o) => !o)}
              className="flex w-full items-center justify-between gap-3 p-5 text-left cursor-pointer"
            >
              <div>
                <h3 className="font-semibold">Primeiro, o OBS (Opcional)</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Só se o seu computador não transmite pelo navegador. Por esse caminho a extensão
                  não comenta, não fixa o produto e não bloqueia ninguém.
                </p>
              </div>
              <span className={cn("text-muted-foreground transition-transform", obsOpen && "rotate-180")}>
                ▼
              </span>
            </button>
            {obsOpen && (
              <div className="border-t border-border px-5 pb-5 pt-4 text-xs text-muted-foreground space-y-2">
                <p>
                  1. Baixe o OBS Studio na página oficial (obsproject.com) ou via Flatpak no Linux.
                </p>
                <p>
                  2. Adicione uma fonte de <strong>Navegador (Browser Source)</strong> em 1080x1920
                  (9:16) com a URL da sua saída MediaFlowMZ Live.
                </p>
                <p>
                  3. Cole a chave de transmissão do TikTok Live Studio e inicie a transmissão.
                </p>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
