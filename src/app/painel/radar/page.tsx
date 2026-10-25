"use client";

import Link from "next/link";
import React, { useState } from "react";
import { CATALOGO_DESTAQUES } from "@/lib/catalogo-original";
import { Segmented, cn } from "@/components/brand";
import {
  PROOF_GOAL_LABELS,
  ZAALYS_CHANGES,
  ZAALYS_PRODUCTS,
  formatBRL,
} from "@/lib/zaalys-data";

export default function RadarPage() {
  const [tone, setTone] = useState<"all" | "good" | "bad">("all");

  const filtered = ZAALYS_CHANGES.filter((c) => (tone === "all" ? true : c.tone === tone));
  // Como no original: os produtos com mais vendas registradas.
  const recommended = CATALOGO_DESTAQUES.slice(0, 3);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          Radar de mudanças
        </h1>
        <p className="mt-1.5 max-w-2xl text-muted-foreground">
          Quem vende muda preço e comissão sem avisar. Relemos o catálogo a cada 5 minutos, um lote
          de produtos por vez, e guardamos o que mudou, para você filmar o que subiu e parar de
          divulgar o que caiu.
        </p>
        <p
          className="mt-2 text-xs text-muted-foreground"
          title="Quando o catálogo foi lido pela última vez"
        >
          Última leitura do catálogo: há 4 minutos
        </p>
      </header>

      {/* Produtos para preparar seu próximo vídeo */}
      <section className="rounded-2xl border border-border p-4 sm:p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-base font-semibold">Produtos para preparar seu próximo vídeo</h2>
          <Link href="/painel/catalogo" className="text-xs underline underline-offset-4">
            Ver recomendações no catálogo
          </Link>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          A ordem considera os fatos disponíveis e movimentos compatíveis. Confira as condições no
          TikTok Shop.
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          {recommended.map((p) => (
            <li key={p.id} className="min-w-0 rounded-xl bg-muted/35 p-3">
              <Link
                href={`/painel/catalogo?produto=${p.id}`}
                className="text-sm font-medium underline-offset-4 hover:underline"
              >
                {p.title}
              </Link>
              <p className="mt-2 text-xs text-muted-foreground">{p.reasons[0]}</p>
              <p className="mt-2 text-xs">
                Pergunta: <strong>{PROOF_GOAL_LABELS[p.proofGoal]}</strong>
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* Segmented Filter */}
      <Segmented
        label="Filtrar por tipo de mudança"
        value={tone}
        onChange={setTone}
        options={[
          { value: "all", label: "Tudo" },
          { value: "good", label: "A favor" },
          { value: "bad", label: "Contra" },
        ]}
      />

      {/* Changes List */}
      <ul className="space-y-2.5">
        {filtered.map((w) => {
          const isComm = w.field === "commissionPct";
          const isGood = w.tone === "good";
          const fromLabel = isComm ? `${w.from}%` : formatBRL(w.from);
          const toLabel = isComm ? `${w.to}%` : formatBRL(w.to);

          return (
            <li
              key={w.id}
              className="flex items-center gap-3.5 rounded-2xl border border-black/[0.06] bg-card/75 p-3.5 shadow-2xs dark:border-white/[0.08]"
            >
              <span
                className={cn(
                  "grid size-10 shrink-0 place-items-center rounded-xl font-bold",
                  isGood
                    ? "bg-primary/15 text-primary"
                    : "bg-destructive/15 text-destructive",
                )}
              >
                {isComm ? "%" : "R$"}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-muted/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {w.product.category}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(w.observedAt).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}
                  </span>
                </div>

                <div className="mt-1 truncate text-sm font-medium">{w.product.title}</div>

                <div className="mt-0.5 text-xs text-muted-foreground">
                  {isComm ? "Comissão " : "Preço "}
                  <span className="tabular line-through">{fromLabel}</span>{" "}
                  <span
                    className={cn(
                      "tabular font-semibold",
                      isGood ? "text-primary" : "text-destructive",
                    )}
                  >
                    {toLabel}
                  </span>
                  {w.earnings && (
                    <>
                      {" "}
                      · comissão estimada por venda:{" "}
                      <span className="tabular font-semibold text-foreground">
                        {formatBRL(w.earnings.after)}
                      </span>{" "}
                      <span className="tabular">(era {formatBRL(w.earnings.before)})</span>
                    </>
                  )}
                </div>
              </div>

              <a
                href={w.product.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group grid size-9 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground transition-[transform,color,background-color] duration-150 ease-out hover:text-foreground active:scale-95"
                aria-label={`Abrir ${w.product.title} no TikTok Shop`}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                  <path d="M3 6h18" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
