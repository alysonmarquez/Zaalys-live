"use client";

import React, { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";

const INPUT_CLASS =
  "h-11 w-full rounded-xl border border-black/[0.06] bg-background/50 px-3.5 text-[15px] outline-none transition-[background-color,border-color,box-shadow] placeholder:text-muted-foreground focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring/40 dark:border-white/[0.08] dark:bg-input/20";

function CopyBox({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background/60 p-3">
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="mt-0.5 truncate font-mono text-sm font-semibold">
          {value}
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-border bg-card px-3 text-xs font-semibold hover:bg-muted cursor-pointer"
      >
        {copied ? <Check size={14} className="text-primary" /> : <Copy size={14} />}
        {copied ? "Copiado" : "Copiar"}
      </button>
    </div>
  );
}

export default function IndiquePage() {
  const [handle, setHandle] = useState("CRIADOR30");
  const [pixType, setPixType] = useState("cpf");
  const [pixKey, setPixKey] = useState("");
  const [pixSaved, setPixSaved] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then(({ user }) => {
        if (user?.handle) setHandle(user.handle.toUpperCase().replace(/[^A-Z0-9]/g, "") + "30");
      })
      .catch(() => {});
  }, []);

  const shareUrl = `https://zaalys.com/convite/${handle}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    `Eu uso a Zaalys para rodar minha live automática e criar vídeos com IA no TikTok Shop. Com o meu cupom ${handle} você ganha R$ 30,00 de desconto no acesso vitalício: ${shareUrl}`
  )}`;

  const steps = [
    ["Compartilhe", "Mande o link ou diga o cupom na sua live."],
    ["Seu amigo compra", "O vitalício sai R$ 30,00 mais barato com o cupom."],
    ["Você recebe", "R$ 50,00 no Pix, 7 dias depois da compra dele."],
  ];

  const stats = [
    ["No prazo", "R$ 100,00"],
    ["A receber", "R$ 50,00"],
    ["Recebido", "R$ 150,00"],
  ];

  const rewards = [
    {
      id: "r1",
      email: "mar***@gmail.com",
      date: "20 out 2026",
      amount: "R$ 50,00",
      status: "A receber",
      tone: "bg-amber-500/12 text-amber-600 dark:text-amber-400",
    },
    {
      id: "r2",
      email: "luc***@hotmail.com",
      date: "14 out 2026",
      amount: "R$ 50,00",
      status: "Pago no Pix",
      tone: "bg-primary/15 text-primary",
    },
    {
      id: "r3",
      email: "cam***@gmail.com",
      date: "08 out 2026",
      amount: "R$ 50,00",
      status: "Pago no Pix",
      tone: "bg-primary/15 text-primary",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <header>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          Indique e ganhe
        </h1>
        <p className="mt-1 text-pretty text-muted-foreground">
          Seu amigo ganha R$ 30,00 de desconto no acesso vitalício com o seu
          cupom. Quando o prazo de reembolso dele acaba, você recebe R$ 50,00
          por Pix.
        </p>
      </header>

      {/* Main Share Card */}
      <section className="space-y-4 rounded-3xl border border-black/[0.06] bg-card/85 p-5 shadow-2xs sm:p-6 dark:border-white/[0.08]">
        <CopyBox label="Seu cupom" value={handle} />
        <CopyBox label="Seu link" value={shareUrl} />
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 w-full items-center justify-center rounded-2xl bg-primary text-[15px] font-semibold text-primary-foreground transition-transform active:scale-[0.97]"
        >
          Enviar pelo WhatsApp
        </a>

        <ol className="grid gap-3 pt-2 text-sm sm:grid-cols-3">
          {steps.map(([title, desc], idx) => (
            <li
              key={title}
              className="rounded-2xl border border-border/60 bg-background/40 p-3.5"
            >
              <div className="flex items-center gap-2 font-semibold">
                <span className="grid size-5 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                  {idx + 1}
                </span>
                <span>{title}</span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {desc}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* 3 Totals */}
      <section className="grid grid-cols-3 gap-3">
        {stats.map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-black/[0.06] bg-card/85 p-4 text-center shadow-2xs dark:border-white/[0.08]"
          >
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {label}
            </div>
            <div className="mt-1 font-display text-lg font-extrabold tracking-tight sm:text-xl">
              {value}
            </div>
          </div>
        ))}
      </section>

      {/* Onde você recebe */}
      <section className="rounded-3xl border border-black/[0.06] bg-card/85 p-5 shadow-2xs sm:p-6 dark:border-white/[0.08]">
        <h2 className="font-semibold">Onde você recebe</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pagamos o valor de cada indicação nesta chave Pix.
        </p>
        <form
          className="mt-4 grid gap-3 sm:grid-cols-[10rem_1fr_auto]"
          onSubmit={(e) => {
            e.preventDefault();
            setPixSaved(true);
            setTimeout(() => setPixSaved(false), 2000);
          }}
        >
          <select
            value={pixType}
            onChange={(e) => setPixType(e.target.value)}
            aria-label="Tipo de chave"
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
            placeholder="Sua chave Pix"
            aria-label="Chave Pix"
            className={INPUT_CLASS}
          />
          <button
            type="submit"
            className="h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-xs transition-transform active:scale-95 cursor-pointer"
          >
            {pixSaved ? "Salvo!" : "Salvar"}
          </button>
        </form>
      </section>

      {/* Suas indicações */}
      <section>
        <h2 className="font-semibold">Suas indicações</h2>
        <ul className="mt-3 divide-y divide-border/60 rounded-2xl border border-border/60 bg-card/70">
          {rewards.map((r) => (
            <li
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
            >
              <div>
                <p className="font-medium">{r.email}</p>
                <p className="text-xs text-muted-foreground">{r.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${r.tone}`}
                >
                  {r.status}
                </span>
                <span className="font-mono font-bold tabular-nums">
                  {r.amount}
                </span>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          Vale para compras do acesso vitalício com o seu cupom. Compras feitas
          com o seu próprio e-mail não contam. Se o amigo pedir reembolso, a
          indicação é cancelada.
        </p>
      </section>
    </div>
  );
}
