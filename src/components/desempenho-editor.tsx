"use client";

import { useEffect, useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import { cn } from "@/components/brand";
import {
  LIVE_METRICS,
  PERIOD_PRESETS,
  TODAY_EDITABLE,
  fromInput,
  isoDay,
  loadOverrides,
  saveOverrides,
  toInput,
  totalsOf,
  useLiveSessions,
  type PeriodPreset,
} from "@/lib/estudio-lives";

const UNIT_HINT = { money: "R$", int: "", sec: "seg", pct: "%" } as const;

const rangeOf = (p: PeriodPreset) => {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - (p === "hoje" ? 0 : p === "7" ? 6 : 29));
  return [isoDay(from), isoDay(to)] as const;
};

/**
 * Números do Desempenho da LIVE por período. Campo vazio = calculado das transmissões (aparece como dica).
 * Usado no Desempenho do Estúdio e em "Editar desempenho da LIVE" na página Live do Painel.
 */
export function DesempenhoEditor({ initial = "7", onSaved }: { initial?: PeriodPreset; onSaved?: () => void }) {
  const sessions = useLiveSessions();
  const [preset, setPreset] = useState<PeriodPreset>(initial);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const o = loadOverrides()[preset] ?? {};
    setValues(Object.fromEntries(LIVE_METRICS.filter((m) => typeof o[m.label] === "number").map((m) => [m.label, toInput(m, o[m.label]!)])));
  }, [preset]);

  const [from, to] = rangeOf(preset);
  const totals = totalsOf(sessions.filter((s) => s.day >= from && s.day <= to));
  const metrics = LIVE_METRICS.filter((m) => preset !== "hoje" || TODAY_EDITABLE.has(m.label));

  function save() {
    const all = loadOverrides();
    const entries = metrics.map((m) => [m.label, fromInput(m, values[m.label] ?? "")] as const).filter(([, v]) => v !== undefined);
    all[preset] = Object.fromEntries(entries) as Record<string, number>;
    saveOverrides(all);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
    onSaved?.();
  }

  function clear() {
    const all = loadOverrides();
    delete all[preset];
    saveOverrides(all);
    setValues({});
  }

  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4 text-foreground">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">Números do Desempenho da LIVE</p>
          <p className="text-xs text-muted-foreground">
            Digite o valor que quer mostrar em cada indicador. Vazio = calculado (aparece em cinza).
            {preset === "hoje" && " Em Hoje, GMV, itens e visualizações vêm de “Editar desempenho da LIVE”; aqui ficam as taxas, que valem também no Painel de LIVE e no Console."}
          </p>
        </div>
        <div className="flex overflow-hidden rounded-lg border border-border text-xs font-semibold">
          {PERIOD_PRESETS.map((p) => (
            <button
              key={p.v}
              type="button"
              onClick={() => setPreset(p.v)}
              className={cn("h-8 border-r border-border px-3 last:border-r-0 cursor-pointer", preset === p.v ? "bg-primary/15 text-primary" : "")}
            >
              {p.l}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {metrics.map((m) => (
          <label key={m.label} className="block space-y-1">
            <span className="flex justify-between gap-2 text-xs font-medium text-muted-foreground">
              <span className="truncate">{m.label}</span>
              <span>{UNIT_HINT[m.unit]}</span>
            </span>
            <input
              inputMode="decimal"
              value={values[m.label] ?? ""}
              placeholder={toInput(m, m.value(totals))}
              onChange={(e) => setValues({ ...values, [m.label]: e.target.value })}
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm tabular-nums outline-none placeholder:text-muted-foreground/50 focus-visible:border-primary/60"
            />
          </label>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={save}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground cursor-pointer"
        >
          {saved && <Check size={14} />}
          {saved ? "Salvo" : "Salvar números"}
        </button>
        <button
          type="button"
          onClick={clear}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border px-4 text-xs font-semibold hover:bg-muted cursor-pointer"
        >
          <RotateCcw size={13} /> Voltar ao calculado
        </button>
      </div>
    </div>
  );
}
