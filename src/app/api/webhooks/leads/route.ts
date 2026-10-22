import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let email = "";
    if (contentType.includes("application/json")) {
      const body = await req.json();
      email = String(body?.email || "").trim();
    } else {
      const form = await req.formData();
      email = String(form.get("email") || "").trim();
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "invalid_email" }, { status: 400 });
    }
    return NextResponse.json({ ok: true, outcome: "sent" });
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
}
