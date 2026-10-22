import Link from "next/link";
import { EmptyState, PageHeader } from "@/components/page-header";
import { getAccess } from "@/lib/access";
import { createClient } from "@/lib/supabase/server";

const SHORTCUTS = [
  { href: "/painel/live", title: "Montar uma live", text: "Roteiro por produto e modo tela cheia." },
  { href: "/painel/roteiros", title: "Criar roteiro de vídeo", text: "Gancho, cenas, falas e prompt pronto." },
  { href: "/painel/catalogo", title: "Escolher produto", text: "Compare preço e comissão." },
  { href: "/painel/conta", title: "Ligar a live infinita", text: "Pegue sua chave e instale a extensão." },
];

export default async function PainelHome() {
  const access = await getAccess();
  const supabase = await createClient();
  const { data: scripts } = await supabase
    .from("scripts")
    .select("id, title, kind, created_at")
    .order("created_at", { ascending: false })
    .limit(6);

  return (
    <>
      <PageHeader title="Início">
        {access?.active
          ? access.plan === "lifetime"
            ? "Seu acesso é vitalício."
            : `Plano mensal ativo até ${new Date(access.expiresAt!).toLocaleDateString("pt-BR")}.`
          : "Você ainda não tem um plano ativo."}
      </PageHeader>

      {!access?.active && (
        <div className="panel mb-8 flex flex-wrap items-center justify-between gap-4 border-violet bg-violet-soft p-5">
          <p className="font-semibold">Comprou com outro e-mail? Entre com o e-mail da compra para liberar o acesso.</p>
          <Link href="/#planos" className="btn-primary">Ver planos</Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {SHORTCUTS.map((s) => (
          <Link key={s.href} href={s.href} className="panel block p-5 hover:border-violet">
            <h2 className="text-lg font-bold">{s.title}</h2>
            <p className="mt-1 text-sm text-muted">{s.text}</p>
          </Link>
        ))}
      </div>

      <h2 className="mt-12 mb-4 text-xl font-bold">Últimos roteiros</h2>
      {scripts?.length ? (
        <ul className="panel divide-y divide-line">
          {scripts.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
              <span className="truncate font-medium">{s.title}</span>
              <span className="shrink-0 text-sm text-muted">
                {s.kind === "live" ? "Live" : "Vídeo"} · {new Date(s.created_at).toLocaleDateString("pt-BR")}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState>Os roteiros que você gerar aparecem aqui.</EmptyState>
      )}
    </>
  );
}
