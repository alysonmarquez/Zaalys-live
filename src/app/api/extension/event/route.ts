import { z } from "zod";
import { fail, json, licenseAuth } from "@/lib/http";
import { notifyUser } from "@/lib/push";
import { createAdminClient } from "@/lib/supabase/server";

const Body = z.object({
  sessionId: z.string().uuid().optional(),
  kind: z.enum(["start", "greeting", "comment", "pin", "answer", "sale", "drop", "warning", "end", "heartbeat"]),
  detail: z.record(z.string(), z.unknown()).optional(),
  products: z.array(z.object({ name: z.string() })).optional(),
});

const ALERTS: Partial<Record<z.infer<typeof Body>["kind"], { title: string; body: string; status: string }>> = {
  drop: { title: "Sua live caiu", body: "A live infinita parou de transmitir. Confira o computador.", status: "dropped" },
  warning: { title: "Aviso na sua live", body: "O TikTok mostrou um aviso de violação na live.", status: "warning" },
  end: { title: "Live encerrada", body: "Sua live terminou.", status: "ended" },
};

export const OPTIONS = () => new Response(null, { status: 204 });

// A extensão registra o que acontece na live; quedas, avisos e fim geram push no celular.
export async function POST(req: Request) {
  const auth = await licenseAuth(req);
  if (!auth) return json({ error: "Licença inválida" }, 401);
  try {
    const body = Body.parse(await req.json());
    if ("demo" in auth) return json(body.kind === "start" ? { sessionId: crypto.randomUUID() } : { ok: true });
    const admin = createAdminClient();

    if (body.kind === "start") {
      const { data } = await admin
        .from("live_sessions")
        .insert({ user_id: auth.userId, mode: "infinite", products: body.products ?? [] })
        .select("id")
        .single();
      return json({ sessionId: data?.id });
    }

    if (!body.sessionId) return json({ error: "sessionId obrigatório" }, 400);
    const { data: session } = await admin
      .from("live_sessions")
      .select("id, user_id")
      .eq("id", body.sessionId)
      .maybeSingle();
    if (!session || session.user_id !== auth.userId) return json({ error: "Sessão não encontrada" }, 404);

    if (body.kind !== "heartbeat") {
      await admin.from("live_events").insert({ session_id: session.id, kind: body.kind, detail: body.detail ?? null });
    }

    const alert = ALERTS[body.kind];
    if (alert) {
      await admin
        .from("live_sessions")
        .update({ status: alert.status, ...(body.kind === "end" || body.kind === "drop" ? { ended_at: new Date().toISOString() } : {}) })
        .eq("id", session.id);
      await notifyUser(auth.userId, { title: alert.title, body: alert.body, url: "/painel/live" });
    }

    return json({ ok: true });
  } catch (err) {
    return fail(err);
  }
}
