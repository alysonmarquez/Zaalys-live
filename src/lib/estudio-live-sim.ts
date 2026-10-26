"use client";

// LIVE simulada do Estúdio: pedidos "caindo" em tempo real enquanto o Estúdio de LIVE está aberto,
// no ritmo e com os valores-base configurados em "Editar desempenho da LIVE" (página Live do Painel).
// Ficam separados das Vendas ao Vivo do Painel: entram só nos números da LIVE de hoje do Estúdio.

import { useEffect, useState } from "react";
import { CATALOGO_ORIGINAL } from "@/lib/catalogo-original";

export type LivePace = "lento" | "normal" | "rapido";

export type LiveSimConfig = {
  /** Pedidos caindo ao vivo enquanto o Estúdio estiver aberto. */
  enabled: boolean;
  pace: LivePace;
  title: string;
  /** Espectadores simultâneos (a tela oscila em torno deste número). */
  viewers: number;
  /** Valores com que a LIVE de hoje já começa, somados aos pedidos que caem. */
  baseGmv: number;
  baseItems: number;
  baseViews: number;
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
  viewers: 480,
  baseGmv: 0,
  baseItems: 0,
  baseViews: 0,
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

const dayKey = () => {
  const d = new Date();
  return `zaalys_estudio_live_orders_${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

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
  } catch {}
  window.dispatchEvent(new Event(LIVE_SIM_CONFIG_EVENT));
}

// Os produtos mais vendidos do catálogo são os que "caem" na LIVE.
const LIVE_PRODUCTS = [...CATALOGO_ORIGINAL].sort((a, b) => b.salesCount - a.salesCount).slice(0, 8);
const NAMES = ["ana", "bruna", "carla", "daniela", "eduarda", "fernanda", "gabi", "helena", "isa", "julia", "karol", "leticia", "mariana", "natalia", "paula", "rafa", "sabrina", "thais", "vitoria", "joao", "lucas", "pedro", "gustavo", "matheus"];

// Nome mascarado como no TikTok: primeira e última letra.
const mask = (n: string) => `${n[0]}***${n[n.length - 1]}`;

export function makeOrder(at = new Date()): LiveOrder {
  // Os primeiros produtos da lista vendem mais (como no ranking de uma LIVE real).
  const i = Math.min(LIVE_PRODUCTS.length - 1, Math.floor(Math.random() ** 1.8 * LIVE_PRODUCTS.length));
  const p = LIVE_PRODUCTS[i]!;
  const qty = Math.random() < 0.85 ? 1 : 2;
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
export function useLiveSimEngine() {
  const cfg = useLiveSimConfig();
  useEffect(() => {
    if (!cfg.enabled) return;
    const [min, max] = PACE_LABELS.find((p) => p.v === cfg.pace)!.ms;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      recordLiveOrder();
      timer = setTimeout(tick, min + Math.random() * (max - min));
    };
    timer = setTimeout(tick, min + Math.random() * (max - min));
    return () => clearTimeout(timer);
  }, [cfg.enabled, cfg.pace]);
}

/** Espectadores atuais: oscilam em torno do configurado e sobem um pouco a cada pedido. */
export function useCurrentViewers(base: number, orders: number) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const t = setInterval(() => setV(Math.max(1, Math.round(base * (0.9 + Math.random() * 0.2) + orders * 0.4))), 2500);
    setV(Math.round(base + orders * 0.4));
    return () => clearInterval(t);
  }, [base, orders]);
  return v;
}
