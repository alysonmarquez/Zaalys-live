"use client";

import { useEffect, useState } from "react";

// LIVEs e vendas reais da conta (rota /api/live/stats), para quem não é conta de demonstração.

export type RealSale = { at: string; amountCents: number; commissionCents: number; title: string; imageUrl: string; qty: number };
export type RealLive = { id: string; status: string; startedAt: string; endedAt: string | null; sales: RealSale[] };

/** Atualiza a cada 30 s (a extensão registra as vendas enquanto a LIVE acontece). */
export function useRealLives(enabled = true) {
  const [lives, setLives] = useState<RealLive[]>([]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    const load = () =>
      fetch("/api/live/stats")
        .then((r) => (r.ok ? r.json() : { sessions: [] }))
        .then((d: { sessions?: RealLive[] }) => {
          if (!alive) return;
          setLives(d.sessions ?? []);
          setLoaded(true);
        })
        .catch(() => alive && setLoaded(true));
    load();
    const t = setInterval(load, 30000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [enabled]);
  return { lives, loaded };
}

export const allSales = (lives: RealLive[]) => lives.flatMap((l) => l.sales);
