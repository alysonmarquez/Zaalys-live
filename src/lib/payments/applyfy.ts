import { timingSafeEqual } from "node:crypto";
import { checkoutUrl } from "@/lib/checkout-links";
import type { CheckoutInput, PaymentEvent, PaymentProvider, Plan } from "./types";

const MONTH_MS = 31 * 24 * 3600 * 1000;

// Ids dos produtos na Applyfy (parte do link de checkout).
// Postback real: data.checkoutId (id do link) e data.productId / data.product.id (id do produto).
export const AVULSO_PREFIX = "avulso:";

export const PRODUCT_PLAN: Record<string, Plan> = {
  cmvl7sdxd0e5o01pvhlhnp4rp: "lifetime", // checkout vitalício
  cmvl7sdx30e5n01pvekczd55b: "lifetime", // produto "Media Flow vitalício"
  cmvl7vl7g09a401q2zmahjspy: "monthly", // checkout mensal
  cmvl7vl7c09a301q2bpsr8e4y: "monthly", // produto "media flow assinatura"
};

/** Procura a primeira chave existente num objeto aninhado (o formato exato do postback ainda não foi confirmado). */
export function pick(obj: unknown, paths: string[]): string | undefined {
  for (const path of paths) {
    let cur: unknown = obj;
    for (const key of path.split(".")) {
      cur = cur && typeof cur === "object" ? (cur as Record<string, unknown>)[key] : undefined;
    }
    if (typeof cur === "string" && cur.trim()) return cur.trim();
    if (typeof cur === "number") return String(cur);
  }
  return undefined;
}

/**
 * Applyfy: checkout hospedado (links de oferta) + postback de vendas.
 * APPLYFY_WEBHOOK_TOKEN é o token do webhook gerado pela Applyfy. Configure o postback para
 *   https://SEU-DOMINIO/api/webhooks/payment
 * (se a Applyfy não enviar o token sozinha, acrescente ?token=APPLYFY_WEBHOOK_TOKEN).
 */
export class ApplyfyProvider implements PaymentProvider {
  readonly name = "applyfy";

  async createCheckout(input: CheckoutInput) {
    return { url: checkoutUrl(input.plan, "lp", { email: input.email }) };
  }

  /**
   * Confere o token do webhook. A Applyfy chama o endereço cadastrado com ?token=; só ele vale. Cabeçalhos e corpo
   * deixaram de valer em 31/10, quando o token foi usado de fora em cabeçalho para mandar milhares de vendas falsas.
   */
  private verify(req: Request) {
    const expected = (process.env.APPLYFY_WEBHOOK_TOKEN ?? "").trim();
    if (!expected) throw new Error("APPLYFY_WEBHOOK_TOKEN não configurado (vazio nesta implantação: crie a variável e faça Redeploy)");
    if (expected.length < 8) throw new Error(`APPLYFY_WEBHOOK_TOKEN curto demais (${expected.length} caracteres, mínimo 8)`);
    const a = Buffer.from(expected);
    const b = Buffer.from((new URL(req.url).searchParams.get("token") ?? "").trim());
    const match: [string] | null = b.length === a.length && timingSafeEqual(a, b) ? ["query"] : null;
    if (!match) {
      const extra = ["x-webhook-token", "x-applyfy-token", "x-token", "authorization"].filter((h) => req.headers.get(h));
      throw new Error(`Token do webhook inválido (no endereço: ${b.length} caracteres; esperado ${a.length}${extra.length ? `; cabeçalhos ignorados: ${extra.join(", ")}` : ""})`);
    }
    console.info(`[applyfy] token conferido (${match[0]})`);
  }

  async handleWebhook(req: Request): Promise<PaymentEvent | null> {
    const raw = (await req.json().catch(() => null)) as unknown;
    this.verify(req);
    if (!raw) return null;
    // Registra o formato recebido para ajustar o mapeamento, se precisar (sem o token, que também pode vir no corpo).
    const safe = JSON.stringify(raw, (k, v) => (/^(token|webhook_?token)$/i.test(k) ? "[oculto]" : v));
    console.info("[applyfy] postback:", safe.slice(0, 2000));

    const email = pick(raw, ["data.client.email", "data.customer.email", "data.buyer.email", "customer.email", "buyer.email", "client.email", "data.email", "email"])?.toLowerCase();
    const statusRaw = (pick(raw, ["status", "data.status", "sale.status", "transaction.status", "event", "type"]) ?? "").toLowerCase();
    const productIds = [
      pick(raw, ["data.productId", "data.product.id", "product.id", "product_id", "productId"]),
      pick(raw, ["data.checkoutId", "checkoutId", "checkout.id", "checkout_id"]),
    ].filter(Boolean) as string[];
    const offer = pick(raw, ["offer.code", "offer.id", "data.offer.code", "offer_code", "offer"]) ?? "";
    const ref = pick(raw, [
      "data.orderId", "orderId", "data.order.id", "data.transaction.id", "data.transactionId", "transactionId",
      "data.id", "id", "sale.id", "transaction.id", "order.id", "order_id", "transaction_id",
    ]);
    const amount = Number(
      pick(raw, ["data.amount", "data.total", "data.order.amount", "data.order.total", "data.transaction.amount", "amount", "total", "sale.amount", "transaction.amount", "price"]) ?? NaN,
    );

    // SESSION_* = checkout aberto/atualizado (carrinho), ainda não é pagamento.
    const kind = (pick(raw, ["event", "type"]) ?? "").toLowerCase();
    if (/^session/.test(kind) || !email || !ref) return null;

    // Mensal cobrado pela API (src/lib/invite-pix.ts): cada mês é uma cobrança avulsa, marcada no identificador e na referência.
    const identifier = pick(raw, ["transaction.identifier", "data.transaction.identifier", "identifier", "data.identifier"]) ?? "";
    const avulso = identifier.includes(".mensal.");
    const isMonthly =
      avulso ||
      productIds.some((id) => PRODUCT_PLAN[id] === "monthly") ||
      ["95RF27C", "POL2VBI"].includes(offer.toUpperCase()) ||
      /assinatura|subscription|recorr/.test(statusRaw);
    const plan: Plan = isMonthly ? "monthly" : "lifetime";

    const status: PaymentEvent["status"] = /refund|reembols|chargeback|estorn/.test(statusRaw)
      ? "refunded"
      : /cancel|expir|recus|refus|fail/.test(statusRaw)
        ? "canceled"
        : /atras|overdue|past_due|unpaid/.test(statusRaw)
          ? "past_due"
          : /aprov|approv|paid|pago|complet|success|active|ativ|renew/.test(statusRaw)
            ? "active"
            : "pending";

    return {
      gateway: this.name,
      // Na assinatura, todas as cobranças precisam cair na mesma linha: usa a assinatura, se vier.
      ref: avulso ? `${AVULSO_PREFIX}${ref}` : (isMonthly && pick(raw, ["data.subscriptionId", "data.subscription.id", "subscription.id", "subscription_id"])) || ref,
      email,
      plan,
      status,
      // Valor pode vir em reais ou centavos; acima de 10.000 assume centavos.
      amountCents: Number.isFinite(amount) ? (amount > 10000 ? Math.round(amount) : Math.round(amount * 100)) : undefined,
      expiresAt: plan === "monthly" && status === "active" ? new Date(Date.now() + MONTH_MS).toISOString() : null,
      raw,
      eventName: `applyfy.${statusRaw || "unknown"}`,
    };
  }
}
