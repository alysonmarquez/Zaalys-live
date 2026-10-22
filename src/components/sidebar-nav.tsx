"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const GROUPS = [
  {
    title: "Live",
    items: [{ href: "/painel/live", label: "Assistente de live" }],
  },
  {
    title: "Estúdio",
    items: [
      { href: "/painel/catalogo", label: "Catálogo" },
      { href: "/painel/radar", label: "Radar de mudanças" },
      { href: "/painel/influencers", label: "Influencers" },
      { href: "/painel/roteiros", label: "Roteiros e prompts" },
      { href: "/painel/raio-x", label: "Raio-X de vídeo" },
    ],
  },
  {
    title: "Conta",
    items: [{ href: "/painel/conta", label: "Extensão e alertas" }],
  },
];

export function SidebarNav() {
  const path = usePathname();
  return (
    <nav className="flex gap-6 overflow-x-auto md:flex-col md:gap-7" aria-label="Painel">
      <Link href="/painel" className={`text-sm font-semibold ${path === "/painel" ? "text-violet" : ""}`}>
        Início
      </Link>
      {GROUPS.map((g) => (
        <div key={g.title} className="flex shrink-0 gap-4 md:flex-col md:gap-1">
          <p className="hidden text-xs font-semibold text-muted md:block">{g.title}</p>
          {g.items.map((item) => {
            const active = path.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`whitespace-nowrap rounded-lg text-sm md:px-3 md:py-2 ${
                  active ? "font-semibold text-violet md:bg-violet-soft" : "hover:text-violet"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
