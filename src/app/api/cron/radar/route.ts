import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { appUrl, buildWeeklyRadar, isSupabaseServerConfigured, weeklyEmail } from "@/lib/radar";

export const maxDuration = 300;

// Envio semanal do Radar. A Vercel chama toda segunda (vercel.json) com
// "Authorization: Bearer $CRON_SECRET".
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const admin = createAdminClient();
  const radar = await buildWeeklyRadar();
  if (!radar.top.length) return NextResponse.json({ ok: true, sent: 0, reason: "catalogo_vazio" });

  // Não reenvia para quem já recebeu nos últimos 6 dias (se a rota for chamada duas vezes).
  const since = new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString();
  const base = appUrl(req);
  let sent = 0;
  let failed = 0;

  // Paginação por cursor (id): quem recebe sai do filtro, então offset pularia gente.
  let lastId = 0;
  for (;;) {
    const { data: leads, error } = await admin
      .from("newsletter_leads")
      .select("id, email, token, last_sent_at")
      .eq("status", "confirmed")
      .or(`last_sent_at.is.null,last_sent_at.lt.${since}`)
      .gt("id", lastId)
      .order("id")
      .limit(200);
    if (error) throw error;
    if (!leads?.length) break;

    for (const lead of leads) {
      lastId = lead.id;
      try {
        await sendEmail({ to: lead.email, ...weeklyEmail(base, lead.token, radar) });
        await admin.from("newsletter_leads").update({ last_sent_at: new Date().toISOString() }).eq("id", lead.id);
        sent++;
      } catch (err) {
        console.error(err);
        failed++;
      }
    }
    if (leads.length < 200) break;
  }

  return NextResponse.json({ ok: true, sent, failed });
}
