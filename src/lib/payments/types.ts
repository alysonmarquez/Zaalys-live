export type Plan = "monthly" | "lifetime";

export type CheckoutInput = {
  plan: Plan;
  email: string;
  /** Desconto de cupom já validado no servidor (centavos). */
  discountCents?: number;
  /** Para onde o gateway devolve a pessoa depois do pagamento. */
  returnUrl: string;
  /** URL pública do nosso webhook. */
  webhookUrl: string;
};

/** Evento já normalizado, independente do gateway. */
export type PaymentEvent = {
  gateway: string;
  /** Identificador estável do acesso no gateway (pagamento único ou assinatura). */
  ref: string;
  email: string;
  plan: Plan;
  status: "pending" | "active" | "past_due" | "canceled" | "refunded";
  amountCents?: number;
  /** Até quando o acesso vale. Nulo no vitalício. */
  expiresAt: string | null;
  raw: unknown;
  eventName: string;
};

/** Contrato que todo gateway implementa. */
export interface PaymentProvider {
  readonly name: string;
  createCheckout(input: CheckoutInput): Promise<{ url: string }>;
  /**
   * Valida a assinatura do webhook e devolve o evento normalizado.
   * Devolve null para notificações que não mudam acesso.
   * Lança erro se a assinatura for inválida.
   */
  handleWebhook(req: Request): Promise<PaymentEvent | null>;
}
