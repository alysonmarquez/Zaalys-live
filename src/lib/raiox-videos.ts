import rows from "@/data/raiox-videos.json";

// As 98 referências do Raio-X do original (números do FastMoss, coletados em 02/10/2026).
// [título, criador, categoria, views, vendas, capa, caminho do vídeo no TikTok]
type Row = [string, string, string, number, number, string, string];

export type RaioXReference = {
  id: string;
  title: string;
  creator: string;
  category: string;
  views: number;
  sales: number;
  thumbnail: string;
  tiktokUrl: string;
  fastmossUrl: string;
};

export const RAIOX_COLLECTED_AT = "02/10/2026";

export const RAIOX_REFERENCES: RaioXReference[] = (rows as Row[]).map(
  ([title, creator, category, views, sales, thumbnail, path]) => {
    const id = path.split("/").pop() ?? path;
    return {
      id,
      title,
      creator,
      category,
      views,
      sales,
      thumbnail,
      tiktokUrl: `https://www.tiktok.com/${path}`,
      fastmossUrl: `https://www.fastmoss.com/pt/media-source/video/${id}`,
    };
  },
);

export const RAIOX_CATEGORIES = [...new Set(RAIOX_REFERENCES.map((v) => v.category))].sort((a, b) =>
  a.localeCompare(b, "pt-BR"),
);
