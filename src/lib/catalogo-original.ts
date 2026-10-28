import rows from "@/data/catalogo-original.json";
import type { ProofGoal, ZaalysChange, ZaalysProduct } from "@/lib/zaalys-data";

// Recorte do catálogo do sistema original (lido em 24/10/2026): os mais vendidos de cada
// categoria, com preço, comissão, vendas, foto e link do TikTok Shop. Dados fixos de exemplo:
// não se atualizam sozinhos.
// Formato de cada linha:
// [id, título, categoria, preço¢, comissão%, ganho¢, vendas, views, nota, emAlta, topComissão,
//  imagem, caminhoTikTok, objetivo(f|u), últimaMudança ([p|c, de, para, boa?] ou 0)]
type Row = [
  number, string, string, number, number, number, number, number, number, number, number,
  string, string, string, [string, number, number, number] | 0,
];

export const CATEGORY_LABELS: Record<string, string> = {
  beleza: "Beleza",
  casa: "Casa",
  fitness: "Fitness",
  moda: "Moda",
  pet: "Pet",
  saude: "Saúde",
  tecnologia: "Tecnologia",
};

const brl = (c: number) =>
  (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const compact = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1).replace(".", ",")} mi` : n >= 1000 ? `${Math.round(n / 1000)} mil` : String(n);

/** Link do produto no TikTok Shop do Brasil. "shop/pdp/<id>" sem região cai na loja dos EUA. */
function tiktokUrl(path: string) {
  const id = path.match(/(?:pdp|product)\/(?:[^/]+\/)?(\d{10,})/)?.[1];
  return id ? `https://shop.tiktok.com/view/product/${id}?region=BR&locale=pt-BR` : `https://www.tiktok.com/${path}`;
}

export const CATALOGO_ORIGINAL: ZaalysProduct[] = (rows as Row[]).map((r) => {
  const [id, title, cat, price, pct, earn, sales, views, rating, trending, top, img, path, goal, change] = r;
  const label = CATEGORY_LABELS[cat] ?? cat;
  const earning = earn || Math.round((price * pct) / 100);
  return {
    id: 100000 + id,
    title,
    category: label,
    categoryKey: cat,
    priceCents: price,
    commissionPct: pct,
    earningCents: earning,
    salesCount: sales,
    viewsCount: views,
    rating,
    highCommission: Boolean(top),
    trending: Boolean(trending),
    imageUrl: img,
    affiliateUrl: tiktokUrl(path),
    proofGoal: (goal === "f" ? "fit" : "use") as ProofGoal,
    reasons: [
      sales > 0 ? `${compact(sales)} vendas registradas no TikTok Shop` : "Produto novo no catálogo",
      pct > 0 ? `Comissão de ${pct}%: ${brl(earning)} por venda` : "Comissão a confirmar no TikTok Shop",
    ],
    facts: [
      `Entre os mais vendidos de ${label}`,
      rating > 0 ? `Nota ${String(rating).replace(".", ",")} na loja` : "Ainda sem avaliações",
      views > 0 ? `${compact(views)} visualizações nos vídeos` : "Poucos vídeos publicados",
    ],
    lastChange: change
      ? {
          field: change[0] === "p" ? "priceCents" : "commissionPct",
          tone: change[3] ? "good" : "bad",
          from: change[1],
          to: change[2],
        }
      : undefined,
  } satisfies ZaalysProduct;
});

/** Mudanças de preço e comissão registradas nesse recorte (alimentam o Radar). */
export const CATALOGO_CHANGES: ZaalysChange[] = CATALOGO_ORIGINAL.filter((p) => p.lastChange).map((p, i) => {
  const c = p.lastChange!;
  const before = c.field === "priceCents" ? Math.round((c.from * p.commissionPct) / 100) : Math.round((p.priceCents * c.from) / 100);
  const after = c.field === "priceCents" ? Math.round((c.to * p.commissionPct) / 100) : Math.round((p.priceCents * c.to) / 100);
  return {
    id: `orig-${p.id}`,
    field: c.field,
    tone: c.tone,
    from: c.from,
    to: c.to,
    // Leituras feitas entre 14 e 21/10/2026 no original; espalhadas para a lista ficar ordenada.
    observedAt: new Date(Date.UTC(2026, 9, 21, 12) - i * 3 * 3600 * 1000).toISOString(),
    product: { id: p.id, title: p.title, category: p.category, imageUrl: p.imageUrl, affiliateUrl: p.affiliateUrl },
    earnings: { before, after },
  };
});

/** Os mais vendidos do recorte, para "Produtos para preparar seu próximo vídeo". */
export const CATALOGO_DESTAQUES = [...CATALOGO_ORIGINAL].sort((a, b) => b.salesCount - a.salesCount);
