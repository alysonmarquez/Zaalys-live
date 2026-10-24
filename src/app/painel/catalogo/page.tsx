"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useMemo, useState } from "react";
import { RaisedButton, cn } from "@/components/brand";
import {
  PROOF_GOAL_LABELS,
  ZAALYS_CATEGORIES,
  ZAALYS_CHANGES,
  ZAALYS_PRODUCTS,
  type ZaalysProduct,
  compactNumber,
  formatBRL,
} from "@/lib/zaalys-data";

type SortKey = "recommended" | "trending" | "sales" | "earnings" | "commission" | "recent";

function CatalogoInner() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const initialProdId = Number(searchParams.get("produto") ?? "0") || null;

  const [category, setCategory] = useState<string | null>(null);
  const [search, setSearch] = useState(initialQuery);
  const [sort, setSort] = useState<SortKey>("recommended");
  const [customProducts, setCustomProducts] = useState<ZaalysProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ZaalysProduct | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newLink, setNewLink] = useState("");
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newCommission, setNewCommission] = useState("");

  const allProducts = useMemo(
    () => [...customProducts, ...ZAALYS_PRODUCTS],
    [customProducts],
  );

  useEffect(() => {
    if (initialProdId) {
      const found = allProducts.find((p) => p.id === initialProdId);
      if (found) setSelectedProduct(found);
    }
  }, [initialProdId, allProducts]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allProducts
      .filter((p) => (!category ? true : p.categoryKey === category))
      .filter((p) =>
        !q
          ? true
          : p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q),
      )
      .sort((a, b) => {
        if (sort === "trending") return Number(Boolean(b.trending)) - Number(Boolean(a.trending)) || b.salesCount - a.salesCount;
        if (sort === "sales") return b.salesCount - a.salesCount;
        if (sort === "earnings") return b.earningCents - a.earningCents;
        if (sort === "commission") return b.commissionPct - a.commissionPct;
        if (sort === "recent") return b.id - a.id;
        return b.earningCents * b.salesCount - a.earningCents * a.salesCount;
      });
  }, [allProducts, category, search, sort]);

  // O link do TikTok não pode ser lido daqui: a pessoa informa nome, preço e comissão
  // que aparecem no app. Nada é inventado; vendas e views ficam zeradas.
  function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();
    const priceCents = Math.round(Number(newPrice.replace(/\./g, "").replace(",", ".")) * 100);
    const commissionPct = Number(newCommission.replace(",", "."));
    if (!newName.trim() || !(priceCents > 0) || !(commissionPct > 0 && commissionPct <= 100)) return;
    setAdding(true);
    const created: ZaalysProduct = {
      id: Date.now(),
      title: newName.trim(),
      category: "Meus produtos",
      categoryKey: "meus",
      priceCents,
      commissionPct,
      earningCents: Math.round((priceCents * commissionPct) / 100),
      salesCount: 0,
      viewsCount: 0,
      rating: 0,
      highCommission: commissionPct >= 15,
      trending: false,
      imageUrl: "/media/central-produtos.webp",
      affiliateUrl: newLink.trim().startsWith("http") ? newLink.trim() : "https://www.tiktok.com/",
      proofGoal: "use",
      reasons: ["Adicionado por você, com o preço e a comissão que aparecem no TikTok Shop."],
      facts: [`Preço informado: ${formatBRL(priceCents)}`, `Comissão informada: ${commissionPct}%`],
    };
    setCustomProducts((prev) => [created, ...prev]);
    setSelectedProduct(created);
    setNewLink("");
    setNewName("");
    setNewPrice("");
    setNewCommission("");
    setAdding(false);
    setAddModalOpen(false);
  }

  return (
    <div className="space-y-6">
      {/* Header + Pulse Badge */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Produtos Virais
          </h1>
          <p className="mt-1.5 text-muted-foreground">
            Escolha pelo que sabemos do produto e pelo conteúdo que você pode preparar.
          </p>
        </div>

        <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
          <span className="relative flex size-2 shrink-0" aria-hidden="true">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/60 [animation-duration:2.4s]" />
            <span className="relative inline-flex size-2 rounded-full bg-primary" />
          </span>
          <span className="tabular">
            <span className="font-semibold text-foreground">248</span> produtos
          </span>
          <span className="tabular">
            · <span className="font-semibold text-primary">+18</span> novos
          </span>
          <span>· atualizado há 4 min</span>
          <Link
            href="/painel/radar"
            className="tabular underline-offset-2 transition-colors hover:text-foreground hover:underline"
          >
            · {ZAALYS_CHANGES.length} mudanças
          </Link>
        </span>
      </header>

      {/* Filters Bar */}
      <div className="flex flex-col gap-3">
        {/* Category Pills */}
        <div className="-mx-1 flex gap-1.5 overflow-x-auto rounded-full bg-muted/40 p-1 px-1.5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {ZAALYS_CATEGORIES.map((cat) => {
            const active = cat.key === category;
            return (
              <button
                key={cat.label}
                type="button"
                onClick={() => setCategory(cat.key)}
                className={cn(
                  "shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide transition-[transform,color,background-color,border-color] duration-150 ease-out active:scale-[0.96] cursor-pointer",
                  active
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground",
                )}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Search + Sort + Add Product */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[220px] flex-1">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar produto…"
              aria-label="Buscar produto"
              className="h-10.5 w-full rounded-2xl border border-black/[0.06] bg-card/80 pl-10 pr-4 text-sm outline-none shadow-2xs focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring/40 dark:border-white/[0.08]"
            />
          </div>

          <div className="flex w-full gap-2.5 sm:w-auto">
            <select
              aria-label="Ordenar produtos"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="h-10.5 min-w-0 flex-1 rounded-2xl border border-black/[0.06] bg-card/80 px-3.5 text-xs font-semibold text-foreground shadow-2xs outline-none sm:w-52 sm:flex-none dark:border-white/[0.08]"
            >
              <option value="recommended">Recomendados</option>
              <option value="trending">Em alta</option>
              <option value="sales">Mais vendidos</option>
              <option value="earnings">Maior ganho por venda</option>
              <option value="commission">Maior comissão</option>
              <option value="recent">Recentes</option>
            </select>

            <RaisedButton
              size="default"
              onClick={() => setAddModalOpen(true)}
              className="h-10.5 shrink-0 rounded-2xl px-4 text-xs"
            >
              + Adicionar produto
            </RaisedButton>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 px-6 py-16 text-center text-sm text-muted-foreground">
          Nenhum produto encontrado para esse filtro.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedProduct(p)}
              className="group flex flex-col overflow-hidden rounded-3xl border border-black/[0.06] bg-card text-left transition-[transform,border-color,box-shadow] duration-200 ease-out hover:border-primary/40 hover:shadow-[0_16px_36px_-12px_rgba(0,0,0,0.4)] active:scale-[0.98] cursor-pointer dark:border-white/[0.08]"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
                <img
                  src={p.imageUrl}
                  alt={p.title}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                {p.highCommission && (
                  <span className="absolute left-2.5 top-2.5 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-xs">
                    Alta comissão
                  </span>
                )}
                <div className="absolute inset-x-2.5 bottom-2.5 flex items-center justify-between text-[11px] font-medium text-white/90">
                  <span className="rounded-full bg-black/55 px-2 py-0.5 backdrop-blur-md">
                    {p.commissionPct}% comissão
                  </span>
                  <span className="tabular rounded-full bg-black/55 px-2 py-0.5 backdrop-blur-md">
                    {compactNumber(p.salesCount)} vendas
                  </span>
                </div>
              </div>

              <div className="flex flex-1 flex-col justify-between p-3.5">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {p.category}
                  </span>
                  <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-foreground">
                    {p.title}
                  </h3>
                </div>

                <div className="mt-3 flex items-end justify-between border-t border-border/60 pt-2.5">
                  <div>
                    <span className="block text-[10px] text-muted-foreground">Preço</span>
                    <span className="tabular text-xs font-medium text-foreground">
                      {formatBRL(p.priceCents)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] text-muted-foreground">Ganho / venda</span>
                    <span className="tabular text-sm font-bold text-primary">
                      {formatBRL(p.earningCents)}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Product Detail Modal (Exact Zaalys Flow) */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="apple-card grid max-h-[90dvh] w-full max-w-2xl overflow-hidden shadow-2xl sm:grid-cols-[220px_1fr]">
            <div className="relative h-52 bg-muted sm:h-full">
              <img
                src={selectedProduct.imageUrl}
                alt={selectedProduct.title}
                className="size-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute inset-x-3 bottom-3 text-white">
                <span className="text-[10px] uppercase tracking-wider text-white/70">
                  Ganho por venda
                </span>
                <p className="tabular text-xl font-extrabold text-primary">
                  {formatBRL(selectedProduct.earningCents)}
                </p>
                <p className="text-xs text-white/80">
                  Preço {formatBRL(selectedProduct.priceCents)} · {selectedProduct.commissionPct}%
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-between overflow-y-auto p-5 sm:p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                      {selectedProduct.category}
                    </span>
                    <h2 className="mt-2 font-display text-lg font-bold leading-snug">
                      {selectedProduct.title}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(null)}
                    className="rounded-lg p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Fluxo recomendado */}
                <div className="rounded-2xl border border-border bg-background/50 p-3 text-xs">
                  <span className="font-semibold text-muted-foreground">Fluxo recomendado: </span>
                  <span className="font-semibold text-foreground">Descobrir</span>
                  <span className="mx-1.5 text-muted-foreground">→</span>
                  <span className="font-semibold text-primary">Afiliar</span>
                  <span className="mx-1.5 text-muted-foreground">→</span>
                  <span className="font-semibold text-foreground">Criar</span>
                </div>

                {/* Por que conhecer este produto */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Por que conhecer este produto
                  </h3>
                  <ul className="mt-1.5 space-y-1 text-xs text-foreground/90">
                    {selectedProduct.reasons.map((r, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-primary">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Pergunta recomendada no vídeo:{" "}
                    <strong className="text-foreground">
                      {PROOF_GOAL_LABELS[selectedProduct.proofGoal]}
                    </strong>
                  </p>
                </div>

                {/* Fatos e fontes */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Fatos e fontes do produto
                  </h3>
                  <ul className="mt-1.5 space-y-1 text-xs text-muted-foreground">
                    {selectedProduct.facts.map((f, i) => (
                      <li key={i}>✓ {f}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Próximos passos com este produto */}
              <div className="mt-6 space-y-2 border-t border-border pt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Próximos passos com este produto
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Link
                    href={`/painel/influencers?produto=${selectedProduct.id}`}
                    className="btn-primary py-2 text-xs"
                  >
                    Criar em Templates Virais
                  </Link>
                  <Link
                    href={`/painel/roteiros?produto=${encodeURIComponent(selectedProduct.title)}&preco=${encodeURIComponent(formatBRL(selectedProduct.priceCents))}`}
                    className="btn-ghost py-2 text-xs"
                  >
                    Gerar roteiro no Trend AI
                  </Link>
                  <Link
                    href={`/painel/live?produto=${selectedProduct.id}`}
                    className="btn-ghost py-2 text-xs"
                  >
                    Usar na Live Infinita
                  </Link>
                  <a
                    href={selectedProduct.affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost py-2 text-xs"
                  >
                    Afiliar no TikTok Shop ↗
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Adicionar Produto Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="apple-card w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-bold">Adicionar um produto</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Copie do app do TikTok Shop o nome, o preço e a comissão do produto.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddProduct} className="mt-4 space-y-3">
              <input
                type="text"
                inputMode="url"
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                placeholder="https://vt.tiktok.com/... (opcional)"
                className="field text-sm"
              />
              <input
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nome do produto"
                className="field text-sm"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  required
                  inputMode="decimal"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="Preço (ex.: 89,90)"
                  className="field text-sm"
                />
                <input
                  required
                  inputMode="decimal"
                  value={newCommission}
                  onChange={(e) => setNewCommission(e.target.value)}
                  placeholder="Comissão % (ex.: 15)"
                  className="field text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Fechar
                </button>
                <RaisedButton type="submit" size="sm" disabled={adding || !newName.trim()}>
                  {adding ? "Adicionando…" : "Adicionar"}
                </RaisedButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CatalogoPage() {
  return (
    <Suspense fallback={null}>
      <CatalogoInner />
    </Suspense>
  );
}
