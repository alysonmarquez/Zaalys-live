import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    plans: [
      { id: "monthly", priceCents: 34000, installments: null },
      {
        id: "lifetime",
        priceCents: 59400,
        installments: { count: 12, cents: 6329, totalCents: 75951, feeCents: 16551 },
      },
    ],
  });
}
