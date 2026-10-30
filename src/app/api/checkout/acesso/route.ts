import { z } from "zod";
import { json } from "@/lib/http";
import { sendPurchaseAccess } from "@/lib/invite-email";
import { createAdminClient } from "@/lib/supabase/server";

// "Reenviar e-mail de acesso" da página pós-compra. A resposta é sempre a mesma: não revela quem comprou.
const Body = z.object({ email: z.string().trim().toLowerCase().email().max(200) });

// Freio por instância do servidor: um reenvio por e-mail a cada minuto.
const WAIT_MS = 60_000;
const lastSent = new Map<string, number>();

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "E-mail inválido" }, 400);
  const { email } = parsed.data;
  const now = Date.now();
  if (now - (lastSent.get(email) ?? 0) < WAIT_MS) return json({ ok: true });
  lastSent.set(email, now);
  try {
    const admin = createAdminClient();
    const { data } = await admin.from("subscriptions").select("plan, expires_at").eq("email", email).eq("status", "active");
    const valid = (data ?? []).some((s) => s.plan === "lifetime" || (s.expires_at && Date.parse(s.expires_at) > now));
    if (valid) {
      const origin = (process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin).replace(/\/$/, "");
      await sendPurchaseAccess(admin, email, origin);
    }
  } catch (err) {
    console.error("[acesso] reenvio:", err);
  }
  return json({ ok: true });
}
