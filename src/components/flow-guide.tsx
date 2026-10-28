"use client";

import { useState } from "react";
import { ArrowUpRight, Check, Copy, Download } from "lucide-react";
import { cn } from "@/components/brand";

// Passo a passo para gerar o vídeo no Google Flow: baixar as imagens, copiar o prompt e seguir as etapas
// dentro do Flow (modo "Ingredientes para vídeo"). Usado nos Templates Virais e no Trend AI.

export type FlowImage = { src: string; label: string; filename: string };

const FLOW_URL = "https://labs.google/fx/tools/flow";

/** Link de download: imagens do próprio site baixam direto; as do catálogo passam por /api/media/baixar. */
export function downloadHref(img: FlowImage) {
  if (img.src.startsWith("/")) return img.src;
  return `/api/media/baixar?url=${encodeURIComponent(img.src)}&nome=${encodeURIComponent(img.filename)}`;
}

function CopyButton({ text, label = "Copiar prompt" }: { text: string; label?: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard
          ?.writeText(text)
          .then(() => {
            setOk(true);
            setTimeout(() => setOk(false), 1800);
          })
          .catch(() => {});
      }}
      className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-background px-3 text-xs font-semibold hover:bg-muted cursor-pointer"
    >
      {ok ? <Check size={14} className="text-primary" /> : <Copy size={14} />}
      {ok ? "Copiado" : label}
    </button>
  );
}

export function DownloadImages({ images }: { images: FlowImage[] }) {
  return (
    <div className={cn("grid gap-3", images.length > 1 ? "grid-cols-2" : "grid-cols-1 sm:max-w-[220px]")}>
      {images.map((img) => (
        <div key={img.label} className="overflow-hidden rounded-2xl border border-border bg-card/60">
          <div className="aspect-[3/4] overflow-hidden bg-muted">
            <img src={img.src} alt={img.label} className="size-full object-cover" />
          </div>
          <div className="space-y-2 p-2.5">
            <p className="truncate text-xs font-semibold">{img.label}</p>
            <a
              href={downloadHref(img)}
              download={img.src.startsWith("/") ? `${img.filename}.${img.src.split(".").pop()}` : undefined}
              className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-lg bg-primary text-xs font-semibold text-primary-foreground"
            >
              <Download size={13} /> Baixar foto
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}

export function FlowGuide({ images, prompt, finalStep }: { images: FlowImage[]; prompt: string; finalStep: string }) {
  const steps = [
    <>
      Abra o <strong>Google Flow</strong> e clique em <strong>Novo projeto</strong>. O Flow dá créditos grátis todo dia.
    </>,
    <>
      Na caixa de criação, escolha o modo <strong>Ingredientes para vídeo</strong>.
    </>,
    <>
      Clique no <strong>+</strong> e envie {images.length > 1 ? <>as <strong>{images.length} fotos baixadas</strong> ({images.map((i) => i.label.toLowerCase()).join(" e ")})</> : <>a <strong>foto baixada</strong></>}.
    </>,
    <>
      Cole o <strong>prompt</strong> na caixa de texto e clique em gerar.
    </>,
    <>
      Quando o vídeo ficar pronto, abra o vídeo e <strong>baixe em MP4</strong>.
    </>,
    <>{finalStep}</>,
  ];
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card/60 p-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-primary">Prompt para o Flow</span>
          <CopyButton text={prompt} />
        </div>
        <pre className="max-h-40 overflow-y-auto whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-foreground/90">{prompt}</pre>
      </div>

      <div className="rounded-2xl border border-border bg-card/40 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Passo a passo no Google Flow</p>
        <div className="mt-3 flex items-center gap-2">
          {images.map((img) => (
            <img key={img.label} src={img.src} alt={img.label} className="size-11 rounded-lg object-cover ring-1 ring-border" />
          ))}
          <span className="text-lg text-muted-foreground">+</span>
          <span className="grid h-11 place-items-center rounded-lg bg-muted px-2.5 font-mono text-[10px] text-muted-foreground">prompt</span>
          <span className="text-lg text-muted-foreground">=</span>
          <span className="grid h-11 place-items-center rounded-lg bg-primary/15 px-2.5 text-[11px] font-semibold text-primary">vídeo 8s</span>
        </div>
        <ol className="mt-4 space-y-2.5 text-sm">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">{i + 1}</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href={FLOW_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => navigator.clipboard?.writeText(prompt).catch(() => {})}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
          >
            Copiar prompt e abrir o Flow <ArrowUpRight size={15} />
          </a>
        </div>
      </div>
    </div>
  );
}
