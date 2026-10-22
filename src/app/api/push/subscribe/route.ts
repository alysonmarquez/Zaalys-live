import { z } from "zod";
import { fail, json, unauthorized } from "@/lib/http";
import { createClient } from "@/lib/supabase/server";

const Body = z.object({
  endpoint: z.string().url(),
  keys: z.object({ p256dh: z.string(), auth: z.string() }),
});

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return unauthorized();
  try {
    const sub = Body.parse(await req.json());
    const { error } = await supabase.from("push_subscriptions").upsert(
      { user_id: user.id, endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth },
      { onConflict: "endpoint" },
    );
    if (error) throw error;
    return json({ ok: true });
  } catch (err) {
    return fail(err);
  }
}
