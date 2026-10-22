import { createHmac, timingSafeEqual } from "node:crypto";
import type { CheckoutInput, PaymentEvent, PaymentProvider, Plan } from "./types";

const API = "https://api.mercadopago.com";
const MONTH_MS = 32 * 24 * 60 * 60 * 1000; // folga de 2 dias sobre o ciclo mensal

type MpPayment = {
  id: number;
  status: string; // approved, pending, in_process, rejected, refunded, charged_back, cancelled
  transaction_amount: number;
  external_reference?: string;
  payer?: { email?: string };
  metadata?: { preapproval_id?: string };
};

type MpPreapproval = {
  id: string;
  status: string; // pending, authorized, paused, cancelled
  external_reference?: string;
  payer_email?: string;
  auto_recurring?: { transaction_amount?: number };
};

type MpAuthorizedPayment = {
  id: number;
  preapproval_id: string;
  status: string; // scheduled, processed, recycling, cancelled
  payment?: { id: number; status: string };
  transaction_amount?: number;
};

/** external_reference = "<plano>|<email>", para sabermos de quem é o pagamento. */
const ref = (plan: Plan, email: string) => `${plan}|${email.toLowerCase()}`;
const parseRef = (value?: string): { plan: Plan; email: string } | null => {
  const [plan, email] = (value ?? "").split("|");
  if ((plan === "monthly" || plan === "lifetime") && email) return { plan, email };
  return null;
};

export class MercadoPagoProvider implements PaymentProvider {
  readonly name = "mercadopago";

  constructor(
    private token = process.env.MERCADOPAGO_ACCESS_TOKEN ?? "",
    private webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET ?? "",
  ) {
    if (!this.token) throw new Error("MERCADOPAGO_ACCESS_TOKEN não configurado");
  }

  private async mp<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${API}${path}`, {
      ...init,
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.token}`,
        ...(init?.method === "POST" ? { "x-idempotency-key": crypto.randomUUID() } : {}),
        ...init?.headers,
      },
    });
    if (!res.ok) throw new Error(`Mercado Pago ${res.status}: ${await res.text()}`);
    return res.json() as Promise<T>;
  }

  async createCheckout(input: CheckoutInput) {
    const name = process.env.NEXT_PUBLIC_APP_NAME ?? "MediaFlow";

    if (input.plan === "lifetime") {
      // Checkout Pro: Pix, boleto e cartão parcelado.
      const cents = Number(process.env.PRICE_LIFETIME_CENTS ?? 79400);
      const pref = await this.mp<{ init_point: string }>("/checkout/preferences", {
        method: "POST",
        body: JSON.stringify({
          items: [
            { title: `${name} — acesso vitalício`, quantity: 1, unit_price: cents / 100, currency_id: "BRL" },
          ],
          payer: { email: input.email },
          payment_methods: { installments: Number(process.env.LIFETIME_MAX_INSTALLMENTS ?? 12) },
          external_reference: ref("lifetime", input.email),
          notification_url: input.webhookUrl,
          back_urls: { success: input.returnUrl, pending: input.returnUrl, failure: input.returnUrl },
          auto_return: "approved",
        }),
      });
      return { url: pref.init_point };
    }

    // Assinatura mensal (preapproval). Observação: recorrência no MP é só no cartão.
    const cents = Number(process.env.PRICE_MONTHLY_CENTS ?? 54000);
    const sub = await this.mp<{ init_point: string }>("/preapproval", {
      method: "POST",
      body: JSON.stringify({
        reason: `${name} — plano mensal`,
        external_reference: ref("monthly", input.email),
        payer_email: input.email,
        back_url: input.returnUrl,
        notification_url: input.webhookUrl,
        status: "pending",
        auto_recurring: {
          frequency: 1,
          frequency_type: "months",
          transaction_amount: cents / 100,
          currency_id: "BRL",
        },
      }),
    });
    return { url: sub.init_point };
  }

  /** Assinatura do webhook: x-signature "ts=...,v1=..." sobre "id:<data.id>;request-id:<x-request-id>;ts:<ts>;" */
  private verify(req: Request, dataId: string) {
    if (!this.webhookSecret) throw new Error("MERCADOPAGO_WEBHOOK_SECRET não configurado");
    const signature = req.headers.get("x-signature") ?? "";
    const requestId = req.headers.get("x-request-id") ?? "";
    const parts = Object.fromEntries(
      signature.split(",").map((p) => p.trim().split("=") as [string, string]),
    );
    if (!parts.ts || !parts.v1) throw new Error("Webhook sem assinatura");
    const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${parts.ts};`;
    const expected = createHmac("sha256", this.webhookSecret).update(manifest).digest("hex");
    const a = Buffer.from(expected);
    const b = Buffer.from(parts.v1);
    if (a.length !== b.length || !timingSafeEqual(a, b)) throw new Error("Assinatura do webhook inválida");
  }

  async handleWebhook(req: Request): Promise<PaymentEvent | null> {
    const url = new URL(req.url);
    const body = (await req.json().catch(() => ({}))) as { type?: string; data?: { id?: string | number } };
    const type = body.type ?? url.searchParams.get("type") ?? "";
    const dataId = String(body.data?.id ?? url.searchParams.get("data.id") ?? "");
    if (!dataId) return null;

    this.verify(req, dataId);

    // Pagamento único (vitalício) — busca o pagamento real na API, nunca confia no corpo.
    if (type === "payment") {
      const p = await this.mp<MpPayment>(`/v1/payments/${dataId}`);
      const owner = parseRef(p.external_reference);
      if (!owner || owner.plan !== "lifetime") return null; // cobranças da assinatura chegam por outro tipo
      const status: PaymentEvent["status"] =
        p.status === "approved"
          ? "active"
          : p.status === "refunded" || p.status === "charged_back"
            ? "refunded"
            : p.status === "rejected" || p.status === "cancelled"
              ? "canceled"
              : "pending";
      return {
        gateway: this.name,
        ref: String(p.id),
        email: owner.email,
        plan: "lifetime",
        status,
        amountCents: Math.round(p.transaction_amount * 100),
        expiresAt: null,
        raw: p,
        eventName: `payment.${p.status}`,
      };
    }

    // Assinatura criada, pausada ou cancelada.
    if (type === "subscription_preapproval" || type === "preapproval") {
      const s = await this.mp<MpPreapproval>(`/preapproval/${dataId}`);
      const owner = parseRef(s.external_reference);
      if (!owner) return null;
      const status: PaymentEvent["status"] =
        s.status === "authorized" ? "active" : s.status === "paused" ? "past_due" : s.status === "cancelled" ? "canceled" : "pending";
      return {
        gateway: this.name,
        ref: s.id,
        email: owner.email,
        plan: "monthly",
        status,
        amountCents: s.auto_recurring?.transaction_amount
          ? Math.round(s.auto_recurring.transaction_amount * 100)
          : undefined,
        expiresAt: status === "active" ? new Date(Date.now() + MONTH_MS).toISOString() : null,
        raw: s,
        eventName: `preapproval.${s.status}`,
      };
    }

    // Cada cobrança mensal: estende o acesso quando o pagamento foi aprovado.
    if (type === "subscription_authorized_payment") {
      const ap = await this.mp<MpAuthorizedPayment>(`/authorized_payments/${dataId}`);
      const s = await this.mp<MpPreapproval>(`/preapproval/${ap.preapproval_id}`);
      const owner = parseRef(s.external_reference);
      if (!owner) return null;
      const paid = ap.payment?.status === "approved";
      return {
        gateway: this.name,
        ref: s.id,
        email: owner.email,
        plan: "monthly",
        status: paid ? "active" : "past_due",
        amountCents: ap.transaction_amount ? Math.round(ap.transaction_amount * 100) : undefined,
        expiresAt: paid ? new Date(Date.now() + MONTH_MS).toISOString() : null,
        raw: ap,
        eventName: `authorized_payment.${ap.payment?.status ?? ap.status}`,
      };
    }

    return null;
  }
}
