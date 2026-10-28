import { NextResponse } from "next/server";

// Convites do Acesso Creator e do Indique: abrem o checkout da MediaFlowMZ com o preço de convite.
// /convite/<codigo>               → vitalício com desconto
// /convite/<codigo>?plano=mensal  → mensal com desconto
// No botão de pagar, /api/checkout leva à oferta com desconto da Applyfy marcada com o código do afiliado.
export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const monthly = new URL(req.url).searchParams.get("plano") === "mensal";
  const dest = new URL("/checkout/vitalicio", req.url);
  dest.searchParams.set("convite", code);
  if (monthly) dest.searchParams.set("plan", "monthly");
  return NextResponse.redirect(dest, 302);
}
