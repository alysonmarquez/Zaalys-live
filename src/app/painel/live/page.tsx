import { PageHeader } from "@/components/page-header";
import { requireAccess } from "@/lib/access";
import type { LiveScript } from "@/lib/ai/prompts";
import { createClient } from "@/lib/supabase/server";
import { LiveAssistant } from "./live-assistant";

const STATUS: Record<string, { label: string; className: string }> = {
  running: { label: "No ar", className: "text-onair" },
  ended: { label: "Encerrada", className: "text-muted" },
  dropped: { label: "Caiu", className: "text-onair" },
  warning: { label: "Com aviso", className: "text-warn" },
};

export default async function LivePage() {
  await requireAccess();
  const supabase = await createClient();
  const [{ data: scripts }, { data: sessions }] = await Promise.all([
    supabase.from("scripts").select("id, title, content, created_at").eq("kind", "live").order("created_at", { ascending: false }).limit(10),
    supabase.from("live_sessions").select("id, status, started_at, ended_at, products").eq("mode", "infinite").order("started_at", { ascending: false }).limit(8),
  ]);

  return (
    <>
      <PageHeader title="Assistente de live">
        Para apresentar: gere o roteiro e abra o modo live. Para rodar sem você na câmera, use a extensão (chave em
        Extensão e alertas).
      </PageHeader>

      <LiveAssistant saved={(scripts ?? []).map((s) => ({ id: s.id, title: s.title, script: s.content as LiveScript }))} />

      <section className="mt-14">
        <h2 className="mb-3 text-lg font-bold">Lives infinitas recentes</h2>
        {sessions?.length ? (
          <ul className="panel divide-y divide-line">
            {sessions.map((s) => {
              const st = STATUS[s.status] ?? STATUS.ended;
              const products = (s.products as { name: string }[]).map((p) => p.name).join(", ");
              return (
                <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
                  <span className="min-w-0 truncate">{products || "Sem produtos"}</span>
                  <span className="text-sm">
                    <span className={`font-semibold ${st.className}`}>{st.label}</span>
                    <span className="text-muted"> · {new Date(s.started_at).toLocaleString("pt-BR")}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-muted">Nenhuma ainda. Quando a extensão ligar uma live, ela aparece aqui.</p>
        )}
      </section>
    </>
  );
}
