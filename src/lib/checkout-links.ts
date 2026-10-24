// Links de checkout hospedados na Applyfy.
// Valores na Applyfy: KXSWOMU R$ 594 e POL2VBI R$ 340/mês (lp); UCYM6OR R$ 297 e 95RF27C R$ 170/mês (creator).
// - "lp": ofertas com o valor cheio, usadas na landing e no checkout do site.
// - "creator": ofertas com desconto, usadas nos convites do Acesso Creator e do Indique.
// Para trocar uma oferta, mude a variável de ambiente; os padrões abaixo são os links atuais.

export type Plan = "lifetime" | "monthly";
export type Channel = "lp" | "creator";

const LIFETIME = "https://checkout.applyfy.com.br/checkout/cmvl7sdxd0e5o01pvhlhnp4rp";
const MONTHLY = "https://checkout.applyfy.com.br/checkout/cmvl7vl7g09a401q2zmahjspy";

export const CHECKOUT_LINKS: Record<Channel, Record<Plan, string>> = {
  lp: {
    lifetime: process.env.NEXT_PUBLIC_CHECKOUT_LP_LIFETIME || `${LIFETIME}?offer=KXSWOMU`,
    monthly: process.env.NEXT_PUBLIC_CHECKOUT_LP_MONTHLY || `${MONTHLY}?offer=POL2VBI`,
  },
  creator: {
    lifetime: process.env.NEXT_PUBLIC_CHECKOUT_CREATOR_LIFETIME || `${LIFETIME}?offer=UCYM6OR`,
    monthly: process.env.NEXT_PUBLIC_CHECKOUT_CREATOR_MONTHLY || `${MONTHLY}?offer=95RF27C`,
  },
};

/** Monta o link final, repassando e-mail e origem quando houver (a Applyfy ignora o que não usa). */
export function checkoutUrl(plan: Plan, channel: Channel = "lp", extra?: { email?: string; src?: string }) {
  const url = new URL(CHECKOUT_LINKS[channel][plan]);
  if (extra?.email) url.searchParams.set("email", extra.email);
  if (extra?.src) url.searchParams.set("src", extra.src);
  return url.toString();
}
