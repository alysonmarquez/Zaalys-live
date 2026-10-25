"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  Bell,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  House,
  LayoutGrid,
  MonitorPlay,
  PanelLeftClose,
  PanelLeftOpen,
  Radio,
  Store,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { Brand, cn } from "@/components/brand";

type Item = { label: string; href?: string; icon?: LucideIcon };
type Group = { label: string; icon: LucideIcon; items: Item[] };

// Mesma organização de menu do original; só o que está implementado leva a uma página.
const NAV: (Item | Group)[] = [
  { label: "Início", href: "/painel", icon: House },
  { label: "Console de LIVE", href: "/estudio/console", icon: MonitorPlay },
  { label: "Eventos LIVE", icon: CalendarDays },
  { label: "Ferramentas da LIVE", icon: LayoutGrid, items: [{ label: "Recompensa da LIVE" }] },
  { label: "Vitrine", icon: Store, items: [{ label: "Produtos da vitrine" }, { label: "Kit de produtos da LIVE" }] },
  { label: "Campanhas de vídeo", icon: Radio },
  {
    label: "Escopo de dados",
    icon: BarChart3,
    items: [{ label: "Desempenho da LIVE", href: "/estudio/desempenho" }, { label: "Histórico de LIVE" }, { label: "Análise de mercado" }],
  },
  { label: "Integridade da conta", icon: UserRound, items: [{ label: "Pontos de qualidade" }, { label: "Classificação de integridade" }] },
];

function NavLink({ item, nested }: { item: Item; nested?: boolean }) {
  const pathname = usePathname();
  const active = item.href && pathname === item.href;
  const Icon = item.icon;
  const cls = cn(
    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[14px] transition-colors",
    nested && "pl-10",
    active ? "bg-primary/12 font-semibold text-foreground" : item.href ? "text-foreground/80 hover:bg-foreground/[0.05]" : "cursor-default text-muted-foreground/70",
  );
  return item.href ? (
    <Link href={item.href} className={cls} aria-current={active ? "page" : undefined}>
      {Icon && <Icon size={16} />}
      {item.label}
    </Link>
  ) : (
    <span className={cls} title="Ainda não disponível no clone">
      {Icon && <Icon size={16} />}
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
        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-[14px] text-foreground/80 hover:bg-foreground/[0.05] cursor-pointer"
      >
        <span className="flex items-center gap-2.5">
          <group.icon size={16} />
          {group.label}
        </span>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {open && group.items.map((i) => <NavLink key={i.label} item={i} nested />)}
    </div>
  );
}

export function StudioShell({ handle, children }: { handle: string; children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);


  return (
    <div className="studio-light flex h-svh flex-col bg-background text-foreground">
      <header className="flex h-14 shrink-0 items-center justify-between bg-neutral-950 px-4 text-white">
        <div className="flex items-center gap-3">
          <Link href="/painel" className="[&_span]:!text-white">
            <Brand />
          </Link>
          <span className="h-5 w-px bg-white/30" />
          <span className="text-[17px] font-semibold">Estúdio de LIVE</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <Bell size={18} className="text-white/80" />
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
          <div className="flex min-h-full flex-col">
          <div className="flex-1 space-y-0.5 p-3">
            <Link
              href="/estudio/console"
              className="mb-3 flex h-10 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground"
            >
              <Radio size={16} /> Iniciar LIVE agora
            </Link>
            {NAV.map((n) => ("items" in n ? <NavGroup key={n.label} group={n} /> : <NavLink key={n.label} item={n} />))}
          </div>
          <div className="border-t border-border/60 p-3">
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              aria-label="Recolher menu"
              className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted cursor-pointer"
            >
              <PanelLeftClose size={16} />
            </button>
          </div>
          </div>
        </aside>

        <div className="relative min-w-0 flex-1 overflow-auto">
          {collapsed && (
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              aria-label="Mostrar menu"
              className="absolute bottom-3 left-2 z-10 grid size-8 place-items-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <PanelLeftOpen size={16} />
            </button>
          )}
          <main className="p-4">{children}</main>
        </div>
      </div>
    </div>
  );
}
