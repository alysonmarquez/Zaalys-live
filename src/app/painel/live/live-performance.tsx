"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, ExternalLink, RotateCcw } from "lucide-react";
import { formatBRL } from "@/lib/zaalys-data";
import { PACE_LABELS, loadLiveSim, resetLiveOrders, saveLiveSim, useLiveOrders, type LiveSimConfig } from "@/lib/estudio-live-sim";

const INPUT =
  "h-10 w-full rounded-xl border border-black/[0.06] bg-background/50 px-3 text-sm tabular-nums outline-none focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring/40 dark:border-white/[0.08] dark:bg-input/20";

// "Editar desempenho da LIVE": controla a LIVE simulada do Estúdio (pedidos caindo no Painel de LIVE,
// no Console e no Desempenho).
export function LivePerformance() {
  const [cfg, setCfg] = useState<LiveSimConfig | null>(null);
  const [saved, setSaved] = useState(false);
  const orders = useLiveOrders();
  useEffect(() => setCfg(loadLiveSim()), []);
  if (!cfg) return null;

  const num = (k: "viewers" | "baseGmv" | "baseItems" | "baseViews", v: string) => {
    const n = Number(v.replace(",", "."));
    setCfg({ ...cfg, [k]: Number.isFinite(n) && n >= 0 ? n : 0 });
  };

  return (
    <section className="rounded-3xl border border-black/[0.06] bg-card/85 p-5 sm:p-6 dark:border-white/[0.08]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-bold">Desempenho da LIVE no Estúdio</h3>
          <p className="mt-1 max-w-xl text-xs text-muted-foreground">
            Com os pedidos ligados, as vendas caem em tempo real no Painel de LIVE, no Console e no Desempenho do Estúdio enquanto ele
            estiver aberto. Os valores iniciais entram na LIVE de hoje.
          </p>
        </div>
        <Link
          href="/estudio/painel-de-live"
          target="_blank"
          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-background px-3 text-xs font-semibold hover:bg-muted"
        >
          Abrir Painel de LIVE <ExternalLink size={13} />
        </Link>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Hoje: <span className="font-semibold text-foreground">{orders.length}</span> pedidos caíram ·{" "}
        <span className="font-semibold text-foreground">{formatBRL(orders.reduce((a, o) => a + o.amountCents, 0))}</span>
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1">
          <span className="text-xs font-medium text-muted-foreground">Pedidos caindo na LIVE</span>
          <select value={cfg.enabled ? "on" : "off"} onChange={(e) => setCfg({ ...cfg, enabled: e.target.value === "on" })} className={`${INPUT} cursor-pointer`}>
            <option value="on">Ligado</option>
            <option value="off">Desligado</option>
          </select>
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-medium text-muted-foreground">Ritmo dos pedidos</span>
          <select value={cfg.pace} onChange={(e) => setCfg({ ...cfg, pace: e.target.value as LiveSimConfig["pace"] })} className={`${INPUT} cursor-pointer`}>
            {PACE_LABELS.map((p) => (
              <option key={p.v} value={p.v}>
                {p.l}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1 sm:col-span-2">
          <span className="text-xs font-medium text-muted-foreground">Título da LIVE</span>
          <input value={cfg.title} onChange={(e) => setCfg({ ...cfg, title: e.target.value })} className={INPUT} />
        </label>
        {(
          [
            ["viewers", "Espectadores simultâneos"],
            ["baseGmv", "GMV inicial da LIVE (R$)"],
            ["baseItems", "Itens vendidos iniciais"],
            ["baseViews", "Visualizações iniciais"],
          ] as const
        ).map(([k, l]) => (
          <label key={k} className="block space-y-1">
            <span className="text-xs font-medium text-muted-foreground">{l}</span>
            <input inputMode="decimal" value={String(cfg[k])} onChange={(e) => num(k, e.target.value)} className={INPUT} />
          </label>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            saveLiveSim(cfg);
            setSaved(true);
            setTimeout(() => setSaved(false), 1800);
          }}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-xs cursor-pointer"
        >
          {saved && <Check size={14} />}
          {saved ? "Salvo" : "Salvar desempenho"}
        </button>
        <button
          type="button"
          onClick={resetLiveOrders}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-border bg-background px-4 text-xs font-semibold hover:bg-muted cursor-pointer"
        >
          <RotateCcw size={14} /> Recomeçar LIVE de hoje
        </button>
      </div>
    </section>
  );
}
