import { LIFETIME_CENTS, MAX_INSTALLMENTS, MONTHLY_CENTS } from "@/lib/pricing";
import { ApplyfyProvider } from "./applyfy";
import { MercadoPagoProvider } from "./mercadopago";
import type { PaymentProvider } from "./types";

export type { Plan, PaymentEvent, PaymentProvider } from "./types";

// Registro de gateways. Para Asaas, Stripe etc., implemente PaymentProvider e adicione aqui.
const registry: Record<string, () => PaymentProvider> = {
  applyfy: () => new ApplyfyProvider(),
  mercadopago: () => new MercadoPagoProvider(),
};

export function getPayments(name = process.env.PAYMENT_PROVIDER ?? "applyfy"): PaymentProvider {
  const make = registry[name];
  if (!make) throw new Error(`Gateway de pagamento desconhecido: ${name}`);
  return make();
}

export const PRICES = {
  monthlyCents: MONTHLY_CENTS,
  lifetimeCents: LIFETIME_CENTS,
  installments: MAX_INSTALLMENTS,
};

export const brl = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
