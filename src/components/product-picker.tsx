"use client";

import { useMemo, useState } from "react";
import { Check, Search } from "lucide-react";
import { cn } from "@/components/brand";
import { ZAALYS_PRODUCTS, formatBRL, type ZaalysProduct } from "@/lib/zaalys-data";

// Campo de produto com busca: digite parte do nome ou a categoria e escolha na lista (foto, preço e comissão).
const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function ProductPicker({ value, onChange }: { value: ZaalysProduct | null; onChange: (p: ZaalysProduct) => void }) {
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    const words = norm(q).split(/\s+/).filter(Boolean);
    const list = words.length
      ? ZAALYS_PRODUCTS.filter((p) => {
          const hay = norm(`${p.title} ${p.category}`);
          return words.every((w) => hay.includes(w));
        })
      : [...ZAALYS_PRODUCTS].sort((a, b) => b.salesCount - a.salesCount);
    return list.slice(0, 30);
  }, [q]);

  return (
    <div className="space-y-2">
      <label className="flex h-11 items-center gap-2 rounded-xl border border-border bg-background px-3 focus-within:border-primary/60">
        <Search size={16} className="shrink-0 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Busque o produto pelo nome ou categoria"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none"
          aria-label="Buscar produto"
        />
      </label>
      <ul className="max-h-[300px] divide-y divide-border/60 overflow-y-auto rounded-xl border border-border bg-card/60" role="listbox">
        {results.length === 0 && <li className="p-4 text-center text-sm text-muted-foreground">Nenhum produto com esse nome.</li>}
        {results.map((p) => {
          const sel = value?.id === p.id;
          return (
            <li key={p.id}>
              <button
                type="button"
                role="option"
                aria-selected={sel}
                onClick={() => onChange(p)}
                className={cn("flex w-full items-center gap-3 p-2.5 text-left cursor-pointer", sel ? "bg-primary/10" : "hover:bg-muted/60")}
              >
                <img src={p.imageUrl} alt="" className="size-11 shrink-0 rounded-lg bg-muted object-cover" />
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 text-xs font-semibold leading-snug">{p.title}</span>
                  <span className="text-[11px] text-muted-foreground">
                    {p.category} · {formatBRL(p.priceCents)}
                    {p.commissionPct ? ` · ${p.commissionPct}% de comissão` : ""}
                  </span>
                </span>
                {sel && <Check size={16} className="shrink-0 text-primary" />}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
