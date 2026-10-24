import { timingSafeEqual } from "node:crypto";
import { checkoutUrl } from "@/lib/checkout-links";
import type { CheckoutInput, PaymentEvent, PaymentProvider, Plan } from "./types";

const MONTH_MS = 31 * 24 * 3600 * 1000;

// Ids dos produtos na Applyfy (parte do link de checkout).
const PRODUCT_PLAN: Record<string, Plan> = {
  cmvl7sdxd0e5o01pvhlhnp4rp: "lifetime",
  cmvl7vl7g09a401q2zmahjspy: "monthly",
};

/** Procura a primeira chave existente num objeto aninhado (o formato exato do postback ainda não foi confirmado). */
function pick(obj: unknown, paths: string[]): string | undefined {
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
 * Configure na Applyfy o postback para:
 *   https://SEU-DOMINIO/api/webhooks/payment?token=APPLYFY_WEBHOOK_TOKEN
 */
export class ApplyfyProvider implements PaymentProvider {
  readonly name = "applyfy";

  async createCheckout(input: CheckoutInput) {
    return { url: checkoutUrl(input.plan, "lp", { email: input.email }) };
  }

  private verify(req: Request) {
    const expected = process.env.APPLYFY_WEBHOOK_TOKEN ?? "";
    if (expected.length < 16) throw new Error("APPLYFY_WEBHOOK_TOKEN não configurado (mínimo 16 caracteres)");
    const got = new URL(req.url).searchParams.get("token") ?? req.headers.get("x-webhook-token") ?? "";
    const a = Buffer.from(expected);
    const b = Buffer.from(got);
    if (a.length !== b.length || !timingSafeEqual(a, b)) throw new Error("Token do webhook inválido");
  }

  async handleWebhook(req: Request): Promise<PaymentEvent | null> {
    this.verify(req);
    const raw = (await req.json().catch(() => null)) as unknown;
    if (!raw) return null;
    // Registra o formato recebido para ajustar o mapeamento, se precisar.
    console.info("[applyfy] postback:", JSON.stringify(raw).slice(0, 2000));

    const email = pick(raw, ["customer.email", "buyer.email", "client.email", "data.customer.email", "data.buyer.email", "email"])?.toLowerCase();
    const statusRaw = (pick(raw, ["status", "data.status", "sale.status", "transaction.status", "event", "type"]) ?? "").toLowerCase();
    const productId = pick(raw, ["product.id", "data.product.id", "product_id", "productId", "checkout.id", "checkout_id"]) ?? "";
    const offer = pick(raw, ["offer.code", "offer.id", "data.offer.code", "offer_code", "offer"]) ?? "";
    const ref = pick(raw, ["id", "data.id", "sale.id", "transaction.id", "order.id", "order_id", "transaction_id"]);
    const amount = Number(pick(raw, ["amount", "data.amount", "total", "sale.amount", "transaction.amount", "price"]) ?? NaN);

    if (!email || !ref) return null;

    const isMonthly =
      PRODUCT_PLAN[productId] === "monthly" ||
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
      ref: (isMonthly && pick(raw, ["subscription.id", "data.subscription.id", "subscription_id"])) || ref,
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
