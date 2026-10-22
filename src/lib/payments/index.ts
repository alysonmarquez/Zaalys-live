import { MercadoPagoProvider } from "./mercadopago";
import type { PaymentProvider } from "./types";

export type { Plan, PaymentEvent, PaymentProvider } from "./types";

// Registro de gateways. Para Asaas, Stripe etc., implemente PaymentProvider e adicione aqui.
const registry: Record<string, () => PaymentProvider> = {
  mercadopago: () => new MercadoPagoProvider(),
};

export function getPayments(name = process.env.PAYMENT_PROVIDER ?? "mercadopago"): PaymentProvider {
  const make = registry[name];
  if (!make) throw new Error(`Gateway de pagamento desconhecido: ${name}`);
  return make();
}

export const PRICES = {
  monthlyCents: Number(process.env.PRICE_MONTHLY_CENTS ?? 54000),
  lifetimeCents: Number(process.env.PRICE_LIFETIME_CENTS ?? 79400),
  installments: Number(process.env.LIFETIME_MAX_INSTALLMENTS ?? 12),
};

export const brl = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
