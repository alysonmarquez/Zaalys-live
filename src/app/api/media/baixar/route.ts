import { NextResponse } from "next/server";

// Baixa a foto do produto (servidores de imagem do TikTok Shop) com "Salvar como", para enviar no Google Flow.
// Só aceita os hosts das fotos do catálogo: não é um proxy aberto.
const HOSTS = [/^s\.500fd\.com$/, /^p\d+-oec-[a-z0-9-]+\.ibyteimg\.com$/, /^p\d+-[a-z0-9-]+\.tiktokcdn(-us)?\.com$/];
const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" };

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  let src: URL;
  try {
    src = new URL(params.get("url") ?? "");
  } catch {
    return NextResponse.json({ error: "Endereço inválido" }, { status: 400 });
  }
  if (src.protocol !== "https:" || !HOSTS.some((h) => h.test(src.hostname))) {
    return NextResponse.json({ error: "Imagem fora do catálogo" }, { status: 400 });
  }
  const res = await fetch(src, { headers: { "user-agent": "Mozilla/5.0" } }).catch(() => null);
  const type = res?.headers.get("content-type")?.split(";")[0] ?? "";
  if (!res?.ok || !type.startsWith("image/")) return NextResponse.json({ error: "Não consegui baixar a imagem" }, { status: 502 });
  const base = (params.get("nome") || "produto").normalize("NFD").replace(/[^\w-]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "produto";
  return new NextResponse(res.body, {
    headers: {
      "content-type": type,
      "content-disposition": `attachment; filename="${base}.${EXT[type] ?? "jpg"}"`,
      "cache-control": "public, max-age=86400",
    },
  });
}
