import { NextResponse } from "next/server";
import { LIFETIME_CENTS, MAX_INSTALLMENTS, MONTHLY_CENTS, installmentQuote } from "@/lib/pricing";

export async function GET() {
  const q = installmentQuote(LIFETIME_CENTS, MAX_INSTALLMENTS);
  return NextResponse.json({
    plans: [
      { id: "monthly", priceCents: MONTHLY_CENTS, installments: null },
      {
        id: "lifetime",
        priceCents: LIFETIME_CENTS,
        installments: { count: q.count, cents: q.cents, totalCents: q.totalCents, feeCents: q.feeCents },
      },
    ],
  });
}
