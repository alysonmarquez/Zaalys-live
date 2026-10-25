"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Bell, ChevronDown, ChevronUp, PanelLeftClose, PanelLeftOpen, Radio } from "lucide-react";
import { Brand, cn } from "@/components/brand";

type Item = { label: string; href?: string };
type Group = { label: string; items: Item[] };

// Mesma organização de menu do original; só o que está implementado leva a uma página.
const NAV: (Item | Group)[] = [
  { label: "Início", href: "/painel" },
  { label: "Console de LIVE", href: "/estudio/console" },
  { label: "Eventos LIVE" },
  { label: "Ferramentas da LIVE", items: [{ label: "Kit de produtos da LIVE" }, { label: "Recompensa da LIVE" }] },
  { label: "Vitrine", items: [{ label: "Produtos da vitrine" }] },
  {
    label: "Escopo de dados",
    items: [{ label: "Desempenho da LIVE", href: "/estudio/desempenho" }, { label: "Histórico de LIVE" }, { label: "Análise de mercado" }],
  },
  { label: "Integridade da conta", items: [{ label: "Pontos de qualidade" }, { label: "Classificação de integridade" }] },
];

function NavLink({ item, nested }: { item: Item; nested?: boolean }) {
  const pathname = usePathname();
  const active = item.href && pathname === item.href;
  const cls = cn(
    "block rounded-lg px-3 py-2 text-[13px] transition-colors",
    nested && "pl-7",
    active ? "bg-primary/12 font-semibold text-foreground" : item.href ? "text-foreground/80 hover:bg-foreground/[0.05]" : "cursor-default text-muted-foreground/70",
  );
  return item.href ? (
    <Link href={item.href} className={cls} aria-current={active ? "page" : undefined}>
      {item.label}
    </Link>
  ) : (
    <span className={cls} title="Ainda não disponível no clone">
      {item.label}
    </span>
  );
}

function NavGroup({ group }: { group: Group }) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-[13px] text-foreground/80 hover:bg-foreground/[0.05] cursor-pointer"
      >
        {group.label}
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {open && group.items.map((i) => <NavLink key={i.label} item={i} nested />)}
    </div>
  );
}

export function StudioShell({ handle, children }: { handle: string; children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-svh flex-col bg-muted/30">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/60 bg-card px-4">
        <div className="flex items-center gap-3">
          <Link href="/painel">
            <Brand />
          </Link>
          <span className="h-5 w-px bg-border" />
          <span className="text-[15px] font-semibold">Estúdio de LIVE</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <Bell size={18} className="text-muted-foreground" />
          <span className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-full bg-primary/20 text-xs font-bold text-primary">
              {handle.slice(0, 1).toUpperCase()}
            </span>
            <span className="hidden font-medium sm:inline">{handle}</span>
          </span>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside
          className={cn(
            "shrink-0 overflow-y-auto border-r border-border/60 bg-card transition-[width] duration-200",
            collapsed ? "w-0 border-r-0" : "w-60",
          )}
        >
          <div className="space-y-0.5 p-3">
            <Link
              href="/estudio/console"
              className="mb-3 flex h-10 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground"
            >
              <Radio size={16} /> Iniciar LIVE agora
            </Link>
            {NAV.map((n) => ("items" in n ? <NavGroup key={n.label} group={n} /> : <NavLink key={n.label} item={n} />))}
          </div>
        </aside>

        <div className="relative min-w-0 flex-1 overflow-auto">
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Mostrar menu" : "Recolher menu"}
            className="absolute left-2 top-2 z-10 grid size-8 place-items-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground cursor-pointer"
          >
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
          <main className="p-4 pl-12">{children}</main>
        </div>
      </div>
    </div>
  );
}
