import { z } from "zod";
import { apiAccess } from "@/lib/access";
import { fail, json, unauthorized } from "@/lib/http";
import { createAdminClient } from "@/lib/supabase/server";

// Números editados da LIVE (Estúdio) da conta, guardados no perfil para valerem em qualquer aparelho.
// Sem a coluna profiles.live_settings (migration-2026-10-live-settings.sql), responde vazio e o painel
// segue usando só o navegador.

const Body = z.object({ sim: z.record(z.string(), z.unknown()), overrides: z.record(z.string(), z.unknown()) });

export async function GET() {
  const access = await apiAccess();
  if (!access) return unauthorized();
  if (access.demo) return json({ settings: null });
  const { data, error } = await createAdminClient().from("profiles").select("live_settings").eq("id", access.userId).maybeSingle();
  if (error) return json({ settings: null });
  return json({ settings: data?.live_settings ?? null });
}

export async function PUT(req: Request) {
  const access = await apiAccess();
  if (!access) return unauthorized();
  if (access.demo) return json({ ok: true });
  try {
    const body = Body.parse(await req.json());
    const { error } = await createAdminClient().from("profiles").update({ live_settings: body }).eq("id", access.userId);
    if (error) return json({ ok: false });
    return json({ ok: true });
  } catch (err) {
    return fail(err);
  }
}
