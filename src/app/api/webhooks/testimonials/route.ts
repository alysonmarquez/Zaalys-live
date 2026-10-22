import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { testimonials: [] },
    {
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
      },
    },
  );
}
