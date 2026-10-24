"use client";

// Configuração dos números de demonstração do dashboard (aba "Métricas" e "Vendas ao Vivo" do
// Painel do Afiliado, igual ao original). Fica no navegador de quem configura.

export type PeriodKey = "today" | "week" | "d7" | "d15" | "month" | "d30";

export const PERIOD_LABELS: { v: PeriodKey; l: string }[] = [
  { v: "today", l: "Hoje" },
  { v: "week", l: "Esta semana" },
  { v: "d7", l: "7 dias" },
  { v: "d15", l: "15 dias" },
  { v: "month", l: "Este mês" },
  { v: "d30", l: "30 dias" },
];

export type BaseMetrics = {
  gmv: number;
  orders: number;
  commission: number;
  ticket: number;
  items: number;
  commissionBase: number;
  views: number;
  clicks: number;
};

export const METRIC_FIELDS: { k: keyof BaseMetrics; l: string; money?: boolean }[] = [
  { k: "gmv", l: "GMV (R$)", money: true },
  { k: "orders", l: "Pedidos" },
  { k: "commission", l: "Comissão estimada (R$)", money: true },
  { k: "ticket", l: "Ticket médio (R$)", money: true },
  { k: "items", l: "Itens vendidos" },
  { k: "commissionBase", l: "Base de comissão (R$)", money: true },
  { k: "views", l: "Visualizações" },
  { k: "clicks", l: "Cliques" },
];

export const EMPTY_METRICS: BaseMetrics = {
  gmv: 0, orders: 0, commission: 0, ticket: 0, items: 0, commissionBase: 0, views: 0, clicks: 0,
};

export type LiveSalesConfig = { enabled: boolean; source: "all_random" };

const METRICS_KEY = "zaalys_demo_metrics";
const LIVE_KEY = "zaalys_demo_live_sales";
export const DEMO_CONFIG_EVENT = "zaalys:demo-config";
export const FIRE_SALE_EVENT = "zaalys:fire-sale";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* navegador sem armazenamento: vale só nesta aba */
  }
  window.dispatchEvent(new Event(DEMO_CONFIG_EVENT));
}

export function loadMetrics(): Record<PeriodKey, BaseMetrics> {
  const base = Object.fromEntries(PERIOD_LABELS.map((p) => [p.v, { ...EMPTY_METRICS }])) as Record<PeriodKey, BaseMetrics>;
  const saved = read<Partial<Record<PeriodKey, BaseMetrics>>>(METRICS_KEY, {});
  for (const p of PERIOD_LABELS) if (saved[p.v]) base[p.v] = { ...EMPTY_METRICS, ...saved[p.v] };
  return base;
}

export function saveMetrics(all: Record<PeriodKey, BaseMetrics>) {
  write(METRICS_KEY, all);
}

export function resetMetrics() {
  try {
    localStorage.removeItem(METRICS_KEY);
  } catch {}
  window.dispatchEvent(new Event(DEMO_CONFIG_EVENT));
}

export function hasCustomMetrics(m: BaseMetrics) {
  return Object.values(m).some((v) => v > 0);
}

export function loadLiveSales(): LiveSalesConfig {
  return read<LiveSalesConfig>(LIVE_KEY, { enabled: true, source: "all_random" });
}

export function saveLiveSales(cfg: LiveSalesConfig) {
  write(LIVE_KEY, cfg);
}
