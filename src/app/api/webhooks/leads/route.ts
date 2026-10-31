import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { isJunkEmail } from "@/lib/junk-email";
import { appUrl, confirmEmail, isSupabaseServerConfigured } from "@/lib/radar";

const Email = z.string().trim().toLowerCase().email().max(254);

// Inscrição no Radar gratuito (dupla confirmação).
export async function POST(req: Request) {
  let fields: Record<string, string> = {};
  try {
    if ((req.headers.get("content-type") || "").includes("application/json")) {
      fields = await req.json();
    } else {
      const form = await req.formData();
      form.forEach((v, k) => (fields[k] = String(v)));
    }
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const parsed = Email.safeParse(fields.email ?? "");
  if (!parsed.success) return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  const email = parsed.data;

  // Anti-robô: campo armadilha preenchido ou envio em menos de 2 s após carregar a página.
  // Também: e-mail de domínio reservado para testes, envio sem o horário da página (só robôs) ou vindo de outro site.
  const renderedAt = Number(fields.t || 0);
  const origin = req.headers.get("origin") || req.headers.get("referer") || "";
  const foreign = origin !== "" && !/^https:\/\/([a-z0-9-]+\.)*(mediaflowmz\.com|vercel\.app)(\/|$)|^http:\/\/localhost(:\d+)?(\/|$)/i.test(origin);
  if (fields.website || !renderedAt || Date.now() - renderedAt < 2000 || isJunkEmail(email) || foreign) {
    return NextResponse.json({ ok: true, outcome: "sent" });
  }

  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("newsletter_leads")
    .select("token, status")
    .eq("email", email)
    .maybeSingle();

  if (existing?.status === "confirmed") return NextResponse.json({ ok: true, outcome: "already" });

  let token = existing?.token as string | undefined;
  if (existing) {
    await admin.from("newsletter_leads").update({ status: "pending" }).eq("email", email);
  } else {
    const { data, error } = await admin
      .from("newsletter_leads")
      .insert({ email, source: (fields.source || "landing-radar").slice(0, 60) })
      .select("token")
      .single();
    if (error) {
      console.error(error);
      return NextResponse.json({ error: "internal" }, { status: 500 });
    }
    token = data.token;
  }

  try {
    await sendEmail({ to: email, ...confirmEmail(appUrl(req), token!) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "email_failed" }, { status: 502 });
  }
  return NextResponse.json({ ok: true, outcome: "sent" });
}
