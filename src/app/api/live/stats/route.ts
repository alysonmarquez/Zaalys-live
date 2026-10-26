import { apiAccess } from "@/lib/access";
import { fail, json, unauthorized } from "@/lib/http";
import { createAdminClient } from "@/lib/supabase/server";

// Faturamento real da conta: as LIVEs dos últimos 31 dias e as vendas registradas nelas
// (eventos "sale" da extensão). É o que o dashboard e o Estúdio mostram para quem não é conta de demonstração.

type SaleDetail = { amountCents?: number; commissionCents?: number; title?: string; imageUrl?: string; qty?: number };

export async function GET() {
  const access = await apiAccess();
  if (!access) return unauthorized();
  if (access.demo) return json({ sessions: [] });
  try {
    const admin = createAdminClient();
    const since = new Date(Date.now() - 31 * 86400000).toISOString();
    const { data: sessions, error } = await admin
      .from("live_sessions")
      .select("id, status, started_at, ended_at")
      .eq("user_id", access.userId)
      .gte("started_at", since)
      .order("started_at", { ascending: false })
      .limit(200);
    if (error) return fail(error);
    const ids = (sessions ?? []).map((s) => s.id);
    const { data: events, error: evError } = ids.length
      ? await admin.from("live_events").select("session_id, detail, at").eq("kind", "sale").in("session_id", ids).limit(5000)
      : { data: [], error: null };
    if (evError) return fail(evError);

    return json({
      sessions: (sessions ?? []).map((s) => ({
        id: s.id,
        status: s.status,
        startedAt: s.started_at,
        endedAt: s.ended_at,
        sales: (events ?? [])
          .filter((e) => e.session_id === s.id)
          .map((e) => {
            const d = (e.detail ?? {}) as SaleDetail;
            return {
              at: e.at,
              amountCents: Number(d.amountCents) || 0,
              commissionCents: Number(d.commissionCents) || 0,
              title: d.title ?? "Venda na LIVE",
              imageUrl: d.imageUrl ?? "",
              qty: Number(d.qty) || 1,
            };
          }),
      })),
    });
  } catch (err) {
    return fail(err);
  }
}
