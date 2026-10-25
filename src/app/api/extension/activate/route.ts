import { z } from "zod";
import { fail, json } from "@/lib/http";
import { createAdminClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/access";

const Body = z.object({
  key: z.string().regex(/^[A-F0-9]{24}$/i, "Chave inválida"),
  deviceId: z.string().regex(/^[\w-]{8,64}$/),
  label: z.string().max(60).optional(),
});

export const OPTIONS = () => new Response(null, { status: 204 });

/**
 * Ativa a chave neste computador. Um computador por vez:
 * ativar em outro desconecta o anterior.
 */
export async function POST(req: Request) {
  try {
    const { key, deviceId, label } = Body.parse(await req.json());
    if (isDemoMode()) return json({ ok: true, replacedOtherDevice: false });
    const admin = createAdminClient();
    const { data: lic } = await admin
      .from("licenses")
      .select("id, user_id, device_id")
      .eq("key", key.toUpperCase())
      .maybeSingle();
    if (!lic) return json({ error: "Chave não encontrada" }, 404);

    const { data: subs } = await admin
      .from("subscriptions")
      .select("plan, expires_at")
      .eq("user_id", lic.user_id)
      .eq("status", "active");
    const active = (subs ?? []).some(
      (s) => s.plan === "lifetime" || (s.expires_at && Date.parse(s.expires_at) > Date.now()),
    );
    if (!active) return json({ error: "Plano inativo. Renove o acesso no painel." }, 402);

    const replaced = Boolean(lic.device_id && lic.device_id !== deviceId);
    await admin
      .from("licenses")
      .update({ device_id: deviceId, device_label: label ?? null, activated_at: new Date().toISOString() })
      .eq("id", lic.id);

    return json({ ok: true, replacedOtherDevice: replaced });
  } catch (err) {
    return fail(err);
  }
}
