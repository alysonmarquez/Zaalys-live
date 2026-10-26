"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Check, ExternalLink, RotateCcw } from "lucide-react";
import { todayTotals } from "@/lib/estudio-lives";
import {
  LIVE_ORDER_EVENT,
  LIVE_SIM_CONFIG_EVENT,
  PACE_LABELS,
  loadLiveSim,
  resetLiveOrders,
  saveLiveSim,
  type LiveSimConfig,
} from "@/lib/estudio-live-sim";

const INPUT =
  "h-10 w-full rounded-xl border border-black/[0.06] bg-background/50 px-3 text-sm tabular-nums outline-none focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring/40 dark:border-white/[0.08] dark:bg-input/20";

// Números que aparecem no Painel de LIVE, no Console e no Desempenho do Estúdio.
type NumKey = "gmv" | "orders" | "items" | "views" | "clicks" | "viewers" | "avgWatch";
const NUM_FIELDS: { k: NumKey; l: string; hint?: string }[] = [
  { k: "gmv", l: "GMV da LIVE (R$)" },
  { k: "orders", l: "Pedidos" },
  { k: "items", l: "Itens vendidos" },
  { k: "views", l: "Visualizações" },
  { k: "clicks", l: "Cliques no produto" },
  { k: "viewers", l: "Espectadores atuais", hint: "Varia 15% para cima ou para baixo na tela" },
  { k: "avgWatch", l: "Duração média (segundos)", hint: "Vazio = automática" },
];

type Nums = Record<NumKey, string>;

const fmt = (n: number, decimals = 0) => n.toLocaleString("pt-BR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals, useGrouping: false });
// Aceita "1.500,50", "1500,50" e "1500.50".
const parse = (v: string) => {
  const t = v.trim();
  const n = Number(t.includes(",") ? t.replace(/\./g, "").replace(",", ".") : /\.\d{1,2}$/.test(t) ? t : t.replace(/\./g, ""));
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

function currentNums(cfg: LiveSimConfig): Nums {
  const t = todayTotals();
  return {
    gmv: fmt(t.gmvCents / 100, 2),
    orders: fmt(t.orders),
    items: fmt(t.items),
    views: fmt(t.views),
    clicks: fmt(t.clicks),
    viewers: fmt(cfg.viewers),
    avgWatch: cfg.avgWatchSec ? fmt(cfg.avgWatchSec) : "",
  };
}

// "Editar desempenho da LIVE": os números da LIVE de hoje e o ritmo dos pedidos que caem.
export function LivePerformance() {
  const [cfg, setCfg] = useState<LiveSimConfig | null>(null);
  const [nums, setNums] = useState<Nums | null>(null);
  const [saved, setSaved] = useState(false);
  // Enquanto você edita, os campos não são sobrescritos pelos pedidos que caem.
  const dirty = useRef(false);

  useEffect(() => {
    const load = () => {
      const c = loadLiveSim();
      setCfg((prev) => (dirty.current && prev ? prev : c));
      if (!dirty.current) setNums(currentNums(c));
    };
    load();
    const t = setInterval(load, 5000);
    window.addEventListener(LIVE_ORDER_EVENT, load);
    window.addEventListener(LIVE_SIM_CONFIG_EVENT, load);
    return () => {
      clearInterval(t);
      window.removeEventListener(LIVE_ORDER_EVENT, load);
      window.removeEventListener(LIVE_SIM_CONFIG_EVENT, load);
    };
  }, []);
  if (!cfg || !nums) return null;

  const edit = (k: NumKey, v: string) => {
    dirty.current = true;
    setNums({ ...nums, [k]: v });
  };
  const editCfg = (c: LiveSimConfig) => {
    dirty.current = true;
    setCfg(c);
  };

  function save() {
    if (!cfg || !nums) return;
    // Grava a diferença entre o número digitado e o atual: a tela passa a mostrar o digitado e segue subindo dele.
    const now = todayTotals();
    const next: LiveSimConfig = {
      ...cfg,
      baseGmv: cfg.baseGmv + (parse(nums.gmv) * 100 - now.gmvCents) / 100,
      baseOrders: cfg.baseOrders + Math.round(parse(nums.orders) - now.orders),
      baseItems: cfg.baseItems + Math.round(parse(nums.items) - now.items),
      baseViews: cfg.baseViews + Math.round(parse(nums.views) - now.views),
      baseClicks: cfg.baseClicks + Math.round(parse(nums.clicks) - now.clicks),
      viewers: Math.round(parse(nums.viewers)),
      avgWatchSec: Math.round(parse(nums.avgWatch)),
    };
    dirty.current = false;
    saveLiveSim(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  const views = parse(nums.views);
  const clicks = parse(nums.clicks);
  const orders = parse(nums.orders);
  const pct = (a: number, b: number) => `${(b > 0 ? (a / b) * 100 : 0).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`;

  return (
    <section className="rounded-3xl border border-black/[0.06] bg-card/85 p-5 sm:p-6 dark:border-white/[0.08]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-bold">Desempenho da LIVE no Estúdio</h3>
          <p className="mt-1 max-w-xl text-xs text-muted-foreground">
            Estes são os números da LIVE de hoje agora. Altere e salve: o Painel de LIVE, o Console e o Desempenho passam a mostrar
            exatamente o que você digitou, e os pedidos que caem seguem somando a partir daí.
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

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {NUM_FIELDS.map((f) => (
          <label key={f.k} className="block space-y-1">
            <span className="text-xs font-medium text-muted-foreground">{f.l}</span>
            <input
              inputMode="decimal"
              value={nums[f.k]}
              placeholder={f.k === "avgWatch" ? "Automática" : undefined}
              onChange={(e) => edit(f.k, e.target.value)}
              className={INPUT}
            />
            {f.hint && <span className="block text-[11px] text-muted-foreground/80">{f.hint}</span>}
          </label>
        ))}
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Calculados: CTR <span className="font-semibold text-foreground">{pct(clicks, views)}</span> · Taxa de conversão{" "}
        <span className="font-semibold text-foreground">{pct(orders, clicks)}</span> · Clientes{" "}
        <span className="font-semibold text-foreground">{Math.round(orders * 0.94).toLocaleString("pt-BR")}</span>
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1">
          <span className="text-xs font-medium text-muted-foreground">Pedidos caindo na LIVE</span>
          <select value={cfg.enabled ? "on" : "off"} onChange={(e) => editCfg({ ...cfg, enabled: e.target.value === "on" })} className={`${INPUT} cursor-pointer`}>
            <option value="on">Ligado</option>
            <option value="off">Desligado</option>
          </select>
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-medium text-muted-foreground">Ritmo dos pedidos</span>
          <select value={cfg.pace} onChange={(e) => editCfg({ ...cfg, pace: e.target.value as LiveSimConfig["pace"] })} className={`${INPUT} cursor-pointer`}>
            {PACE_LABELS.map((p) => (
              <option key={p.v} value={p.v}>
                {p.l}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1 sm:col-span-2">
          <span className="text-xs font-medium text-muted-foreground">Título da LIVE</span>
          <input value={cfg.title} onChange={(e) => editCfg({ ...cfg, title: e.target.value })} className={INPUT} />
        </label>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={save}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-xs cursor-pointer"
        >
          {saved && <Check size={14} />}
          {saved ? "Salvo" : "Salvar desempenho"}
        </button>
        <button
          type="button"
          onClick={() => {
            dirty.current = false;
            resetLiveOrders();
          }}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-border bg-background px-4 text-xs font-semibold hover:bg-muted cursor-pointer"
        >
          <RotateCcw size={14} /> Recomeçar LIVE de hoje
        </button>
      </div>
    </section>
  );
}
