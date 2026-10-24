// Fonte única dos preços. Usado pela landing, pelo checkout e pela API.
// No navegador valem os NEXT_PUBLIC_*; no servidor, PRICE_* tem prioridade.
// Zaalys: R$ 540/mês | R$ 794 vitalício (12x de R$ 84,60 com acréscimo).

const num = (...vals: (string | undefined)[]) => {
  for (const v of vals) {
    const n = Number(v);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return undefined;
};

export const MONTHLY_CENTS =
  num(process.env.PRICE_MONTHLY_CENTS, process.env.NEXT_PUBLIC_PRICE_MONTHLY_CENTS) ?? 54000;
export const LIFETIME_CENTS =
  num(process.env.PRICE_LIFETIME_CENTS, process.env.NEXT_PUBLIC_PRICE_LIFETIME_CENTS) ?? 79400;
export const MAX_INSTALLMENTS =
  num(process.env.LIFETIME_MAX_INSTALLMENTS, process.env.NEXT_PUBLIC_LIFETIME_MAX_INSTALLMENTS) ?? 12;

/** Juros simulados de 4% a.m. (tabela Price), igual ao que o gateway repassa. */
export function installmentQuote(cents: number, count: number) {
  if (count <= 1) return { count: 1, cents, totalCents: cents, feeCents: 0 };
  const factor = 0.04 / (1 - Math.pow(1.04, -count));
  const totalCents = Math.ceil(cents * count * factor - 1e-6);
  return { count, cents: Math.round(cents * factor), totalCents, feeCents: totalCents - cents };
}

export function formatBRL(cents: number) {
  const digits = cents % 100 === 0 ? 0 : 2;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(cents / 100);
}

/**
 * Cupons válidos só no servidor: COUPON_CODES="CODIGO:3000,OUTRO:5000" (desconto em centavos,
 * só no vitalício). Devolve 0 se o cupom não existir.
 */
export function couponDiscountCents(code: string | undefined | null): number {
  if (!code) return 0;
  const wanted = code.trim().toUpperCase();
  for (const pair of (process.env.COUPON_CODES ?? "").split(",")) {
    const [c, v] = pair.split(":").map((s) => s?.trim());
    if (c && c.toUpperCase() === wanted) return Math.max(0, Number(v) || 0);
  }
  return 0;
}
