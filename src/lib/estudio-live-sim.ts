"use client";

// LIVE simulada do Estúdio: pedidos "caindo" em tempo real enquanto o Estúdio de LIVE está aberto,
// no ritmo e com os valores-base configurados em "Editar desempenho da LIVE" (página Live do Painel).
// Ficam separados das Vendas ao Vivo do Painel: entram só nos números da LIVE de hoje do Estúdio.

import { useEffect, useState } from "react";
import { CATALOGO_ORIGINAL } from "@/lib/catalogo-original";
import { useShowcase } from "@/lib/showcase";
import { useRealLives } from "@/lib/real-lives";

export type LivePace = "lento" | "normal" | "rapido";

export type LiveSimConfig = {
  /** Pedidos caindo ao vivo enquanto o Estúdio estiver aberto. */
  enabled: boolean;
  pace: LivePace;
  title: string;
  /** Espectadores simultâneos (a tela oscila em torno deste número). */
  viewers: number;
  /**
   * Ajustes da LIVE de hoje, somados ao que os pedidos que caem geram. "Editar desempenho da LIVE" grava aqui
   * a diferença entre o número digitado e o atual (pode ser negativa).
   */
  baseGmv: number;
  baseOrders: number;
  baseItems: number;
  baseViews: number;
  baseClicks: number;
  /** Duração média de visualização em segundos (0 = automática). */
  avgWatchSec: number;
  /** true depois do primeiro "Salvar desempenho": nas contas reais, só então os ajustes entram nos números. */
  edited?: boolean;
};

export const PACE_LABELS: { v: LivePace; l: string; ms: [number, number] }[] = [
  { v: "lento", l: "Lento (1 pedido a cada 3–5 min)", ms: [180000, 300000] },
  { v: "normal", l: "Normal (1 pedido a cada 1,5–2,5 min)", ms: [90000, 150000] },
  { v: "rapido", l: "Rápido (1 pedido a cada 45–90 s)", ms: [45000, 90000] },
];

export const DEFAULT_LIVE_SIM: LiveSimConfig = {
  enabled: true,
  pace: "normal",
  title: "LIVE de achadinhos com desconto",
  viewers: 60,
  baseGmv: 0,
  baseOrders: 0,
  baseItems: 0,
  baseViews: 0,
  baseClicks: 0,
  avgWatchSec: 0,
};

export type LiveOrder = {
  id: string;
  at: string;
  productId: number;
  title: string;
  imageUrl: string;
  qty: number;
  amountCents: number;
  buyer: string;
};

const CONFIG_KEY = "zaalys_estudio_live_sim";
export const LIVE_SIM_CONFIG_EVENT = "zaalys:estudio-live-config";
export const LIVE_ORDER_EVENT = "zaalys:estudio-live-order";

export function loadLiveSim(): LiveSimConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    return raw ? { ...DEFAULT_LIVE_SIM, ...JSON.parse(raw) } : DEFAULT_LIVE_SIM;
  } catch {
    return DEFAULT_LIVE_SIM;
  }
}

export function saveLiveSim(cfg: LiveSimConfig) {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
  } catch {
    /* sem armazenamento: vale só nesta aba */
  }
  window.dispatchEvent(new Event(LIVE_SIM_CONFIG_EVENT));
}

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const dayKey = () => `zaalys_estudio_live_orders_${today()}`;
const startKey = () => `zaalys_estudio_live_start_${today()}`;

/** Hora em que a LIVE de hoje começou (o primeiro momento em que o motor rodou no dia). */
export function loadLiveStart(): Date | null {
  try {
    const raw = localStorage.getItem(startKey());
    return raw ? new Date(raw) : null;
  } catch {
    return null;
  }
}

function markLiveStart() {
  try {
    if (!localStorage.getItem(startKey())) localStorage.setItem(startKey(), new Date().toISOString());
  } catch {}
}

export function loadLiveOrders(): LiveOrder[] {
  try {
    return JSON.parse(localStorage.getItem(dayKey()) || "[]") as LiveOrder[];
  } catch {
    return [];
  }
}

/** Zera os pedidos da LIVE de hoje (botão "Recomeçar LIVE"). */
export function resetLiveOrders() {
  try {
    localStorage.removeItem(dayKey());
    localStorage.removeItem(startKey());
  } catch {}
  // Os ajustes de números também voltam a zero: a LIVE recomeça do início.
  saveLiveSim({ ...loadLiveSim(), baseGmv: 0, baseOrders: 0, baseItems: 0, baseViews: 0, baseClicks: 0, avgWatchSec: 0, edited: false });
}

// Os produtos mais vendidos do catálogo até R$ 80 são os que "caem" na LIVE (ticket de LIVE de afiliado).
const LIVE_PRODUCTS = CATALOGO_ORIGINAL.filter((p) => p.priceCents >= 1500 && p.priceCents <= 8000)
  .sort((a, b) => b.salesCount - a.salesCount)
  .slice(0, 8);
const NAMES = ["ana", "bruna", "carla", "daniela", "eduarda", "fernanda", "gabi", "helena", "isa", "julia", "karol", "leticia", "mariana", "natalia", "paula", "rafa", "sabrina", "thais", "vitoria", "joao", "lucas", "pedro", "gustavo", "matheus"];

// Nome mascarado como no TikTok: primeira e última letra.
const mask = (n: string) => `${n[0]}***${n[n.length - 1]}`;

export function makeOrder(at = new Date()): LiveOrder {
  // Os primeiros produtos da lista vendem mais (como no ranking de uma LIVE real).
  const i = Math.min(LIVE_PRODUCTS.length - 1, Math.floor(Math.random() ** 1.8 * LIVE_PRODUCTS.length));
  const p = LIVE_PRODUCTS[i]!;
  const qty = Math.random() < 0.92 ? 1 : 2;
  return {
    id: `lo-${at.getTime()}-${Math.random().toString(36).slice(2, 6)}`,
    at: at.toISOString(),
    productId: p.id,
    title: p.title,
    imageUrl: p.imageUrl,
    qty,
    amountCents: p.priceCents * qty,
    buyer: mask(NAMES[Math.floor(Math.random() * NAMES.length)]!),
  };
}

export function recordLiveOrder(order = makeOrder()) {
  try {
    const list = loadLiveOrders();
    list.push(order);
    localStorage.setItem(dayKey(), JSON.stringify(list.slice(-3000)));
  } catch {}
  window.dispatchEvent(new CustomEvent<LiveOrder>(LIVE_ORDER_EVENT, { detail: order }));
  return order;
}

export function useLiveSimConfig() {
  const [cfg, setCfg] = useState<LiveSimConfig>(DEFAULT_LIVE_SIM);
  useEffect(() => {
    const load = () => setCfg(loadLiveSim());
    load();
    window.addEventListener(LIVE_SIM_CONFIG_EVENT, load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener(LIVE_SIM_CONFIG_EVENT, load);
      window.removeEventListener("storage", load);
    };
  }, []);
  return cfg;
}

/** Pedidos de hoje da LIVE, atualizados a cada pedido que cai. */
export function useLiveOrders() {
  const [orders, setOrders] = useState<LiveOrder[]>([]);
  useEffect(() => {
    const load = () => setOrders(loadLiveOrders());
    const onOrder = (e: Event) => setOrders((prev) => [...prev, (e as CustomEvent<LiveOrder>).detail]);
    load();
    window.addEventListener(LIVE_ORDER_EVENT, onOrder);
    window.addEventListener(LIVE_SIM_CONFIG_EVENT, load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener(LIVE_ORDER_EVENT, onOrder);
      window.removeEventListener(LIVE_SIM_CONFIG_EVENT, load);
      window.removeEventListener("storage", load);
    };
  }, []);
  return orders;
}

/** Motor: com a LIVE simulada ligada, faz cair um pedido a cada intervalo do ritmo escolhido. */
export function useLiveSimEngine(active = true) {
  const cfg = useLiveSimConfig();
  useEffect(() => {
    if (!active || !cfg.enabled) return;
    markLiveStart();
    const [min, max] = PACE_LABELS.find((p) => p.v === cfg.pace)!.ms;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      recordLiveOrder();
      timer = setTimeout(tick, min + Math.random() * (max - min));
    };
    timer = setTimeout(tick, min + Math.random() * (max - min));
    return () => clearTimeout(timer);
  }, [active, cfg.enabled, cfg.pace]);
}

/** Espectadores atuais: oscilam em torno do configurado (±15%), como numa LIVE de verdade. */
export function useCurrentViewers(base: number, orders: number) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const t = setInterval(() => setV(Math.max(1, Math.round(base * (0.85 + Math.random() * 0.3) + Math.min(orders, 20) * 0.1))), 4000);
    setV(base);
    return () => clearInterval(t);
  }, [base, orders]);
  return v;
}

// Nas contas reais, os "pedidos que caem" são as vendas de hoje registradas pela extensão.
const titleId = (t: string) => [...t].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 0);

/** Pedidos da LIVE de hoje: os simulados na conta de demonstração, os reais nas demais. */
export function useLiveFeed() {
  const showcase = useShowcase();
  const simulated = useLiveOrders();
  const { lives } = useRealLives(!showcase);
  if (showcase) return simulated;
  const today = new Date().toDateString();
  return lives
    .flatMap((l) => l.sales)
    .filter((x) => new Date(x.at).toDateString() === today)
    .sort((a, b) => Date.parse(a.at) - Date.parse(b.at))
    .map<LiveOrder>((x, i) => ({
      id: `real-${x.at}-${i}`,
      at: x.at,
      productId: titleId(x.title),
      title: x.title,
      imageUrl: x.imageUrl,
      qty: x.qty,
      amountCents: x.amountCents,
      buyer: "Cliente",
    }));
}
