"use client";

// Transmissões de exemplo do Estúdio de LIVE (Desempenho e Histórico). Os dias anteriores são a parte
// da LIVE nas vendas do dashboard do Painel (SERIES_BY_PERIOD, ou os valores-base de 30 dias do Painel do
// Afiliado); hoje é a LIVE simulada do Estúdio. Uma LIVE por dia, com proporções de uma LIVE real.

import { useEffect, useState } from "react";
import { SERIES_BY_PERIOD } from "@/lib/dashboard-demo";
import { DEMO_CONFIG_EVENT, hasCustomMetrics, loadMetrics, type BaseMetrics } from "@/lib/demo-config";
import { LIVE_ORDER_EVENT, LIVE_SIM_CONFIG_EVENT, loadLiveOrders, loadLiveSim, loadLiveStart } from "@/lib/estudio-live-sim";
import { formatBRL } from "@/lib/zaalys-data";
import { useShowcase } from "@/lib/showcase";
import { useRealLives, type RealLive } from "@/lib/real-lives";

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

// Parte das vendas do dia que sai da LIVE (o resto vem de vídeos e vitrine), e o tíquete da LIVE,
// que fica perto da metade do geral (compra por impulso, produtos mais baratos).
const LIVE_SHARE = 0.35;
const LIVE_TICKET = 0.55;

/** GMV e pedidos da LIVE de cada um dos 29 dias anteriores a hoje (índice 0 = ontem). */
function pastDays(now: Date, custom: BaseMetrics | undefined): DayTotals[] {
  const d30 = SERIES_BY_PERIOD.d30;
  const d7 = SERIES_BY_PERIOD.d7;
  // Valores-base de 30 dias do Painel do Afiliado, quando preenchidos, escalam GMV e pedidos.
  const useCustom = custom && hasCustomMetrics(custom);
  const fGmv = useCustom && custom.gmv > 0 ? (custom.gmv * 100) / d30.gmvCents : 1;
  const fOrders = useCustom && custom.orders > 0 ? custom.orders / d30.orders : 1;
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
  return days.map((x, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - 1 - i);
    const r = rng(daySeed(d) * 13 + 5);
    const orders = Math.max(1, Math.round(x.orders * LIVE_SHARE * fOrders));
    // Proporções de uma LIVE pequena de afiliado: 0,35–0,55% das visualizações viram pedido e 4,5–7% clicam no produto.
    const views = Math.round(orders / (0.0035 + r() * 0.002));
    return {
      gmvCents: Math.round(x.gmvCents * LIVE_SHARE * LIVE_TICKET * fGmv),
      orders,
      items: Math.round(orders * (d30.items / d30.orders)),
      views,
      clicks: Math.round(views * (0.045 + r() * 0.025)),
    };
  });
}

/**
 * LIVE de hoje: só a LIVE simulada do Estúdio, desde que ela começou. Os ajustes de "Editar desempenho da LIVE"
 * (base*) somam aos pedidos que caíram, então a tela mostra o número digitado e segue subindo a partir dele.
 */
export function todayTotals(now = new Date()): DayTotals & { startAt: Date } {
  const sim = loadLiveSim();
  const orders = loadLiveOrders();
  const startAt = loadLiveStart() ?? now;
  const minutes = Math.max(0, (now.getTime() - startAt.getTime()) / 60000);
  // ~0,5% das visualizações viram pedido, como nos dias anteriores.
  const views = Math.max(0, sim.baseViews + Math.round(minutes * 12 + orders.length * 180));
  return {
    startAt,
    gmvCents: Math.max(0, Math.round(sim.baseGmv * 100) + orders.reduce((a, o) => a + o.amountCents, 0)),
    orders: Math.max(0, sim.baseOrders + orders.length),
    items: Math.max(0, sim.baseItems + orders.reduce((a, o) => a + o.qty, 0)),
    views,
    clicks: Math.max(0, sim.baseClicks + Math.round(views * 0.05)),
  };
}

function toSession(day: Date, t: DayTotals, now: Date, todayStart?: Date, avgWatchSec?: number): LiveSession {
  const r = rng(daySeed(day) * 7 + 3);
  let startAt = new Date(day);
  let durationMin: number;
  if (todayStart) {
    startAt = todayStart;
    durationMin = Math.max(1, Math.round((now.getTime() - startAt.getTime()) / 60000));
  } else {
    startAt.setHours(18 + Math.floor(r() * 4), [0, 15, 30, 45][Math.floor(r() * 4)]!, 0, 0);
    durationMin = 90 + Math.round(r() * 90);
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
    // 20–28% de quem vê a LIVE no feed entra nela.
    impressions: Math.round(views * (3.6 + r() * 1.4)),
    clicks: Math.max(t.clicks, t.orders),
    newFollowers: Math.round(views * (0.004 + r() * 0.006)),
    avgWatchSec: avgWatchSec || 25 + Math.round(r() * 25),
  };
}

export function buildLiveSessions(now = new Date()): LiveSession[] {
  const custom = loadMetrics();
  const sessions = pastDays(now, custom.d30).map((t, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - 1 - i);
    d.setHours(0, 0, 0, 0);
    return toSession(d, t, now);
  });
  const sim = loadLiveSim();
  const today = todayTotals(now);
  if (loadLiveStart() || today.orders > 0 || today.gmvCents > 0 || today.views > 0) {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    sessions.unshift(toSession(d, today, now, today.startAt, sim.avgWatchSec));
  }
  return sessions; // mais recente primeiro
}

/** LIVEs reais da conta, no mesmo formato. Só há o que a extensão registra: vendas, início e fim. */
function fromReal(lives: RealLive[], now = new Date()): LiveSession[] {
  return lives.map((l) => {
    const startAt = new Date(l.startedAt);
    const end = l.endedAt ? new Date(l.endedAt) : now;
    return {
      id: l.id,
      day: isoDay(startAt),
      title: `LIVE de ${WEEKDAYS[startAt.getDay()]}`,
      startAt,
      durationMin: Math.max(1, Math.round((end.getTime() - startAt.getTime()) / 60000)),
      gmvCents: l.sales.reduce((a, x) => a + x.amountCents, 0),
      orders: l.sales.length,
      items: l.sales.reduce((a, x) => a + x.qty, 0),
      views: 0,
      impressions: 0,
      clicks: 0,
      newFollowers: 0,
      avgWatchSec: 0,
    };
  });
}

/**
 * Transmissões do Estúdio. Conta de demonstração: as de exemplo, atualizadas a cada pedido da LIVE simulada
 * e a cada mudança de configuração. Demais contas: as LIVEs reais.
 */
export function useLiveSessions() {
  const showcase = useShowcase();
  const real = useRealLives(!showcase);
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  useEffect(() => {
    if (!showcase) return;
    const load = () => setSessions(buildLiveSessions());
    load();
    // A duração e as visualizações da LIVE de hoje andam com o relógio.
    const t = setInterval(load, 30000);
    const events = [DEMO_CONFIG_EVENT, LIVE_SIM_CONFIG_EVENT, LIVE_ORDER_EVENT, "storage"];
    for (const e of events) window.addEventListener(e, load);
    return () => {
      clearInterval(t);
      for (const e of events) window.removeEventListener(e, load);
    };
  }, [showcase]);
  return showcase ? sessions : fromReal(real.lives);
}

export const inRange = (s: LiveSession, from: string, to: string) => Boolean(from && to) && s.day >= from && s.day <= to;

// ---------- Indicadores (mesmos nomes e ordem do original) ----------

export type Totals = { gmvCents: number; orders: number; items: number; views: number; impressions: number; clicks: number; followers: number; watchSec: number; hours: number };

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

export type MetricUnit = "money" | "int" | "sec" | "pct";
export type LiveMetric = { label: string; unit: MetricUnit; value: (t: Totals) => number; format: (v: number) => string };

export const LIVE_METRICS: LiveMetric[] = [
  { label: "GMV atribuído", unit: "money", value: (t) => t.gmvCents, format: formatBRL },
  { label: "Itens atribuídos vendidos", unit: "int", value: (t) => t.items, format: int },
  { label: "Visualizações", unit: "int", value: (t) => t.views, format: int },
  { label: "Impressões da LIVE", unit: "int", value: (t) => t.impressions, format: int },
  { label: "Impressões por hora", unit: "int", value: (t) => div(t.impressions, t.hours), format: int },
  { label: "GMV por hora", unit: "money", value: (t) => Math.round(div(t.gmvCents, t.hours)), format: formatBRL },
  { label: "GPM de exibição", unit: "money", value: (t) => Math.round(div(t.gmvCents * 1000, t.impressions)), format: formatBRL },
  { label: "Duração média de visualização", unit: "sec", value: (t) => div(t.watchSec, t.views), format: duration },
  { label: "Porcentagem de visitantes", unit: "pct", value: (t) => div(t.views, t.impressions), format: pct },
  { label: "Taxa de novos seguidores", unit: "pct", value: (t) => div(t.followers, t.views), format: pct },
  { label: "CTR", unit: "pct", value: (t) => div(t.clicks, t.views), format: pct },
  { label: "CTOR", unit: "pct", value: (t) => div(t.orders, t.clicks), format: pct },
];

export const metricByLabel = (label: string) => LIVE_METRICS.find((m) => m.label === label)!;

// ---------- Números editados por período ----------
// "Editar números" (no Desempenho e na página Live do Painel) fixa o valor de qualquer indicador em cada
// período da barra de datas. Sem valor, o indicador segue o calculado das transmissões.

export type PeriodPreset = "hoje" | "7" | "30";
export const PERIOD_PRESETS: { v: PeriodPreset; l: string }[] = [
  { v: "hoje", l: "Hoje" },
  { v: "7", l: "Últimos 7 dias" },
  { v: "30", l: "Últimos 30 dias" },
];
/** Em "Hoje", os números que andam com a LIVE (GMV, itens, visualizações…) vêm de "Editar desempenho da LIVE"; aqui só as taxas. */
export const TODAY_EDITABLE = new Set(["GPM de exibição", "Duração média de visualização", "Porcentagem de visitantes", "Taxa de novos seguidores", "CTR", "CTOR", "Impressões por hora", "GMV por hora"]);

export type MetricOverrides = Partial<Record<PeriodPreset, Record<string, number>>>;
const OVERRIDES_KEY = "zaalys_estudio_desempenho_numeros";
export const OVERRIDES_EVENT = "zaalys:estudio-desempenho-numeros";

export function loadOverrides(): MetricOverrides {
  try {
    return JSON.parse(localStorage.getItem(OVERRIDES_KEY) || "{}") as MetricOverrides;
  } catch {
    return {};
  }
}

export function saveOverrides(o: MetricOverrides) {
  try {
    localStorage.setItem(OVERRIDES_KEY, JSON.stringify(o));
  } catch {}
  window.dispatchEvent(new Event(OVERRIDES_EVENT));
}

export function useOverrides() {
  const showcase = useShowcase();
  const [o, setO] = useState<MetricOverrides>({});
  useEffect(() => {
    // Números editados são da conta de demonstração; as demais veem só o calculado.
    if (!showcase) return;
    const load = () => setO(loadOverrides());
    load();
    window.addEventListener(OVERRIDES_EVENT, load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener(OVERRIDES_EVENT, load);
      window.removeEventListener("storage", load);
    };
  }, [showcase]);
  return showcase ? o : {};
}

/** Valor do indicador no período: o editado, se houver, senão o calculado. */
export function metricValue(o: MetricOverrides, preset: string, m: LiveMetric, t: Totals) {
  const v = o[preset as PeriodPreset]?.[m.label];
  return typeof v === "number" ? v : m.value(t);
}

// Conversão entre o valor guardado (centavos, fração) e o que se digita (R$, %).
export function toInput(m: LiveMetric, v: number) {
  const n = m.unit === "money" ? v / 100 : m.unit === "pct" ? v * 100 : v;
  return n.toLocaleString("pt-BR", { maximumFractionDigits: 2, useGrouping: false });
}
export function fromInput(m: LiveMetric, raw: string): number | undefined {
  const t = raw.trim();
  if (!t) return undefined;
  const n = Number(t.includes(",") ? t.replace(/\./g, "").replace(",", ".") : /\.\d{1,2}$/.test(t) ? t : t.replace(/\./g, ""));
  if (!Number.isFinite(n) || n < 0) return undefined;
  return m.unit === "money" ? Math.round(n * 100) : m.unit === "pct" ? n / 100 : n;
}
