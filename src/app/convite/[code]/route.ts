import { NextResponse } from "next/server";
import { CHECKOUT_LINKS } from "@/lib/checkout-links";
import { refFromInvite, refMark } from "@/lib/referrals";

// Convites do Acesso Creator e do Indique: levam às ofertas com desconto, marcados com o código do afiliado.
// /convite/<codigo>               → vitalício com desconto
// /convite/<codigo>?plano=mensal  → mensal com desconto
// A marca vai em src, sck e utm_* (a Applyfy repassa no postback o que guardar); a venda é atribuída por ela.
export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const plan = new URL(req.url).searchParams.get("plano") === "mensal" ? "monthly" : "lifetime";
  const url = new URL(CHECKOUT_LINKS.creator[plan]);
  const ref = refFromInvite(code);
  if (ref) {
    const mark = refMark(ref);
    url.searchParams.set("src", mark);
    url.searchParams.set("sck", mark);
    url.searchParams.set("utm_source", "convite");
    url.searchParams.set("utm_campaign", mark);
  }
  return NextResponse.redirect(url.toString(), 302);
}
