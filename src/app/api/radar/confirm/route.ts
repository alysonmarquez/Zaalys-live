import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { appUrl, isSupabaseServerConfigured } from "@/lib/radar";

const UUID = /^[0-9a-f-]{36}$/i;

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token") ?? "";
  const base = appUrl(req);
  if (!UUID.test(token) || !isSupabaseServerConfigured()) {
    return NextResponse.redirect(`${base}/newsletter?status=invalido`);
  }
  const { data } = await createAdminClient()
    .from("newsletter_leads")
    .update({ status: "confirmed", confirmed_at: new Date().toISOString(), unsubscribed_at: null })
    .eq("token", token)
    .select("id")
    .maybeSingle();
  return NextResponse.redirect(`${base}/newsletter?status=${data ? "confirmado" : "invalido"}`);
}
