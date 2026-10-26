"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, CircleHelp, Download, Pencil, SlidersHorizontal } from "lucide-react";
import { cn } from "@/components/brand";
import { LIVE_METRICS, inRange, isoDay, metricByLabel, metricValue, totalsOf, useLiveSessions, useOverrides, type LiveSession, type PeriodPreset } from "@/lib/estudio-lives";
import { DesempenhoEditor } from "@/components/desempenho-editor";
import { useShowcase } from "@/lib/showcase";
import { formatBRL } from "@/lib/zaalys-data";
import { Card, GrayButton, PageTitle, Table, UnderlineTabs } from "../ui";
import { DateBar, brDate, useDateRange } from "../date-bar";

// Participação de cada fonte nas visualizações e no GMV das transmissões de exemplo.
const TRAFFIC: { l: string; views: number; gmv: number }[] = [
  { l: "Para você", views: 0.56, gmv: 0.52 },
  { l: "Seguindo", views: 0.15, gmv: 0.19 },
  { l: "Pesquisa", views: 0.09, gmv: 0.11 },
  { l: "Perfil", views: 0.07, gmv: 0.08 },
  { l: "Vídeo", views: 0.09, gmv: 0.07 },
  { l: "Outros", views: 0.04, gmv: 0.03 },
];

const STATUS = { normal: "var(--primary)", baixo: "#f7b83d", alto: "#e5394e" };

/** Dias de `from` a `to` (AAAA-MM-DD), com a transmissão de cada dia, se houver. */
function daysOf(from: string, to: string, sessions: LiveSession[]) {
  if (!from || !to) return [];
  const out: { day: string; session?: LiveSession }[] = [];
  const d = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T00:00:00`);
  for (let guard = 0; d <= end && guard < 400; guard++) {
    const day = isoDay(d);
    out.push({ day, session: sessions.find((s) => s.day === day) });
    d.setDate(d.getDate() + 1);
  }
  return out;
}

export default function DesempenhoPage() {
  const r = useDateRange();
  const sessions = useLiveSessions();
  const [tab, setTab] = useState<"dados" | "trafego">("dados");
  const [metric, setMetric] = useState(LIVE_METRICS[0]!.label);
  const [offset, setOffset] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const [editing, setEditing] = useState(false);
  const overrides = useOverrides();
  // "Editar números" é ferramenta da conta de demonstração.
  const showcase = useShowcase();

  const selected = sessions.filter((s) => inRange(s, r.from, r.to));
  const totals = totalsOf(selected);
  const m = metricByLabel(metric);
  // Números editados do período (Hoje / 7 / 30 dias); fora desses períodos, só o calculado.
  const valueOf = (x: typeof m) => metricValue(overrides, r.preset, x, totals);
  const calc = m.value(totals);
  // O gráfico acompanha o número editado: cada dia na mesma proporção.
  const scale = calc > 0 ? valueOf(m) / calc : 1;

  const days = daysOf(r.from, r.to, sessions);
  const points = days.map((d) => ({ ...d, v: d.session ? m.value(totalsOf([d.session])) * scale : 0 }));
  const withData = points.filter((p) => p.session);
  const mean = withData.reduce((a, p) => a + p.v, 0) / Math.max(1, withData.length);
  const statusOf = (v: number) => (v < mean * 0.7 ? STATUS.baixo : v > mean * 1.3 ? STATUS.alto : STATUS.normal);
  const max = Math.max(1, ...points.map((p) => p.v));
  const W = 960;
  const H = 260;
  const xs = points.map((_, i) => (points.length > 1 ? 32 + (i * (W - 64)) / (points.length - 1) : W / 2));
  const ys = points.map((p) => H - 28 - (p.v / max) * (H - 56));
  const line = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x},${ys[i]}`).join(" ");
  const labelEvery = Math.max(1, Math.ceil(points.length / 10));
  const active = hover !== null ? points[hover] : undefined;

  return (
    <Card className="min-h-[calc(100svh-5.5rem)]">
      <PageTitle size="md">Desempenho da LIVE</PageTitle>

      <div className="mt-6">
        <DateBar
          r={r}
          right={
            <GrayButton className="font-semibold">
              <Download size={14} /> Exportar
            </GrayButton>
          }
        />
      </div>

      <div className="mt-6">
        <UnderlineTabs
          tabs={[
            { v: "dados", l: "Dados de LIVE" },
            { v: "trafego", l: "Fontes de tráfego" },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>

      {tab === "dados" ? (
        <div className="mt-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Dados de LIVE</h2>
              <p className="mt-0.5 text-sm text-black/65">Mostra apenas dados de transmissões ao vivo que foram iniciadas durante o período selecionado.</p>
            </div>
            <div className="flex gap-2">
              {showcase && (
                <GrayButton onClick={() => setEditing((e) => !e)}>
                  <Pencil size={14} /> {editing ? "Fechar edição" : "Editar números"}
                </GrayButton>
              )}
              <GrayButton>
                <SlidersHorizontal size={14} /> Métricas
              </GrayButton>
            </div>
          </div>
          {showcase && editing && (
            <div className="mt-4">
              <DesempenhoEditor initial={(r.preset === "custom" ? "7" : r.preset) as PeriodPreset} />
            </div>
          )}

          <div className="relative mt-4 overflow-hidden">
            <div className="flex gap-3 transition-transform duration-300" style={{ transform: `translateX(-${offset * 224}px)` }}>
              {LIVE_METRICS.map((x) => (
                <button
                  key={x.label}
                  type="button"
                  onClick={() => setMetric(x.label)}
                  className={cn(
                    "h-[92px] w-[212px] shrink-0 rounded-lg border p-4 text-left cursor-pointer",
                    metric === x.label ? "border-primary/30 bg-[#ebf7f7]" : "border-black/10 bg-white hover:bg-black/[0.02]",
                  )}
                >
                  <span className="flex items-start gap-1 text-sm font-semibold leading-4">
                    <span className="line-clamp-2">{x.label}</span>
                    <CircleHelp size={12} className="mt-0.5 shrink-0 text-black/40" />
                  </span>
                  <span className="mt-2 block truncate text-2xl font-semibold tabular-nums">{selected.length ? x.format(valueOf(x)) : "--"}</span>
                </button>
              ))}
            </div>
            {offset > 0 && (
              <button
                type="button"
                aria-label="Indicadores anteriores"
                onClick={() => setOffset((o) => Math.max(o - 4, 0))}
                className="absolute left-1 top-8 grid size-7 place-items-center rounded-full bg-white/95 shadow cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
            )}
            {offset < LIVE_METRICS.length - 4 && (
              <button
                type="button"
                aria-label="Próximos indicadores"
                onClick={() => setOffset((o) => Math.min(o + 4, LIVE_METRICS.length - 4))}
                className="absolute right-1 top-8 grid size-7 place-items-center rounded-full bg-white/95 shadow cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
            <p>
              {selected.length} {selected.length === 1 ? "transmissão ao vivo concluída" : "transmissões ao vivo concluídas"}
              {r.from && r.to ? ` nos ${brDate(r.from)} - ${brDate(r.to)}` : ""}. Limite do resumo de dados: 200 transmissões ao vivo.
            </p>
            <span className="flex items-center gap-4 text-black/65">
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary" />Normal</span>
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#f7b83d]" />Baixo</span>
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#e5394e]" />Alto</span>
            </span>
          </div>
          <p className="mt-4 text-xs text-black/65">
            {active ? `${brDate(active.day)} · ${active.session ? `${metric}: ${m.format(active.v)}` : "sem LIVE"}` : metric}
          </p>
          {withData.length === 0 ? (
            <div className="mt-2 grid h-72 place-items-center border-b border-black/10 text-sm text-black/45">No Data</div>
          ) : (
            <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 block h-72 w-full" onMouseLeave={() => setHover(null)}>
              {[0, 0.25, 0.5, 0.75, 1].map((g) => (
                <line key={g} x1={0} x2={W} y1={28 + (H - 56) * g} y2={28 + (H - 56) * g} stroke="rgba(0,0,0,0.06)" />
              ))}
              <path d={line} fill="none" stroke="var(--primary)" strokeWidth={2} strokeLinejoin="round" />
              {points.map((p, i) => (
                <g key={p.day} onMouseEnter={() => setHover(i)}>
                  <rect x={xs[i]! - W / points.length / 2} y={0} width={W / points.length} height={H} fill="transparent" />
                  {hover === i && <line x1={xs[i]} x2={xs[i]} y1={28} y2={H - 28} stroke="rgba(0,0,0,0.25)" strokeDasharray="3 3" />}
                  {p.session && <circle cx={xs[i]} cy={ys[i]} r={hover === i ? 5 : 3.5} fill={statusOf(p.v)} stroke="#fff" strokeWidth={1.5} />}
                  {(i % labelEvery === 0 || i === points.length - 1) && (
                    <text x={xs[i]} y={H - 6} textAnchor="middle" fontSize={11} fill="rgba(0,0,0,0.45)">
                      {brDate(p.day).slice(0, 5)}
                    </text>
                  )}
                </g>
              ))}
            </svg>
          )}
        </div>
      ) : (
        <div className="mt-6">
          <Table cols={["Fonte de tráfego", "Visualizações", "% das visualizações", "GMV atribuído"]}>
            {TRAFFIC.map((t) => (
              <tr key={t.l}>
                <td className="px-3 py-3">{t.l}</td>
                <td className="px-3 tabular-nums">{selected.length ? Math.round(valueOf(metricByLabel("Visualizações")) * t.views).toLocaleString("pt-BR") : "--"}</td>
                <td className="px-3 tabular-nums">{selected.length ? `${Math.round(t.views * 100)}%` : "--"}</td>
                <td className="px-3 tabular-nums">{selected.length ? formatBRL(Math.round(valueOf(metricByLabel("GMV atribuído")) * t.gmv)) : "--"}</td>
              </tr>
            ))}
          </Table>
        </div>
      )}
    </Card>
  );
}
