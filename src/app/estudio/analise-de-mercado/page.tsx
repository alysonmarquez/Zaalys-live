"use client";

import { useEffect, useState } from "react";
import { PackageSearch } from "lucide-react";
import { cn } from "@/components/brand";
import { Card, Empty, PageTitle, Table } from "../ui";

const TABS = ["Mais vendidos", "Comissão alta", "Escolha dos criadores", "Em alta", "Personalizar"];
const DESC: Record<string, string> = {
  "Mais vendidos": "Classificação de todos os produtos no TikTok com base nas vendas",
  "Comissão alta": "Classificação de todos os produtos no TikTok com base na comissão",
  "Escolha dos criadores": "Classificação dos produtos mais promovidos pelos criadores",
  "Em alta": "Produtos que mais cresceram no período",
  Personalizar: "Monte sua própria classificação com os filtros abaixo",
};
const CATEGORIAS = ["Beauty & Personal Care", "Home Supplies", "Womenswear & Underwear", "Phones & Electronics", "Sports & Outdoor", "Pet Supplies"];
const fmt = (d: Date) => d.toLocaleDateString("pt-BR", { month: "short", day: "numeric", year: "numeric" }).replace(" de ", " ").replace(".", "");

export default function AnaliseDeMercadoPage() {
  const [period, setPeriod] = useState<7 | 28>(7);
  const [tab, setTab] = useState(TABS[0]!);
  const [cat, setCat] = useState(CATEGORIAS[0]!);
  const [range, setRange] = useState("");
  useEffect(() => {
    const end = new Date();
    end.setDate(end.getDate() - 1);
    const start = new Date(end);
    start.setDate(end.getDate() - (period - 1));
    setRange(`${fmt(start)} - ${fmt(end)}`);
  }, [period]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageTitle size="md">Análise de mercado</PageTitle>
        <div className="flex items-center gap-3">
          <span className="text-sm text-black/65">{range}</span>
          {([7, 28] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={cn("h-9 rounded-md border px-4 text-sm font-semibold cursor-pointer", period === p ? "border-primary bg-white text-primary" : "border-black/15 bg-white")}
            >
              Últimos {p} dias
            </button>
          ))}
        </div>
      </div>

      <Card>
        <h2 className="text-base font-medium">Classificação do produto</h2>
        <div className="mt-5 flex items-center gap-4">
          <span className="text-base">Categoria</span>
          <select value={cat} onChange={(e) => setCat(e.target.value)} className="h-[34px] w-[196px] rounded-md border border-black/15 bg-white px-2 text-sm cursor-pointer">
            {CATEGORIAS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="mt-6 flex flex-wrap gap-2 border-b border-black/10">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn("-mb-px border-b-2 px-4 pb-2 text-sm font-semibold cursor-pointer", tab === t ? "border-primary text-primary" : "border-transparent text-black/70")}
            >
              {t}
            </button>
          ))}
        </div>
        <p className="mt-4 text-sm text-black/65">{DESC[tab]}</p>
        <div className="mt-4">
          <Table
            cols={["Classificação", "Informações do produto", "Pontuação", "Preço", "Criadores", "Informações da loja", "Ação"]}
            empty={<Empty icon={PackageSearch} text="Nenhum produto encontrado. Tente outros filtros." />}
          />
        </div>
      </Card>
    </div>
  );
}
