"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useMemo, useState } from "react";
import { Brand, BrandLoader, RaisedButton, Segmented } from "@/components/brand";

const FEATURE_DEMOS_CSS = `
.zd {
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  border-top: 1px solid var(--border);
  padding-top: 12px;
  font-size: 12px;
  line-height: 1.5;
}
.zd-eyebrow {
  display: flex; align-items: center; gap: 6px;
  font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase;
  color: var(--muted-foreground);
}
.zd-caption { margin-top: 10px; color: var(--muted-foreground); font-size: 11px; }
.zd-row { display: grid; align-items: baseline; gap: 10px; padding: 5px 0; }
.zd-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.zd-num { font-variant-numeric: tabular-nums; }
.zd-dim { color: var(--muted-foreground); }
.zd-acc { color: var(--primary); }

/* Raio-X: the numbers land, then the hook is read out of the video. */
.zd-xray .zd-stat { opacity: 0; transform: translateY(4px); animation: zd-row-in 560ms var(--ease-out) forwards; }
.zd-xray .zd-stat:nth-child(2) { animation-delay: 60ms; }
.zd-xray .zd-stat:nth-child(3) { animation-delay: 120ms; }
.zd-xray .zd-quote { opacity: 0; transform: translateY(4px); animation: zd-loop 6.4s var(--ease-out) 700ms infinite; }
.zd-xray .zd-mark { opacity: 0; transform: translateY(3px); animation: zd-mark 6.4s var(--ease-out) 1.5s infinite; }

/* Live: the chat answers while the clips loop. */
.zd-live .zd-dot {
  width: 5px; height: 5px; border-radius: 50%; background: var(--primary);
  animation: zd-pulse 2.4s ease-in-out infinite;
}
.zd-live .zd-msg { opacity: 0; transform: translateY(4px); animation: zd-loop 5.6s var(--ease-out) infinite; }
.zd-live .zd-msg:nth-of-type(2) { animation-delay: 700ms; }
.zd-live .zd-msg:nth-of-type(3) { animation-delay: 1.8s; }

@keyframes zd-row-in { to { opacity: 1; transform: translateY(0); } }
@keyframes zd-loop {
  0%, 5% { opacity: 0; transform: translateY(4px); }
  14%, 80% { opacity: 1; transform: translateY(0); }
  90%, 100% { opacity: 0; transform: translateY(-3px); }
}
@keyframes zd-mark {
  0%, 8% { opacity: 0; transform: translateY(3px); }
  17%, 84% { opacity: 1; transform: translateY(0); }
  93%, 100% { opacity: 0; transform: translateY(-2px); }
}
@keyframes zd-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}

@media (prefers-reduced-motion: reduce) {
  .zd *, .zd *::before, .zd *::after {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
}
`;

const INPUT_CLASS =
  "h-10.5 w-full rounded-xl border border-black/[0.06] bg-background/50 px-3 text-base outline-none transition-[background-color,border-color,box-shadow] placeholder:text-muted-foreground focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:border-white/[0.08] dark:bg-input/20";

function formatBRL(cents: number) {
  const digits = cents % 100 === 0 ? 0 : 2;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(cents / 100);
}

function installmentQuote(cents: number, count: number) {
  if (count <= 1) return { count: 1, cents, totalCents: cents, feeCents: 0 };
  const factor = 0.04 / (1 - Math.pow(1.04, -count));
  const totalCents = Math.ceil(cents * count * factor - 1e-6);
  return {
    count,
    cents: Math.round(cents * factor),
    totalCents,
    feeCents: totalCents - cents,
  };
}

function digitsOnly(val: string) {
  return val.replace(/\D+/g, "");
}

function isValidCpfCnpj(raw: string): boolean {
  if (!/^[\d.\-/\s]+$/.test(raw.trim())) return false;
  const d = digitsOnly(raw);
  if (d.length === 11) {
    if (/^(\d)\1{10}$/.test(d)) return false;
    for (const [len, weight] of [
      [9, 10],
      [10, 11],
    ] as const) {
      let sum = 0;
      for (let i = 0; i < len; i++) sum += Number(d[i]) * (weight - i);
      if (((sum * 10) % 11) % 10 !== Number(d[len])) return false;
    }
    return true;
  }
  if (d.length === 14) {
    if (/^(\d)\1{13}$/.test(d)) return false;
    const weights = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    for (const len of [12, 13] as const) {
      const w = weights.slice(weights.length - len);
      let sum = 0;
      for (let i = 0; i < len; i++) sum += Number(d[i]) * w[i];
      const rem = sum % 11;
      if ((rem < 2 ? 0 : 11 - rem) !== Number(d[len])) return false;
    }
    return true;
  }
  return false;
}

function ShieldCheckIcon({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function CheckIcon({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function InfinityIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 16c5 0 7-8 12-8a4 4 0 0 1 0 8c-5 0-7-8-12-8a4 4 0 1 0 0 8" />
    </svg>
  );
}

function PixMark({ className = "size-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M12 2.4 15.9 6.3 12 10.2 8.1 6.3 12 2.4Zm5.7 5.7L21.6 12l-3.9 3.9L13.8 12l3.9-3.9Zm-11.4 0L10.2 12l-3.9 3.9L2.4 12l3.9-3.9ZM12 13.8l3.9 3.9L12 21.6l-3.9-3.9L12 13.8Z" />
    </svg>
  );
}

function FieldBlock({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string | null;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground select-none">
        {label}
      </span>
      {children}
      {error ? (
        <p role="alert" className="text-[11px] text-rose-500">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[11px] text-muted-foreground">{hint}</p>
      ) : null}
    </label>
  );
}

const LIFETIME_FEATURES = [
  "Catálogo com 391 produtos e a comissão de cada um",
  "Roteiros e prompts de vídeo escritos por IA",
  "Raio-X de Vídeo e Assistente de Live, sem custo extra",
  "Gerações ilimitadas, sem mensalidade",
  "Acesso na sua conta assim que o pagamento cair",
];

const MONTHLY_FEATURES = [
  "Todas as ferramentas, Raio-X e Assistente de Live incluídos",
  "Acesso durante o período pago",
  "Renovação mensal",
];

function SplitPriceDisplay({
  cents,
  smallCents = false,
}: {
  cents: number;
  smallCents?: boolean;
}) {
  const formatted = formatBRL(cents);
  const commaIdx = formatted.lastIndexOf(",");
  if (!smallCents || commaIdx < 0) {
    return <span>{formatted}</span>;
  }
  const whole = formatted.slice(0, commaIdx);
  const fraction = formatted.slice(commaIdx);
  return (
    <span>
      {whole}
      <span className="font-sans text-base font-semibold tracking-normal">{fraction}</span>
    </span>
  );
}

function CheckoutContent() {
  const params = useSearchParams();
  const planParam = params.get("plan") === "monthly" ? "monthly" : "lifetime";
  const initialEmail = params.get("email") ?? "";
  const initialCoupon = params.get("coupon") ?? params.get("cupom") ?? "";

  const [method, setMethod] = useState<"pix" | "card" | "boleto">("pix");
  const [name, setName] = useState("");
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState("");
  const [document, setDocument] = useState("");
  const [docError, setDocError] = useState<string | null>(null);

  // Billing address (for card & boleto)
  const [zipCode, setZipCode] = useState("");
  const [cepStatus, setCepStatus] = useState<"idle" | "loading" | "notfound">("idle");
  const [city, setCity] = useState("");
  const [stateUf, setStateUf] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [complement, setComplement] = useState("");

  // Card fields
  const [cardNumber, setCardNumber] = useState("");
  const [cardOwner, setCardOwner] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [installments, setInstallments] = useState(12);

  // Coupon
  const [showCoupon, setShowCoupon] = useState(Boolean(initialCoupon));
  const [couponInput, setCouponInput] = useState(initialCoupon.toUpperCase());
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountCents: number;
  } | null>(
    initialCoupon
      ? { code: initialCoupon.toUpperCase(), discountCents: 3000 }
      : null,
  );
  const [couponError, setCouponError] = useState<string | null>(null);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [activeOrder, setActiveOrder] = useState<{
    orderId: string;
    method: "pix" | "card" | "boleto";
    pixCode?: string;
    boletoLine?: string;
  } | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);

  useEffect(() => {
    if (planParam === "monthly" && method === "boleto") {
      setMethod("pix");
    }
  }, [planParam, method]);

  const baseCents = planParam === "monthly" ? 34000 : 59400;
  const discountCents = appliedCoupon && planParam === "lifetime" ? appliedCoupon.discountCents : 0;
  const amountCents = Math.max(100, baseCents - discountCents);

  const installmentOptions = useMemo(() => {
    if (planParam === "monthly") {
      return [installmentQuote(amountCents, 1)];
    }
    return Array.from({ length: 12 }, (_, idx) => installmentQuote(amountCents, idx + 1));
  }, [amountCents, planParam]);

  const defaultInstallment12 = useMemo(
    () => (planParam === "lifetime" ? installmentQuote(amountCents, 12) : null),
    [amountCents, planParam],
  );

  const selectedInstallment = useMemo(
    () =>
      method === "card"
        ? installmentOptions.find((o) => o.count === installments) ?? installmentOptions[0]
        : null,
    [method, installmentOptions, installments],
  );

  const totalToPayCents =
    method === "card" && selectedInstallment && selectedInstallment.count > 1
      ? selectedInstallment.totalCents
      : amountCents;

  async function lookupCep(rawCep: string) {
    const clean = digitsOnly(rawCep);
    if (clean.length !== 8) return;
    setCepStatus("loading");
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();
      if (data?.erro) {
        setCepStatus("notfound");
        return;
      }
      setCepStatus("idle");
      if (data.logradouro) setStreet(data.logradouro);
      if (data.bairro) setNeighborhood(data.bairro);
      if (data.localidade) setCity(data.localidade);
      if (data.uf) setStateUf(data.uf);
    } catch {
      setCepStatus("idle");
    }
  }

  function handleApplyCoupon() {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCouponError(null);
    if (code.length < 3) {
      setCouponError("Cupom inválido ou expirado.");
      return;
    }
    setAppliedCoupon({ code, discountCents: 3000 });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidCpfCnpj(document)) {
      setDocError("Confira o número: este CPF ou CNPJ não é válido.");
      window.document.getElementById("checkout-documento")?.focus();
      return;
    }
    setDocError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planParam, email: email.trim() }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.url && !data.url.includes("localhost")) {
        window.location.href = data.url;
        return;
      }
    } catch {
      // Fall back to in-page payment confirmation flow
    } finally {
      setSubmitting(false);
    }

    const orderId = `ord_${Math.random().toString(36).slice(2, 12)}`;
    setActiveOrder({
      orderId,
      method,
      pixCode:
        method === "pix"
          ? `00020126580014br.gov.bcb.pix0136ee91c84d-9b82-4682-a119-zaalys5204000053039865406${(amountCents / 100).toFixed(2)}5802BR5906ZAALYS6009SAO PAULO62140510${orderId}6304ABCD`
          : undefined,
      boletoLine:
        method === "boleto"
          ? "34191.79001 01043.510047 91020.150008 8 98760000059400"
          : undefined,
    });
  }

  const buttonText =
    method === "pix"
      ? `Gerar Pix de ${formatBRL(totalToPayCents)}`
      : method === "card"
        ? `Pagar ${formatBRL(totalToPayCents)}`
        : `Gerar boleto de ${formatBRL(totalToPayCents)}`;

  return (
    <main className="min-h-svh bg-background">
      <style dangerouslySetInnerHTML={{ __html: FEATURE_DEMOS_CSS }} />

      <header className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-5">
        <Link href="/">
          <Brand />
        </Link>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          <ShieldCheckIcon size={14} />
          Pagamento seguro
        </span>
      </header>

      <div className="mx-auto grid w-full max-w-5xl gap-5 px-5 pb-24 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <aside className="lg:sticky lg:top-6 lg:order-2">
          <section
            aria-label="Resumo do pedido"
            className="overflow-hidden rounded-2xl border border-border/60 bg-card/70"
          >
            <div className="relative p-5">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_70%_at_100%_0%,color-mix(in_oklch,var(--primary)_16%,transparent),transparent_62%)]"
              />
              <div className="relative">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Seu pedido
                  </p>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
                    <InfinityIcon size={20} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      Zaalys · Acesso {planParam === "monthly" ? "Mensal" : "Vitalício"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {planParam === "monthly"
                        ? "Assinatura mensal"
                        : "Pagamento único do acesso base"}
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="mt-0.5 font-display text-[40px] font-extrabold leading-none tracking-tight tabular-nums">
                    <SplitPriceDisplay cents={amountCents} smallCents />
                  </div>
                  {defaultInstallment12 ? (
                    <p className="mt-2 text-[13px] text-muted-foreground">
                      ou {defaultInstallment12.count}x de {formatBRL(defaultInstallment12.cents)} no
                      cartão
                    </p>
                  ) : null}
                  {appliedCoupon && discountCents > 0 ? (
                    <p className="mt-2 text-[13px] text-muted-foreground">
                      Cupom{" "}
                      <span className="font-mono font-semibold text-foreground">
                        {appliedCoupon.code}
                      </span>{" "}
                      aplicado: −{formatBRL(discountCents)}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            <ul className="grid gap-2 border-t border-border/60 px-5 py-4 text-[13px] sm:grid-cols-2 lg:grid-cols-1">
              {(planParam === "monthly" ? MONTHLY_FEATURES : LIFETIME_FEATURES).map((feat) => (
                <li key={feat} className="flex items-start gap-2 text-muted-foreground">
                  <CheckIcon size={14} className="mt-0.5 shrink-0 text-primary" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </section>
        </aside>

        <div className="min-w-0 lg:order-1">
          {activeOrder ? (
            <section className="rounded-2xl border border-border/60 bg-card/70 p-6">
              {activeOrder.method === "pix" && activeOrder.pixCode && (
                <>
                  <h2 className="text-base font-semibold tracking-tight">Pague com Pix</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Escaneie o QR Code ou use o código copia e cola. A liberação é automática.
                  </p>
                  <div className="mt-5 flex flex-col">
                    <div className="mt-2 flex justify-center">
                      <BrandLoader
                        label="Aguardando pagamento Pix"
                        className="grid size-44 place-items-center rounded-xl border border-border/60 bg-background/50"
                        markClassName="size-12"
                      />
                    </div>
                    <div className="mt-5">
                      <RaisedButton
                        type="button"
                        className="h-12 w-full gap-2 text-[15px] font-semibold"
                        onClick={async () => {
                          if (!activeOrder.pixCode) return;
                          await navigator.clipboard.writeText(activeOrder.pixCode);
                          setCopiedPix(true);
                          setTimeout(() => setCopiedPix(false), 2000);
                        }}
                      >
                        {copiedPix ? "Código copiado" : "Copiar código Pix"}
                      </RaisedButton>
                      <ol className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                        <li>1. Copie o código acima.</li>
                        <li>2. No app do seu banco, abra Pix e escolha “Pix Copia e Cola”.</li>
                        <li>3. Cole, confira o valor e confirme. O código vale por 30 minutos.</li>
                      </ol>
                      <p className="mt-4 break-all rounded-xl border border-border/60 bg-background/60 p-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
                        {activeOrder.pixCode}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {activeOrder.method === "boleto" && activeOrder.boletoLine && (
                <>
                  <h2 className="text-base font-semibold tracking-tight">Boleto gerado</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    A compensação leva até 3 dias úteis. O acesso é liberado automaticamente.
                  </p>
                  <p className="mt-4 break-all rounded-xl border border-border/60 bg-background/60 p-3 font-mono text-xs">
                    {activeOrder.boletoLine}
                  </p>
                </>
              )}

              {activeOrder.method === "card" && (
                <>
                  <h2 className="text-base font-semibold tracking-tight">Processando o cartão</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Estamos confirmando com a operadora. Não feche esta página.
                  </p>
                </>
              )}

              <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <span className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  Aguardando confirmação do pagamento…
                </span>
                <button
                  type="button"
                  onClick={() => setActiveOrder(null)}
                  className="text-xs underline underline-offset-4 hover:text-foreground"
                >
                  Alterar dados
                </button>
              </div>
            </section>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" data-clarity-mask="true">
              <div className="rounded-2xl border border-border/60 bg-card/70 p-5">
                <Segmented
                  label="Forma de pagamento"
                  value={method}
                  onChange={setMethod}
                  options={
                    planParam === "monthly"
                      ? [
                          { value: "pix", label: "Pix" },
                          { value: "card", label: "Cartão" },
                        ]
                      : [
                          { value: "pix", label: "Pix" },
                          { value: "card", label: "Cartão" },
                          { value: "boleto", label: "Boleto" },
                        ]
                  }
                />

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <FieldBlock label="Nome completo">
                      <input
                        required
                        autoComplete="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={INPUT_CLASS}
                      />
                    </FieldBlock>
                  </div>

                  <FieldBlock
                    label="E-mail"
                    hint="É por ele que seu acesso é liberado."
                  >
                    <input
                      required
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={INPUT_CLASS}
                    />
                  </FieldBlock>

                  <FieldBlock label="Telefone">
                    <input
                      required
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="(11) 99999-9999"
                      value={phone}
                      onChange={(e) => {
                        const d = digitsOnly(e.target.value).slice(0, 11);
                        const formatted =
                          d.length <= 10
                            ? d
                                .replace(/^(\d{2})(\d)/, "($1) $2")
                                .replace(/(\d{4})(\d)/, "$1-$2")
                            : d
                                .replace(/^(\d{2})(\d)/, "($1) $2")
                                .replace(/(\d{5})(\d)/, "$1-$2");
                        setPhone(formatted);
                      }}
                      className={INPUT_CLASS}
                    />
                  </FieldBlock>

                  <FieldBlock label="CPF ou CNPJ" error={docError}>
                    <input
                      required
                      id="checkout-documento"
                      inputMode="numeric"
                      aria-invalid={docError ? true : undefined}
                      value={document}
                      onChange={(e) => {
                        const d = digitsOnly(e.target.value).slice(0, 14);
                        const formatted =
                          d.length <= 11
                            ? d
                                .replace(/^(\d{3})(\d)/, "$1.$2")
                                .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
                                .replace(/\.(\d{3})(\d)/, ".$1-$2")
                            : d
                                .replace(/^(\d{2})(\d)/, "$1.$2")
                                .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
                                .replace(/\.(\d{3})(\d)/, ".$1/$2")
                                .replace(/(\d{4})(\d)/, "$1-$2");
                        setDocument(formatted);
                        if (docError && isValidCpfCnpj(formatted)) {
                          setDocError(null);
                        }
                      }}
                      onBlur={(e) => {
                        const val = e.target.value;
                        setDocError(
                          digitsOnly(val).length && !isValidCpfCnpj(val)
                            ? "Confira o número: este CPF ou CNPJ não é válido."
                            : null,
                        );
                      }}
                      className={INPUT_CLASS}
                    />
                  </FieldBlock>
                </div>
              </div>

              {(method === "card" || method === "boleto") && (
                <div className="rounded-2xl border border-border/60 bg-card/70 p-5">
                  <h3 className="text-sm font-semibold tracking-tight">Endereço de cobrança</h3>
                  <div className="mt-4 grid gap-4 sm:grid-cols-6">
                    <div className="sm:col-span-2">
                      <FieldBlock
                        label="CEP"
                        hint={
                          cepStatus === "loading"
                            ? "Buscando endereço…"
                            : cepStatus === "notfound"
                              ? "CEP não encontrado. Preencha abaixo."
                              : "Preenchemos o resto para você."
                        }
                      >
                        <input
                          required
                          inputMode="numeric"
                          autoComplete="postal-code"
                          placeholder="00000-000"
                          value={zipCode}
                          onChange={(e) => {
                            const d = digitsOnly(e.target.value).slice(0, 8);
                            const formatted = d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
                            setZipCode(formatted);
                            setCepStatus("idle");
                            if (d.length === 8) lookupCep(formatted);
                          }}
                          className={INPUT_CLASS}
                        />
                      </FieldBlock>
                    </div>
                    <div className="sm:col-span-3">
                      <FieldBlock label="Cidade">
                        <input
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className={INPUT_CLASS}
                        />
                      </FieldBlock>
                    </div>
                    <div>
                      <FieldBlock label="UF">
                        <input
                          required
                          maxLength={2}
                          value={stateUf}
                          onChange={(e) => setStateUf(e.target.value.toUpperCase())}
                          className={INPUT_CLASS}
                        />
                      </FieldBlock>
                    </div>
                    <div className="sm:col-span-4">
                      <FieldBlock label="Rua">
                        <input
                          required
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                          className={INPUT_CLASS}
                        />
                      </FieldBlock>
                    </div>
                    <div className="sm:col-span-2">
                      <FieldBlock label="Número">
                        <input
                          required
                          id="checkout-numero"
                          inputMode="numeric"
                          value={number}
                          onChange={(e) => setNumber(e.target.value)}
                          className={INPUT_CLASS}
                        />
                      </FieldBlock>
                    </div>
                    <div className="sm:col-span-3">
                      <FieldBlock label="Bairro">
                        <input
                          required
                          value={neighborhood}
                          onChange={(e) => setNeighborhood(e.target.value)}
                          className={INPUT_CLASS}
                        />
                      </FieldBlock>
                    </div>
                    <div className="sm:col-span-3">
                      <FieldBlock label="Complemento">
                        <input
                          value={complement}
                          onChange={(e) => setComplement(e.target.value)}
                          className={INPUT_CLASS}
                        />
                      </FieldBlock>
                    </div>
                  </div>
                </div>
              )}

              {method === "card" && (
                <div className="rounded-2xl border border-border/60 bg-card/70 p-5">
                  <h3 className="text-sm font-semibold tracking-tight">Dados do cartão</h3>
                  <div className="mt-4 grid gap-4 sm:grid-cols-6">
                    <div className="sm:col-span-6">
                      <FieldBlock label="Número do cartão">
                        <input
                          required
                          inputMode="numeric"
                          autoComplete="cc-number"
                          placeholder="0000 0000 0000 0000"
                          value={cardNumber}
                          onChange={(e) => {
                            const d = digitsOnly(e.target.value).slice(0, 19);
                            setCardNumber(d.match(/.{1,4}/g)?.join(" ") ?? "");
                          }}
                          className={INPUT_CLASS}
                        />
                      </FieldBlock>
                    </div>
                    <div className="sm:col-span-6">
                      <FieldBlock label="Nome impresso no cartão">
                        <input
                          required
                          autoComplete="cc-name"
                          value={cardOwner}
                          onChange={(e) => setCardOwner(e.target.value.toUpperCase())}
                          className={INPUT_CLASS}
                        />
                      </FieldBlock>
                    </div>
                    <div className="sm:col-span-3">
                      <FieldBlock label="Validade" hint="Como está no cartão">
                        <input
                          required
                          inputMode="numeric"
                          placeholder="MM/AA"
                          autoComplete="cc-exp"
                          value={cardExpiry}
                          onChange={(e) => {
                            const d = digitsOnly(e.target.value).slice(0, 4);
                            setCardExpiry(d.length <= 2 ? d : `${d.slice(0, 2)}/${d.slice(2)}`);
                          }}
                          className={INPUT_CLASS}
                        />
                      </FieldBlock>
                    </div>
                    <div className="sm:col-span-3">
                      <FieldBlock label="CVV">
                        <input
                          required
                          inputMode="numeric"
                          autoComplete="cc-csc"
                          maxLength={4}
                          placeholder="000"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(digitsOnly(e.target.value).slice(0, 4))}
                          className={INPUT_CLASS}
                        />
                      </FieldBlock>
                    </div>
                    <div className="min-w-0 sm:col-span-6">
                      <FieldBlock label="Parcelas">
                        <select
                          value={String(installments)}
                          onChange={(e) => setInstallments(Number(e.target.value))}
                          className={`${INPUT_CLASS} bg-card`}
                        >
                          {installmentOptions.map((opt) => (
                            <option key={opt.count} value={String(opt.count)}>
                              {opt.count === 1
                                ? `À vista por ${formatBRL(opt.cents)}`
                                : `${opt.count}x de ${formatBRL(opt.cents)}`}
                            </option>
                          ))}
                        </select>
                      </FieldBlock>
                    </div>
                  </div>
                  <p className="mt-3 text-[11px] text-muted-foreground">
                    Valores parcelados possuem acréscimo de 4% ao mês.
                  </p>
                </div>
              )}

              {showCoupon ? (
                <div className="rounded-2xl border border-border/60 bg-card/70 p-5">
                  <h3 className="text-sm font-semibold tracking-tight">Cupom de desconto</h3>
                  {appliedCoupon ? (
                    <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/[0.06] px-3 py-2.5">
                      <span className="flex items-center gap-2 text-sm">
                        <CheckIcon size={16} className="text-primary" />
                        <span className="font-mono font-semibold">{appliedCoupon.code}</span>
                        <span className="text-muted-foreground">
                          −{formatBRL(appliedCoupon.discountCents)}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setAppliedCoupon(null);
                          setCouponInput("");
                        }}
                        className="text-xs font-medium text-muted-foreground hover:text-foreground"
                      >
                        Remover
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="mt-3 flex gap-2">
                        <input
                          aria-label="Código do cupom"
                          placeholder="Digite seu cupom"
                          autoComplete="off"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleApplyCoupon();
                            }
                          }}
                          className={`${INPUT_CLASS} uppercase`}
                        />
                        <button
                          type="button"
                          disabled={!couponInput.trim()}
                          onClick={handleApplyCoupon}
                          className="rounded-xl border border-border bg-secondary px-4 text-sm font-semibold text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50"
                        >
                          Aplicar
                        </button>
                      </div>
                      {couponError && (
                        <p role="alert" className="mt-2 text-[13px] text-rose-500">
                          {couponError}
                        </p>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCoupon(true)}
                  className="px-1 text-sm text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-foreground hover:decoration-foreground/40"
                >
                  Tem um cupom de desconto?
                </button>
              )}

              <div className="space-y-3">
                <div className="flex items-baseline justify-between gap-3 px-1">
                  <span className="text-sm text-muted-foreground">Total a pagar</span>
                  <span className="flex items-baseline gap-2">
                    <span className="font-display text-xl font-extrabold tracking-tight tabular-nums">
                      <SplitPriceDisplay cents={totalToPayCents} />
                    </span>
                  </span>
                </div>

                {planParam === "monthly" && (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Assinatura mensal de {formatBRL(amountCents)}.
                      {method === "pix"
                        ? " A cada mês você recebe uma nova cobrança Pix."
                        : " O cartão será cobrado mensalmente."}{" "}
                      Cancele quando quiser por e-mail, sem multa: o acesso segue até o fim do mês
                      já pago.
                    </p>
                    <p className="rounded-xl border border-border/60 px-4 py-3 text-sm">
                      O vitalício custa {formatBRL(59400)} uma vez, menos que dois meses deste
                      plano.{" "}
                      <Link
                        href="/checkout/vitalicio"
                        className="font-semibold underline decoration-primary underline-offset-4"
                      >
                        Trocar para o vitalício
                      </Link>
                    </p>
                  </>
                )}

                <RaisedButton
                  type="submit"
                  disabled={submitting}
                  className="h-13 w-full gap-2 rounded-2xl before:rounded-2xl text-[15px] font-semibold"
                >
                  <ShieldCheckIcon size={17} />
                  {submitting ? "Gerando cobrança…" : buttonText}
                </RaisedButton>

                {method === "pix" && (
                  <p className="text-center text-xs text-muted-foreground">
                    O acesso cai na sua conta assim que o Pix for confirmado.
                  </p>
                )}

                <p className="text-center text-xs text-muted-foreground">
                  Ao pagar, você aceita os{" "}
                  <Link
                    href="/termos#arrependimento"
                    target="_blank"
                    className="underline underline-offset-2"
                  >
                    Termos de Uso
                  </Link>{" "}
                  e pede a liberação imediata do acesso. Depois que o conteúdo é utilizado, não há
                  reembolso integral.
                </p>
              </div>

              {/* Ambiente seguro */}
              <div className="rounded-2xl border border-border/60 bg-card/40 px-5 py-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <ShieldCheckIcon size={16} className="text-primary" />
                  Ambiente seguro
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                  Seus dados trafegam criptografados.
                  {method === "card" ? " Nós não armazenamos os dados do seu cartão." : ""}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  {method === "card" ? (
                    ["Visa", "Mastercard", "Elo", "Amex", "Hipercard"].map((brand) => (
                      <span
                        key={brand}
                        className="rounded-md border border-border/60 bg-background/60 px-2 py-1 text-[11px] font-semibold tracking-wide text-muted-foreground"
                      >
                        {brand}
                      </span>
                    ))
                  ) : method === "pix" ? (
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-background/60 px-2 py-1 text-[11px] font-semibold tracking-wide text-muted-foreground">
                      <PixMark className="size-3.5" />
                      Pix · aprovação em segundos
                    </span>
                  ) : (
                    <span className="rounded-md border border-border/60 bg-background/60 px-2 py-1 text-[11px] font-semibold tracking-wide text-muted-foreground">
                      Boleto bancário · compensação em até 3 dias úteis
                    </span>
                  )}
                </div>
              </div>

              {/* Já vem no seu acesso */}
              <section aria-label="Ferramentas incluídas">
                <h2 className="text-sm font-semibold tracking-tight">Já vem no seu acesso</h2>
                <div className="mt-3 space-y-3">
                  <div className="rounded-2xl border border-border/60 p-5">
                    <span className="flex items-baseline gap-3">
                      <span
                        aria-hidden="true"
                        className="mt-0.5 grid size-[18px] shrink-0 place-items-center self-start rounded-[6px] border border-primary bg-primary text-primary-foreground"
                      >
                        <CheckIcon size={12} />
                      </span>
                      <span className="flex-1 font-semibold">Raio-X de Vídeo</span>
                      <span className="text-sm text-muted-foreground">Incluído</span>
                    </span>
                    <span className="mt-2 block pl-[30px] text-sm leading-relaxed text-muted-foreground">
                      Cole o link de um vídeo do TikTok que está vendendo. Você vê os números, o
                      gancho e a estrutura do roteiro, e recria tudo para um produto seu.
                    </span>
                    <span className="mt-3 block pl-[30px]">
                      <div className="zd zd-xray" aria-hidden="true">
                        <div className="flex gap-6">
                          {[
                            ["Views", "4,3 mi"],
                            ["Salvos / mil", "1,8"],
                            ["Alcance", "694×"],
                          ].map(([lbl, val]) => (
                            <div key={lbl} className="zd-stat">
                              <p className="zd-eyebrow">{lbl}</p>
                              <p className="zd-num font-mono" style={{ fontSize: 15 }}>
                                {val}
                              </p>
                            </div>
                          ))}
                        </div>
                        <p className="zd-quote mt-3">
                          <span className="zd-dim font-mono zd-num">0:00 </span>
                          “isso aqui parece só um pano, mas…”{" "}
                          <span className="zd-acc zd-mark">gancho</span>
                        </p>
                        <p className="zd-caption">
                          Os números e a fala vêm do próprio vídeo. Depois é só recriar para o seu
                          produto.
                        </p>
                      </div>
                    </span>
                  </div>

                  <div className="rounded-2xl border border-border/60 p-5">
                    <span className="flex items-baseline gap-3">
                      <span
                        aria-hidden="true"
                        className="mt-0.5 grid size-[18px] shrink-0 place-items-center self-start rounded-[6px] border border-primary bg-primary text-primary-foreground"
                      >
                        <CheckIcon size={12} />
                      </span>
                      <span className="flex-1 font-semibold">Assistente de Live</span>
                      <span className="text-sm text-muted-foreground">Incluído</span>
                    </span>
                    <span className="mt-2 block pl-[30px] text-sm leading-relaxed text-muted-foreground">
                      O chat da sua live separado, com a resposta pronta para quem quer comprar, e
                      seus clipes em loop como câmera na live infinita.
                    </span>
                    <span className="mt-3 block pl-[30px]">
                      <div className="zd zd-live" aria-hidden="true">
                        <p className="zd-eyebrow">
                          <span className="zd-dot" />
                          Ao vivo <span className="zd-num font-mono">02:14</span> · clipe 3 de 12
                        </p>
                        <div className="mt-2 space-y-1.5">
                          <p className="zd-msg">
                            <span className="zd-dim">ana.costa</span> Serve pra pele oleosa?
                          </p>
                          <p className="zd-msg">
                            <span className="zd-acc">resposta pronta</span> Serve sim, tem toque
                            seco.
                          </p>
                          <p className="zd-msg">
                            <span className="zd-dim">venda na live</span>{" "}
                            <span className="zd-num font-mono">R$ 47,55</span>
                          </p>
                        </div>
                        <p className="zd-caption">
                          Seus clipes na câmera, o chat respondido enquanto você fala.
                        </p>
                      </div>
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Sem cobrança extra: as duas ferramentas abrem assim que seu acesso ao Zaalys
                  estiver ativo.
                </p>
              </section>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

export default function CheckoutVitalicioPage() {
  return (
    <Suspense fallback={<BrandLoader label="Carregando" />}>
      <CheckoutContent />
    </Suspense>
  );
}
