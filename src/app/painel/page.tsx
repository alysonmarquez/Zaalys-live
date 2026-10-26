"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";
import { RaisedButton, Segmented, cn } from "@/components/brand";
import {
  ZAALYS_CHANGES,
  ZAALYS_PRODUCTS,
  ZAALYS_TEMPLATES,
  compactNumber,
  formatBRL,
} from "@/lib/zaalys-data";
import {
  DEMO_CONFIG_EVENT,
  FIRE_SALE_EVENT,
  LIVE_SALE_EVENT,
  LIVE_SALES_RELOAD_EVENT,
  hasCustomMetrics,
  loadLiveSales,
  loadMetrics,
  loadTodaySales,
  type BaseMetrics,
  type LiveSale,
} from "@/lib/demo-config";
import { SERIES_BY_PERIOD } from "@/lib/dashboard-demo";

type PeriodKey = "today" | "week" | "d7" | "d15" | "month" | "d30";

const PERIODS: { v: PeriodKey; l: string }[] = [
  { v: "today", l: "Hoje" },
  { v: "week", l: "Esta semana" },
  { v: "d7", l: "7 dias" },
  { v: "d15", l: "15 dias" },
  { v: "month", l: "Este mês" },
  { v: "d30", l: "30 dias" },
];

function ArrowUpRight({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M7 7h10v10" />
      <path d="M7 17 17 7" />
    </svg>
  );
}

function TemplatesPreviewStrip() {
  // Mesma faixa do original: os quadros dos templates, na ordem (os modelos vêm primeiro).
  const allPosters = ZAALYS_TEMPLATES.map((t) => t.poster);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setOffset((o) => (o + 1) % allPosters.length);
    }, 2600);
    return () => clearInterval(id);
  }, [allPosters.length]);

  // Faixa cheia, como no original: até 10 quadros girando.
  const count = Math.min(10, allPosters.length * 2);
  const visible = Array.from({ length: count }, (_, i) => allPosters[(offset + i) % allPosters.length]!);

  return (
    <div className="flex gap-2 overflow-hidden px-5 opacity-40 saturate-[0.55] transition-[opacity,filter] duration-300 ease-out group-hover:opacity-100 group-hover:saturate-100">
      {visible.map((src, i) => (
        <div
          key={`${src}-${i}`}
          className="relative aspect-[9/16] w-[72px] shrink-0 overflow-hidden rounded-xl border border-white/10 bg-muted shadow-xs"
        >
          <img src={src} alt="" loading="lazy" className="size-full object-cover" />
        </div>
      ))}
    </div>
  );
}

function RadarTickerPanel() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIdx((i) => (i + 1) % ZAALYS_CHANGES.length);
    }, 3200);
    return () => clearInterval(id);
  }, []);

  const item = ZAALYS_CHANGES[idx]!;
  const isGood = item.tone === "good";
  const isCommission = item.field === "commissionPct";
  const label = isCommission
    ? `Comissão ${item.from}% → ${item.to}%`
    : `Preço ${formatBRL(item.from)} → ${formatBRL(item.to)}`;
  const dirLabel = isCommission
    ? item.to > item.from
      ? "subiu"
      : "caiu"
    : item.to < item.from
      ? "caiu"
      : "subiu";

  return (
    <div className="px-5">
      <div className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-background/75 p-2 backdrop-blur-sm">
        <img
          src={item.product.imageUrl}
          alt=""
          loading="lazy"
          className="size-9 shrink-0 rounded-lg object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium">{item.product.title}</p>
          <p className="text-[11px] text-muted-foreground">
            {label}{" "}
            <span className={cn("font-semibold tabular-nums", isGood ? "text-primary" : "text-destructive")}>
              {dirLabel}
            </span>
          </p>
        </div>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            "shrink-0",
            isGood ? "text-primary" : "text-destructive",
            dirLabel === "caiu" && "rotate-180",
          )}
        >
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
          <polyline points="16 7 22 7 22 13" />
        </svg>
      </div>
    </div>
  );
}

function BentoCard({
  href,
  icon,
  title,
  desc,
  className,
  primary,
  cover,
  panel,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  className?: string;
  primary?: boolean;
  cover?: string;
  panel?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex h-full min-h-44 flex-col justify-between overflow-hidden rounded-3xl border p-5 transition-[transform,box-shadow] duration-200 ease-out active:scale-[0.97] hover:shadow-[0_16px_36px_-12px_rgba(0,0,0,0.35)]",
        primary
          ? "border-primary/30 bg-[color-mix(in_oklch,var(--primary)_8%,var(--card))] hover:border-primary/50"
          : "border-black/[0.06] bg-card hover:border-black/[0.12] dark:border-white/[0.08] dark:hover:border-white/[0.16]",
        className,
      )}
    >
      {cover && (
        <>
          <img
            src={cover}
            alt=""
            loading="lazy"
            className="pointer-events-none absolute inset-0 size-full object-cover opacity-85 transition-transform duration-500 ease-out group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card from-30% via-card/70 via-60% to-card/20" />
        </>
      )}

      {panel && (
        <div className="pointer-events-none absolute inset-x-0 top-[4.25rem] z-[5] hidden md:block">
          {panel}
        </div>
      )}

      <div className="relative z-10 flex h-full min-h-40 flex-col justify-between">
        <span
          className={cn(
            "grid size-11 place-items-center rounded-2xl transition-transform duration-200 group-hover:scale-105",
            primary ? "bg-primary text-primary-foreground shadow-xs" : "bg-muted/80 text-foreground",
          )}
        >
          {icon}
        </span>
        <div>
          <h3 className="font-display text-lg font-bold tracking-tight">{title}</h3>
          <p className="mt-1 max-w-sm text-pretty text-sm text-muted-foreground">{desc}</p>
        </div>
      </div>

      <ArrowUpRight
        size={20}
        className="absolute right-5 top-5 z-10 text-muted-foreground transition-[transform,color] duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
      />
    </Link>
  );
}

function CentralView() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch() {
    const q = query.trim();
    router.push(q ? `/painel/catalogo?q=${encodeURIComponent(q)}` : "/painel/catalogo");
  }

  return (
    <div className="space-y-4">
      {/* Search Bar Card */}
      <div className="overflow-hidden rounded-3xl border border-black/[0.06] bg-card/85 p-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:border-white/[0.08]">
        <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:p-3">
          <div className="relative flex-1">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Busque um produto, nicho ou ideia viral…"
              className="h-11 w-full rounded-2xl border border-black/[0.04] bg-background/50 pl-11 pr-4 text-[15px] outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/40 dark:border-white/[0.06]"
            />
          </div>
          <RaisedButton
            size="default"
            onClick={handleSearch}
            className="shrink-0 rounded-2xl px-6 font-semibold"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
            </svg>
            Minerar
          </RaisedButton>
        </div>
      </div>

      {/* Bento Grid (Exact MediaFlowMZ 3-col layout) */}
      <div className="grid gap-3 md:auto-rows-[190px] md:grid-cols-3">
        <BentoCard
          href="/painel/catalogo"
          primary
          cover="/media/central-produtos.webp"
          title="Produtos Virais"
          desc="Produtos do TikTok Shop BR com preço, comissão e quanto cada venda paga."
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z" />
              <path d="m7 16.5-4.74-2.85" />
              <path d="m7 16.5 5-3" />
              <path d="M7 16.5v5.17" />
              <path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z" />
              <path d="m17 16.5-5-3" />
              <path d="m17 16.5 4.74-2.85" />
              <path d="M17 16.5v5.17" />
              <path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z" />
              <path d="M12 8 7.26 5.15" />
              <path d="m12 8 4.74-2.85" />
              <path d="M12 13.5V8" />
            </svg>
          }
        />

        <BentoCard
          href="/painel/influencers"
          className="md:col-span-2 md:row-span-2"
          cover="/media/central-templates.webp"
          panel={<TemplatesPreviewStrip />}
          title="Templates Virais"
          desc="Escolha o movimento, o modelo e o produto. O prompt sai pronto para o Flow."
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z" />
              <path d="m6.2 5.3 3.1 3.9" />
              <path d="m12.4 3.4 3.1 4" />
              <path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
            </svg>
          }
        />

        <BentoCard
          href="/painel/radar"
          className="md:row-span-2"
          cover="/media/central-radar.webp"
          panel={<RadarTickerPanel />}
          title="Radar de mudanças"
          desc="Quem subiu a comissão e quem cortou, desde a última leitura do catálogo."
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v16a2 2 0 0 0 2 2h16" />
              <path d="M7 16c.5-2 1.5-7 4-7 2 0 2 3 4 3 2.5 0 4.5-5 5-7" />
            </svg>
          }
        />

        <BentoCard
          href="/painel/roteiros"
          cover="/media/central-trend.webp"
          title="Trend AI"
          desc="Escolha o tom e a IA escreve o roteiro e o prompt do vídeo."
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
              <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
            </svg>
          }
        />

        <BentoCard
          href="/painel/raio-x"
          cover="/media/central-raiox.webp"
          title="Raio-X de Vídeo"
          desc="Cole o link de um vídeo que já vende: os números, o gancho e a estrutura."
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M7 3v18" />
              <path d="M3 12h18" />
              <path d="M17 3v18" />
            </svg>
          }
        />

        <BentoCard
          href="/painel/live"
          className="md:col-span-2"
          cover="/media/central-live.webp"
          title="Assistente de Live"
          desc="A live infinita roda sozinha: vídeos do produto, narração, comentários e produto fixado."
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
            </svg>
          }
        />

        {/* Daily Catalog Pulse Card */}
        <Link
          href="/painel/radar"
          className="group relative flex items-center gap-3.5 overflow-hidden rounded-3xl border border-black/[0.06] bg-card p-5 transition-[transform,border-color] duration-200 ease-out active:scale-[0.98] hover:border-black/[0.12] dark:border-white/[0.08] dark:hover:border-white/[0.16]"
        >
          <img
            src="/media/central-catalogo.webp"
            alt=""
            loading="lazy"
            className="pointer-events-none absolute inset-0 size-full object-cover opacity-85 transition-transform duration-500 ease-out group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-card from-45% via-card/75 via-75% to-card/25" />
          <span className="relative z-10 grid size-10 shrink-0 place-items-center rounded-full bg-primary/15">
            <span className="absolute inline-flex size-2.5 animate-ping rounded-full bg-primary/60" />
            <span className="relative inline-flex size-2.5 rounded-full bg-primary" />
          </span>
          <div className="relative z-10 min-w-0">
            <div className="text-sm font-semibold tracking-tight">
              18 mudanças em 7 dias
            </div>
            <p className="text-xs text-muted-foreground">
              5 cortes de comissão ou altas de preço para conferir antes de gravar.
            </p>
          </div>
          <ArrowUpRight
            size={18}
            className="relative z-10 ml-auto shrink-0 text-muted-foreground transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </Link>
      </div>

      {/* Referral Banner */}
      <Link
        href="/painel/indique"
        className="group flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/25 bg-primary/[0.06] px-4 py-3 text-sm transition-transform active:scale-[0.99]"
      >
        <span>
          <strong className="font-semibold">Indique e ganhe {formatBRL(5000)}</strong>
          <span className="text-muted-foreground">
            {" "}
            · seu amigo ganha {formatBRL(3000)} de desconto no vitalício
          </span>
        </span>
        <span className="inline-flex items-center gap-1 font-medium text-primary">
          Pegar meu link <ArrowUpRight size={15} />
        </span>
      </Link>
    </div>
  );
}

function DashboardView() {
  const [period, setPeriod] = useState<PeriodKey>("today");
  const [chartType, setChartType] = useState<"area" | "bars">("area");
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  // Vendas ao vivo de hoje: cada notificação "Venda ao vivo" entra aqui e soma nos números.
  const [liveSales, setLiveSales] = useState<LiveSale[]>([]);
  useEffect(() => {
    setLiveSales(loadTodaySales());
    const onSale = (e: Event) => setLiveSales((prev) => [...prev, (e as CustomEvent<LiveSale>).detail]);
    const reload = () => setLiveSales(loadTodaySales());
    window.addEventListener(LIVE_SALE_EVENT, onSale);
    window.addEventListener(LIVE_SALES_RELOAD_EVENT, reload);
    return () => {
      window.removeEventListener(LIVE_SALE_EVENT, onSale);
      window.removeEventListener(LIVE_SALES_RELOAD_EVENT, reload);
    };
  }, []);

  // Valores-base do Painel do Afiliado (aba Métricas), quando preenchidos, substituem os de exemplo.
  const [custom, setCustom] = useState<Record<PeriodKey, BaseMetrics> | null>(null);
  useEffect(() => {
    const load = () => setCustom(loadMetrics());
    load();
    window.addEventListener(DEMO_CONFIG_EVENT, load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener(DEMO_CONFIG_EVENT, load);
      window.removeEventListener("storage", load);
    };
  }, []);

  // Com as Vendas ao Vivo ligadas, o "Hoje" segue o dia simulado: só as vendas ao vivo, sem valores base
  // (como no original). Os outros períodos somam as vendas de hoje aos valores base.
  const [engineOn, setEngineOn] = useState(true);
  useEffect(() => {
    const load = () => setEngineOn(loadLiveSales().enabled);
    load();
    window.addEventListener(DEMO_CONFIG_EVENT, load);
    return () => window.removeEventListener(DEMO_CONFIG_EVENT, load);
  }, []);
  const simulatedDay = engineOn && period === "today";
  const builtIn = simulatedDay
    ? {
        gmvCents: 0,
        commissionCents: 0,
        orders: 0,
        ticketCents: 0,
        items: 0,
        views: 0,
        clicks: 0,
        commissionBaseCents: 0,
        series: ["00h", "04h", "08h", "12h", "16h", "20h"].map((label) => ({ label, gmvCents: 0, orders: 0 })),
      }
    : SERIES_BY_PERIOD[period];
  const override = custom?.[period];
  const data =
    override && hasCustomMetrics(override)
      ? (() => {
          const gmvCents = Math.round(override.gmv * 100);
          const scale = builtIn.gmvCents > 0 ? gmvCents / builtIn.gmvCents : 0;
          const orders = override.orders;
          // Ticket médio informado é o piso: mostra o maior entre ele e o calculado.
          const calcTicket = orders > 0 ? Math.round(gmvCents / orders) : 0;
          return {
            gmvCents,
            commissionCents: Math.round(override.commission * 100),
            orders,
            ticketCents: Math.max(Math.round(override.ticket * 100), calcTicket),
            items: override.items,
            views: override.views,
            clicks: override.clicks,
            commissionBaseCents: Math.round(override.commissionBase * 100),
            series: builtIn.series.map((s) => ({
              ...s,
              gmvCents: Math.round(s.gmvCents * scale),
              orders: Math.round(s.orders * (builtIn.orders > 0 ? orders / builtIn.orders : 0)),
            })),
          };
        })()
      : builtIn;
  // As vendas ao vivo entram no último ponto do gráfico (o momento atual).
  const series = simulatedDay
    ? data.series.map((s, i) => {
        const inBucket = liveSales.filter((x) => Math.floor(new Date(x.at).getHours() / 4) === i);
        return { ...s, gmvCents: s.gmvCents + inBucket.reduce((a, x) => a + x.amountCents, 0), orders: s.orders + inBucket.length };
      })
    : data.series.map((s, i, arr) => (i === arr.length - 1 ? { ...s, gmvCents: s.gmvCents + liveSales.reduce((a, x) => a + x.amountCents, 0), orders: s.orders + liveSales.length } : s));
  const maxVal = Math.max(1, ...series.map((s) => s.gmvCents));
  const width = 760;
  const xs = series.map((_, i) =>
    series.length > 1 ? 24 + (i * (width - 48)) / (series.length - 1) : width / 2,
  );
  const ys = series.map((s) => 176 - (s.gmvCents / maxVal) * 156);
  const linePath = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x},${ys[i]}`).join(" ");
  const areaPath = `${linePath} L${xs[xs.length - 1]},176 L${xs[0]},176 Z`;

  const activePoint = hoverIdx !== null ? series[hoverIdx] : undefined;
  const liveTotalCents = liveSales.reduce((acc, s) => acc + s.amountCents, 0);
  const liveCommissionCents = liveSales.reduce((acc, s) => acc + s.commissionCents, 0);
  const totalOrders = data.orders + liveSales.length;
  const totalGmv = data.gmvCents + liveTotalCents;

  const metrics = [
    {
      label: "GMV",
      value: formatBRL(totalGmv),
      sub: "Base + vendas ao vivo",
      accent: true,
    },
    {
      label: "Comissão estimada",
      value: formatBRL(data.commissionCents + liveCommissionCents),
      sub: "Sobre as vendas",
    },
    {
      label: "Pedidos confirmados",
      value: compactNumber(totalOrders),
      sub: "No período",
    },
    {
      label: "Ticket médio",
      // O ticket médio informado é o piso: mostra o maior entre ele e o calculado.
      value: formatBRL(Math.max(data.ticketCents, totalOrders > 0 ? Math.round(totalGmv / totalOrders) : 0)),
      sub: "Faturamento / pedidos",
    },
    {
      label: "Itens vendidos",
      value: compactNumber(data.items + liveSales.length),
      sub: "No período",
    },
    {
      label: "Visualizações",
      value: compactNumber(data.views + liveSales.length * 47),
      sub: "Em tempo real",
    },
    {
      label: "Cliques no produto",
      value: compactNumber(data.clicks + liveSales.length * 9),
      sub: "Em tempo real",
    },
    {
      label: "Base de comissão",
      value: formatBRL(data.commissionBaseCents + liveTotalCents),
      sub: "Consistente com o volume",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Period Selector Pills */}
      <div className="-mx-1 flex gap-1.5 overflow-x-auto rounded-full bg-muted/40 p-1 px-1.5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {PERIODS.map((p) => (
          <button
            key={p.v}
            type="button"
            onClick={() => setPeriod(p.v)}
            className={cn(
              "relative shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-[transform,color,background-color,border-color] duration-150 ease-out active:scale-[0.96] cursor-pointer",
              period === p.v
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground",
            )}
          >
            {p.l}
          </button>
        ))}
      </div>

      {/* 8 Metric Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="relative flex flex-col rounded-2xl border border-black/[0.05] bg-card/80 p-4 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] dark:border-white/[0.08]"
          >
            <div className="pr-9 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {m.label}
            </div>
            <div
              className={cn(
                "tabular mt-auto whitespace-nowrap pt-1.5 text-[clamp(1.05rem,4.4vw,1.25rem)] font-bold tracking-tight",
                m.accent && "text-primary",
              )}
            >
              {m.value}
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Evolução de Vendas SVG Chart */}
      <div className="rounded-3xl border border-black/[0.06] bg-card/85 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:border-white/[0.08]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-base font-bold tracking-tight">Evolução de Vendas</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {activePoint
                ? `${activePoint.label} · ${activePoint.orders} ${activePoint.orders === 1 ? "pedido" : "pedidos"}`
                : "GMV por intervalo no período selecionado."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="tabular text-sm font-bold text-primary">
              {formatBRL(activePoint ? activePoint.gmvCents : data.gmvCents)}
            </span>
            <div className="flex gap-0.5 rounded-full bg-muted/50 p-0.5">
              <button
                type="button"
                onClick={() => setChartType("area")}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer",
                  chartType === "area"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Área
              </button>
              <button
                type="button"
                onClick={() => setChartType("bars")}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer",
                  chartType === "bars"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Barras
              </button>
            </div>
          </div>
        </div>

        <div className="relative mt-4">
          <svg
            viewBox={`0 0 ${width} 200`}
            className="block h-[200px] w-full touch-none"
            onMouseLeave={() => setHoverIdx(null)}
          >
            <defs>
              <linearGradient id="sales-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.28" />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0, 0.25, 0.5, 0.75, 1].map((g) => (
              <line
                key={g}
                x1={0}
                x2={width}
                y1={16 + 160 * g}
                y2={16 + 160 * g}
                stroke="currentColor"
                strokeWidth={1}
                className="text-foreground/[0.06]"
              />
            ))}
            {chartType === "area" ? (
              <g>
                <path d={areaPath} fill="url(#sales-fill)" />
                <path
                  d={linePath}
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            ) : (
              series.map((s, i) => {
                const h = Math.max(4, (s.gmvCents / maxVal) * 156);
                const x = xs[i]! - 14;
                return (
                  <rect
                    key={s.label}
                    x={x}
                    y={176 - h}
                    width={28}
                    height={h}
                    rx={6}
                    fill="var(--primary)"
                    fillOpacity={hoverIdx === null || hoverIdx === i ? 0.85 : 0.4}
                    onMouseEnter={() => setHoverIdx(i)}
                  />
                );
              })
            )}
            {xs.map((x, i) => (
              <g key={series[i]!.label} onMouseEnter={() => setHoverIdx(i)}>
                <rect x={x - 30} y={0} width={60} height={180} fill="transparent" />
                {hoverIdx === i && (
                  <>
                    <line
                      x1={x}
                      x2={x}
                      y1={16}
                      y2={176}
                      stroke="currentColor"
                      strokeDasharray="3 3"
                      className="text-foreground/30"
                    />
                    <circle
                      cx={x}
                      cy={ys[i]}
                      r={4.5}
                      fill="var(--primary)"
                      stroke="var(--card)"
                      strokeWidth={2}
                    />
                  </>
                )}
                <text
                  x={x}
                  y={194}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[11px]"
                >
                  {series[i]!.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Valores base definidos no painel administrativo, somados às vendas ao vivo.
        </p>
      </div>

      {/* Vendas ao Vivo Card */}
      <div className="rounded-3xl border border-black/[0.06] bg-card/85 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:border-white/[0.08]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex size-2.5 animate-ping rounded-full bg-primary/60" />
              <span className="relative inline-flex size-2.5 rounded-full bg-primary" />
            </span>
            <span className="text-sm font-semibold">Vendas ao Vivo</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event(FIRE_SALE_EVENT))}
              className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/20 cursor-pointer"
            >
              + Simular venda ao vivo
            </button>
            <span className="tabular text-lg font-bold text-primary">
              {formatBRL(liveTotalCents)}
            </span>
          </div>
        </div>
        <ul className="mt-3 space-y-2">
          {liveSales.length === 0 && <li className="text-sm text-muted-foreground">As vendas do dia aparecem aqui conforme acontecem.</li>}
          {[...liveSales].reverse().slice(0, 6).map((s) => (
            <li key={s.id} className="flex items-center gap-2.5 text-sm">
              <div className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-lg border border-black/[0.06] bg-muted dark:border-white/[0.08]">
                <img src={s.imageUrl} alt="" className="size-full object-cover" />
              </div>
              <span className="min-w-0 flex-1 truncate text-muted-foreground">{s.title}</span>
              <span className="shrink-0 text-right">
                <span className="tabular block font-medium leading-tight">
                  {formatBRL(s.amountCents)}
                </span>
                <span className="tabular block text-[11px] leading-tight text-primary">
                  +{formatBRL(s.commissionCents)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function PainelHomeInner() {
  const searchParams = useSearchParams();
  const initialVista = searchParams.get("vista") === "dashboard" ? "dashboard" : "central";
  const [vista, setVista] = useState<"central" | "dashboard">(initialVista);
  const [handle, setHandle] = useState("criador");

  useEffect(() => {
    if (searchParams.get("vista") === "dashboard") setVista("dashboard");
  }, [searchParams]);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then(({ user }) => {
        if (user?.handle) setHandle(user.handle);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Olá, @{handle}</h1>
          <p className="mt-1.5 text-muted-foreground">
            {vista === "central"
              ? "Minere um produto, escolha um movimento, gere o vídeo."
              : "Acompanhe suas vendas e comissões."}
          </p>
        </div>

        <Segmented
          label="Central ou dashboard"
          value={vista}
          onChange={setVista}
          options={[
            { value: "central", label: "Central" },
            { value: "dashboard", label: "Dashboard" },
          ]}
        />
      </header>

      {vista === "central" ? <CentralView /> : <DashboardView />}
    </div>
  );
}

export default function PainelHome() {
  return (
    <Suspense fallback={null}>
      <PainelHomeInner />
    </Suspense>
  );
}
