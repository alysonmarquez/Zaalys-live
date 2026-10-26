"use client";

// Transmissões de exemplo do Estúdio de LIVE (Desempenho e Histórico), montadas com os mesmos números
// do dashboard do Painel: os 30 dias de SERIES_BY_PERIOD (ou os valores-base do Painel do Afiliado,
// quando preenchidos) e, no dia de hoje, as vendas ao vivo do motor. Uma LIVE por dia.

import { useEffect, useState } from "react";
import { SERIES_BY_PERIOD } from "@/lib/dashboard-demo";
import {
  DEMO_CONFIG_EVENT,
  LIVE_SALE_EVENT,
  LIVE_SALES_RELOAD_EVENT,
  hasCustomMetrics,
  loadLiveSales,
  loadMetrics,
  loadTodaySales,
  type BaseMetrics,
} from "@/lib/demo-config";
import { catchUp } from "@/lib/live-sales-engine";
import { formatBRL } from "@/lib/zaalys-data";

export type LiveSession = {
  id: string;
  /** Dia da transmissão no formato da barra de datas (AAAA-MM-DD). */
  day: string;
  title: string;
  startAt: Date;
  durationMin: number;
  gmvCents: number;
  orders: number;
  items: number;
  views: number;
  impressions: number;
  clicks: number;
  newFollowers: number;
  avgWatchSec: number;
};

const THEMES = ["Achadinhos de moda", "Beleza e cuidados", "Casa organizada", "Fitness em casa", "Tech e acessórios", "Ofertas relâmpago"];
const WEEKDAYS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

const pad = (n: number) => String(n).padStart(2, "0");
export const isoDay = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// PRNG determinístico por dia: cada LIVE mantém os mesmos números a cada visita.
function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}
const daySeed = (d: Date) => d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();

type DayTotals = { gmvCents: number; orders: number; items: number; views: number; clicks: number };

/** GMV e pedidos de cada um dos 29 dias anteriores a hoje (índice 0 = ontem). */
function pastDays(now: Date): DayTotals[] {
  const d30 = SERIES_BY_PERIOD.d30;
  const d7 = SERIES_BY_PERIOD.d7;
  // D-6 … Ontem vêm direto do gráfico de 7 dias; o restante dos 30 dias é repartido entre D-7 … D-29.
  const recent = d7.series.slice(0, 6).reverse();
  const restGmv = d30.gmvCents - d7.gmvCents;
  const restOrders = d30.orders - d7.orders;
  const weights = Array.from({ length: 23 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - 7 - i);
    return (0.7 + rng(daySeed(d))() * 0.6) * (1 - i * 0.012);
  });
  const wSum = weights.reduce((a, w) => a + w, 0);
  const days = [
    ...recent.map((s) => ({ gmvCents: s.gmvCents, orders: s.orders })),
    ...weights.map((w) => ({ gmvCents: Math.round((restGmv * w) / wSum), orders: Math.round((restOrders * w) / wSum) })),
  ];
  return days.map((x) => ({
    ...x,
    items: Math.round(x.orders * (d30.items / d30.orders)),
    views: Math.round(d30.views * (x.gmvCents / d30.gmvCents)),
    clicks: Math.round(d30.clicks * (x.gmvCents / d30.gmvCents)),
  }));
}

/** Escala os dias passados para bater com os valores-base de 30 dias do Painel do Afiliado. */
function applyCustom(days: DayTotals[], custom: BaseMetrics | undefined): DayTotals[] {
  if (!custom || !hasCustomMetrics(custom)) return days;
  const d30 = SERIES_BY_PERIOD.d30;
  const k = (v: number, base: number) => (v > 0 ? v / base : 1);
  const f = {
    gmvCents: k(custom.gmv * 100, d30.gmvCents),
    orders: k(custom.orders, d30.orders),
    items: k(custom.items, d30.items),
    views: k(custom.views, d30.views),
    clicks: k(custom.clicks, d30.clicks),
  };
  return days.map((x) => ({
    gmvCents: Math.round(x.gmvCents * f.gmvCents),
    orders: Math.round(x.orders * f.orders),
    items: Math.round(x.items * f.items),
    views: Math.round(x.views * f.views),
    clicks: Math.round(x.clicks * f.clicks),
  }));
}

/** Hoje segue a mesma regra do dashboard: com o motor ligado, só as vendas ao vivo (mais os valores-base de "Hoje", se houver). */
function todayTotals(custom: BaseMetrics | undefined, engineOn: boolean): DayTotals {
  const base: DayTotals =
    custom && hasCustomMetrics(custom)
      ? { gmvCents: Math.round(custom.gmv * 100), orders: custom.orders, items: custom.items, views: custom.views, clicks: custom.clicks }
      : engineOn
        ? { gmvCents: 0, orders: 0, items: 0, views: 0, clicks: 0 }
        : SERIES_BY_PERIOD.today;
  const sales = loadTodaySales();
  return {
    gmvCents: base.gmvCents + sales.reduce((a, s) => a + s.amountCents, 0),
    orders: base.orders + sales.length,
    items: base.items + sales.length,
    views: base.views + sales.length * 47,
    clicks: base.clicks + sales.length * 9,
  };
}

function toSession(day: Date, t: DayTotals, now: Date): LiveSession {
  const r = rng(daySeed(day) * 7 + 3);
  const isToday = isoDay(day) === isoDay(now);
  let startAt = new Date(day);
  let durationMin: number;
  if (isToday) {
    // A LIVE de hoje abre às 7h, quando o motor de vendas ao vivo entra no ritmo do dia.
    startAt = new Date(new Date(now).setHours(Math.min(7, now.getHours()), 0, 0, 0));
    durationMin = Math.max(1, Math.round((now.getTime() - startAt.getTime()) / 60000));
  } else {
    startAt.setHours(18 + Math.floor(r() * 4), [0, 15, 30, 45][Math.floor(r() * 4)]!, 0, 0);
    durationMin = 90 + Math.round(r() * 120);
  }
  const views = Math.max(t.views, t.orders);
  return {
    id: `live-${isoDay(day).replace(/-/g, "")}`,
    day: isoDay(day),
    title: `LIVE de ${WEEKDAYS[day.getDay()]} · ${THEMES[daySeed(day) % THEMES.length]}`,
    startAt,
    durationMin,
    gmvCents: t.gmvCents,
    orders: t.orders,
    items: t.items,
    views,
    impressions: Math.round(views * (2.6 + r() * 1)),
    clicks: Math.max(t.clicks, t.orders),
    newFollowers: Math.round(views * (0.008 + r() * 0.012)),
    avgWatchSec: 35 + Math.round(r() * 40),
  };
}

export function buildLiveSessions(now = new Date()): LiveSession[] {
  const custom = loadMetrics();
  const engineOn = loadLiveSales().enabled;
  const sessions = applyCustom(pastDays(now), custom.d30).map((t, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - 1 - i);
    d.setHours(0, 0, 0, 0);
    return toSession(d, t, now);
  });
  const today = todayTotals(custom.today, engineOn);
  if (today.gmvCents > 0 || today.views > 0) {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    sessions.unshift(toSession(d, today, now));
  }
  return sessions; // mais recente primeiro
}

/** Transmissões de exemplo, atualizadas a cada venda ao vivo e a cada mudança no Painel do Afiliado. */
export function useLiveSessions() {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  useEffect(() => {
    // Mesmo comportamento do Painel: as vendas do dia que aconteceram com ele fechado entram agora.
    if (loadLiveSales().enabled) catchUp();
    const load = () => setSessions(buildLiveSessions());
    load();
    const events = [DEMO_CONFIG_EVENT, LIVE_SALE_EVENT, LIVE_SALES_RELOAD_EVENT, "storage"];
    for (const e of events) window.addEventListener(e, load);
    return () => {
      for (const e of events) window.removeEventListener(e, load);
    };
  }, []);
  return sessions;
}

export const inRange = (s: LiveSession, from: string, to: string) => Boolean(from && to) && s.day >= from && s.day <= to;

// ---------- Indicadores (mesmos nomes e ordem do original) ----------

type Totals = { gmvCents: number; orders: number; items: number; views: number; impressions: number; clicks: number; followers: number; watchSec: number; hours: number };

export function totalsOf(list: LiveSession[]): Totals {
  return list.reduce<Totals>(
    (a, s) => ({
      gmvCents: a.gmvCents + s.gmvCents,
      orders: a.orders + s.orders,
      items: a.items + s.items,
      views: a.views + s.views,
      impressions: a.impressions + s.impressions,
      clicks: a.clicks + s.clicks,
      followers: a.followers + s.newFollowers,
      watchSec: a.watchSec + s.views * s.avgWatchSec,
      hours: a.hours + s.durationMin / 60,
    }),
    { gmvCents: 0, orders: 0, items: 0, views: 0, impressions: 0, clicks: 0, followers: 0, watchSec: 0, hours: 0 },
  );
}

const int = (n: number) => Math.round(n).toLocaleString("pt-BR");
const pct = (n: number) => `${(n * 100).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`;
const div = (a: number, b: number) => (b > 0 ? a / b : 0);
const duration = (sec: number) => {
  const s = Math.round(sec);
  return s >= 60 ? `${Math.floor(s / 60)}min ${s % 60}s` : `${s}s`;
};

export type LiveMetric = { label: string; value: (t: Totals) => number; format: (v: number) => string };

export const LIVE_METRICS: LiveMetric[] = [
  { label: "GMV atribuído", value: (t) => t.gmvCents, format: formatBRL },
  { label: "Itens atribuídos vendidos", value: (t) => t.items, format: int },
  { label: "Visualizações", value: (t) => t.views, format: int },
  { label: "Impressões da LIVE", value: (t) => t.impressions, format: int },
  { label: "Impressões por hora", value: (t) => div(t.impressions, t.hours), format: int },
  { label: "GMV por hora", value: (t) => Math.round(div(t.gmvCents, t.hours)), format: formatBRL },
  { label: "GPM de exibição", value: (t) => Math.round(div(t.gmvCents * 1000, t.impressions)), format: formatBRL },
  { label: "Duração média de visualização", value: (t) => div(t.watchSec, t.views), format: duration },
  { label: "Porcentagem de visitantes", value: (t) => div(t.views, t.impressions), format: pct },
  { label: "Taxa de novos seguidores", value: (t) => div(t.followers, t.views), format: pct },
  { label: "CTR", value: (t) => div(t.clicks, t.views), format: pct },
  { label: "CTOR", value: (t) => div(t.orders, t.clicks), format: pct },
];

export const metricByLabel = (label: string) => LIVE_METRICS.find((m) => m.label === label)!;
