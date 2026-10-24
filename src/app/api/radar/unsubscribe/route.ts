import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { appUrl, isSupabaseServerConfigured } from "@/lib/radar";

const UUID = /^[0-9a-f-]{36}$/i;

async function unsubscribe(req: Request) {
  const token = new URL(req.url).searchParams.get("token") ?? "";
  if (!UUID.test(token) || !isSupabaseServerConfigured()) return false;
  const { data } = await createAdminClient()
    .from("newsletter_leads")
    .update({ status: "unsubscribed", unsubscribed_at: new Date().toISOString() })
    .eq("token", token)
    .select("id")
    .maybeSingle();
  return Boolean(data);
}

// Link do e-mail (GET) e descadastro em um clique do provedor de e-mail (POST, RFC 8058).
export async function GET(req: Request) {
  const ok = await unsubscribe(req);
  return NextResponse.redirect(`${appUrl(req)}/newsletter?status=${ok ? "cancelado" : "invalido"}`);
}

export async function POST(req: Request) {
  const ok = await unsubscribe(req);
  return NextResponse.json({ ok }, { status: ok ? 200 : 404 });
}
