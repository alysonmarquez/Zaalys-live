"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, Clapperboard, Headphones, House, LineChart, Rocket, Film } from "lucide-react";
import { cn } from "@/components/brand";

const ITEMS = [
  { href: "/painel", label: "Início", icon: House, match: ["/painel", "/central", "/dashboard"] },
  { href: "/painel/catalogo", label: "Produtos", icon: Boxes, match: ["/painel/catalogo", "/products", "/venda"] },
  { href: "/painel/influencers", label: "Templates", icon: Clapperboard, match: ["/painel/influencers", "/templates"] },
  { href: "/painel/radar", label: "Radar", icon: LineChart, match: ["/painel/radar", "/radar"] },
  { href: "/painel/roteiros", label: "Trend", icon: Rocket, match: ["/painel/roteiros", "/trend-boost"] },
  { href: "/painel/raio-x", label: "Raio-X", icon: Film, match: ["/painel/raio-x", "/ferramentas/raio-x"] },
  { href: "/painel/live", label: "Live", icon: Headphones, match: ["/painel/live", "/ferramentas/live"] },
];

/** Menu flutuante no rodapé, ao centro (igual ao original: o fone leva à Live). */
export function BottomDock() {
  const pathname = usePathname() || "/painel";
  const isActive = (match: string[]) =>
    match.some((m) => (m === "/painel" ? pathname === "/painel" : pathname === m || pathname.startsWith(`${m}/`)));

  return (
    <nav
      aria-label="Atalhos"
      className="fixed bottom-4 left-1/2 z-30 -translate-x-1/2 rounded-full border border-black/[0.08] bg-card/90 p-1.5 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.6)] backdrop-blur-xl dark:border-white/[0.08]"
    >
      <ul className="flex items-center gap-1">
        {ITEMS.map(({ href, label, icon: Icon, match }) => {
          const active = isActive(match);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                title={label}
                className={cn(
                  "flex h-11 items-center justify-center gap-2 rounded-full transition-[background-color,color,padding] duration-200",
                  active
                    ? "bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-xs"
                    : "w-11 text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground",
                )}
              >
                <Icon size={18} strokeWidth={2} className="shrink-0" />
                {active && <span className="hidden whitespace-nowrap sm:inline">{label}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
