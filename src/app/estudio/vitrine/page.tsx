"use client";

import { useEffect, useMemo, useState } from "react";
import { Store, X } from "lucide-react";
import { cn } from "@/components/brand";
import { CATALOGO_ORIGINAL } from "@/lib/catalogo-original";
import { formatBRL } from "@/lib/zaalys-data";
import { Card, Empty, GrayButton, PageTitle, SearchBox, TealButton, Table } from "../ui";

// Vitrine do criador: produtos adicionados a partir do catálogo do clone (fica salva neste navegador).
type Item = { id: number; hidden: boolean };
const KEY = "zaalys_vitrine";

export default function VitrinePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<number[]>([]);
  const [picker, setPicker] = useState(false);
  const [pq, setPq] = useState("");

  useEffect(() => {
    try {
      setItems(JSON.parse(localStorage.getItem(KEY) || "[]"));
    } catch {}
  }, []);
  const save = (next: Item[]) => {
    setItems(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  };

  const rows = useMemo(
    () =>
      items
        .map((it) => ({ it, p: CATALOGO_ORIGINAL.find((p) => p.id === it.id)! }))
        .filter((r) => r.p && (!q || r.p.title.toLowerCase().includes(q.toLowerCase()))),
    [items, q],
  );
  const options = CATALOGO_ORIGINAL.filter((p) => !items.some((i) => i.id === p.id) && (!pq || p.title.toLowerCase().includes(pq.toLowerCase()))).slice(0, 40);

  const bulk = (fn: (i: Item) => Item | null) => {
    save(items.map((i) => (sel.includes(i.id) ? fn(i) : i)).filter(Boolean) as Item[]);
    setSel([]);
  };
  const elevate = () => {
    const top = items.filter((i) => sel.includes(i.id));
    save([...top, ...items.filter((i) => !sel.includes(i.id))]);
    setSel([]);
  };

  return (
    <Card className="min-h-[calc(100svh-5.5rem)]">
      <div className="flex items-start justify-between gap-4">
        <PageTitle>Produtos da vitrine</PageTitle>
        <TealButton onClick={() => setPicker(true)}>Adicionar novos produtos</TealButton>
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
        <SearchBox placeholder="Pesquisar produtos" value={q} onChange={setQ} className="w-[366px] max-w-full" />
        <div className="flex gap-3">
          <GrayButton className="bg-black/[0.03]" onClick={() => bulk((i) => ({ ...i, hidden: false }))}>Mostrar</GrayButton>
          <GrayButton className="bg-black/[0.03]" onClick={() => bulk((i) => ({ ...i, hidden: true }))}>Ocultar</GrayButton>
          <GrayButton className="bg-black/[0.03]" onClick={elevate}>Elevar</GrayButton>
          <GrayButton className="bg-black/[0.03]" onClick={() => bulk(() => null)}>Remover</GrayButton>
        </div>
      </div>

      <div className="mt-4">
        <Table
          cols={["", "N.º", "Produto", "Preço", "Comissão estimada", "Estoque", "Status do produto", "Ação"]}
          empty={rows.length === 0 && <Empty icon={Store} text="Sua vitrine ainda não tem produtos. Adicione produtos do catálogo." />}
        >
          {rows.map(({ it, p }, i) => (
            <tr key={it.id} className={cn(it.hidden && "opacity-55")}>
              <td className="px-3 py-3">
                <input
                  type="checkbox"
                  checked={sel.includes(it.id)}
                  onChange={(e) => setSel((s) => (e.target.checked ? [...s, it.id] : s.filter((x) => x !== it.id)))}
                  className="size-4 accent-primary"
                />
              </td>
              <td className="px-3">{it.hidden ? "-" : i + 1}</td>
              <td className="px-3 py-3">
                <div className="flex gap-2">
                  <img src={p.imageUrl} alt="" className="size-[46px] shrink-0 rounded object-cover" />
                  <div className="min-w-0 max-w-[170px]">
                    <p className="line-clamp-2 text-sm">{p.title}</p>
                    <p className="text-xs text-black/45">{p.category}</p>
                  </div>
                </div>
              </td>
              <td className="px-3">{formatBRL(p.priceCents)}</td>
              <td className="px-3">{formatBRL(p.earningCents)}</td>
              <td className="px-3 text-xs">Em estoque</td>
              <td className="px-3">
                <span className="rounded bg-[#eafaf6] px-2 py-0.5 text-xs font-medium text-primary">Ativo</span>
              </td>
              <td className="px-3 text-sm font-medium text-primary">
                <button type="button" className="block cursor-pointer" onClick={() => save(items.map((x) => (x.id === it.id ? { ...x, hidden: !x.hidden } : x)))}>
                  {it.hidden ? "Mostrar" : "Ocultar"}
                </button>
                <a href={p.affiliateUrl} target="_blank" rel="noreferrer" className="block">Editar</a>
                <button type="button" className="block cursor-pointer" onClick={() => save(items.filter((x) => x.id !== it.id))}>
                  Remover
                </button>
              </td>
            </tr>
          ))}
        </Table>
      </div>

      {picker && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => setPicker(false)}>
          <div className="flex max-h-[85svh] w-full max-w-2xl flex-col rounded-xl bg-card" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-black/10 p-4">
              <h2 className="font-semibold">Adicionar novos produtos</h2>
              <button type="button" aria-label="Fechar" onClick={() => setPicker(false)} className="cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <div className="p-4 pb-2">
              <SearchBox placeholder="Pesquisar produtos" value={pq} onChange={setPq} />
            </div>
            <ul className="min-h-0 flex-1 divide-y divide-black/[0.06] overflow-y-auto px-4">
              {options.map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-2.5">
                  <img src={p.imageUrl} alt="" className="size-11 rounded object-cover" />
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-1 text-sm">{p.title}</span>
                    <span className="text-xs text-black/50">
                      {formatBRL(p.priceCents)} · comissão {formatBRL(p.earningCents)}
                    </span>
                  </span>
                  <TealButton className="h-8 px-3 text-xs" onClick={() => save([...items, { id: p.id, hidden: false }])}>
                    Adicionar
                  </TealButton>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Card>
  );
}
