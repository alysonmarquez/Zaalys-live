"use client";

// Motor de "Vendas ao Vivo" (o mesmo comportamento descrito no Painel do Afiliado do original):
// uma venda a cada 1–1,5 minuto das 7h às 21h, mais espaçadas de madrugada e à noite,
// cerca de R$ 680 de comissão até as 21h e nunca muito além de R$ 700 no dia.
// Cada venda é uma peça de roupa barata do catálogo. As vendas seguem o dia inteiro:
// ao abrir o painel, as que "aconteceram" com ele fechado são preenchidas.

import rows from "@/data/vendas-ao-vivo.json";
import { loadTodaySales, recordLiveSalesBatch, type LiveSale } from "@/lib/demo-config";

const DAY_TARGET = 68000; // R$ 680 de comissão até as 21h
const DAY_CAP = 70000; // nunca muito além de R$ 700
const OPEN_H = 7;
const CLOSE_H = 21;

// As mesmas peças que o motor do original vende (lidas do dashboard dele em 25/10/2026):
// roupas e acessórios de R$ 12 a R$ 38, com comissão de R$ 0,12 a R$ 1,75.
type Row = [string, number, number, string];
export const ENGINE_PRODUCTS = (rows as Row[]).map(([title, priceCents, earningCents, imageUrl]) => ({
  title,
  priceCents,
  earningCents,
  imageUrl,
  category: "Moda",
}));

const hours = (d: Date) => d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;

/** Comissão que o dia simulado já deveria ter no horário `d`. */
function target(d: Date) {
  const h = hours(d);
  if (h < OPEN_H) return Math.round(1500 * (h / OPEN_H)); // poucas vendas de madrugada
  if (h <= CLOSE_H) return Math.round(1500 + (DAY_TARGET - 1500) * ((h - OPEN_H) / (CLOSE_H - OPEN_H)));
  return Math.round(DAY_TARGET + (DAY_CAP - DAY_TARGET) * ((h - CLOSE_H) / (24 - CLOSE_H)));
}

/** Intervalo até a próxima venda: 60–90 s no horário comercial, 4–8 min fora dele. */
export function nextDelayMs(d = new Date()) {
  const h = hours(d);
  const day = h >= OPEN_H && h < CLOSE_H;
  return day ? 60000 + Math.random() * 30000 : 240000 + Math.random() * 240000;
}

const commissionOf = (list: Pick<LiveSale, "commissionCents">[]) => list.reduce((a, s) => a + s.commissionCents, 0);

function pickProduct() {
  return ENGINE_PRODUCTS[Math.floor(Math.random() * ENGINE_PRODUCTS.length)]!;
}

/** Decide se sai uma venda agora, mantendo o dia na curva da meta. */
export function shouldSell(now = new Date()) {
  const done = commissionOf(loadTodaySales());
  return done < DAY_CAP && done < target(now);
}

export function makeSale(p = pickProduct()) {
  return { title: p.title, imageUrl: p.imageUrl, amountCents: p.priceCents, commissionCents: p.earningCents, product: p };
}

/** Preenche as vendas do dia que teriam acontecido com o painel fechado. */
export function catchUp(now = new Date()) {
  const today = loadTodaySales();
  let done = commissionOf(today);
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  let t = today.length ? new Date(today[today.length - 1]!.at) : start;
  const batch: Omit<LiveSale, "id">[] = [];
  for (let guard = 0; guard < 2000; guard++) {
    t = new Date(t.getTime() + nextDelayMs(t));
    if (t >= now || done >= DAY_CAP) break;
    if (done >= target(t)) continue;
    const { product: _p, ...sale } = makeSale();
    batch.push({ ...sale, at: t.toISOString() });
    done += sale.commissionCents;
  }
  recordLiveSalesBatch(batch);
  return batch.length;
}
