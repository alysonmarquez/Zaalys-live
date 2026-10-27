"use client";

import { LazyVideo } from "@/components/lazy-video";
import React, { useState } from "react";
import { ArrowUpRight, ChevronLeft, Download } from "lucide-react";
import { RaisedButton, cn } from "@/components/brand";
import {
  TREND_CTAS,
  TREND_FORMATS_ORIGINAL,
  TREND_TONES,
  type TrendCharacter,
  type TrendFormat,
} from "@/lib/trend-formats";
import type { TrendScripts } from "@/lib/ai/prompts";
import { useIsDemo } from "@/lib/use-demo";

type Script = TrendScripts["scripts"][number];

/** Trend AI no fluxo do original: personagem → tom & roteiro → prompt + download. */
export default function TrendAiPage() {
  const demo = useIsDemo();
  const [format, setFormat] = useState<TrendFormat | null>(null);
  const [character, setCharacter] = useState<TrendCharacter | null>(null);
  const [tone, setTone] = useState(TREND_TONES[0]!.key);
  const [cta, setCta] = useState(TREND_CTAS[0]!.key);
  const [scripts, setScripts] = useState<Script[] | null>(null);
  const [picked, setPicked] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const step = scripts ? 3 : character ? 2 : 1;
  const ctaLine = TREND_CTAS.find((c) => c.key === cta)!.line;
  const toneObj = TREND_TONES.find((t) => t.key === tone)!;

  function demoScripts(f: TrendFormat, c: TrendCharacter): Script[] {
    const base = (hook: string, lines: string[]): Script => ({
      title: hook.slice(0, 40),
      hook,
      lines,
      cta: ctaLine,
      videoPrompt: `Use the attached character image as reference. Vertical 9:16, 8 seconds, ${f.title} style. ${c.name} looks straight at the camera with a ${toneObj.label.toLowerCase()} energy and says in Brazilian Portuguese: '${hook}' '${lines.join(" ")}' and ends with: '${ctaLine}'. Natural light, handheld phone realism, authentic TikTok pacing.`,
    });
    return [
      base(`Ninguém me avisou que ia ser assim…`, [`Eu, ${c.name}, achei que já tinha visto de tudo.`]),
      base(`Para tudo que eu preciso te contar uma coisa!`, [`Essa aqui ninguém esperava, nem eu.`]),
      base(`Você também faz isso? Não minta pra mim.`, [`Porque eu faço todo santo dia.`]),
    ];
  }

  async function generate() {
    if (!format || !character) return;
    setError(null);
    setGenerating(true);
    try {
      if (demo) {
        await new Promise((r) => setTimeout(r, 900));
        setScripts(demoScripts(format, character));
      } else {
        const res = await fetch("/api/ai/trend-script", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ format: format.slug, character: character.name, tone, cta }),
        });
        const data = (await res.json().catch(() => null)) as (TrendScripts & { error?: string }) | null;
        if (!res.ok || !data?.scripts) throw new Error(data?.error || "Não foi possível gerar os roteiros agora.");
        setScripts(data.scripts);
      }
      setPicked(0);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGenerating(false);
    }
  }

  const stepper = (
    <ol className="flex items-center gap-3 rounded-full border border-border bg-card/70 p-1.5 text-xs">
      {["Personagem", "Tom & roteiro", "Prompt + download"].map((label, i) => {
        const n = i + 1;
        const active = step === n;
        const done = step > n;
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              className={cn(
                "flex items-center gap-2 rounded-full px-3 py-1 font-semibold",
                active ? "bg-primary/15 text-foreground" : "text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "grid size-5 place-items-center rounded-full text-[10px] font-bold",
                  active || done ? "bg-primary text-primary-foreground" : "bg-muted",
                )}
              >
                {done ? "✓" : n}
              </span>
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );

  // Passo 1a: formatos
  if (!format) {
    return (
      <div className="space-y-6">
        {stepper}
        <header>
          <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Trend AI</h1>
          <p className="mt-1.5 text-muted-foreground">Escolha uma estrutura feita para retenção, comentário e compartilhamento.</p>
        </header>
        <div className="grid gap-3 sm:grid-cols-2">
          {TREND_FORMATS_ORIGINAL.map((f) => (
            <button
              key={f.slug}
              type="button"
              onClick={() => setFormat(f)}
              className="group relative aspect-[16/10] overflow-hidden rounded-3xl border border-black/[0.06] bg-muted text-left cursor-pointer dark:border-white/[0.08]"
            >
              <LazyVideo
                src={f.previewLite}
                poster={f.characters[0]?.image}
                className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <ArrowUpRight size={18} className="absolute right-4 top-4 text-white/80" />
              <div className="absolute inset-x-4 bottom-4">
                <span className="rounded-full bg-primary/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                  Template
                </span>
                <h2 className="mt-2 font-display text-xl font-bold text-white">{f.title}</h2>
                <p className="mt-0.5 text-sm text-white/75">{f.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Passo 1b: personagens do formato
  if (!character) {
    return (
      <div className="space-y-6">
        {stepper}
        <button
          type="button"
          onClick={() => setFormat(null)}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <ChevronLeft size={16} /> Voltar
        </button>
        <header className="text-center">
          <h1 className="font-display text-3xl font-extrabold tracking-tight">{format.title}</h1>
          <p className="mt-1.5 text-muted-foreground">Escolha o {format.noun} que vai protagonizar sua história.</p>
        </header>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {format.characters.map((c) => (
            <button
              key={c.image}
              type="button"
              onClick={() => {
                setCharacter(c);
                setScripts(null);
              }}
              className="group relative aspect-[3/4] overflow-hidden rounded-3xl border border-black/[0.06] bg-muted text-left cursor-pointer dark:border-white/[0.08]"
            >
              <img src={c.image} alt={c.name} loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
              <span className="absolute inset-x-3 bottom-3 text-sm font-semibold text-white">{c.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Passos 2 e 3
  const active = scripts?.[picked];
  const fullText = active
    ? [`Gancho: "${active.hook}"`, ...active.lines.map((l) => `"${l}"`), `Chamada: "${active.cta}"`, "", active.videoPrompt].join("\n")
    : "";

  return (
    <div className="space-y-6">
      {stepper}
      <div className="flex items-center gap-3">
        <img src={character.image} alt="" className="size-14 rounded-2xl object-cover" />
        <div>
          <p className="font-display text-lg font-bold">{character.name}</p>
          <button
            type="button"
            onClick={() => {
              setCharacter(null);
              setScripts(null);
            }}
            className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground cursor-pointer"
          >
            Trocar personagem
          </button>
        </div>
      </div>

      {!scripts && (
        <div className="apple-card space-y-5 p-5">
          <div>
            <h2 className="font-display text-lg font-bold">Escolha o tom do vídeo</h2>
            <p className="text-xs text-muted-foreground">8 segundos · 3 roteiros</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {TREND_TONES.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTone(t.key)}
                className={cn(
                  "rounded-2xl border p-3 text-left transition-colors cursor-pointer",
                  tone === t.key ? "border-primary bg-primary/10" : "border-border hover:border-primary/40",
                )}
              >
                <span className="block text-sm font-semibold">{t.label}</span>
                <span className="text-[11px] text-muted-foreground">{t.desc}</span>
              </button>
            ))}
          </div>

          <div>
            <p className="text-sm font-semibold">Chamada no final</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {TREND_CTAS.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setCta(c.key)}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer",
                    cta === c.key ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <p className="mt-3 rounded-2xl bg-muted/50 p-3 text-sm italic">“{ctaLine}”</p>
          </div>

          <p className="text-xs text-muted-foreground">
            Duração fixa de 8 segundos. A IA analisa a cena do personagem e gera 3 roteiros virais prontos.
          </p>
          {error && (
            <p role="alert" className="text-sm font-medium text-destructive">
              {error}
            </p>
          )}
          <RaisedButton onClick={generate} disabled={generating} className="w-full">
            {generating ? "Gerando os roteiros…" : "Analisar com IA & gerar 3 roteiros"}
          </RaisedButton>
        </div>
      )}

      {scripts && active && (
        <div className="apple-card space-y-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-lg font-bold">Escolha um roteiro</h2>
            <div className="flex gap-1.5">
              {scripts.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPicked(i)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold cursor-pointer",
                    picked === i ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground",
                  )}
                >
                  Opção {i + 1}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5 text-sm">
            <p className="font-semibold">“{active.hook}”</p>
            {active.lines.map((l, i) => (
              <p key={i} className="text-foreground/90">
                “{l}”
              </p>
            ))}
            <p className="font-semibold text-primary">“{active.cta}”</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Prompt para o Google Flow</p>
            <pre className="mt-1.5 max-h-48 overflow-auto whitespace-pre-wrap rounded-2xl border border-border bg-background/60 p-3 font-mono text-[11px] leading-relaxed">
              {active.videoPrompt}
            </pre>
          </div>
          <div className="flex flex-wrap gap-2">
            <RaisedButton
              size="sm"
              onClick={() => {
                navigator.clipboard?.writeText(fullText).catch(() => {});
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
            >
              {copied ? "Copiado" : "Copiar roteiro + prompt"}
            </RaisedButton>
            <a
              href={character.image}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border px-3 text-xs font-semibold hover:bg-muted"
            >
              <Download size={14} /> Imagem do personagem
            </a>
            <button
              type="button"
              onClick={() => setScripts(null)}
              className="h-9 rounded-xl px-3 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Trocar tom
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            No Flow, envie a imagem do personagem como referência e cole o prompt.
          </p>
        </div>
      )}
    </div>
  );
}
