"use client";

import { useState } from "react";
import { CalendarClock, CalendarRange } from "lucide-react";
import { Card, Empty, GrayButton, PageTitle, TealButton, UnderlineTabs } from "../ui";

export default function EventosPage() {
  const [tab, setTab] = useState<"proximos" | "ultimos">("proximos");
  return (
    <Card className="min-h-[calc(100svh-5.5rem)]">
      <PageTitle>Eventos LIVE</PageTitle>

      <div className="mt-4 flex flex-wrap items-center gap-6 rounded-lg bg-[#f8f8f8] p-4">
        <span className="grid h-[100px] w-[203px] place-items-center rounded-md bg-primary/10">
          <CalendarRange size={40} className="text-primary" />
        </span>
        <div className="flex-1">
          <p className="text-xl font-medium">Um pouco de planejamento pode multiplicar seus espectadores da LIVE</p>
          <p className="mt-1 text-sm text-black/55">Agende seu evento de LIVE com antecedência para maximizar vendas e comissões.</p>
        </div>
        <GrayButton>Saiba mais</GrayButton>
      </div>

      <div className="mt-6 flex items-end justify-between gap-4">
        <div className="flex-1">
          <UnderlineTabs
            tabs={[
              { v: "proximos", l: "Próximos 0" },
              { v: "ultimos", l: "Últimos 0" },
            ]}
            value={tab}
            onChange={setTab}
          />
        </div>
        <TealButton className="mb-1">+ Agendar evento</TealButton>
      </div>

      <Empty
        icon={CalendarClock}
        title={tab === "proximos" ? "Nenhum evento agendado" : "Nenhum evento anterior"}
        text="Crie um evento para gerar expectativa e dar aos espectadores uma maneira de se cadastrar para sua próxima LIVE."
      >
        <TealButton>+ Agendar evento</TealButton>
      </Empty>
    </Card>
  );
}
