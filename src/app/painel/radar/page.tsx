import { EmptyState, PageHeader } from "@/components/page-header";
import { requireAccess } from "@/lib/access";
import { brl } from "@/lib/payments";
import { createClient } from "@/lib/supabase/server";

function Delta({ before, after, format, higherIsGood }: { before: number; after: number; format: (n: number) => string; higherIsGood: boolean }) {
  if (before === after) return <span className="text-muted">{format(after)}</span>;
  const good = after > before === higherIsGood;
  return (
    <span>
      <span className="text-muted line-through">{format(before)}</span>{" "}
      <span className={`font-semibold ${good ? "text-on" : "text-onair"}`}>{format(after)}</span>
    </span>
  );
}

export default async function Radar() {
  await requireAccess();
  const supabase = await createClient();
  const { data: changes } = await supabase.from("product_changes").select("*").order("read_at", { ascending: false });

  return (
    <>
      <PageHeader title="Radar de mudanças">O que mudou de preço ou comissão entre as duas últimas leituras do catálogo.</PageHeader>
      {!changes?.length ? (
        <EmptyState>Nada mudou desde a última leitura.</EmptyState>
      ) : (
        <div className="panel overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-[15px]">
            <thead className="border-b border-line text-sm text-muted">
              <tr>
                <th className="px-5 py-3 font-semibold">Produto</th>
                <th className="px-5 py-3 font-semibold">Preço</th>
                <th className="px-5 py-3 font-semibold">Comissão</th>
                <th className="px-5 py-3 font-semibold">Lido em</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {changes.map((c) => (
                <tr key={c.product_id}>
                  <td className="px-5 py-3.5">
                    <span className="font-medium">{c.name}</span> <span className="text-sm text-muted">{c.niche}</span>
                  </td>
                  <td className="px-5 py-3.5 tabular-nums">
                    <Delta before={c.old_price_cents} after={c.new_price_cents} format={brl} higherIsGood={false} />
                  </td>
                  <td className="px-5 py-3.5 tabular-nums">
                    <Delta before={Number(c.old_commission_pct)} after={Number(c.new_commission_pct)} format={(n) => `${n}%`} higherIsGood />
                  </td>
                  <td className="px-5 py-3.5 text-sm text-muted">{new Date(c.read_at).toLocaleDateString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
