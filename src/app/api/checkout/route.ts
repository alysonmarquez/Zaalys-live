import { z } from "zod";
import { fail, json } from "@/lib/http";
import { getPayments } from "@/lib/payments";
import { INVITE_LIFETIME_CENTS, INVITE_MONTHLY_CENTS, LIFETIME_CENTS, MONTHLY_CENTS, couponDiscountCents } from "@/lib/pricing";
import { inviteCheckoutUrl } from "@/lib/invite-link";

const Body = z.object({
  plan: z.enum(["monthly", "lifetime"]),
  email: z.string().email(),
  coupon: z.string().max(40).optional(),
  /** Código do convite (Acesso Creator / Indique): preço de convite e venda atribuída ao afiliado. */
  convite: z.string().trim().max(80).optional(),
});

export async function POST(req: Request) {
  try {
    const { plan, email, coupon, convite } = Body.parse(await req.json());
    const app = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;
    const provider = getPayments();
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
