"use client";

import React, { useState } from "react";
import { Wallet, Check, ArrowUpRight } from "lucide-react";

const INPUT_CLASS =
  "h-11 w-full rounded-xl border border-black/[0.06] bg-background/50 px-3.5 text-[15px] outline-none transition-[background-color,border-color,box-shadow] placeholder:text-muted-foreground focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring/40 dark:border-white/[0.08] dark:bg-input/20";

export default function ComissoesPage() {
  const [pixType, setPixType] = useState("cpf");
  const [pixKey, setPixKey] = useState("");
  const [savedPix, setSavedPix] = useState(false);
  const [requestedPayout, setRequestedPayout] = useState(false);

  const payouts = [
    {
      id: "pay-1",
      date: "15/10/2026",
      desc: "Repasse de 2 indicações (Vitalício)",
      amount: "R$ 100,00",
      status: "Repassada",
      tone: "bg-primary/15 text-primary",
    },
    {
      id: "pay-2",
      date: "08/10/2026",
      desc: "Repasse de 1 indicação (Vitalício)",
      amount: "R$ 50,00",
      status: "Repassada",
      tone: "bg-primary/15 text-primary",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <header>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          Saque de comissões
        </h1>
        <p className="mt-1 text-muted-foreground">
          Acompanhe seu saldo disponível, chave Pix de recebimento e histórico
          de repasses.
        </p>
      </header>

      {/* Metrics */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border/60 bg-card/70 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Disponível para saque
          </p>
          <p className="mt-1 font-display text-2xl font-extrabold tracking-tight text-primary">
            R$ 50,00
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Liberado após garantia de 7 dias
          </p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card/70 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Em garantia (7 dias)
          </p>
          <p className="mt-1 font-display text-2xl font-extrabold tracking-tight">
            R$ 100,00
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            2 vendas aguardando prazo
          </p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card/70 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Total já recebido
          </p>
          <p className="mt-1 font-display text-2xl font-extrabold tracking-tight">
            R$ 150,00
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Pago via Pix automático
          </p>
        </div>
      </div>

      {/* Solicitar saque / Chave Pix */}
      <section className="rounded-3xl border border-black/[0.06] bg-card/85 p-5 shadow-2xs sm:p-6 dark:border-white/[0.08]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold tracking-tight">
              Chave Pix de recebimento
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Os repasses aprovados caem diretamente na chave Pix cadastrada
              abaixo.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setRequestedPayout(true)}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-xs transition-transform active:scale-95 cursor-pointer"
          >
            <Wallet size={15} />
            {requestedPayout ? "Saque solicitado!" : "Solicitar saque (R$ 50,00)"}
          </button>
        </div>

        <form
          className="mt-4 grid gap-3 sm:grid-cols-[10rem_1fr_auto]"
          onSubmit={(e) => {
            e.preventDefault();
            setSavedPix(true);
            setTimeout(() => setSavedPix(false), 2000);
          }}
        >
          <select
            value={pixType}
            onChange={(e) => setPixType(e.target.value)}
            className={`${INPUT_CLASS} cursor-pointer`}
          >
            <option value="cpf">CPF</option>
            <option value="cnpj">CNPJ</option>
            <option value="email">E-mail</option>
            <option value="phone">Telefone</option>
            <option value="random">Chave aleatória</option>
          </select>
          <input
            required
            value={pixKey}
            onChange={(e) => setPixKey(e.target.value)}
            placeholder="Informe sua chave Pix"
            className={INPUT_CLASS}
          />
          <button
            type="submit"
            className="h-11 rounded-xl border border-border bg-background px-5 text-xs font-semibold hover:bg-muted cursor-pointer"
          >
            {savedPix ? "Salvo!" : "Salvar chave"}
          </button>
        </form>
      </section>

      {/* Histórico de repasses */}
      <section className="rounded-3xl border border-black/[0.06] bg-card/85 p-5 shadow-2xs sm:p-6 dark:border-white/[0.08]">
        <h2 className="font-display text-lg font-bold tracking-tight">
          Histórico de repasses
        </h2>
        <ul className="mt-3 divide-y divide-border/60">
          {payouts.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
            >
              <div>
                <p className="font-medium">{p.desc}</p>
                <p className="text-xs text-muted-foreground">{p.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${p.tone}`}
                >
                  {p.status}
                </span>
                <span className="font-mono font-bold tabular-nums">
                  {p.amount}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
