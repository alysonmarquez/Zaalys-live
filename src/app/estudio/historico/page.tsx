"use client";

import { Download, Inbox, SlidersHorizontal } from "lucide-react";
import { Card, GrayButton, PageTitle, Table } from "../ui";
import { DateBar, useDateRange } from "../date-bar";

const COLS = [
  "LIVE",
  "Hora de início",
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
  "Ação",
];

export default function HistoricoPage() {
  const r = useDateRange();
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
            <div className="flex flex-col items-center py-16 text-black/45">
              <Inbox size={72} strokeWidth={1} />
              <p className="mt-2 text-sm">Nothing here at the moment</p>
            </div>
          }
        />
      </div>
    </Card>
  );
}
