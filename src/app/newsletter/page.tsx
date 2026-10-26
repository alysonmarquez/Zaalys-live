import Link from "next/link";
import { Brand } from "@/components/brand";

export const metadata = {
  title: "Radar da MediaFlowMZ",
  description: "Os produtos do TikTok Shop que mais pagam por venda, toda segunda no seu e-mail.",
};

const MESSAGES: Record<string, { title: string; body: string }> = {
  confirmado: {
    title: "E-mail confirmado",
    body: "Pronto. Toda segunda você recebe os produtos do TikTok Shop que mais pagam por venda.",
  },
  cancelado: {
    title: "Você saiu da lista",
    body: "Não vamos mais enviar o Radar para este e-mail. Se mudar de ideia, é só se inscrever de novo na página inicial.",
  },
  invalido: {
    title: "Link inválido ou expirado",
    body: "Não encontramos esta inscrição. Peça o Radar de novo na página inicial ou fale com suporte@mediaflowmz.com.",
  },
};

export default async function RadarPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const msg = MESSAGES[status ?? ""] ?? MESSAGES.invalido;
  return (
    <div className="min-h-svh bg-studio">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-10 sm:py-16">
        <Link href="/">
          <Brand />
        </Link>
        <div className="rounded-3xl border border-border bg-card/85 p-8 text-center shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
          <h1 className="font-display text-2xl font-extrabold tracking-tight">{msg.title}</h1>
          <p className="mt-2 text-pretty text-sm/relaxed text-muted-foreground">{msg.body}</p>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-background/60 px-4 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Voltar para a MediaFlowMZ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
