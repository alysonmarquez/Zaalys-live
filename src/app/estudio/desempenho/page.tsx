"use client";

import { useState } from "react";
import { ChevronRight, CircleHelp, Download, SlidersHorizontal } from "lucide-react";
import { cn } from "@/components/brand";
import { Card, GrayButton, PageTitle, Table, UnderlineTabs } from "../ui";
import { DateBar, brDate, useDateRange } from "../date-bar";

// Os 12 indicadores da tela de desempenho. Sem transmissões registradas, ficam vazios ("--").
const METRICS = [
  "GMV atribuído",
  "Itens atribuídos vendidos",
  "Visualizações",
  "Impressões da LIVE",
  "Impressões por hora",
  "GMV por hora",
  "GPM de exibição",
  "Duração média de visualização",
  "Porcentagem de visitantes",
  "Taxa de novos seguidores",
  "CTR",
  "CTOR",
];

const TRAFFIC = ["Para você", "Seguindo", "Pesquisa", "Perfil", "Vídeo", "Outros"];

export default function DesempenhoPage() {
  const r = useDateRange();
  const [tab, setTab] = useState<"dados" | "trafego">("dados");
  const [metric, setMetric] = useState(METRICS[0]!);
  const [offset, setOffset] = useState(0);

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
            <GrayButton>
              <SlidersHorizontal size={14} /> Métricas
            </GrayButton>
          </div>

          <div className="relative mt-4 overflow-hidden">
            <div className="flex gap-3 transition-transform duration-300" style={{ transform: `translateX(-${offset * 224}px)` }}>
              {METRICS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMetric(m)}
                  className={cn(
                    "h-[92px] w-[212px] shrink-0 rounded-lg border p-4 text-left cursor-pointer",
                    metric === m ? "border-primary/30 bg-[#ebf7f7]" : "border-black/10 bg-white hover:bg-black/[0.02]",
                  )}
                >
                  <span className="flex items-start gap-1 text-sm font-semibold leading-4">
                    <span className="line-clamp-2">{m}</span>
                    <CircleHelp size={12} className="mt-0.5 shrink-0 text-black/40" />
                  </span>
                  <span className="mt-2 block text-2xl font-semibold">--</span>
                </button>
              ))}
            </div>
            {offset < METRICS.length - 4 && (
              <button
                type="button"
                aria-label="Próximos indicadores"
                onClick={() => setOffset((o) => Math.min(o + 4, METRICS.length - 4))}
                className="absolute right-1 top-8 grid size-7 place-items-center rounded-full bg-white/95 shadow cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
            <p>
              0 transmissão ao vivo concluída{r.from && r.to ? ` nos ${brDate(r.from)} - ${brDate(r.to)}` : ""}. Limite do resumo de dados: 200 transmissões ao vivo.
            </p>
            <span className="flex items-center gap-4 text-black/65">
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary" />Normal</span>
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#f7b83d]" />Baixo</span>
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#e5394e]" />Alto</span>
            </span>
          </div>
          <p className="mt-4 text-xs text-black/65">{metric}</p>
          <div className="mt-2 grid h-72 place-items-center border-b border-black/10 text-sm text-black/45">No Data</div>
        </div>
      ) : (
        <div className="mt-6">
          <Table cols={["Fonte de tráfego", "Visualizações", "% das visualizações", "GMV atribuído"]}>
            {TRAFFIC.map((t) => (
              <tr key={t}>
                <td className="px-3 py-3">{t}</td>
                <td className="px-3">--</td>
                <td className="px-3">--</td>
                <td className="px-3">--</td>
              </tr>
            ))}
          </Table>
        </div>
      )}
    </Card>
  );
}
