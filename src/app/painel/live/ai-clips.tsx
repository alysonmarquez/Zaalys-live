"use client";

import { useState } from "react";
import { ArrowUpRight, Check, Copy } from "lucide-react";
import { cn } from "@/components/brand";
import { DownloadImages } from "@/components/flow-guide";

// "Gere live com IA": a foto do produto vira 6 clipes no Google Flow (um prompt por clipe, 8 s cada),
// que depois entram em "Clipes da live" no painel da extensão.

type Product = { title: string; imageUrl: string };

/** Nome curto do produto para o prompt (o título do TikTok Shop costuma ser enorme). */
const shortName = (t: string) => t.split(/[-–|,(]/)[0]!.trim().split(/\s+/).slice(0, 7).join(" ");

export function clipPrompts(p: Product) {
  const name = shortName(p.title);
  const base = `Use the attached product photo as the exact reference for "${name}" (same packaging, colors and label). Vertical 9:16, 8 seconds, photorealistic, soft natural window light, clean light background, shallow depth of field, slow steady camera. No text, no logos added, no people's faces.`;
  return [
    { title: "Girando o produto", prompt: `${base} The product slowly rotates 360 degrees on a clean surface, showing every side and the label.` },
    { title: "Desembalando", prompt: `${base} Only hands visible: hands open the package and take the product out, then hold it toward the camera.` },
    { title: "Pousando o produto", prompt: `${base} A hand gently places the product on a wooden table next to a small plant; camera slowly pushes in.` },
    { title: "Detalhe de perto", prompt: `${base} Extreme close-up macro shot gliding over the product's texture and label details.` },
    { title: "Em uso", prompt: `${base} Only hands visible: the product being used in a realistic everyday situation, showing how it works.` },
    { title: "Ambiente do dia a dia", prompt: `${base} The product sits in a cozy, tidy home setting at golden hour; gentle parallax camera move around it.` },
  ];
}

function CopyChip({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      onClick={() =>
        navigator.clipboard
          ?.writeText(text)
          .then(() => {
            setOk(true);
            setTimeout(() => setOk(false), 1600);
          })
          .catch(() => {})
      }
      className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-xs font-semibold hover:bg-muted cursor-pointer"
    >
      {ok ? <Check size={13} className="text-primary" /> : <Copy size={13} />}
      {ok ? "Copiado" : "Prompt"}
    </button>
  );
}

export function AiClips({ product }: { product: Product | null }) {
  const [done, setDone] = useState<number[]>([]);
  if (!product) return <p className="text-sm text-muted-foreground">Escolha o produto da live para ver os prompts.</p>;
  const clips = clipPrompts(product);
  const toggle = (i: number) => setDone((d) => (d.includes(i) ? d.filter((x) => x !== i) : [...d, i]));

  return (
    <div className="space-y-5 rounded-2xl border border-border bg-card/40 p-4">
      <div className="space-y-2">
        <p className="text-sm font-semibold">1. Baixe a foto do produto</p>
        <DownloadImages images={[{ src: product.imageUrl, label: "Foto do produto", filename: `produto-${product.title.slice(0, 40)}` }]} />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold">2. Abra um projeto no Google Flow</p>
        <ol className="space-y-1.5 text-sm text-muted-foreground">
          <li>• Clique em <b className="text-foreground">Novo projeto</b>.</li>
          <li>• Escolha o modo <b className="text-foreground">Ingredientes para vídeo</b>.</li>
          <li>• Toque no <b className="text-foreground">+</b> e envie a foto do produto.</li>
        </ol>
        <a
          href="https://labs.google/fx/tools/flow"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
        >
          Abrir o Google Flow <ArrowUpRight size={15} />
        </a>
        <p className="text-xs text-muted-foreground">O Flow dá créditos grátis todo dia, suficientes para os 6 clipes.</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold">3. Gere os 6 clipes, um por vez</p>
          <span className="text-xs tabular-nums text-muted-foreground">{done.length} de 6</span>
        </div>
        <p className="text-xs text-muted-foreground">Copie um prompt, cole no Flow, gere e baixe o vídeo em MP4. Marque cada clipe quando terminar.</p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {clips.map((c, i) => (
            <li key={c.title} className={cn("flex items-center gap-2 rounded-xl border p-2.5", done.includes(i) ? "border-primary/50 bg-primary/10" : "border-border")}>
              <button
                type="button"
                aria-label={done.includes(i) ? "Desmarcar" : "Marcar como feito"}
                onClick={() => toggle(i)}
                className={cn(
                  "grid size-5 shrink-0 place-items-center rounded-full border-2 text-[10px] font-bold cursor-pointer",
                  done.includes(i) ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/50",
                )}
              >
                {done.includes(i) ? "✓" : ""}
              </button>
              <span className="min-w-0 flex-1 truncate text-sm font-medium">
                {i + 1}. {c.title}
              </span>
              <CopyChip text={c.prompt} />
            </li>
          ))}
        </ul>
      </div>

      <p className="rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground">
        <b className="text-foreground">4.</b> Com os 6 MP4 baixados, no painel MediaFlowMZ Live (dentro do TikTok) toque em <b className="text-foreground">Escolher</b>, em
        “Clipes da live”, e selecione os 6 de uma vez.
      </p>
    </div>
  );
}
