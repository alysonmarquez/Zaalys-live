import { fail, json, unauthorized } from "@/lib/http";
import { adminCtx } from "@/lib/admin";
import { pick } from "@/lib/payments/applyfy";

// Avisos de pagamento recebidos da Applyfy (Admin), do mais recente para o mais antigo.
export async function GET(req: Request) {
  const c = await adminCtx();
  if (!c) return unauthorized();
  try {
    const limit = Math.min(Number(new URL(req.url).searchParams.get("limite")) || 200, 1000);
    const { data, error } = await c.db
      .from("payments")
      .select("id, gateway, event, amount_cents, payload, received_at")
      .order("received_at", { ascending: false })
      .limit(limit);
    if (error) return fail(error);
    return json({
      pagamentos: (data ?? []).map((p) => ({
        id: p.id,
        data: p.received_at,
        evento: String(p.event).replace(/^applyfy\./, ""),
        valorCents: p.amount_cents,
        email: pick(p.payload, ["data.client.email", "data.customer.email", "customer.email", "buyer.email", "client.email", "email"]) ?? null,
        produto: pick(p.payload, ["data.product.name", "product.name", "data.productName"]) ?? null,
        forma: pick(p.payload, ["data.paymentMethod", "paymentMethod", "data.payment.method", "payment_method"]) ?? null,
      })),
    });
  } catch (err) {
    return fail(err);
  }
}
