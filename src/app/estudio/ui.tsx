// Peças visuais compartilhadas pelas telas do Estúdio de LIVE (medidas lidas do original).
import type { LucideIcon } from "lucide-react";

// Vale no servidor e no cliente (o cn de components/brand é só de cliente).
const cn = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={cn("rounded-lg bg-card p-6", className)}>{children}</section>;
}

export function PageTitle({ children, size = "lg" }: { children: React.ReactNode; size?: "lg" | "md" }) {
  return <h1 className={cn("font-bold text-black/90", size === "lg" ? "text-[28px] leading-9" : "text-[20px] leading-7")}>{children}</h1>;
}

export function TealButton({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-white hover:brightness-95 cursor-pointer", className)}
    >
      {children}
    </button>
  );
}

export function GrayButton({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-black/[0.05] px-4 text-sm font-medium text-black/90 hover:bg-black/[0.08] cursor-pointer", className)}
    >
      {children}
    </button>
  );
}

/** Ilustração genérica (ícone num círculo verde-água) no lugar das imagens do original. */
export function Illustration({ icon: Icon, size = 96 }: { icon: LucideIcon; size?: number }) {
  return (
    <span className="grid place-items-center rounded-full bg-primary/10" style={{ width: size, height: size }}>
      <Icon size={size * 0.42} strokeWidth={1.5} className="text-primary" />
    </span>
  );
}

export function Empty({ icon, title, text, children }: { icon: LucideIcon; title?: string; text: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <Illustration icon={icon} />
      {title && <p className="mt-4 text-base font-medium text-black/90">{title}</p>}
      <p className={cn("max-w-[400px] text-sm text-black/55", title ? "mt-1" : "mt-4")}>{text}</p>
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}

export function UnderlineTabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { v: T; l: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-6 border-b border-black/10">
      {tabs.map((t) => (
        <button
          key={t.v}
          type="button"
          onClick={() => onChange(t.v)}
          className={cn(
            "-mb-px h-[34px] border-b-2 text-base cursor-pointer",
            value === t.v ? "border-primary font-medium text-black/90" : "border-transparent text-black/65",
          )}
        >
          {t.l}
        </button>
      ))}
    </div>
  );
}

export function Table({ cols, children, empty }: { cols: string[]; children?: React.ReactNode; empty?: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-md border border-black/[0.06]">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="bg-[#f5f5f5] text-left">
            {cols.map((c) => (
              <th key={c} className="px-3 py-3.5 text-xs font-medium text-black/90">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-black/[0.06]">{children}</tbody>
      </table>
      {empty}
    </div>
  );
}

export function SearchBox({ placeholder, value, onChange, className }: { placeholder: string; value: string; onChange: (v: string) => void; className?: string }) {
  return (
    <label className={cn("flex h-[34px] items-center gap-2 rounded-md border border-black/15 bg-white px-3", className)}>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="flex-1 bg-transparent text-sm outline-none placeholder:text-black/35" />
      <svg viewBox="0 0 24 24" className="size-4 text-black/45" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
    </label>
  );
}
