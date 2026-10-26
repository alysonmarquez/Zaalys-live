import { apiAccess } from "@/lib/access";
import { fail, json, unauthorized } from "@/lib/http";
import { createAdminClient } from "@/lib/supabase/server";
import { ensureRefCode, refFromInvite } from "@/lib/referrals";

// Código fixo da conta para os links de convite (/convite/<código>). Criado na primeira vez.
export async function GET() {
  const access = await apiAccess();
  if (!access) return unauthorized();
  if (access.demo) return json({ code: refFromInvite(access.handle || "creator") || "creator" });
  try {
    const code = await ensureRefCode(createAdminClient(), access.userId, access.handle || access.email.split("@")[0]!);
    return json({ code });
  } catch (err) {
    return fail(err);
  }
}
