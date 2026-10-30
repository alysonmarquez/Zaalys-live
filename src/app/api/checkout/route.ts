import { z } from "zod";
import { fail, json } from "@/lib/http";
import { getPayments } from "@/lib/payments";
import { INVITE_LIFETIME_CENTS, INVITE_MONTHLY_CENTS, LIFETIME_CENTS, MONTHLY_CENTS, couponDiscountCents } from "@/lib/pricing";
import { inviteCheckoutUrl } from "@/lib/invite-link";
import { createInviteCard, createInvitePix } from "@/lib/invite-pix";
import { ApplyfyApiError } from "@/lib/applyfy-api";
import { createAdminClient } from "@/lib/supabase/server";

const Body = z.object({
  plan: z.enum(["monthly", "lifetime"]),
  email: z.string().email(),
  coupon: z.string().max(40).optional(),
  /** Código do convite (Acesso Creator / Indique): preço de convite e venda atribuída ao afiliado. */
  convite: z.string().trim().max(80).optional(),
  method: z.enum(["pix", "card", "boleto"]).optional(),
  name: z.string().trim().max(120).optional(),
  phone: z.string().trim().max(30).optional(),
  document: z.string().trim().max(30).optional(),
  // Só no cartão (cobrado pela API): repassado à Applyfy, nunca gravado.
  installments: z.number().int().min(1).max(12).optional(),
  address: z
    .object({
      zipCode: z.string().trim().min(8).max(10),
      state: z.string().trim().length(2),
      city: z.string().trim().min(1).max(80),
      street: z.string().trim().min(1).max(120),
      neighborhood: z.string().trim().min(1).max(80),
      number: z.string().trim().min(1).max(20),
      complement: z.string().trim().max(80).optional(),
    })
    .optional(),
  card: z
    .object({
      number: z.string().regex(/^\d{13,19}$/),
      owner: z.string().trim().min(3).max(80),
      expiresAt: z.string().regex(/^\d{4}-\d{2}$/),
      cvv: z.string().regex(/^\d{3,4}$/),
    })
    .optional(),
});

export async function POST(req: Request) {
  try {
    // safeParse: o erro de validação nunca devolve (nem registra) os dados do cartão.
    const parsed = Body.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return json({ error: "Confira os dados do pagamento." }, 400);
    const { plan, email, coupon, convite, method, name, phone, document, installments, address, card } = parsed.data;
    const app = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;
    const provider = getPayments();
    if (card) {
      // Cartão cobrado pela API. Sem as chaves configuradas, não há para onde mandar o cartão.
      if (provider.name !== "applyfy" || !name || !address) return json({ error: "Confira os dados do pagamento." }, 400);
      const clientIp = (req.headers.get("x-forwarded-for") ?? "").split(",")[0]!.trim() || req.headers.get("x-real-ip") || "127.0.0.1";
      try {
        const charge = await createInviteCard(createAdminClient(), {
          convite,
          plan,
          name,
          email: email.toLowerCase(),
          phone,
          document,
          app,
          clientIp,
          installments: installments ?? 1,
          address,
          card,
        });
        if (!charge) return json({ error: "O pagamento no cartão por aqui não está disponível agora. Tente pelo Pix." }, 409);
        if (charge.status === "FAILED" || charge.transactionStatus === "FAILED")
          return json({ error: charge.errorDescription || "Pagamento recusado. Confira os dados ou tente outro cartão." }, 402);
        return json({ card: { transactionId: charge.transactionId, needThreeDs: Boolean(charge.needThreeDs), paid: charge.transactionStatus === "COMPLETED" } });
      } catch (err) {
        console.error("[checkout] cartão pela API:", err instanceof ApplyfyApiError ? `${err.status} ${err.message}${err.details}` : "erro");
        return json({ error: "Não deu para processar o cartão agora. Confira os dados, tente de novo ou pague pelo Pix." }, 502);
      }
    }
    // Pix aqui mesmo, com o split do afiliado (vitalício, se houver) e dos coprodutores.
    if (provider.name === "applyfy" && method === "pix" && name) {
      try {
        const charge = await createInvitePix(createAdminClient(), { convite, plan, name, email: email.toLowerCase(), phone, document, app });
        if (charge?.pix?.code && charge.status !== "FAILED")
          return json({ pix: { transactionId: charge.transactionId, code: charge.pix.code, image: charge.pix.image ?? null, expiresAt: charge.pix.expiresAt ?? null } });
        // Com a API disponível, nunca cai no checkout da Applyfy: lá não há split e aparecem os dados do produtor.
        if (charge) {
          console.error("[checkout] Pix pela API recusado:", charge.errorDescription ?? charge.status);
          return json({ error: charge.errorDescription || "Não deu para gerar o Pix agora. Confira os dados e tente de novo." }, 402);
        }
      } catch (err) {
        console.error("[checkout] Pix pela API indisponível:", err instanceof ApplyfyApiError ? `${err.status} ${err.message}${err.details}` : "erro");
        return json({ error: "Não deu para gerar o Pix agora. Confira nome, telefone e CPF e tente de novo." }, 502);
      }
    }
    if (convite) {
      // Applyfy: a oferta com desconto marcada com o afiliado. Outros gateways: o mesmo desconto em valor.
      if (provider.name === "applyfy") return json({ url: inviteCheckoutUrl(plan, convite, email.toLowerCase()) });
      const discountCents = plan === "lifetime" ? LIFETIME_CENTS - INVITE_LIFETIME_CENTS : MONTHLY_CENTS - INVITE_MONTHLY_CENTS;
      const { url } = await provider.createCheckout({
        plan,
        email: email.toLowerCase(),
        discountCents: Math.max(0, discountCents),
        returnUrl: `${app}/obrigado`,
        webhookUrl: `${app}/api/webhooks/payment`,
      });
      return json({ url });
    }
    const { url } = await provider.createCheckout({
      plan,
      email: email.toLowerCase(),
      discountCents: plan === "lifetime" ? couponDiscountCents(coupon) : 0,
      returnUrl: `${app}/obrigado`,
      webhookUrl: `${app}/api/webhooks/payment`,
    });
    return json({ url });
  } catch (err) {
    return fail(err);
  }
}
