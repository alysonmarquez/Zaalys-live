"use client";

import React, { useId, useRef } from "react";

export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export function Mark({ className = "size-6 text-primary" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" aria-hidden="true" className={className}>
      <g stroke="currentColor" strokeWidth="10.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M25 75V25L50 55L75 25" />
        <path d="M75 25V75" />
      </g>
    </svg>
  );
}

export function Brand({
  className,
  showText = true,
}: {
  className?: string;
  showText?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2 select-none", className)}>
      <Mark className="size-6 text-primary" />
      {showText && (
        <span className="font-display text-[1.35rem] font-extrabold leading-none tracking-[-0.035em] text-foreground">
          MediaFlowMZ
        </span>
      )}
    </span>
  );
}

const brandLoaderCss = `
.zl-mark { --draw: cubic-bezier(0.23, 1, 0.32, 1); }
.zl-mark path { stroke-dasharray: var(--len); stroke-dashoffset: var(--len); }
.zl-mark path:nth-child(1) { --len: 130; animation: zl-draw 620ms var(--draw) forwards, zl-breathe 1.9s ease-in-out 900ms infinite; }
.zl-mark path:nth-child(2) { --len: 52; animation: zl-draw 220ms var(--draw) 520ms forwards, zl-breathe 1.9s ease-in-out 900ms infinite; }

@keyframes zl-draw { to { stroke-dashoffset: 0; } }
@keyframes zl-breathe {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.45; }
}

@media (prefers-reduced-motion: reduce) {
  .zl-mark path {
    animation: none !important;
    stroke-dashoffset: 0 !important;
    opacity: 1 !important;
  }
}
`;

export function BrandLoader({
  label = "Carregando",
  className = "grid min-h-[60svh] place-items-center",
  markClassName = "size-14",
}: {
  label?: string;
  className?: string;
  markClassName?: string;
}) {
  return (
    <div role="status" aria-label={label} className={className}>
      <style dangerouslySetInnerHTML={{ __html: brandLoaderCss }} />
      <Mark className={cn("zl-mark text-primary", markClassName)} />
      <span className="sr-only">{label}…</span>
    </div>
  );
}

export interface SegmentedOption<T extends string> {
  value: T;
  label: React.ReactNode;
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
  size = "md",
  id,
  label,
}: {
  value: T;
  onChange: (value: T) => void;
  options: SegmentedOption<T>[];
  className?: string;
  size?: "sm" | "md";
  id?: string;
  label?: string;
}) {
  const autoId = useId();
  const groupId = id || autoId;
  const ref = useRef<HTMLDivElement>(null);

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const dir =
      e.key === "ArrowRight" || e.key === "ArrowDown"
        ? 1
        : e.key === "ArrowLeft" || e.key === "ArrowUp"
          ? -1
          : 0;
    if (!dir) return;
    e.preventDefault();
    const idx = options.findIndex((o) => o.value === value);
    const next = options[(idx + dir + options.length) % options.length];
    if (next) {
      onChange(next.value);
      const buttons = ref.current?.querySelectorAll<HTMLButtonElement>("[role='radio']");
      buttons?.[options.indexOf(next)]?.focus();
    }
  }

  return (
    <div
      ref={ref}
      role="radiogroup"
      aria-label={label}
      onKeyDown={handleKeyDown}
      data-id={groupId}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-black/[0.04] bg-muted/70 p-1 dark:border-white/[0.06] dark:bg-card/80 shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)]",
        className,
      )}
    >
      {options.map((opt) => {
        const checked = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative rounded-full font-semibold transition-[transform,box-shadow,color,background-color] duration-150 ease-out active:scale-[0.96] active:duration-75 motion-reduce:active:scale-100 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
              size === "sm" ? "px-3 py-1 text-xs" : "px-4 py-1.5 text-sm",
              checked
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-foreground/[0.04]",
            )}
          >
            {checked && (
              <span className="absolute inset-0 rounded-full bg-primary shadow-[0_2px_8px_rgba(0,0,0,0.15)] transition-all duration-200" />
            )}
            <span className="relative z-10">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export const RaisedButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    size?: "default" | "sm" | "lg" | "icon";
  }
>(({ className, size = "default", children, ...props }, ref) => {
  const sizeClass =
    size === "sm"
      ? "h-9 rounded-lg px-3 before:rounded-lg"
      : size === "lg"
        ? "h-12 rounded-2xl px-8 text-base before:rounded-2xl"
        : size === "icon"
          ? "size-10 rounded-xl before:rounded-xl"
          : "h-10 rounded-xl px-4 py-2 before:rounded-xl";

  return (
    <button
      ref={ref}
      className={cn(
        "relative inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap text-sm font-medium subpixel-antialiased transition-[transform,opacity,background-color,box-shadow] duration-150 ease-out border border-primary/50 bg-primary text-primary-foreground shadow-md hover:bg-primary/90 active:scale-[0.96] active:duration-75 motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 before:pointer-events-none before:absolute before:inset-0 before:border-t before:border-white/40 before:bg-gradient-to-b before:from-white/20 before:to-transparent",
        sizeClass,
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
});
RaisedButton.displayName = "RaisedButton";
