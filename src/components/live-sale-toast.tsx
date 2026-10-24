"use client";

import { useEffect, useState } from "react";
import { formatBRL } from "@/lib/zaalys-data";
import { CATALOGO_ORIGINAL } from "@/lib/catalogo-original";
import { DEMO_CONFIG_EVENT, FIRE_SALE_EVENT, loadLiveSales } from "@/lib/demo-config";

// Só produtos com venda e comissão registradas, como no original.
const SALES = CATALOGO_ORIGINAL.filter((p) => p.salesCount > 0 && p.earningCents > 0);

// Notificação "Venda ao vivo" que alterna no canto (dados de exemplo, como no original).
const SHOW_MS = 5500;
const GAP_MS = 4500;

export function LiveSaleToast() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(false);
  // "Modo de disparo" do Painel do Afiliado (aba Vendas ao Vivo).
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const load = () => setEnabled(loadLiveSales().enabled);
    load();
    window.addEventListener(DEMO_CONFIG_EVENT, load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener(DEMO_CONFIG_EVENT, load);
      window.removeEventListener("storage", load);
    };
  }, []);

  // "Disparar venda agora": mostra a próxima venda na hora, mesmo com o motor desligado.
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const fire = () => {
      setIdx((i) => (i + 1) % SALES.length);
      setVisible(true);
      clearTimeout(t);
      t = setTimeout(() => setVisible(false), SHOW_MS);
    };
    window.addEventListener(FIRE_SALE_EVENT, fire);
    return () => {
      window.removeEventListener(FIRE_SALE_EVENT, fire);
      clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let timer: ReturnType<typeof setTimeout>;
    const show = () => {
      setVisible(true);
      timer = setTimeout(hide, SHOW_MS);
    };
    const hide = () => {
      setVisible(false);
      timer = setTimeout(() => {
        setIdx((i) => (i + 1) % SALES.length);
        show();
      }, GAP_MS);
    };
    timer = setTimeout(show, 2500);
    return () => clearTimeout(timer);
  }, [enabled]);

  const p = SALES[idx]!;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-none fixed bottom-5 right-[92px] z-30 hidden w-[340px] transition-[opacity,transform] duration-500 ease-out xl:block ${
        visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      }`}
    >
      <div className="flex items-center gap-3 rounded-2xl border border-black/[0.08] bg-card/95 p-3 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.6)] backdrop-blur-xl dark:border-white/[0.08]">
        <img src={p.imageUrl} alt="" className="size-12 shrink-0 rounded-xl object-cover" />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary" />
            Venda ao vivo · {p.category}
          </p>
          <p className="truncate text-[13px] font-semibold text-foreground">{p.title}</p>
          <p className="text-[11px] text-muted-foreground">
            <span className="font-mono tabular-nums">{formatBRL(p.priceCents)}</span> ·{" "}
            <span className="font-mono font-semibold tabular-nums text-primary">+{formatBRL(p.earningCents)}</span>{" "}
            de comissão
          </p>
        </div>
      </div>
    </div>
  );
}
