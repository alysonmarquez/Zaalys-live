import { z } from "zod";
import { fail, json } from "@/lib/http";
import { getPayments } from "@/lib/payments";

const Body = z.object({
  plan: z.enum(["monthly", "lifetime"]),
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const { plan, email } = Body.parse(await req.json());
    const app = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;
    const { url } = await getPayments().createCheckout({
      plan,
      email: email.toLowerCase(),
      returnUrl: `${app}/obrigado`,
      webhookUrl: `${app}/api/webhooks/payment`,
    });
    return json({ url });
  } catch (err) {
    return fail(err);
  }
}
