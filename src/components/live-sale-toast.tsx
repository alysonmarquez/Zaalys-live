"use client";

import { useEffect, useRef, useState } from "react";
import { formatBRL } from "@/lib/zaalys-data";
import { DEMO_CONFIG_EVENT, FIRE_SALE_EVENT, loadLiveSales, recordLiveSale } from "@/lib/demo-config";
import { catchUp, makeSale, nextDelayMs, shouldSell } from "@/lib/live-sales-engine";

const SHOW_MS = 5500;
type Shown = { title: string; imageUrl: string; amountCents: number; commissionCents: number; category: string };

// Notificação "Venda ao vivo": mostra cada venda do motor (live-sales-engine) e a registra para o dashboard.
export function LiveSaleToast() {
  const [sale, setSale] = useState<Shown | null>(null);
  const [visible, setVisible] = useState(false);
  // "Modo de disparo" do Painel do Afiliado (aba Vendas ao Vivo).
  const [enabled, setEnabled] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

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

  function sell() {
    const { product, ...s } = makeSale();
    recordLiveSale(s);
    setSale({ ...s, category: product.category });
    setVisible(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setVisible(false), SHOW_MS);
  }

  // "Disparar venda agora" / "Simular venda ao vivo": uma venda na hora, mesmo com o motor desligado.
  useEffect(() => {
    const fire = () => sell();
    window.addEventListener(FIRE_SALE_EVENT, fire);
    return () => window.removeEventListener(FIRE_SALE_EVENT, fire);
  }, []);

  // Motor ligado: completa o dia e segue vendendo no ritmo do original.
  useEffect(() => {
    if (!enabled) return;
    catchUp();
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      if (shouldSell()) sell();
      timer = setTimeout(tick, nextDelayMs());
    };
    timer = setTimeout(tick, nextDelayMs());
    return () => clearTimeout(timer);
  }, [enabled]);

  if (!sale) return null;
  const p = { ...sale, priceCents: sale.amountCents, earningCents: sale.commissionCents };

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
