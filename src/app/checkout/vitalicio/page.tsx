"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useMemo, useState } from "react";
import { Brand, BrandLoader, RaisedButton, Segmented } from "@/components/brand";
import { INVITE_LIFETIME_CENTS, INVITE_MONTHLY_CENTS, LIFETIME_CENTS, MONTHLY_CENTS, formatBRL, installmentQuote } from "@/lib/pricing";

// Cupom próprio só vale no Mercado Pago. Na Applyfy, os cupons são da própria Applyfy.
const COUPONS_ENABLED = (process.env.NEXT_PUBLIC_PAYMENT_PROVIDER ?? "applyfy") === "mercadopago";

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
  // Convite do Acesso Creator / Indique (/convite/<codigo>): preço de convite, venda atribuída ao afiliado.
  const invite = (params.get("convite") ?? "").trim() || null;

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
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    if (planParam === "monthly" && method === "boleto") {
      setMethod("pix");
    }
  }, [planParam, method]);

  const fullCents = planParam === "monthly" ? MONTHLY_CENTS : LIFETIME_CENTS;
  const baseCents = invite ? (planParam === "monthly" ? INVITE_MONTHLY_CENTS : INVITE_LIFETIME_CENTS) : fullCents;
  const discountCents = !invite && appliedCoupon && planParam === "lifetime" ? appliedCoupon.discountCents : 0;
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

  async function validateCoupon(raw: string) {
    const code = raw.trim().toUpperCase();
    if (!code) return;
    setCouponError(null);
    try {
      const res = await fetch(`/api/checkout/coupon?code=${encodeURIComponent(code)}`);
      const data = await res.json().catch(() => null);
      if (res.ok && data?.valid) {
        setAppliedCoupon({ code: data.code, discountCents: data.discountCents });
        return;
      }
    } catch {
      // segue para a mensagem de erro
    }
    setAppliedCoupon(null);
    setCouponError("Cupom inválido ou expirado.");
  }

  function handleApplyCoupon() {
    void validateCoupon(couponInput);
  }

  useEffect(() => {
    if (initialCoupon) void validateCoupon(initialCoupon);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidCpfCnpj(document)) {
      setDocError("Confira o número: este CPF ou CNPJ não é válido.");
      window.document.getElementById("checkout-documento")?.focus();
      return;
    }
    setDocError(null);
    setSubmitting(true);
    setCheckoutError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: planParam,
          email: email.trim(),
          coupon: invite ? undefined : appliedCoupon?.code,
          convite: invite ?? undefined,
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.url) {
        // Pix, boleto e cartão são pagos na página segura do gateway (Applyfy).
        window.location.href = data.url;
        return;
      }
      setCheckoutError(
        "Não conseguimos abrir o pagamento agora. Tente de novo em instantes ou fale com suporte@mediaflowmz.com.",
      );
    } catch {
      setCheckoutError("Sem conexão com o servidor. Confira sua internet e tente de novo.");
    } finally {
      setSubmitting(false);
    }
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
                      MediaFlowMZ · Acesso {planParam === "monthly" ? "Mensal" : "Vitalício"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {planParam === "monthly"
                        ? "Assinatura mensal"
                        : "Pagamento único do acesso base"}
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  {invite && fullCents > baseCents ? (
                    <p className="mb-1.5 flex items-center gap-2 text-[13px]">
                      <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-semibold text-primary">Preço de convite</span>
                      <span className="text-muted-foreground line-through tabular-nums">{formatBRL(fullCents)}</span>
                    </p>
                  ) : null}
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
                  <h3 className="text-sm font-semibold tracking-tight">Parcelamento no cartão</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Você digita o cartão na página segura do Mercado Pago, no próximo passo. A MediaFlowMZ não recebe nem guarda os dados do cartão.
                  </p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-6">
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

              {COUPONS_ENABLED && !invite && (showCoupon ? (
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
              ))}

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
                      O vitalício custa {formatBRL(invite ? INVITE_LIFETIME_CENTS : LIFETIME_CENTS)} uma vez, menos que dois meses deste
                      plano.{" "}
                      <Link
                        href={invite ? `/checkout/vitalicio?convite=${encodeURIComponent(invite)}` : "/checkout/vitalicio"}
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
                  {submitting ? "Abrindo pagamento seguro…" : buttonText}
                </RaisedButton>

                {checkoutError && (
                  <p role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-center text-sm">
                    {checkoutError}
                  </p>
                )}

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

            </form>
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
