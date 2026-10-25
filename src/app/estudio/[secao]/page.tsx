import { notFound } from "next/navigation";
import { Inbox } from "lucide-react";
import { ESTUDIO_SECOES } from "@/lib/estudio-secoes";

export default async function SecaoPage({ params }: { params: Promise<{ secao: string }> }) {
  const { secao } = await params;
  const s = ESTUDIO_SECOES[secao];
  if (!s) notFound();
  return (
    <div className="flex h-[calc(100svh-5.5rem)] min-h-[520px] flex-col overflow-hidden rounded-xl bg-card">
      <div className="border-b border-border/60 px-4 py-3">
        <h1 className="text-[17px] font-semibold">{s.title}</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">{s.desc}</p>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
        <Inbox size={44} strokeWidth={1.4} className="text-primary" />
        <p className="text-sm">{s.empty}</p>
      </div>
    </div>
  );
}
