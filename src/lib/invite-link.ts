import { CHECKOUT_LINKS, type Plan } from "@/lib/checkout-links";
import { refFromInvite, refMark } from "@/lib/referrals";

/**
 * Link da oferta com desconto da Applyfy (Acesso Creator e Indique) marcado com o código do afiliado.
 * A marca vai em src, sck e utm_* (a Applyfy repassa no postback o que guardar); a venda é atribuída por ela.
 */
export function inviteCheckoutUrl(plan: Plan, code: string, email?: string) {
  const url = new URL(CHECKOUT_LINKS.creator[plan]);
  const ref = refFromInvite(code);
  if (ref) {
    const mark = refMark(ref);
    url.searchParams.set("src", mark);
    url.searchParams.set("sck", mark);
    url.searchParams.set("utm_source", "convite");
    url.searchParams.set("utm_campaign", mark);
  }
  if (email) url.searchParams.set("email", email);
  return url.toString();
}
