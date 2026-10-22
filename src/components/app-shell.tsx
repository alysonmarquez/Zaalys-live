"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";
import { Brand, RaisedButton, cn } from "@/components/brand";
import { createClient } from "@/lib/supabase/client";

function IconHome({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="relative z-10 shrink-0">
      <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
      <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  );
}

function IconBoxes({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="relative z-10 shrink-0">
      <path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z" />
      <path d="m7 16.5-4.74-2.85" />
      <path d="m7 16.5 5-3" />
      <path d="M7 16.5v5.17" />
      <path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z" />
      <path d="m17 16.5-5-3" />
      <path d="m17 16.5 4.74-2.85" />
      <path d="M17 16.5v5.17" />
      <path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z" />
      <path d="M12 8 7.26 5.15" />
      <path d="m12 8 4.74-2.85" />
      <path d="M12 13.5V8" />
    </svg>
  );
}

function IconClapperboard({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="relative z-10 shrink-0">
      <path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z" />
      <path d="m6.2 5.3 3.1 3.9" />
      <path d="m12.4 3.4 3.1 4" />
      <path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
    </svg>
  );
}

function IconChartSpline({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="relative z-10 shrink-0">
      <path d="M3 3v16a2 2 0 0 0 2 2h16" />
      <path d="M7 16c.5-2 1.5-7 4-7 2 0 2 3 4 3 2.5 0 4.5-5 5-7" />
    </svg>
  );
}

function IconRocket({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="relative z-10 shrink-0">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}

function IconFilm({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="relative z-10 shrink-0">
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M7 3v18" />
      <path d="M3 7.5h4" />
      <path d="M3 12h18" />
      <path d="M3 16.5h4" />
      <path d="M17 3v18" />
      <path d="M17 7.5h4" />
      <path d="M17 16.5h4" />
    </svg>
  );
}

function IconHeadphones({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="relative z-10 shrink-0">
      <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
    </svg>
  );
}

function IconGift({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13" />
      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
      <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
    </svg>
  );
}

function IconBell({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.268 21a2 2 0 0 0 3.464 0" />
      <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
    </svg>
  );
}

const DOCK_ITEMS = [
  { href: "/painel", aliases: ["/painel"], label: "Início", icon: IconHome, exact: true },
  { href: "/painel/catalogo", aliases: ["/painel/catalogo", "/products"], label: "Produtos", icon: IconBoxes },
  { href: "/painel/influencers", aliases: ["/painel/influencers", "/templates"], label: "Templates", icon: IconClapperboard },
  { href: "/painel/radar", aliases: ["/painel/radar", "/radar"], label: "Radar", icon: IconChartSpline },
  { href: "/painel/roteiros", aliases: ["/painel/roteiros", "/trend-boost"], label: "Trend", icon: IconRocket },
  { href: "/painel/raio-x", aliases: ["/painel/raio-x", "/ferramentas/raio-x"], label: "Raio-X", icon: IconFilm },
  { href: "/painel/live", aliases: ["/painel/live", "/ferramentas/live"], label: "Live", icon: IconHeadphones },
];

export function AppShell({
  children,
  userEmail = "criador@zaalys.com",
  userName = "Criador Zaalys",
}: {
  children: React.ReactNode;
  userEmail?: string;
  userName?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [creatorOpen, setCreatorOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [supportSubject, setSupportSubject] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [supportSent, setSupportSent] = useState(false);

  const initials = (userName || userEmail || "CZ")
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");

  async function handleSignOut() {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    router.push("/login");
  }

  function handleCopyInvite() {
    const url = `${typeof window !== "undefined" ? window.location.origin : "https://www.zaalys.com"}/checkout/vitalicio?invite=creator-vip`;
    navigator.clipboard?.writeText(url).catch(() => {});
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2500);
  }

  function handleSendSupport(e: React.FormEvent) {
    e.preventDefault();
    if (!supportMessage.trim()) return;
    setSupportSent(true);
    setTimeout(() => {
      setSupportSent(false);
      setSupportSubject("");
      setSupportMessage("");
      setSupportOpen(false);
    }, 1500);
  }

  return (
    <div className="bg-studio flex min-h-dvh flex-col text-foreground">
      {/* Top Sticky Glass Header */}
      <header className="sticky top-0 z-30">
        <div className="absolute inset-0 border-b border-black/[0.05] bg-background/75 backdrop-blur-2xl dark:border-white/[0.08]" />
        <div className="relative mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/painel"
            className="rounded-xl outline-none transition-transform duration-100 ease-out focus-visible:ring-2 focus-visible:ring-ring/50 active:scale-[0.97]"
          >
            <Brand />
          </Link>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCreatorOpen(true)}
              className="inline-flex h-8 items-center gap-1.5 rounded-xl px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-foreground/[0.05] hover:text-foreground cursor-pointer"
            >
              <IconGift size={16} />
              <span className="hidden sm:inline">Acesso Creator</span>
            </button>

            <button
              type="button"
              onClick={() => setSupportOpen(true)}
              className="inline-flex h-8 items-center gap-1.5 rounded-xl px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-foreground/[0.05] hover:text-foreground cursor-pointer"
            >
              <IconHeadphones size={16} />
              <span className="hidden sm:inline">Suporte</span>
            </button>

            {/* Notifications popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotifOpen((o) => !o);
                  setMenuOpen(false);
                }}
                aria-label="Notificações"
                className="relative grid size-8 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-foreground/[0.05] hover:text-foreground cursor-pointer"
              >
                <IconBell size={16} />
                <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-primary" />
              </button>
              {notifOpen && (
                <div className="apple-glass absolute right-0 mt-2 w-80 rounded-2xl p-3.5 text-sm shadow-2xl">
                  <div className="flex items-center justify-between pb-2.5 border-b border-border">
                    <span className="font-semibold">Notificações</span>
                    <button
                      type="button"
                      onClick={() => setNotifOpen(false)}
                      className="text-xs text-primary hover:underline cursor-pointer"
                    >
                      Marcar todas como lidas
                    </button>
                  </div>
                  <div className="divide-y divide-border/60 py-1 text-xs">
                    <div className="py-2.5">
                      <p className="font-medium text-foreground">Radar leu +18 produtos novos</p>
                      <p className="mt-0.5 text-muted-foreground">
                        Escova Alisadora 5 em 1 subiu comissão para 22% no TikTok Shop BR.
                      </p>
                    </div>
                    <div className="py-2.5">
                      <p className="font-medium text-foreground">Zaalys Live v3.17.0 disponível</p>
                      <p className="mt-0.5 text-muted-foreground">
                        Novo controle de comentários automáticos e reconexão rápida.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen((o) => !o);
                  setNotifOpen(false);
                }}
                aria-label="Menu da conta"
                className="flex h-8 items-center gap-2 rounded-full border border-white/10 bg-card/90 pl-1 pr-2.5 text-xs font-semibold text-foreground transition-colors hover:border-white/20 cursor-pointer"
              >
                <span className="grid size-6 place-items-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                  {initials || "CZ"}
                </span>
                <span className="hidden max-w-[110px] truncate sm:inline">{userName}</span>
              </button>

              {menuOpen && (
                <div className="apple-glass absolute right-0 mt-2 w-60 rounded-2xl p-2 text-sm shadow-2xl">
                  <div className="border-b border-border px-3 py-2">
                    <p className="truncate font-semibold text-foreground">{userName}</p>
                    <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
                    <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                      Vitalício · Ativo
                    </span>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/painel/conta"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-foreground hover:bg-foreground/[0.06]"
                    >
                      <span>Configurações & Extensão</span>
                    </Link>
                    <Link
                      href="/painel?vista=dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-foreground hover:bg-foreground/[0.06]"
                    >
                      <span>Dashboard de Vendas</span>
                    </Link>
                    <Link
                      href="/"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground"
                    >
                      <span>Ver página inicial (Site)</span>
                    </Link>
                  </div>
                  <div className="border-t border-border pt-1">
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="flex w-full items-center rounded-xl px-3 py-2 text-left text-xs font-medium text-destructive hover:bg-destructive/10 cursor-pointer"
                    >
                      Sair da conta
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-28 sm:px-6 sm:pt-8">
        {children}
      </main>

      {/* Floating Bottom Dock (Exact Zaalys Navigation) */}
      <div className="pointer-events-none fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex justify-center px-4">
        <nav
          aria-label="Navegação principal"
          className="pointer-events-auto flex items-center gap-0.5 rounded-full border border-white/20 bg-popover/80 p-1.5 shadow-[0_16px_48px_-8px_rgba(0,0,0,0.45)] backdrop-blur-2xl ring-1 ring-black/[0.04] sm:gap-1 dark:border-white/10 dark:ring-white/[0.05]"
        >
          {DOCK_ITEMS.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : item.aliases.some((a) => pathname === a || pathname.startsWith(`${a}/`));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className="group relative"
              >
                <div
                  className={cn(
                    "relative flex h-11 items-center gap-2 rounded-full px-2.5 transition-[transform,color,background-color,border-color] duration-150 ease-out active:scale-[0.94] sm:px-3.5",
                    active
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-foreground/[0.05]",
                  )}
                >
                  <Icon size={20} />
                  {active && (
                    <span className="relative z-10 hidden whitespace-nowrap pr-1 text-sm font-semibold sm:block">
                      {item.label}
                    </span>
                  )}
                  <span className="sr-only">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Creator Access Modal */}
      {creatorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
          <div className="apple-card w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
                  Acesso Creator
                </span>
                <h2 className="mt-2 font-display text-xl font-bold tracking-tight">
                  Indique e ganhe R$ 50,00
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Seu amigo recebe R$ 30,00 de desconto no acesso vitalício pelo seu link de convite.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCreatorOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="mt-5 rounded-2xl border border-border bg-background/60 p-3.5 text-xs">
              <p className="font-semibold text-foreground">Link pronto</p>
              <p className="mt-1 text-muted-foreground">
                Link de convite oculto — use o botão copiar para enviar no WhatsApp ou Instagram.
              </p>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCreatorOpen(false)}
                className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Fechar
              </button>
              <RaisedButton size="sm" onClick={handleCopyInvite}>
                {copiedInvite ? "Link copiado!" : "Copiar link de convite"}
              </RaisedButton>
            </div>
          </div>
        </div>
      )}

      {/* Support Modal */}
      {supportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
          <div className="apple-card w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-bold tracking-tight">
                  Falar com o suporte
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Conte o que está acontecendo. A gente responde por e-mail em {userEmail}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSupportOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSendSupport} className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Assunto
                </label>
                <input
                  value={supportSubject}
                  onChange={(e) => setSupportSubject(e.target.value)}
                  placeholder="Ex.: Dúvida na extensão Zaalys Live"
                  className="field text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Mensagem
                </label>
                <textarea
                  rows={4}
                  required
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  placeholder="Descreva o que aconteceu…"
                  className="field text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSupportOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Fechar
                </button>
                <RaisedButton type="submit" size="sm">
                  {supportSent ? "Mensagem enviada!" : "Enviar"}
                </RaisedButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
