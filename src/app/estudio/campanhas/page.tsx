"use client";

import { useState } from "react";
import { Megaphone } from "lucide-react";
import { Card, Empty, PageTitle, SearchBox, UnderlineTabs } from "../ui";

export default function CampanhasPage() {
  const [tab, setTab] = useState<"tudo" | "aberta" | "inscrita">("tudo");
  const [q, setQ] = useState("");
  return (
    <Card className="min-h-[calc(100svh-5.5rem)]">
      <PageTitle>Campanhas de vídeo curto e LIVE</PageTitle>
      <div className="mt-6">
        <UnderlineTabs
          tabs={[
            { v: "tudo", l: "Tudo" },
            { v: "aberta", l: "Aberta para inscrição" },
            { v: "inscrita", l: "Inscrita" },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>
      <SearchBox placeholder="Pesquisar campanhas" value={q} onChange={setQ} className="mt-4 w-[466px] max-w-full" />
      <Empty icon={Megaphone} text="A lista está vazia" />
    </Card>
  );
}
