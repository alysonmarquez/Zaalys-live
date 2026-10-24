import { NextResponse } from "next/server";
import { couponDiscountCents } from "@/lib/pricing";

// Valida o cupom no servidor. O desconto só vale no acesso vitalício.
export async function GET(req: Request) {
  const code = new URL(req.url).searchParams.get("code") ?? "";
  const discountCents = couponDiscountCents(code);
  if (!discountCents) return NextResponse.json({ valid: false }, { status: 404 });
  return NextResponse.json({ valid: true, code: code.trim().toUpperCase(), discountCents });
}
