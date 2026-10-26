"use client";

// Painel de LIVE em tempo real, no formato da tela cheia do TikTok Shop: GMV grande subindo a cada pedido,
// indicadores ao vivo, tendência por minuto, pedidos caindo e ranking de produtos.

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Eye, MousePointerClick, Pause, Play, Settings2, ShoppingBag, Timer, Users, X } from "lucide-react";
import { formatBRL } from "@/lib/zaalys-data";
import { isoDay, totalsOf, useLiveSessions } from "@/lib/estudio-lives";
import { loadLiveSim, saveLiveSim, useCurrentViewers, useLiveOrders, useLiveSimConfig, type LiveOrder } from "@/lib/estudio-live-sim";

const CYAN = "#25f4ee";
const PINK = "#fe2c55";

/** Número que sobe suavemente até o valor novo (como o contador do TikTok). */
function useCountUp(target: number, ms = 900) {
  const [v, setV] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const step = (t: number) => {
      const k = Math.min(1, (t - start) / ms);
      const cur = a + (target - a) * (1 - (1 - k) ** 3);
      setV(cur);
      from.current = cur;
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

function useNow(every = 1000) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), every);
    return () => clearInterval(t);
  }, [every]);
  return now;
}

const int = (n: number) => Math.round(n).toLocaleString("pt-BR");
const pct = (n: number) => `${(n * 100).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`;
const clock = (sec: number) => {
  const s = Math.max(0, Math.floor(sec));
  return [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60].map((x) => String(x).padStart(2, "0")).join(":");
};
const ago = (at: string, now: Date) => {
  const s = Math.max(0, Math.round((now.getTime() - Date.parse(at)) / 1000));
  return s < 5 ? "agora" : s < 60 ? `há ${s}s` : `há ${Math.floor(s / 60)} min`;
};

function Kpi({ icon: Icon, label, value, accent }: { icon: typeof Eye; label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
      <p className="flex items-center gap-1.5 text-xs text-white/55">
        <Icon size={13} style={{ color: accent }} /> {label}
      </p>
      <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight text-white">{value}</p>
    </div>
  );
}

export default function PainelDeLivePage() {
  const cfg = useLiveSimConfig();
  const orders = useLiveOrders();
  const sessions = useLiveSessions();
  const now = useNow();
  const today = now ? sessions.find((s) => s.day === isoDay(now)) : undefined;
  const t = totalsOf(today ? [today] : []);
  const viewers = useCurrentViewers(cfg.viewers, orders.length);
  const gmv = useCountUp(t.gmvCents);
  const items = useCountUp(t.items);

  // "+R$ xx" subindo ao lado do GMV a cada pedido novo.
  const [bursts, setBursts] = useState<LiveOrder[]>([]);
  const seen = useRef(0);
  useEffect(() => {
    if (seen.current === 0) {
      seen.current = orders.length;
      return;
    }
    const fresh = orders.slice(seen.current);
    seen.current = orders.length;
    if (!fresh.length) return;
    setBursts((b) => [...b, ...fresh].slice(-6));
    const ids = fresh.map((o) => o.id);
    setTimeout(() => setBursts((b) => b.filter((o) => !ids.includes(o.id))), 2200);
  }, [orders]);

  if (!now) return null;
  const elapsed = today ? (now.getTime() - today.startAt.getTime()) / 1000 : 0;

  // Tendência: últimos 30 minutos, GMV por minuto (barras) e pedidos (linha).
  const buckets = Array.from({ length: 30 }, (_, i) => {
    const end = now.getTime() - (29 - i) * 60000;
    const list = orders.filter((o) => {
      const at = Date.parse(o.at);
      return at > end - 60000 && at <= end;
    });
    return { label: new Date(end).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }), gmv: list.reduce((a, o) => a + o.amountCents, 0), n: list.length };
  });
  const maxG = Math.max(1, ...buckets.map((b) => b.gmv));
  const maxN = Math.max(1, ...buckets.map((b) => b.n));
  const W = 720;
  const H = 220;
  const bw = W / buckets.length;
  const line = buckets.map((b, i) => `${i === 0 ? "M" : "L"}${i * bw + bw / 2},${H - 24 - (b.n / maxN) * (H - 48)}`).join(" ");

  // Ranking de produtos da LIVE.
  const ranking = Object.values(
    orders.reduce<Record<number, { title: string; imageUrl: string; qty: number; gmv: number }>>((acc, o) => {
      const r = (acc[o.productId] ??= { title: o.title, imageUrl: o.imageUrl, qty: 0, gmv: 0 });
      r.qty += o.qty;
      r.gmv += o.amountCents;
      return acc;
    }, {}),
  )
    .sort((a, b) => b.gmv - a.gmv)
    .slice(0, 5);
  const topGmv = Math.max(1, ...ranking.map((r) => r.gmv));

  const feed = [...orders].reverse().slice(0, 9);
  const customers = new Set(orders.map((o) => o.buyer)).size + Math.round(Math.max(0, t.orders - orders.length) * 0.92);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0b0b12] text-white">
      <style>{`
        @keyframes lv-rise { 0% { opacity: 0; transform: translateY(8px) } 15% { opacity: 1 } 100% { opacity: 0; transform: translateY(-46px) } }
        @keyframes lv-in { from { opacity: 0; transform: translateY(-14px) scale(.98) } to { opacity: 1; transform: none } }
        @keyframes lv-glow { 0%, 100% { text-shadow: 0 0 0 transparent } 50% { text-shadow: 0 0 28px rgba(37,244,238,.35) } }
      `}</style>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(254,44,85,0.16),transparent)]" />

      <div className="relative mx-auto max-w-[1440px] p-4 sm:p-6">
        {/* Topo */}
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wider" style={{ background: PINK }}>
              <span className="size-1.5 animate-pulse rounded-full bg-white" /> Ao vivo
            </span>
            <h1 className="truncate text-lg font-semibold sm:text-xl">{cfg.title}</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/70">
            <span className="flex items-center gap-1.5 rounded-md bg-white/[0.06] px-3 py-1.5 tabular-nums">
              <Timer size={14} /> {clock(elapsed)}
            </span>
            <button
              type="button"
              onClick={() => saveLiveSim({ ...loadLiveSim(), enabled: !cfg.enabled })}
              className="flex items-center gap-1.5 rounded-md bg-white/[0.06] px-3 py-1.5 hover:bg-white/10 cursor-pointer"
            >
              {cfg.enabled ? <Pause size={14} /> : <Play size={14} />} {cfg.enabled ? "Pausar pedidos" : "Retomar pedidos"}
            </button>
            <Link href="/painel/live?desempenho=1" className="flex items-center gap-1.5 rounded-md bg-white/[0.06] px-3 py-1.5 hover:bg-white/10">
              <Settings2 size={14} /> Editar desempenho
            </Link>
            <Link href="/estudio/desempenho" aria-label="Sair da tela cheia" className="grid size-8 place-items-center rounded-md bg-white/[0.06] hover:bg-white/10">
              <X size={16} />
            </Link>
          </div>
        </header>

        {/* GMV principal */}
        <section className="mt-8 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/50">GMV da LIVE</p>
          <div className="relative mx-auto mt-2 inline-block">
            <p className="text-[clamp(2.75rem,8vw,6rem)] font-extrabold leading-none tabular-nums tracking-tight" style={{ color: CYAN, animation: "lv-glow 2.4s ease-in-out infinite" }}>
              {formatBRL(Math.round(gmv))}
            </p>
            <div className="pointer-events-none absolute -right-4 top-0 translate-x-full">
              {bursts.map((b, i) => (
                <span
                  key={b.id}
                  className="absolute left-0 whitespace-nowrap rounded-full px-2.5 py-0.5 text-sm font-bold"
                  style={{ top: i * 6, background: "rgba(254,44,85,.18)", color: PINK, animation: "lv-rise 2.2s ease-out forwards" }}
                >
                  +{formatBRL(b.amountCents)}
                </span>
              ))}
            </div>
          </div>
          <p className="mt-3 text-sm text-white/50">
            <span className="font-semibold tabular-nums text-white">{int(items)}</span> itens vendidos ·{" "}
            <span className="font-semibold tabular-nums text-white">{int(t.orders)}</span> pedidos
          </p>
        </section>

        {/* Indicadores */}
        <section className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
          <Kpi icon={Users} label="Espectadores atuais" value={int(viewers)} accent={PINK} />
          <Kpi icon={Eye} label="Visualizações" value={int(t.views)} accent={CYAN} />
          <Kpi icon={ShoppingBag} label="Clientes" value={int(customers)} accent={CYAN} />
          <Kpi icon={MousePointerClick} label="Cliques no produto" value={int(t.clicks)} accent={CYAN} />
          <Kpi icon={MousePointerClick} label="CTR" value={pct(t.views ? t.clicks / t.views : 0)} />
          <Kpi icon={ShoppingBag} label="Taxa de conversão" value={pct(t.clicks ? t.orders / t.clicks : 0)} />
          <Kpi icon={ShoppingBag} label="GPM" value={formatBRL(t.impressions ? Math.round((t.gmvCents * 1000) / t.impressions) : 0)} />
          <Kpi icon={Timer} label="Duração média" value={`${Math.round(t.views ? t.watchSec / t.views : 0)}s`} />
        </section>

        <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            {/* Tendência */}
            <section className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-semibold">Tendência em tempo real</h2>
                <span className="flex items-center gap-4 text-xs text-white/55">
                  <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm" style={{ background: PINK }} />GMV por minuto</span>
                  <span className="flex items-center gap-1.5"><span className="h-0.5 w-3" style={{ background: CYAN }} />Pedidos</span>
                </span>
              </div>
              <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 block h-56 w-full">
                {[0, 0.5, 1].map((g) => (
                  <line key={g} x1={0} x2={W} y1={24 + (H - 48) * g} y2={24 + (H - 48) * g} stroke="rgba(255,255,255,0.06)" />
                ))}
                {buckets.map((b, i) => {
                  const h = (b.gmv / maxG) * (H - 48);
                  return <rect key={i} x={i * bw + bw * 0.2} y={H - 24 - h} width={bw * 0.6} height={Math.max(h, 1)} rx={2} fill={PINK} fillOpacity={i === buckets.length - 1 ? 1 : 0.55} />;
                })}
                <path d={line} fill="none" stroke={CYAN} strokeWidth={2} strokeLinejoin="round" />
                {buckets.map((b, i) =>
                  i % 5 === 0 || i === buckets.length - 1 ? (
                    <text key={i} x={i * bw + bw / 2} y={H - 6} textAnchor="middle" fontSize={11} fill="rgba(255,255,255,0.4)">
                      {b.label}
                    </text>
                  ) : null,
                )}
              </svg>
            </section>

            {/* Ranking */}
            <section className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-5">
              <h2 className="font-semibold">Ranking de produtos</h2>
              {ranking.length === 0 ? (
                <p className="py-8 text-center text-sm text-white/45">Os produtos vendidos na LIVE aparecem aqui.</p>
              ) : (
                <ol className="mt-4 space-y-3">
                  {ranking.map((r, i) => (
                    <li key={r.title} className="flex items-center gap-3">
                      <span className="w-5 text-center text-sm font-bold tabular-nums" style={{ color: i < 3 ? CYAN : "rgba(255,255,255,.45)" }}>
                        {i + 1}
                      </span>
                      <img src={r.imageUrl} alt="" className="size-11 shrink-0 rounded-lg object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm">{r.title}</p>
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                          <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${(r.gmv / topGmv) * 100}%`, background: `linear-gradient(90deg, ${CYAN}, ${PINK})` }} />
                        </div>
                      </div>
                      <div className="shrink-0 text-right text-sm tabular-nums">
                        <p className="font-semibold">{formatBRL(r.gmv)}</p>
                        <p className="text-xs text-white/50">{r.qty} vendidos</p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </div>

          {/* Pedidos caindo */}
          <section className="flex flex-col rounded-xl border border-white/[0.07] bg-white/[0.03] p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Pedidos em tempo real</h2>
              <span className="text-xs text-white/45">{int(orders.length)} na LIVE</span>
            </div>
            {feed.length === 0 ? (
              <p className="flex flex-1 items-center justify-center py-10 text-center text-sm text-white/45">
                {cfg.enabled ? "Aguardando o primeiro pedido…" : "Pedidos pausados."}
              </p>
            ) : (
              <ul className="mt-4 space-y-2.5">
                {feed.map((o, i) => (
                  <li
                    key={o.id}
                    className="flex items-center gap-3 rounded-lg p-2.5"
                    style={{ background: i === 0 ? "rgba(37,244,238,.08)" : "rgba(255,255,255,.02)", animation: i === 0 ? "lv-in .45s ease-out" : undefined }}
                  >
                    <img src={o.imageUrl} alt="" className="size-10 shrink-0 rounded-md object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-white/60">
                        <span className="font-semibold text-white">{o.buyer}</span> comprou {o.qty > 1 ? `${o.qty} itens` : ""}
                      </p>
                      <p className="truncate text-sm">{o.title}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold tabular-nums" style={{ color: PINK }}>
                        {formatBRL(o.amountCents)}
                      </p>
                      <p className="text-[11px] text-white/40">{ago(o.at, now)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
