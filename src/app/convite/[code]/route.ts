import { NextResponse } from "next/server";
import { checkoutUrl } from "@/lib/checkout-links";

// Convites do Acesso Creator e do Indique: levam para as ofertas com desconto.
// /convite/<codigo>            → vitalício com desconto
// /convite/<codigo>?plano=mensal → mensal com desconto
export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const plan = new URL(req.url).searchParams.get("plano") === "mensal" ? "monthly" : "lifetime";
  const src = code.replace(/[^\w-]/g, "").slice(0, 60);
  return NextResponse.redirect(checkoutUrl(plan, "creator", { src }), 302);
}
