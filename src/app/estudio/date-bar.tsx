"use client";

import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { cn } from "@/components/brand";

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return iso(d);
};
export const brDate = (s: string) => s.split("-").reverse().join("/");

/** Barra de período do original: datas + Hoje / Últimos 7 dias / Últimos 30 dias / "...". */
export function useDateRange() {
  const [preset, setPreset] = useState<"hoje" | "7" | "30" | "custom">("7");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  useEffect(() => {
    setFrom(daysAgo(6));
    setTo(daysAgo(0));
  }, []);
  const pick = (p: "hoje" | "7" | "30") => {
    setPreset(p);
    setFrom(daysAgo(p === "hoje" ? 0 : p === "7" ? 6 : 29));
    setTo(daysAgo(0));
  };
  return { preset, setPreset, from, setFrom, to, setTo, pick };
}

export function DateBar({ r, right }: { r: ReturnType<typeof useDateRange>; right?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex h-9 items-center gap-2 rounded-md border border-black/15 px-3 text-sm">
          <input
            type="date"
            value={r.from}
            max={r.to}
            onChange={(e) => {
              r.setFrom(e.target.value);
              r.setPreset("custom");
            }}
            className="w-[130px] bg-transparent outline-none"
            aria-label="Data inicial"
          />
          <span className="text-black/45">-</span>
          <input
            type="date"
            value={r.to}
            min={r.from}
            onChange={(e) => {
              r.setTo(e.target.value);
              r.setPreset("custom");
            }}
            className="w-[130px] bg-transparent outline-none"
            aria-label="Data final"
          />
          <CalendarDays size={15} className="text-black/45" />
        </label>
        <div className="flex overflow-hidden rounded-md border border-black/15 text-sm font-semibold">
          {(
            [
              ["hoje", "Hoje"],
              ["7", "Últimos 7 dias"],
              ["30", "Últimos 30 dias"],
            ] as const
          ).map(([v, l]) => (
            <button
              key={v}
              type="button"
              onClick={() => r.pick(v)}
              className={cn("h-8 border-r border-black/15 px-3 last:border-r-0 cursor-pointer", r.preset === v ? "bg-primary/10 text-primary" : "bg-white")}
            >
              {l}
            </button>
          ))}
        </div>
        <span className="grid h-9 w-[45px] place-items-center rounded-md border border-black/15 text-sm font-medium">...</span>
      </div>
      {right}
    </div>
  );
}
