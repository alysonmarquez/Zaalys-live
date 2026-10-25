"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/components/brand";
import { Card, GrayButton, PageTitle, Table, UnderlineTabs } from "../ui";

export default function ClassificacaoPage() {
  const [tab, setTab] = useState<"shop" | "geral">("shop");
  const [sub, setSub] = useState<"politica" | "marco">("politica");
  return (
    <Card className="min-h-[calc(100svh-5.5rem)]">
      <PageTitle>Índice de qualidade do criador</PageTitle>

      <div className="mt-6 rounded-lg border border-black/[0.08] p-6">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <p className="text-[30px] font-semibold text-primary">Íntegra</p>
            <p className="mt-1 text-sm font-medium">Sua conta está em situação regular</p>
            <div className="mt-6">
              <div className="relative h-2 rounded-full bg-gradient-to-r from-[#e5394e] via-[#f7b83d] to-primary">
                <span className="absolute -top-1 left-[14%] size-4 rounded-full border-2 border-white bg-primary shadow" />
              </div>
              <div className="relative mt-2 h-9 text-xs text-black/55">
                <span className="absolute left-0">Ruim</span>
                <span className="absolute left-[4%]">50</span>
                <span className="absolute left-[9%]">100</span>
                <span className="absolute left-[14%]">
                  150
                  <br />
                  (Padrão)
                </span>
                <span className="absolute right-0 text-right">
                  1000
                  <br />
                  Excelente
                </span>
              </div>
            </div>
          </div>
          <ShieldCheck size={92} strokeWidth={1.2} className="text-primary" />
        </div>
      </div>

      <h2 className="mt-8 text-xl font-medium">Como melhorar sua Classificação de integridade do criador</h2>
      <div className="mt-4 flex max-w-[520px] items-start justify-between rounded-lg border border-black/[0.08] p-4">
        <div>
          <p className="text-xs font-medium text-black/65">Recorrer das violações</p>
          <p className="text-xl font-medium">0</p>
          <p className="text-xs text-black/55">Recorra das violações para melhorar sua classificação.</p>
        </div>
        <GrayButton className="h-8 px-3">Ver</GrayButton>
      </div>

      <h2 className="mt-8 text-xl font-medium">Violações nos últimos 90 dias</h2>
      <div className="mt-3">
        <UnderlineTabs
          tabs={[
            { v: "shop", l: "Violação do TikTok Shop" },
            { v: "geral", l: "Violação geral" },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>
      <div className="mt-4 flex gap-2">
        {(
          [
            ["politica", "Violações de política"],
            ["marco", "Sanções de marco"],
          ] as const
        ).map(([v, l]) => (
          <button
            key={v}
            type="button"
            onClick={() => setSub(v)}
            className={cn("h-7 rounded px-3 text-base font-medium cursor-pointer", sub === v ? "bg-primary/15 text-primary" : "text-black/65")}
          >
            {l}
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        {["Tipo de violação", "Tipo de execução", "Status da violação", "Status do recurso"].map((f) => (
          <select key={f} defaultValue="" className="h-[34px] w-48 rounded-md border border-black/15 bg-white px-2 text-sm text-black/55 cursor-pointer">
            <option value="">{f}</option>
          </select>
        ))}
      </div>
      <div className="mt-4">
        <Table
          cols={["Tipo de violação", "Data e hora", "Motivo", "Resultado", "Dedução de pontos", "Status", "Ações"]}
          empty={<p className="py-40 text-center text-sm font-medium text-black/55">Nenhum registro de violação</p>}
        />
      </div>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-xl font-medium">Conheça nossas políticas</h2>
        <span className="text-sm font-medium text-primary">Saiba mais</span>
      </div>
      <div className="mt-4 grid gap-8 md:grid-cols-2">
        <div>
          <p className="text-sm font-medium">Política de Conteúdo do TikTok Shop</p>
          <p className="mt-1 text-xs text-black/55">
            Considera-se que o conteúdo redireciona o tráfego quando o criador inclui, explícita ou implicitamente, links, referências ou outras &quot;chamadas para ação&quot; que incentivam os usuários a deixar o TikTok Shop ou os direcionam para outras plataformas.
          </p>
        </div>
        <div>
          <p className="text-sm font-medium">O que é promoção irrelevante?</p>
          <p className="mt-1 text-xs text-black/55">
            Uma promoção é considerada irrelevante quando o produto que está sendo promovido ou anunciado não corresponde à página de destino âncora de um vendedor, vídeo âncora ou loja.
          </p>
        </div>
      </div>
    </Card>
  );
}
