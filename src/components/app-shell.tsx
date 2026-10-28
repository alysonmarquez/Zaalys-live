"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Gift,
  Bell,
  Headphones,
  Moon,
  Sun,
  UserRound,
  Settings,
  Heart,
  Wallet,
  ShieldCheck,
  LogOut,
  Check,
  Copy,
  ShoppingBag,
  X,
  RotateCcw,
  Send,
  Sparkles,
  LayoutDashboard,
} from "lucide-react";
import { ZAALYS_NOTIFICATIONS, formatBRL } from "@/lib/zaalys-data";
import { BottomDock } from "@/components/bottom-dock";
import { CreatorModal } from "@/components/creator-modal";
import { LiveSaleToast } from "@/components/live-sale-toast";
import { AdminProvider, ShowcaseProvider, StudioProvider } from "@/lib/showcase";
import { useLiveSettingsSync } from "@/lib/live-settings-sync";

type AppShellProps = {
  userEmail: string;
  userName?: string;
  /** @ do criador, mostrado no Acesso Creator. */
  userHandle?: string;
  /** Painel em modo demonstração (sem Supabase, fora de produção). */
  demo?: boolean;
  /** Conta de demonstração: dados de exemplo, vendas ao vivo simuladas e Painel do Afiliado. */
  showcase?: boolean;
  /** Pode aprovar afiliados. */
  admin?: boolean;
  /** Pode abrir o Estúdio de LIVE. */
  studio?: boolean;
  children: React.ReactNode;
};

type ZaalQA = {
  q: string;
  a: string;
  video: string;
};

const ZAAL_QUESTIONS_BY_ROUTE: Record<string, ZaalQA[]> = {
  default: [
    {
      q: "Por onde eu começo?",
      a: "Comece pelo card **Produtos Virais**: escolha um produto com comissão acima de 18% e clique em **Afiliar no TikTok Shop**. Depois, clique em **Templates Virais** ou **Assistente de Live** para a IA montar seu roteiro pronto!",
      video: "/zaal/zaal-presenting.mp4",
    },
    {
      q: "O que tem em cada atalho?",
      a: "• **Produtos Virais**: catálogo com preço, comissão e ganho real por venda.\n• **Templates Virais**: cenas prontas para gerar vídeo com IA no Google Flow.\n• **Radar**: avisa quando um produto sobe a comissão ou baixa o preço.\n• **Trend AI**: roteiros virais de 8 segundos com personagens.\n• **Raio-X**: analisa qualquer vídeo que está vendendo no TikTok.\n• **Assistente de Live**: sua live automática em loop com extensão do Chrome.",
      video: "/zaal/zaal-thumbs-up.mp4",
    },
    {
      q: "Por que o Dashboard está vazio?",
      a: "Os números de vendas ao vivo e atividades aparecem assim que você conecta a extensão **MediaFlowMZ Live** na sua primeira transmissão do TikTok Shop ou compartilha seu link de indicação em **Indique e ganhe**.",
      video: "/zaal/zaal-waving.mp4",
    },
  ],
  "/painel/catalogo": [
    {
      q: "Como escolho um produto bom?",
      a: "Olhe sempre o **Ganho por venda** (em verde) e o selo **Comissão alta**. Produtos entre R$ 59 e R$ 149 com mais de 18% de comissão vendem no impulso e batem R$ 1.000 com poucas vendas.",
      video: "/zaal/zaal-presenting.mp4",
    },
    {
      q: "Como me afilio no TikTok Shop?",
      a: "Toque no produto para abrir os detalhes e clique em **Afiliar no TikTok Shop**. Adicione o produto à sua vitrine de afiliado e volte aqui para gerar o vídeo ou a live.",
      video: "/zaal/zaal-thumbs-up.mp4",
    },
    {
      q: "Posso cadastrar um produto meu?",
      a: "Sim! Clique no botão **+ Adicionar produto** no topo direito da lista e cole o link do produto do TikTok Shop.",
      video: "/zaal/zaal-waving.mp4",
    },
  ],
  "/painel/live": [
    {
      q: "Como funciona a Live Infinita?",
      a: "1. Escolha o produto aqui no **Assistente de Live**.\n2. Gere ou baixe os clipes curtos.\n3. Instale a extensão **MediaFlowMZ Live** no navegador.\n4. Abra a página de LIVE do TikTok Shop: a extensão mantém seus clipes em loop, fixa o produto e responde o chat sozinha!",
      video: "/zaal/zaal-presenting.mp4",
    },
    {
      q: "Preciso aparecer na câmera?",
      a: "Não! Na Live Infinita, os seus clipes do produto rodam em loop como câmera virtual enquanto a extensão comenta e fixa o link na sacola.",
      video: "/zaal/zaal-thumbs-up.mp4",
    },
    {
      q: "Como recebo aviso se a live cair?",
      a: "Vá em **Configurações → Avisos no celular** e clique em **Avisar neste aparelho**. Se a transmissão encerrar ou receber aviso, seu celular toca na hora.",
      video: "/zaal/zaal-waving.mp4",
    },
  ],
};

export function BrandLogo() {
  return (
    <Link
      href="/painel"
      className="group inline-flex shrink-0 items-center gap-2 font-display text-base font-extrabold sm:text-lg tracking-tight text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
    >
      <span className="grid size-7 place-items-center rounded-lg bg-primary text-primary-foreground shadow-2xs transition-transform duration-150 group-hover:scale-105">
        <svg viewBox="0 0 100 100" fill="none" className="size-4" aria-hidden="true">
          <g
            stroke="currentColor"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M25 75V25L50 55L75 25" />
            <path d="M75 25V75" />
          </g>
        </svg>
      </span>
      {/* Em telas bem estreitas (< 380 px) só o ícone: o nome não cabe ao lado dos botões do topo. */}
      <span className="hidden min-[380px]:inline">MediaFlowMZ</span>
    </Link>
  );
}

export function AppShell({ userEmail, userName, userHandle, demo, showcase = false, admin = false, studio = false, children }: AppShellProps) {
  // Números editados da LIVE valem em qualquer aparelho.
  useLiveSettingsSync();
  const pathname = usePathname();
  const router = useRouter();

  const displayName =
    userName?.trim() ||
    userEmail
      .split("@")[0]
      .replace(/[._-]+/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()) ||
    "Creator";
  const initial = displayName.charAt(0).toUpperCase();


  // Theme state (default light matching mediaflowmz.com studio, toggleable to dark)
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("zaalys_theme");
      const isDark =
        saved === "dark" ||
        (!saved && document.documentElement.classList.contains("dark"));
      setTheme(isDark ? "dark" : "light");
      document.documentElement.classList.toggle("dark", isDark);
    } catch {}
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("zaalys_theme", next);
    } catch {}
  }

  // Popovers & Modals
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [creatorOpen, setCreatorOpen] = useState(false);

  const [supportOpen, setSupportOpen] = useState(false);
  const [supportTopic, setSupportTopic] = useState("Dúvida sobre ferramenta");
  const [supportMessage, setSupportMessage] = useState("");
  const [supportSent, setSupportSent] = useState(false);
  const [supportSending, setSupportSending] = useState(false);
  const [supportError, setSupportError] = useState<string | null>(null);

  async function submitSupport() {
    if (!supportMessage.trim() || supportSending) return;
    setSupportSending(true);
    setSupportError(null);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: supportTopic, message: supportMessage.trim(), page: pathname }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setSupportSent(true);
      setSupportMessage("");
    } catch {
      setSupportError("Não conseguimos enviar agora. Escreva para suporte@mediaflowmz.com.");
    } finally {
      setSupportSending(false);
    }
  }

  // Notificações de venda de exemplo só na conta de demonstração.
  const [notifications, setNotifications] = useState(showcase ? ZAALYS_NOTIFICATIONS : []);
  const unreadCount = notifications.filter((n) => n.unread).length;

  // Zaal Mascot Assistant state
  const [zaalBubbleDismissed, setZaalBubbleDismissed] = useState(false);
  const [zaalDrawerOpen, setZaalDrawerOpen] = useState(false);
  const [zaalHovered, setZaalHovered] = useState(false);
  const [zaalVideo, setZaalVideo] = useState("/zaal/zaal-waving.mp4");
  const [zaalMessages, setZaalMessages] = useState<
    { role: "user" | "zaal"; text: string }[]
  >([
    {
      role: "zaal",
      text: `Oi, ${displayName.split(" ")[0]}! Sou o **Zaal** 👋\nEscolha uma dúvida abaixo ou escreva sua pergunta sobre a MediaFlowMZ.`,
    },
  ]);
  const [zaalInput, setZaalInput] = useState("");

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const currentQuestions =
    ZAAL_QUESTIONS_BY_ROUTE[pathname] ?? ZAAL_QUESTIONS_BY_ROUTE.default;

  function askZaal(qa: ZaalQA) {
    setZaalDrawerOpen(true);
    setZaalVideo(qa.video);
    setZaalMessages((prev) => [
      ...prev,
      { role: "user", text: qa.q },
      { role: "zaal", text: qa.a },
    ]);
  }

  function handleZaalSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = zaalInput.trim();
    if (!q) return;
    setZaalInput("");
    setZaalVideo("/zaal/zaal-presenting.mp4");
    const lower = q.toLowerCase();
    let reply =
      "Você pode acessar todas as ferramentas pela **Central**: comece escolhendo um item em **Produtos Virais**, gere seus vídeos em **Templates Virais** ou configure sua transmissão em **Assistente de Live**.";
    if (lower.includes("live") || lower.includes("extens")) {
      reply =
        "Para usar a **Live Infinita**, abra o **Assistente de Live**, escolha seu produto, baixe os clipes e instale a extensão **MediaFlowMZ Live** no Chrome. A chave de ativação fica em **Configurações**.";
    } else if (lower.includes("flow") || lower.includes("video") || lower.includes("vídeo") || lower.includes("template")) {
      reply =
        "Em **Templates Virais**, escolha um movimento de cena, selecione o produto e o modelo de IA e clique em **Gerar roteiro**. Depois é só abrir o **Google Flow** no modo *Ingredientes para vídeo*, subir as 2 fotos e colar o prompt!";
    } else if (lower.includes("comiss") || lower.includes("indique") || lower.includes("afiliado") || lower.includes("pix")) {
      reply =
        "No programa **Indique e ganhe**, seu amigo recebe **R$ 30,00 de desconto** no plano vitalício e você recebe **R$ 50,00 no Pix** após o prazo de garantia. Configure sua chave Pix em **Indique e ganhe** ou **Saque de comissões**!";
    }
    setZaalMessages((prev) => [
      ...prev,
      { role: "user", text: q },
      { role: "zaal", text: reply },
    ]);
  }

  async function handleSignOut() {
    setUserMenuOpen(false);
    try {
      await fetch("/api/auth/session", { method: "DELETE" });
    } catch {}
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-svh bg-studio text-foreground flex flex-col">
      {demo && (
        <div role="status" className="bg-primary/15 px-4 py-1.5 text-center text-[11px] font-semibold text-foreground">
          Modo demonstração: sem banco configurado, dados de exemplo. Configure o Supabase para usar contas reais.
        </div>
      )}
      {/* Top Navbar matching 3jz1kpdvh_75d.js */}
      <header className="sticky top-0 z-30 border-b border-black/[0.06] bg-background/85 backdrop-blur-xl dark:border-white/[0.08]">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4 sm:px-6">
          {/* Left: só a marca, como no original */}
          <div className="flex min-w-0 items-center gap-1.5">
            <BrandLogo />
          </div>

          {/* Right: 1. Acesso Creator | 2. Bell (9+) | 3. Suporte | 4. Moon/Sun | 5. Avatar Circle */}
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            {/* 1. Acesso Creator */}
            <button
              type="button"
              onClick={() => {
                setCreatorOpen(true);
              }}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-black/[0.06] bg-card px-3 text-xs font-semibold text-foreground shadow-2xs transition-[transform,border-color,background-color] duration-150 hover:bg-muted active:scale-[0.97] dark:border-white/[0.08] cursor-pointer sm:px-3.5"
            >
              <Gift size={15} className="shrink-0 text-primary" />
              <span className="hidden xs:inline sm:inline">Acesso Creator</span>
            </button>

            {/* 2. Bell Notifications with 9+ lime badge */}
            <div ref={notifRef} className="relative">
              <button
                type="button"
                aria-label="Notificações"
                onClick={() => {
                  setNotifOpen((o) => !o);
                  setUserMenuOpen(false);
                }}
                className="relative grid size-9 place-items-center rounded-full text-muted-foreground transition-[transform,color,background-color] duration-150 hover:bg-foreground/[0.05] hover:text-foreground active:scale-95 cursor-pointer"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="tabular-nums absolute -right-0.5 -top-0.5 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold leading-4 text-primary-foreground shadow-2xs">
                    {unreadCount >= 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-3xl border border-black/[0.08] bg-popover p-0 text-popover-foreground shadow-[0_24px_64px_-12px_rgba(0,0,0,0.45)] sm:w-96 dark:border-white/[0.1]">
                  <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-sm font-bold">
                        Notificações
                      </span>
                      {unreadCount > 0 && (
                        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-bold text-primary">
                          {unreadCount >= 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          setNotifications((prev) =>
                            prev.map((n) => ({ ...n, unread: false }))
                          )
                        }
                        className="text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        Marcar todas como lidas
                      </button>
                    )}
                  </div>

                  <ul className="max-h-[340px] divide-y divide-border/50 overflow-y-auto">
                    {notifications.map((item) => (
                      <li
                        key={item.id}
                        className={`flex items-center gap-3 px-4 py-3 text-xs transition-colors ${
                          item.unread ? "bg-primary/[0.04]" : ""
                        }`}
                      >
                        <div className="relative size-10 shrink-0">
                          <img
                            src={item.productImage}
                            alt=""
                            className="size-10 rounded-xl object-cover border border-black/[0.06] dark:border-white/[0.08]"
                          />
                          <span className="absolute -bottom-1 -right-1 grid size-4 place-items-center rounded-full bg-primary text-primary-foreground shadow-2xs">
                            <ShoppingBag size={10} />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-foreground">
                              Venda ao vivo
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              · {item.timeAgo}
                            </span>
                          </div>
                          <p className="truncate text-muted-foreground">
                            {item.productTitle}
                          </p>
                        </div>
                        <span className="shrink-0 font-mono text-xs font-bold tabular-nums text-primary">
                          +{formatBRL(item.priceCents)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {notifications.length === 0 && (
                    <p className="px-4 py-8 text-center text-xs text-muted-foreground">As vendas das suas LIVEs aparecem aqui.</p>
                  )}
                  {showcase && <Link
                    href="/painel/afiliado"
                    onClick={() => setNotifOpen(false)}
                    className="block border-t border-border/60 py-2.5 text-center text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                  >
                    Ver painel de atividades
                  </Link>}
                </div>
              )}
            </div>

            {/* 3. Suporte */}
            <button
              type="button"
              onClick={() => {
                setSupportSent(false);
                setSupportOpen(true);
              }}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-black/[0.06] bg-card px-3 text-xs font-semibold text-foreground shadow-2xs transition-[transform,border-color,background-color] duration-150 hover:bg-muted active:scale-[0.97] dark:border-white/[0.08] cursor-pointer sm:px-3.5"
            >
              <Headphones size={15} className="shrink-0 text-muted-foreground" />
              <span className="hidden xs:inline sm:inline">Suporte</span>
            </button>

            {/* 4. Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Alternar tema"
              className="grid size-9 place-items-center rounded-full text-muted-foreground transition-[transform,color,background-color] duration-150 hover:bg-foreground/[0.05] hover:text-foreground active:scale-95 cursor-pointer"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* 5. User Avatar Circle + Dropdown */}
            <div ref={userMenuRef} className="relative">
              <button
                type="button"
                aria-label="Menu da conta"
                onClick={() => {
                  setUserMenuOpen((o) => !o);
                  setNotifOpen(false);
                }}
                className="grid size-9 place-items-center rounded-full bg-primary/15 text-sm font-bold text-primary transition-transform duration-150 hover:bg-primary/25 active:scale-95 cursor-pointer"
              >
                {initial}
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-11 z-50 w-56 rounded-2xl border border-black/[0.08] bg-popover p-1.5 text-popover-foreground shadow-[0_20px_48px_-12px_rgba(0,0,0,0.4)] dark:border-white/[0.1]">
                  <div className="px-2.5 py-2">
                    <div className="truncate text-sm font-semibold">
                      {displayName}
                    </div>
                    <div className="truncate text-xs font-normal text-muted-foreground">
                      {userEmail}
                    </div>
                  </div>
                  <div className="my-1 h-px bg-border/60" />

                  <Link
                    href="/painel/conta"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <UserRound size={15} className="text-muted-foreground" />
                    Meu perfil
                  </Link>
                  <Link
                    href="/painel/configuracoes"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <Settings size={15} className="text-muted-foreground" />
                    Configurações
                  </Link>
                  <Link
                    href="/painel/indique"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <Gift size={15} className="text-primary" />
                    Indique e ganhe
                  </Link>
                  <Link
                    href="/painel/depoimento"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <Heart size={15} className="text-muted-foreground" />
                    Deixar um depoimento
                  </Link>
                  <Link
                    href="/painel/comissoes"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <Wallet size={15} className="text-muted-foreground" />
                    Saque de comissões
                  </Link>
                  {admin && (
                    <Link
                      href="/painel/admin"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold text-primary transition-colors hover:bg-accent"
                    >
                      <LayoutDashboard size={15} />
                      Admin
                    </Link>
                  )}
                  {(showcase || admin) && <Link
                    href="/painel/afiliado"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <ShieldCheck size={15} className="text-muted-foreground" />
                    Painel do Afiliado
                  </Link>}

                  <div className="my-1 h-px bg-border/60" />
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs font-medium text-rose-500 transition-colors hover:bg-rose-500/10 cursor-pointer"
                  >
                    <LogOut size={15} />
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-40 pt-6 sm:px-6 sm:pb-28 sm:pt-8">
        <ShowcaseProvider value={showcase}>
          <AdminProvider value={admin}>
            <StudioProvider value={studio}>{children}</StudioProvider>
          </AdminProvider>
        </ShowcaseProvider>
      </main>

      {/* Acesso Creator: "Sua condição especial" → valores e usos → link */}
      {creatorOpen && <CreatorModal handle={userHandle || userEmail.split("@")[0]} onClose={() => setCreatorOpen(false)} />}

      {/* Support Modal (matching 3jz1kpdvh_75d.js) */}
      {supportOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-xs"
          onClick={() => setSupportOpen(false)}
        >
          <div
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-black/[0.08] bg-card p-6 text-card-foreground shadow-2xl dark:border-white/[0.1]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSupportOpen(false)}
              className="absolute right-4 top-4 grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
            >
              <X size={16} />
            </button>

            <h2 className="font-display text-xl font-extrabold tracking-tight">
              Falar com o suporte
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Escolha o assunto e conte como podemos ajudar. Respondemos no seu
              e-mail de cadastro.
            </p>

            {supportSent ? (
              <div className="mt-5 space-y-4 rounded-2xl border border-primary/30 bg-primary/[0.06] p-4 text-sm">
                <div className="flex items-center gap-2 font-semibold text-primary">
                  <Check size={16} />
                  Mensagem recebida!
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Nossa equipe já recebeu seu chamado sobre{" "}
                  <strong>{supportTopic}</strong> e responderá em breve no e-mail{" "}
                  <strong>{userEmail}</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => setSupportOpen(false)}
                  className="h-10 w-full rounded-xl bg-primary text-xs font-semibold text-primary-foreground cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            ) : (
              <form
                className="mt-4 space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  void submitSupport();
                }}
              >
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Assunto
                  </span>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {[
                      "Dúvida sobre ferramenta",
                      "Extensão / Live",
                      "Pagamento ou plano",
                      "Sugestão ou bug",
                    ].map((topic) => (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => setSupportTopic(topic)}
                        className={`rounded-xl border px-3 py-2 text-left text-xs font-medium transition-colors cursor-pointer ${
                          supportTopic === topic
                            ? "border-primary bg-primary/12 text-foreground font-semibold"
                            : "border-border/70 bg-background/60 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="support-msg"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    Mensagem
                  </label>
                  <textarea
                    id="support-msg"
                    required
                    rows={4}
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    placeholder="Conte o que aconteceu ou qual é a sua dúvida..."
                    className="mt-1.5 w-full rounded-2xl border border-border bg-background/70 p-3 text-sm outline-none focus:border-primary"
                  />
                </div>

                {supportError && (
                  <p role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 p-2.5 text-xs">
                    {supportError}
                  </p>
                )}

                <div className="flex items-center justify-between gap-3 pt-1">
                  <span className="text-[11px] text-muted-foreground">
                    Ou escreva para{" "}
                    <a
                      href="mailto:suporte@mediaflowmz.com"
                      className="underline hover:text-foreground"
                    >
                      suporte@mediaflowmz.com
                    </a>
                  </span>
                  <button
                    type="submit"
                    disabled={supportSending}
                    className="h-10 rounded-xl bg-primary px-5 text-xs font-semibold text-primary-foreground shadow-xs transition-transform active:scale-95 cursor-pointer disabled:opacity-60"
                  >
                    {supportSending ? "Enviando…" : "Enviar"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Menu flutuante e notificação de venda ao vivo (como no original) */}
      <BottomDock />
      {showcase && !zaalDrawerOpen && <LiveSaleToast />}

      {/* Floating "Zaal" 3D Mascot Assistant Widget (matching Screenshot 1 & 3jz1kpdvh_75d.js) */}
      {!zaalDrawerOpen && (
        // No celular fica acima da barra de atalhos (senão cobre o botão da Live).
        <div className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom))] right-3 z-40 flex flex-col items-end gap-2 sm:bottom-5 sm:right-5">
          {!zaalBubbleDismissed && (
            <div className="mb-1 flex max-w-[300px] flex-col items-end gap-1.5">
              {/* Top Greeting Bubble */}
              <div className="relative flex items-start gap-2.5 rounded-2xl border border-[#2E2B27] bg-[#1E1C19] px-3.5 py-2.5 pr-7 text-xs leading-relaxed text-[#F3F1EF] shadow-[0_14px_34px_-8px_rgba(0,0,0,0.55)]">
                <img
                  src="/zaal/zaal-chat.png"
                  alt="Zaal"
                  className="mt-0.5 size-7 shrink-0 rounded-full object-cover ring-1 ring-[#B9F83A]/40"
                />
                <div>
                  <p>
                    Oi! Sou o <strong className="text-[#B9F83A]">Zaal</strong> 👋
                  </p>
                  <p className="text-[#C9C4BD]">
                    Ficou com alguma dúvida? Toque numa pergunta:
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Fechar dicas do Zaal"
                  onClick={() => setZaalBubbleDismissed(true)}
                  className="absolute right-2 top-2 grid size-5 place-items-center rounded-full text-[#9E9890] transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
                >
                  <X size={12} />
                </button>
              </div>

              {/* 3 Quick-Question Pills */}
              {currentQuestions.map((qa) => (
                <button
                  key={qa.q}
                  type="button"
                  onClick={() => askZaal(qa)}
                  className="rounded-full border border-[#2E2B27] bg-[#25221F] px-3.5 py-1.5 text-right text-xs font-medium text-[#F3F1EF] shadow-md transition-all duration-150 hover:border-[#B9F83A]/55 hover:bg-[#2E2B27] active:scale-[0.97] cursor-pointer"
                >
                  {qa.q}
                </button>
              ))}
            </div>
          )}

          {/* Mascot FAB Button */}
          <button
            type="button"
            aria-label="Abrir assistente Zaal"
            onClick={() => setZaalDrawerOpen(true)}
            onMouseEnter={() => setZaalHovered(true)}
            onMouseLeave={() => setZaalHovered(false)}
            className="group relative size-12 overflow-hidden rounded-2xl sm:size-14 border-2 border-[#B9F83A]/70 bg-[#181614] shadow-[0_12px_32px_-6px_rgba(0,0,0,0.65)] transition-transform duration-200 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <img
              src={zaalHovered ? "/zaal/zaal-fab-hover.png" : "/zaal/zaal-fab.png"}
              alt="Assistente Zaal"
              className="size-full object-cover"
            />
            <span className="absolute bottom-1 right-1 size-2.5 rounded-full bg-[#B9F83A] ring-2 ring-[#181614]" />
          </button>
        </div>
      )}

      {/* Zaal Interactive Chat Drawer (400px right sheet) */}
      {zaalDrawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[1px]"
          onClick={() => setZaalDrawerOpen(false)}
        >
          <aside
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[400px] flex-col border-l border-[#2E2B27] bg-[#221F18] text-[#F3F1EF] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex h-12 shrink-0 items-center justify-between border-b border-[#2E2B27] bg-[#110F0D] px-4">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#B9F83A]" />
                <span className="font-display text-sm font-bold text-white">
                  Zaal
                </span>
                <span className="text-xs text-[#A7A29C]">
                  · Assistente da MediaFlowMZ
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Recomeçar conversa"
                  onClick={() => {
                    setZaalVideo("/zaal/zaal-waving.mp4");
                    setZaalMessages([
                      {
                        role: "zaal",
                        text: `Oi, ${displayName.split(" ")[0]}! Sou o **Zaal** 👋\nEscolha uma dúvida abaixo ou escreva sua pergunta sobre a MediaFlowMZ.`,
                      },
                    ]);
                  }}
                  className="grid size-8 place-items-center rounded-lg text-[#A7A29C] hover:bg-white/10 hover:text-white cursor-pointer"
                >
                  <RotateCcw size={14} />
                </button>
                <button
                  type="button"
                  aria-label="Fechar Zaal"
                  onClick={() => setZaalDrawerOpen(false)}
                  className="grid size-8 place-items-center rounded-lg text-[#A7A29C] hover:bg-white/10 hover:text-white cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* 3D Mascot Video Stage */}
            <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden border-b border-[#2E2B27] bg-[#141210]">
              <video
                key={zaalVideo}
                src={zaalVideo}
                poster="/zaal/zaal-placeholder.png"
                autoPlay
                muted
                loop
                playsInline
                className="size-full object-cover"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#221F18] to-transparent" />
            </div>

            {/* Messages & Quick Prompts */}
            <div className="flex-1 space-y-3 overflow-y-auto p-4 text-xs leading-relaxed">
              {zaalMessages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 ${
                      m.role === "user"
                        ? "bg-[#B9F83A] font-medium text-[#141A06]"
                        : "border border-[#2E2B27] bg-[#1A1814] text-[#F3F1EF]"
                    }`}
                  >
                    {m.text.split("**").map((part, i) =>
                      i % 2 === 1 ? (
                        <strong
                          key={i}
                          className={
                            m.role === "user" ? "font-bold" : "text-[#B9F83A]"
                          }
                        >
                          {part}
                        </strong>
                      ) : (
                        <span key={i}>{part}</span>
                      )
                    )}
                  </div>
                </div>
              ))}

              <div className="pt-2">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#A7A29C]">
                  Perguntas frequentes
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {currentQuestions.map((qa) => (
                    <button
                      key={qa.q}
                      type="button"
                      onClick={() => askZaal(qa)}
                      className="rounded-full border border-[#2E2B27] bg-[#28241E] px-3 py-1.5 text-left text-xs text-[#F3F1EF] transition-colors hover:border-[#B9F83A]/50 hover:bg-[#322D25] cursor-pointer"
                    >
                      {qa.q}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Input Form */}
            <form
              onSubmit={handleZaalSubmit}
              className="flex items-center gap-2 border-t border-[#2E2B27] bg-[#181612] p-3"
            >
              <input
                type="text"
                value={zaalInput}
                onChange={(e) => setZaalInput(e.target.value)}
                placeholder="Pergunte qualquer coisa ao Zaal..."
                className="h-10 min-w-0 flex-1 rounded-xl border border-[#2E2B27] bg-[#221F18] px-3 text-xs text-white placeholder:text-[#8E8880] outline-none focus:border-[#B9F83A]"
              />
              <button
                type="submit"
                aria-label="Enviar pergunta"
                className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#B9F83A] text-[#141A06] transition-transform active:scale-95 cursor-pointer"
              >
                <Send size={15} />
              </button>
            </form>
          </aside>
        </div>
      )}
    </div>
  );
}
