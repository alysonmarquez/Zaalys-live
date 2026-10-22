"use client";
import { useEffect, useState } from "react";

const pad = (n: number) => String(n).padStart(2, "0");
const clock = (s: number) => `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;

const FEED = [
  { who: "carol.vendas", text: "entrou na live", kind: "join" },
  { who: "anfitrião", text: "Oi, carol.vendas! O kit organizador está fixado aí embaixo.", kind: "host" },
  { who: "joao_reis", text: "cabe em gaveta funda?", kind: "ask" },
  { who: "anfitrião", text: "Cabe sim: são 6 peças de alturas diferentes.", kind: "host" },
  { who: "mari.lima", text: "comprou Organizador de gaveta", kind: "sale" },
];

const SWITCHES = ["Comentários do anfitrião", "Fixar produto a cada minuto", "Saudar quem entra", "Responder perguntas"];

// Painel de demonstração do hero: o cronômetro "no ar" corre e o chat avança.
export function LiveConsole() {
  const [seconds, setSeconds] = useState(2 * 3600 + 14 * 60 + 37);
  const [shown, setShown] = useState(2);

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    const f = setInterval(() => setShown((n) => (n >= FEED.length ? 2 : n + 1)), 2600);
    return () => {
      clearInterval(t);
      clearInterval(f);
    };
  }, []);

  return (
    <div className="panel w-full max-w-md overflow-hidden shadow-[0_24px_60px_-28px_rgba(0,0,0,0.7)]" aria-label="Exemplo do painel da live">
      <div className="flex items-center justify-between bg-night px-5 py-4 text-white">
        <div className="flex items-center gap-2.5">
          <span className="onair-dot inline-block size-2.5 rounded-full bg-onair" />
          <span className="text-sm font-semibold">No ar</span>
        </div>
        <span className="font-display text-2xl font-bold tabular-nums">{clock(seconds)}</span>
      </div>

      <ul className="divide-y divide-line px-5">
        {SWITCHES.map((label) => (
          <li key={label} className="flex items-center justify-between py-3 text-[15px]">
            {label}
            <span className="relative inline-flex h-6 w-11 items-center rounded-full bg-on" aria-label="ligado">
              <span className="absolute right-0.5 size-5 rounded-full bg-white" />
            </span>
          </li>
        ))}
      </ul>

      <div className="border-t border-line bg-paper px-5 py-4">
        <p className="mb-2 text-xs font-semibold text-muted">Chat da live (exemplo)</p>
        <ul className="space-y-1.5 text-sm" aria-live="off">
          {FEED.slice(0, shown).map((m, i) => (
            <li key={i} className={m.kind === "sale" ? "font-semibold text-on" : ""}>
              <span className={m.kind === "host" ? "font-semibold text-violet" : "font-semibold"}>@{m.who}</span>{" "}
              <span className={m.kind === "join" ? "text-muted" : ""}>{m.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
