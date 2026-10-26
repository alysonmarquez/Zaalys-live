"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Check, Copy, Gift, ImagePlus, LockOpen, Percent, Sparkles, X } from "lucide-react";

// Acesso Creator (como no original): 1) "Sua condição especial"; 2) valores + quantos usos; 3) link pronto.
// Os usos (1 a 10) entram no código do link; o link leva às ofertas com desconto (/convite/[code]).

const BENEFITS = [
  { icon: Percent, strong: "Até 50% de desconto", rest: " ao comprar." },
  { icon: LockOpen, strong: "Todas as funcionalidades", rest: " da ferramenta desbloqueadas" },
  { icon: ImagePlus, strong: "Gerações ilimitadas", rest: "" },
];

export function CreatorModal({ handle, onClose }: { handle: string; onClose: () => void }) {
  const [step, setStep] = useState<"offer" | "prices" | "link">("offer");
  const [uses, setUses] = useState(1);
  const [copied, setCopied] = useState(false);

  const slug = handle.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 20) || "vip";
  // Código fixo da conta (o que identifica o afiliado na venda); enquanto carrega, o @.
  const [code, setCode] = useState<string | null>(null);
  useEffect(() => {
    fetch("/api/conta/convite")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { code?: string } | null) => d?.code && setCode(d.code))
      .catch(() => {});
  }, []);
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://mediaflowmz.com";
  const link = `${base}/convite/creator-${code ?? slug}-${uses}x`;
  const usesLabel = `${uses} ${uses === 1 ? "uso" : "usos"}`;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-xs" onClick={onClose}>
      <div
        className="relative max-h-[85svh] w-full max-w-md overflow-y-auto rounded-[28px] border border-black/[0.08] bg-card p-6 text-card-foreground shadow-2xl dark:border-white/[0.1]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Fechar"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 grid size-9 place-items-center rounded-full bg-muted/60 text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <X size={18} />
        </button>

        {step === "offer" && (
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-primary">
              <Sparkles size={14} /> Acesso Creator
            </span>
            <h2 className="mt-4 font-display text-[28px] font-extrabold leading-tight tracking-tight">
              <span className="text-primary">Sua</span> condição especial
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
              Seu reconhecimento como Creator permite liberar uma condição exclusiva para sua audiência.
            </p>

            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-border/70 bg-muted/30 p-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/15 font-bold text-primary">
                {slug.charAt(0).toUpperCase()}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">@{slug}</span>
                <span className="block truncate text-sm text-muted-foreground">Creator reconhecido</span>
              </span>
              <span className="shrink-0 rounded-full bg-primary/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-primary">
                Reconhecido
              </span>
            </div>

            <p className="mt-6 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">O que o convidado recebe</p>
            <ul className="mt-3 space-y-2.5">
              {BENEFITS.map(({ icon: Icon, strong, rest }) => (
                <li key={strong} className="flex items-center gap-3 rounded-2xl border border-border/70 bg-muted/20 p-3.5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary">
                    <Icon size={20} />
                  </span>
                  <span className="text-[15px]">
                    <strong className="font-semibold">{strong}</strong>
                    <span className="text-muted-foreground">{rest}</span>
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-3 rounded-2xl border border-border/70 bg-muted/20 p-4">
              <p className="flex items-center gap-2 font-semibold">
                <Gift size={18} className="text-primary" /> Link presente
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                Cada link dá ao seu amigo acesso à ferramenta completa + até 50% de desconto. Gere o link abaixo.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setStep("prices")}
              className="mt-5 inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-primary text-base font-semibold text-primary-foreground shadow-xs transition-transform active:scale-[0.98] cursor-pointer"
            >
              <Gift size={18} /> Gerar link
            </button>
          </div>
        )}

        {step === "prices" && (
          <div>
            <button
              type="button"
              onClick={() => setStep("offer")}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <ArrowLeft size={16} /> Voltar
            </button>

            <div className="mt-4 rounded-2xl border border-border/70 bg-muted/20 p-4 pr-12">
              <p className="flex items-center gap-2 font-semibold">
                <Gift size={18} className="text-primary" /> Condição do convidado
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Desconto e benefícios automáticos no checkout.</p>
            </div>

            <div className="mt-3 rounded-2xl border border-border/70 bg-muted/20 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Mensal</p>
              <p className="mt-1 font-mono text-base text-muted-foreground line-through decoration-primary">R$ 340,00</p>
              <p className="font-mono text-[32px] font-bold leading-tight">
                R$ 170,00<span className="text-base font-normal text-muted-foreground">/mês</span>
              </p>
              <p className="mt-3 flex items-center gap-2 border-t border-border/70 pt-3 font-mono text-sm text-primary">
                <Check size={16} /> Economia de R$ 170,00
              </p>
            </div>

            <div className="relative mt-3 rounded-2xl border border-primary/50 bg-primary/[0.06] p-5">
              <span className="absolute right-4 top-4 rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em] text-primary-foreground">
                Mais popular
              </span>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Vitalício</p>
              <p className="mt-1 font-mono text-base text-muted-foreground line-through decoration-primary">R$ 594,00</p>
              <p className="font-mono text-[32px] font-bold leading-tight">
                <span className="text-lg font-normal">12x</span> R$ 31,65
              </p>
              <p className="font-mono text-sm text-muted-foreground">ou R$ 297,00 pagamento único</p>
              <p className="mt-3 flex items-center gap-2 border-t border-primary/30 pt-3 font-mono text-sm text-primary">
                <Check size={16} /> Economia de R$ 297,00
              </p>
            </div>

            <div className="mt-3 rounded-2xl border border-border/70 bg-muted/20 p-5">
              <p className="flex items-center gap-2 font-semibold">
                <Gift size={18} className="text-primary" /> Link de convite
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                Escolha quantos usos liberar (até 10 no total) e confirme. O link já sai com o desconto aplicado.
              </p>
              <div className="mt-5 flex items-center justify-between">
                <span className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Quantos usos?</span>
                <span className="rounded-full bg-primary/15 px-3 py-1 font-mono text-xs font-bold uppercase text-primary">{usesLabel}</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={uses}
                onChange={(e) => setUses(Number(e.target.value))}
                aria-label="Quantos usos"
                className="mt-4 w-full accent-primary cursor-pointer"
              />
              <div className="mt-1 flex justify-between font-mono text-xs text-muted-foreground">
                <span>1</span>
                <span>10</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep("link")}
              className="mt-5 inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-primary text-base font-semibold text-primary-foreground shadow-xs transition-transform active:scale-[0.98] cursor-pointer"
            >
              <Gift size={18} /> Gerar {usesLabel}
            </button>
            <p className="mt-3 text-center font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Promoção por tempo limitado
            </p>
          </div>
        )}

        {step === "link" && (
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-primary">
              <Check size={14} /> Link gerado · {usesLabel}
            </span>
            <h2 className="mt-4 font-display text-2xl font-extrabold tracking-tight">Seu link presente está pronto</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Envie para o seu convidado. Ele abre o checkout já com o desconto aplicado.
            </p>
            <div className="mt-5 flex items-center gap-2 rounded-2xl border border-border bg-background p-2 pl-3">
              <code className="min-w-0 flex-1 truncate font-mono text-xs">{link}</code>
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard.writeText(link);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground cursor-pointer"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copiado" : "Copiar"}
              </button>
            </div>
            <div className="mt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setStep("prices")}
                className="text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Gerar outro
              </button>
              <button type="button" onClick={onClose} className="text-sm font-semibold text-primary cursor-pointer">
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
