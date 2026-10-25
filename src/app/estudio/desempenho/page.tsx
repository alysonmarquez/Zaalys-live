"use client";

import { useEffect, useState } from "react";
import { BarChart3, CircleHelp } from "lucide-react";
import { cn } from "@/components/brand";

// Os 12 indicadores da tela de desempenho do original. Sem transmissões registradas, ficam vazios.
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

// Data local (não UTC), no formato do <input type="date">.
const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return iso(d);
};
const br = (s: string) => s.split("-").reverse().join("/");

export default function DesempenhoPage() {
  const [preset, setPreset] = useState<"hoje" | "7" | "30" | "custom">("7");
  // Datas definidas só no navegador, para servidor e navegador não divergirem de fuso.
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  useEffect(() => {
    setFrom(daysAgo(6));
    setTo(daysAgo(0));
  }, []);
  const [tab, setTab] = useState<"dados" | "trafego">("dados");
  const [metric, setMetric] = useState(METRICS[0]!);

  function pick(p: "hoje" | "7" | "30") {
    setPreset(p);
    setFrom(daysAgo(p === "hoje" ? 0 : p === "7" ? 6 : 29));
    setTo(daysAgo(0));
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Desempenho da LIVE</h1>

      <div className="rounded-xl border border-border/60 bg-card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm">
            <input
              type="date"
              value={from}
              max={to}
              onChange={(e) => {
                setFrom(e.target.value);
                setPreset("custom");
              }}
              className="bg-transparent outline-none"
            />
            <span className="text-muted-foreground">–</span>
            <input
              type="date"
              value={to}
              min={from}
              onChange={(e) => {
                setTo(e.target.value);
                setPreset("custom");
              }}
              className="bg-transparent outline-none"
            />
          </div>
          <div className="flex overflow-hidden rounded-lg border border-border text-sm">
            {(
              [
                ["hoje", "Hoje"],
                ["7", "Últimos 7 dias"],
                ["30", "Últimos 30 dias"],
              ] as const
            ).map(([v, l]) => (
              <button
                key={v}
                type="button"
                onClick={() => pick(v)}
                className={cn("px-3 py-1.5 cursor-pointer", preset === v ? "bg-primary/12 font-semibold text-primary" : "hover:bg-muted")}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex gap-5 border-b border-border/60 text-sm">
          {(
            [
              ["dados", "Dados de LIVE"],
              ["trafego", "Fontes de tráfego"],
            ] as const
          ).map(([v, l]) => (
            <button
              key={v}
              type="button"
              onClick={() => setTab(v)}
              className={cn("-mb-px border-b-2 pb-2 cursor-pointer", tab === v ? "border-primary font-semibold" : "border-transparent text-muted-foreground")}
            >
              {l}
            </button>
          ))}
        </div>

        {tab === "dados" ? (
          <div className="mt-4">
            <h2 className="font-semibold">Dados de LIVE</h2>
            <p className="text-xs text-muted-foreground">Mostra apenas dados de transmissões ao vivo que foram iniciadas durante o período selecionado.</p>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
              {METRICS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMetric(m)}
                  className={cn(
                    "rounded-lg border p-3 text-left transition-colors cursor-pointer",
                    metric === m ? "border-primary bg-primary/[0.06]" : "border-border/60 hover:bg-muted/50",
                  )}
                >
                  <span className="flex items-center gap-1 truncate text-xs text-muted-foreground" title={m}>
                    <span className="truncate">{m}</span>
                    <CircleHelp size={11} className="shrink-0" />
                  </span>
                  <span className="mt-1.5 block text-lg font-semibold">--</span>
                </button>
              ))}
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              0 transmissões ao vivo concluídas{from && to ? ` nos dias ${br(from)} – ${br(to)}` : ""}. Limite do resumo de dados: 200 transmissões ao vivo.
            </p>

            <div className="mt-3 flex h-72 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border text-center text-muted-foreground">
              <BarChart3 size={30} />
              <p className="text-sm font-medium text-foreground">{metric}</p>
              <p className="text-sm">Nenhuma transmissão ao vivo no período selecionado.</p>
            </div>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground">
                  {["Fonte de tráfego", "Visualizações", "% das visualizações", "GMV atribuído"].map((h) => (
                    <th key={h} className="pb-2 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {TRAFFIC.map((t) => (
                  <tr key={t}>
                    <td className="py-2.5">{t}</td>
                    <td>--</td>
                    <td>--</td>
                    <td>--</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
