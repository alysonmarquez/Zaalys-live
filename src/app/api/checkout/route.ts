import { z } from "zod";
import { fail, json } from "@/lib/http";
import { getPayments } from "@/lib/payments";
import { INVITE_LIFETIME_CENTS, INVITE_MONTHLY_CENTS, LIFETIME_CENTS, MONTHLY_CENTS, couponDiscountCents } from "@/lib/pricing";
import { inviteCheckoutUrl } from "@/lib/invite-link";
import { createInvitePix } from "@/lib/invite-pix";
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
});

export async function POST(req: Request) {
  try {
    const { plan, email, coupon, convite, method, name, phone, document } = Body.parse(await req.json());
    const app = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;
    const provider = getPayments();
    if (convite) {
      // Vitalício no Pix pelo link de um afiliado com Applyfy vinculada: Pix aqui mesmo, com o split dele.
      if (provider.name === "applyfy" && plan === "lifetime" && method === "pix" && name) {
        try {
          const charge = await createInvitePix(createAdminClient(), { convite, name, email: email.toLowerCase(), phone, document, app });
          if (charge?.pix?.code && charge.status !== "FAILED")
            return json({ pix: { transactionId: charge.transactionId, code: charge.pix.code, image: charge.pix.image ?? null, expiresAt: charge.pix.expiresAt ?? null } });
          if (charge) console.error("[checkout] Pix com split recusado:", charge.errorDescription ?? charge.status);
        } catch (err) {
          // Sem o Pix com split, segue para o checkout da Applyfy (a comissão fica a receber do admin).
          console.error("[checkout] Pix com split indisponível:", (err as Error).message);
        }
      }
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
