"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldCheck, ArrowUpRight } from "lucide-react";

export default function AfiliadoPage() {
  const [tab, setTab] = useState<"comissoes" | "transacoes" | "indicados">(
    "comissoes"
  );

  const comissoes = [
    {
      id: "cm-1",
      buyer: "mar***@gmail.com",
      plan: "Vitalício",
      date: "20/10/2026",
      commission: "R$ 50,00",
      status: "A receber",
      tone: "bg-amber-500/12 text-amber-600 dark:text-amber-400",
    },
    {
      id: "cm-2",
      buyer: "luc***@hotmail.com",
      plan: "Vitalício",
      date: "14/10/2026",
      commission: "R$ 50,00",
      status: "Na sua conta",
      tone: "bg-primary/15 text-primary",
    },
    {
      id: "cm-3",
      buyer: "cam***@gmail.com",
      plan: "Vitalício",
      date: "08/10/2026",
      commission: "R$ 50,00",
      status: "Repassada",
      tone: "bg-primary/10 text-muted-foreground",
    },
  ];

  const transacoes = [
    {
      id: "tx-1",
      buyer: "mar***@gmail.com",
      amount: "R$ 729,56",
      method: "Cartão 12x",
      date: "20/10/2026",
      status: "Pago",
      tone: "bg-primary/15 text-primary",
    },
    {
      id: "tx-2",
      buyer: "joa***@gmail.com",
      amount: "R$ 729,56",
      method: "Pix",
      date: "18/10/2026",
      status: "Aguardando pagamento",
      tone: "bg-amber-500/12 text-amber-600 dark:text-amber-400",
    },
    {
      id: "tx-3",
      buyer: "luc***@hotmail.com",
      amount: "R$ 729,56",
      method: "Pix",
      date: "14/10/2026",
      status: "Pago",
      tone: "bg-primary/15 text-primary",
    },
  ];

  const indicados = [
    {
      id: "ind-1",
      name: "Mariana S.",
      email: "mar***@gmail.com",
      date: "20/10/2026",
      status: "Ativo",
      tone: "bg-primary/15 text-primary",
    },
    {
      id: "ind-2",
      name: "João R.",
      email: "joa***@gmail.com",
      date: "18/10/2026",
      status: "Não pagou ainda",
      tone: "bg-amber-500/12 text-amber-600 dark:text-amber-400",
    },
    {
      id: "ind-3",
      name: "Lucas M.",
      email: "luc***@hotmail.com",
      date: "14/10/2026",
      status: "Ativo",
      tone: "bg-primary/15 text-primary",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
            <ShieldCheck size={14} />
            Painel do Afiliado
          </div>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight">
            Atividades e Indicações
          </h1>
          <p className="mt-1 text-muted-foreground">
            Acompanhe comissões, transações e criadores indicados pelo seu link.
          </p>
        </div>

        <Link
          href="/painel/indique"
          className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-xs"
        >
          Pegar link de convite
          <ArrowUpRight size={15} />
        </Link>
      </header>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Comissões geradas", value: "R$ 150,00", hint: "3 vendas pagas" },
          { label: "A receber", value: "R$ 50,00", hint: "Liberado em 5 dias" },
          { label: "Repassado no Pix", value: "R$ 100,00", hint: "Sem pendências" },
          { label: "Indicados totais", value: "3", hint: "2 ativos · 1 pendente" },
        ].map((m) => (
          <div
            key={m.label}
            className="rounded-2xl border border-border/60 bg-card/70 p-4"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {m.label}
            </p>
            <p className="mt-1 font-display text-xl font-extrabold tracking-tight">
              {m.value}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{m.hint}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="inline-flex rounded-full border border-black/[0.06] bg-muted/50 p-1 dark:border-white/[0.08]">
        {(
          [
            { id: "comissoes", label: "Comissões" },
            { id: "transacoes", label: "Transações" },
            { id: "indicados", label: "Indicados" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              tab === t.id
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <section className="rounded-3xl border border-black/[0.06] bg-card/85 p-5 shadow-2xs dark:border-white/[0.08]">
        {tab === "comissoes" && (
          <ul className="divide-y divide-border/60">
            {comissoes.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
              >
                <div>
                  <p className="font-semibold">{c.buyer}</p>
                  <p className="text-xs text-muted-foreground">
                    Plano {c.plan} · {c.date}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${c.tone}`}
                  >
                    {c.status}
                  </span>
                  <span className="font-mono font-bold tabular-nums">
                    {c.commission}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}

        {tab === "transacoes" && (
          <ul className="divide-y divide-border/60">
            {transacoes.map((tx) => (
              <li
                key={tx.id}
                className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
              >
                <div>
                  <p className="font-semibold">{tx.buyer}</p>
                  <p className="text-xs text-muted-foreground">
                    {tx.method} · {tx.date}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${tx.tone}`}
                  >
                    {tx.status}
                  </span>
                  <span className="font-mono font-bold tabular-nums">
                    {tx.amount}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}

        {tab === "indicados" && (
          <ul className="divide-y divide-border/60">
            {indicados.map((ind) => (
              <li
                key={ind.id}
                className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
              >
                <div>
                  <p className="font-semibold">{ind.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {ind.email} · Entrou em {ind.date}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${ind.tone}`}
                >
                  {ind.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
