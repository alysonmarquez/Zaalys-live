"use client";

import Link from "next/link";
import { Download, Inbox, SlidersHorizontal } from "lucide-react";
import { inRange, metricByLabel, totalsOf, useLiveSessions } from "@/lib/estudio-lives";
import { Card, GrayButton, PageTitle, Table } from "../ui";
import { DateBar, useDateRange } from "../date-bar";

// Colunas de indicadores, na ordem do original (entre "Hora de início" e "Ação").
const METRIC_COLS = [
  "GMV atribuído",
  "Itens atribuídos vendidos",
  "Visualizações",
  "Impressões da LIVE",
  "Impressões por hora",
  "GMV por hora",
  "GPM de exibição",
  "Duração média de visualização",
  "Porcentagem de visitantes",
  "CTR",
  "CTOR",
  "Taxa de novos seguidores",
];

const COLS = ["LIVE", "Hora de início", ...METRIC_COLS, "Ação"];

const startLabel = (d: Date) =>
  `${d.toLocaleDateString("pt-BR")} ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;

export default function HistoricoPage() {
  const r = useDateRange();
  const sessions = useLiveSessions().filter((s) => inRange(s, r.from, r.to));
  return (
    <Card className="min-h-[calc(100svh-5.5rem)]">
      <PageTitle size="md">Histórico de LIVE</PageTitle>
      <div className="mt-6">
        <DateBar
          r={r}
          right={
            <div className="flex gap-2">
              <GrayButton><SlidersHorizontal size={14} /> Métricas</GrayButton>
              <GrayButton className="font-semibold"><Download size={14} /> Exportar</GrayButton>
            </div>
          }
        />
      </div>
      <div className="mt-6">
        <Table
          cols={COLS}
          empty={
            sessions.length === 0 && (
              <div className="flex flex-col items-center py-16 text-black/45">
                <Inbox size={72} strokeWidth={1} />
                <p className="mt-2 text-sm">Nothing here at the moment</p>
              </div>
            )
          }
        >
          {sessions.map((s) => {
            const t = totalsOf([s]);
            return (
              <tr key={s.id} className="whitespace-nowrap">
                <td className="px-3 py-3">
                  <span className="block font-medium text-black/90">{s.title}</span>
                  <span className="text-xs text-black/45">ID {s.id.slice(5)}</span>
                </td>
                <td className="px-3 tabular-nums">{startLabel(s.startAt)}</td>
                {METRIC_COLS.map((c) => {
                  const m = metricByLabel(c);
                  return (
                    <td key={c} className="px-3 tabular-nums">
                      {m.format(m.value(t))}
                    </td>
                  );
                })}
                <td className="px-3">
                  <Link href="/estudio/desempenho" className="font-medium text-primary">
                    Ver dados
                  </Link>
                </td>
              </tr>
            );
          })}
        </Table>
      </div>
    </Card>
  );
}
