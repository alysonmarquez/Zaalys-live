import Link from "next/link";
import { EmptyState, PageHeader } from "@/components/page-header";
import { requireAccess } from "@/lib/access";
import { brl } from "@/lib/payments";
import { createClient } from "@/lib/supabase/server";

type Search = { nicho?: string; ordem?: string };

export default async function Catalogo({ searchParams }: { searchParams: Promise<Search> }) {
  await requireAccess();
  const { nicho, ordem = "ganho" } = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("products").select("*").eq("active", true);
  if (nicho) query = query.eq("niche", nicho);
  const [{ data: products }, { data: niches }] = await Promise.all([
    query,
    supabase.from("products").select("niche").eq("active", true),
  ]);

  const rows = (products ?? [])
    .map((p) => ({ ...p, earning: Math.round((p.price_cents * Number(p.commission_pct)) / 100) }))
    .sort((a, b) =>
      ordem === "comissao" ? b.commission_pct - a.commission_pct : ordem === "preco" ? a.price_cents - b.price_cents : b.earning - a.earning,
    );
  const nicheList = [...new Set((niches ?? []).map((n) => n.niche))].sort();

  const link = (params: Search) => {
    const q = new URLSearchParams({ ...(nicho ? { nicho } : {}), ordem, ...params } as Record<string, string>);
    if (params.nicho === "") q.delete("nicho");
    return `/painel/catalogo?${q}`;
  };

  return (
    <>
      <PageHeader title="Catálogo">Quanto cada venda paga, para escolher o produto antes de gravar.</PageHeader>

      <div className="mb-5 flex flex-wrap items-center gap-2 text-sm">
        <Link href={link({ nicho: "" })} className={!nicho ? "btn-primary py-1.5" : "btn-ghost py-1.5"}>Todos</Link>
        {nicheList.map((n) => (
          <Link key={n} href={link({ nicho: n })} className={nicho === n ? "btn-primary py-1.5" : "btn-ghost py-1.5"}>
            {n}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <EmptyState>Nenhum produto nesse nicho ainda.</EmptyState>
      ) : (
        <div className="panel overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-[15px]">
            <thead className="border-b border-line text-sm text-muted">
              <tr>
                <th className="px-5 py-3 font-semibold">Produto</th>
                <th className="px-5 py-3 font-semibold">Nicho</th>
                <th className="px-5 py-3 font-semibold"><Link href={link({ ordem: "preco" })}>Preço</Link></th>
                <th className="px-5 py-3 font-semibold"><Link href={link({ ordem: "comissao" })}>Comissão</Link></th>
                <th className="px-5 py-3 font-semibold"><Link href={link({ ordem: "ganho" })}>Você recebe por venda</Link></th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((p) => (
                <tr key={p.id}>
                  <td className="px-5 py-3.5 font-medium">{p.name}</td>
                  <td className="px-5 py-3.5 text-muted">{p.niche}</td>
                  <td className="px-5 py-3.5 tabular-nums">{brl(p.price_cents)}</td>
                  <td className="px-5 py-3.5 tabular-nums">{Number(p.commission_pct)}%</td>
                  <td className="px-5 py-3.5 font-semibold tabular-nums text-on">{brl(p.earning)}</td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      href={`/painel/roteiros?produto=${encodeURIComponent(p.name)}&preco=${encodeURIComponent(brl(p.price_cents))}`}
                      className="text-sm font-semibold text-violet"
                    >
                      Criar roteiro
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
