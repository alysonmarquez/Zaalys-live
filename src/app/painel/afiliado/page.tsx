"use client";

import React, { useEffect, useState } from "react";
import { Check, RotateCcw, Zap } from "lucide-react";
import { cn } from "@/components/brand";
import { AfiliadosAdmin } from "@/components/afiliados-admin";
import { useAdmin, useShowcase } from "@/lib/showcase";
import {
  FIRE_SALE_EVENT,
  METRIC_FIELDS,
  PERIOD_LABELS,
  loadLiveSales,
  loadMetrics,
  resetMetrics,
  saveLiveSales,
  saveMetrics,
  type BaseMetrics,
  type LiveSalesConfig,
  type PeriodKey,
} from "@/lib/demo-config";

const INPUT_CLASS =
  "h-10 w-full rounded-xl border border-black/[0.06] bg-background/50 px-3 text-sm tabular-nums outline-none transition-[border-color,box-shadow] focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring/40 dark:border-white/[0.08] dark:bg-input/20";

const CARD = "rounded-3xl border border-black/[0.06] bg-card/85 p-5 shadow-2xs sm:p-6 dark:border-white/[0.08]";

type Tab = "metricas" | "vendas" | "afiliados";
// Métricas e Vendas ao Vivo: conta de demonstração. Afiliados (aprovar e comissão): quem está em ADMIN_EMAILS.
const TABS: { v: Tab; l: string; showcase?: boolean; admin?: boolean }[] = [
  { v: "metricas", l: "Métricas", showcase: true },
  { v: "vendas", l: "Vendas ao Vivo", showcase: true },
  { v: "afiliados", l: "Afiliados", admin: true },
];

export default function AfiliadoPage() {
  const showcase = useShowcase();
  const admin = useAdmin();
  const tabs = TABS.filter((t) => (t.showcase && showcase) || (t.admin && admin));
  const [tab, setTab] = useState<Tab>(tabs[0]?.v ?? "metricas");
  // ?aba=afiliados abre direto a lista de afiliados.
  useEffect(() => {
    const aba = new URLSearchParams(window.location.search).get("aba");
    if (aba && tabs.some((t) => t.v === aba)) setTab(aba as Tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <header>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Painel do Afiliado</h1>
        <p className="mt-1 text-muted-foreground">
          {showcase
            ? "Configure os números e as vendas ao vivo do seu dashboard" + (admin ? ", aprove afiliados e defina comissões" : "")
            : "Aprove afiliados e defina a comissão de cada um"}
        </p>
      </header>

      <div className="flex w-fit gap-1 rounded-full bg-muted/40 p-1">
        {tabs.map((t) => (
          <button
            key={t.v}
            type="button"
            onClick={() => setTab(t.v)}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-semibold transition-colors cursor-pointer",
              tab === t.v ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.l}
          </button>
        ))}
      </div>

      {tab === "afiliados" ? <AfiliadosAdmin /> : tab === "metricas" ? <MetricasTab /> : <VendasTab />}
    </div>
  );
}

function MetricasTab() {
  const [all, setAll] = useState<Record<PeriodKey, BaseMetrics> | null>(null);
  const [saved, setSaved] = useState<PeriodKey | null>(null);

  useEffect(() => setAll(loadMetrics()), []);
  if (!all) return null;

  function update(p: PeriodKey, k: keyof BaseMetrics, v: string) {
    const n = Number(v.replace(",", "."));
    setAll((prev) => (prev ? { ...prev, [p]: { ...prev[p], [k]: Number.isFinite(n) && n >= 0 ? n : 0 } } : prev));
  }

  function save(p: PeriodKey) {
    if (!all) return;
    const current = loadMetrics();
    saveMetrics({ ...current, [p]: all[p] });
    setSaved(p);
    setTimeout(() => setSaved(null), 1800);
  }

  return (
    <section className={CARD}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="max-w-2xl text-sm text-muted-foreground">
          Valores-base por período, usados só com as vendas ao vivo desligadas: ligadas, o dashboard segue o dia
          simulado. O dashboard soma estes números às vendas ao vivo. O ticket médio informado é o piso: o painel
          mostra o maior entre ele e o calculado, então sobe e nunca desce.
        </p>
        <button
          type="button"
          onClick={() => {
            resetMetrics();
            setAll(loadMetrics());
          }}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-background px-3 text-xs font-semibold hover:bg-muted cursor-pointer"
        >
          <RotateCcw size={14} /> Resetar
        </button>
      </div>

      <div className="mt-5 space-y-6">
        {PERIOD_LABELS.map((p) => (
          <div key={p.v} className="rounded-2xl border border-border/60 p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-display text-base font-bold">{p.l}</h3>
              <button
                type="button"
                onClick={() => save(p.v)}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-xs cursor-pointer"
              >
                {saved === p.v ? <Check size={14} /> : null}
                {saved === p.v ? "Salvo" : "Salvar"}
              </button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {METRIC_FIELDS.map((f) => (
                <label key={f.k} className="block space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">{f.l}</span>
                  <input
                    inputMode="decimal"
                    value={String(all[p.v][f.k])}
                    onChange={(e) => update(p.v, f.k, e.target.value)}
                    className={INPUT_CLASS}
                  />
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function VendasTab() {
  const [cfg, setCfg] = useState<LiveSalesConfig | null>(null);
  const [saved, setSaved] = useState(false);
  const [fired, setFired] = useState(false);

  useEffect(() => setCfg(loadLiveSales()), []);
  if (!cfg) return null;

  return (
    <section className={CARD}>
      <p className="max-w-2xl text-sm text-muted-foreground">
        Controla o motor de &quot;Vendas ao Vivo&quot; — os pop-ups e o incremento em tempo real do dashboard. Quando
        ligado, as vendas aparecem em sequência enquanto o painel estiver aberto. Cada pop-up é uma venda que entra no
        dashboard, com título, preço e comissão de produtos do catálogo.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Modo de disparo</span>
          <select
            value={cfg.enabled ? "on" : "off"}
            onChange={(e) => setCfg({ ...cfg, enabled: e.target.value === "on" })}
            className={`${INPUT_CLASS} h-11 cursor-pointer`}
          >
            <option value="off">Desligado</option>
            <option value="on">Ligado</option>
          </select>
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Fonte dos produtos</span>
          <select value={cfg.source} onChange={() => {}} className={`${INPUT_CLASS} h-11 cursor-pointer`}>
            <option value="all_random">Todos / Aleatório</option>
          </select>
        </label>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            saveLiveSales(cfg);
            setSaved(true);
            setTimeout(() => setSaved(false), 1800);
          }}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-xs cursor-pointer"
        >
          {saved ? <Check size={14} /> : null}
          {saved ? "Configuração salva" : "Salvar configuração"}
        </button>
        <button
          type="button"
          onClick={() => {
            window.dispatchEvent(new Event(FIRE_SALE_EVENT));
            setFired(true);
            setTimeout(() => setFired(false), 1800);
          }}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-border bg-background px-4 text-xs font-semibold hover:bg-muted cursor-pointer"
        >
          <Zap size={14} />
          {fired ? "Venda disparada" : "Disparar venda agora"}
        </button>
      </div>
    </section>
  );
}
