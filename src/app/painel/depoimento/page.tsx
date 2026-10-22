"use client";

import React, { useEffect, useState } from "react";
import { Check } from "lucide-react";

const INPUT_CLASS =
  "w-full rounded-xl border border-black/[0.06] bg-background/50 px-3.5 text-[15px] outline-none transition-[background-color,border-color,box-shadow] placeholder:text-muted-foreground focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring/40 dark:border-white/[0.08] dark:bg-input/20";

export default function DepoimentoPage() {
  const [quote, setQuote] = useState("");
  const [result, setResult] = useState("");
  const [displayName, setDisplayName] = useState("Criador Zaalys");
  const [handle, setHandle] = useState("@criador");
  const [consent, setConsent] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("zaalys_current_user");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.name) setDisplayName(parsed.name);
        if (parsed?.handle) setHandle(`@${parsed.handle}`);
      }
    } catch {}
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (quote.trim().length < 20) return;
    setSubmitted(true);
  }

  return (
    <div className="mx-auto w-full max-w-xl space-y-6">
      <header>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          Deixar um depoimento
        </h1>
        <p className="mt-1 text-pretty text-muted-foreground">
          Quem está decidindo se entra na Zaalys lê o que outros afiliados
          escreveram. Escreva do seu jeito, em uma ou duas frases.
        </p>
      </header>

      {submitted && (
        <div className="flex items-start gap-3 rounded-2xl border border-primary/25 bg-primary/[0.06] p-4 text-sm">
          <Check size={18} className="mt-0.5 shrink-0 text-primary" />
          <p>
            Recebemos seu depoimento! Obrigado por compartilhar como a Zaalys
            ajuda no seu dia a dia.
          </p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-3xl border border-black/[0.06] bg-card/85 p-5 shadow-2xs sm:p-6 dark:border-white/[0.08]"
      >
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">
            O que a Zaalys mudou no seu trabalho?
          </span>
          <textarea
            required
            minLength={20}
            maxLength={600}
            rows={4}
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            placeholder="Ex.: Eu travava para escolher produto e escrever roteiro. Agora escolho pela comissão e saio com o prompt pronto."
            className={`${INPUT_CLASS} resize-y py-3 leading-relaxed`}
          />
          <span className="block text-right text-xs tabular-nums text-muted-foreground">
            {quote.length}/600 (mínimo 20 caracteres)
          </span>
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">
            Resultado ou conquista (opcional)
          </span>
          <input
            value={result}
            onChange={(e) => setResult(e.target.value)}
            placeholder="Ex.: Primeira live rodando 3h sozinha / 14 vendas na semana"
            className={`${INPUT_CLASS} h-11`}
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Como mostrar seu nome</span>
            <input
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className={`${INPUT_CLASS} h-11`}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">@ do TikTok (opcional)</span>
            <input
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="@sua.loja"
              className={`${INPUT_CLASS} h-11`}
            />
          </label>
        </div>

        <label className="flex items-start gap-2.5 text-xs leading-relaxed text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 size-4 rounded accent-primary"
          />
          <span>
            Autorizo exibir meu depoimento, nome e @ na página inicial da Zaalys.
          </span>
        </label>

        <button
          type="submit"
          className="h-11 w-full rounded-2xl bg-primary text-sm font-semibold text-primary-foreground shadow-xs transition-transform active:scale-[0.98] cursor-pointer"
        >
          Enviar depoimento
        </button>
      </form>
    </div>
  );
}
