"use client";

import React, { useEffect, useState } from "react";
import { useIsDemo } from "@/lib/use-demo";
import { useExtension } from "@/lib/use-extension";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Copy,
  Check,
  Laptop,
  Smartphone,
  BellRing,
  ChevronDown,
  ArrowUpRight,
} from "lucide-react";

const CARD_CLASS =
  "rounded-3xl border border-black/[0.06] bg-card/85 p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] sm:p-6 dark:border-white/[0.08]";

export default function SettingsPage() {
  const [themePref, setThemePref] = useState<"light" | "dark" | "system">("light");
  const [soundEnabled, setSoundEnabled] = useState(true);

  const demo = useIsDemo();
  const ext = useExtension();
  const [licenseKey, setLicenseKey] = useState("FC7A9E2D41B8C063D5E9A1F4");
  const [showKey, setShowKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [zipGuideOpen, setZipGuideOpen] = useState(false);

  const [devices, setDevices] = useState<{ deviceId: string; label: string; idle: boolean; lastSeenAt: string }[]>([
    { deviceId: "dev-1", label: "Chrome · Windows", idle: false, lastSeenAt: "Em uso agora" },
  ]);

  // Conta real: chave e aparelho vêm do banco (o modo demonstração mostra os de exemplo).
  type Lic = { key: string | null; device: { label: string; activatedAt: string | null } | null };
  function applyLicense(d: Lic | null) {
    if (!d?.key) return;
    setLicenseKey(d.key);
    setDevices(
      d.device
        ? [
            {
              deviceId: "real",
              label: d.device.label,
              idle: false,
              lastSeenAt: d.device.activatedAt
                ? `Conectado em ${new Date(d.device.activatedAt).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" })}`
                : "Conectado",
            },
          ]
        : [],
    );
  }
  useEffect(() => {
    if (demo) return;
    fetch("/api/license/reset")
      .then((r) => (r.ok ? r.json() : null))
      .then(applyLicense)
      .catch(() => {});
  }, [demo]);
  useEffect(() => {
    if (demo || ext.status !== "connected") return;
    fetch("/api/license/reset")
      .then((r) => (r.ok ? r.json() : null))
      .then(applyLicense)
      .catch(() => {});
  }, [ext.status, demo]);

  const [pushSubscribed, setPushSubscribed] = useState(true);
  const [pushTestSent, setPushTestSent] = useState(false);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("zaalys_theme") as "light" | "dark" | null;
      if (saved === "dark" || saved === "light") setThemePref(saved);
    } catch {}
  }, []);

  function updateTheme(val: "light" | "dark" | "system") {
    setThemePref(val);
    const isDark =
      val === "dark" ||
      (val === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", isDark);
    try {
      localStorage.setItem("zaalys_theme", isDark ? "dark" : "light");
    } catch {}
  }

  async function rotateKey() {
    if (demo) {
      const hex = () => Math.random().toString(16).slice(2, 10).toUpperCase().padEnd(8, "0");
      setLicenseKey(`${hex()}${hex()}${hex()}`);
    } else {
      const r = await fetch("/api/license/reset?rotate=1", { method: "POST" });
      if (r.ok) applyLicense(await r.json());
    }
    setShowKey(true);
  }

  async function unbindDevice(id: string) {
    if (!demo) await fetch("/api/license/reset?unbind=1", { method: "POST" }).catch(() => {});
    setDevices((prev) => prev.filter((x) => x.deviceId !== id));
  }

  const maskedKey = showKey
    ? licenseKey
    : `${licenseKey.slice(0, 8)}${"•".repeat(20)}`;

  const liveSessions = [
    {
      id: "sess-1",
      startedAt: "22/10/2026, 09:15",
      duration: "142 min · Timer · 4 registros",
      gmv: "R$ 1.248,60",
      stats: "14 vendas · 86 comentários · 28 fixações",
      events: [
        { time: "09:15", text: "Live iniciada com Escova Alisadora 5 em 1 Bivolt" },
        { time: "09:42", text: "Produto fixado automaticamente no topo da sacola" },
        { time: "10:18", text: "Pico de 312 espectadores simultâneos" },
        { time: "11:37", text: "Encerrada pelo timer programado (2h22m)" },
      ],
    },
    {
      id: "sess-2",
      startedAt: "21/10/2026, 19:30",
      duration: "95 min · Você parou · 3 registros",
      gmv: "R$ 839,10",
      stats: "9 vendas · 54 comentários · 19 fixações",
      events: [
        { time: "19:30", text: "Live iniciada com HILEE Garrafa Térmica Inox 591ml" },
        { time: "20:11", text: "Pergunta respondida no chat automático" },
        { time: "21:05", text: "Transmissão encerrada manualmente pelo painel" },
      ],
    },
  ];

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <header>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          Configurações
        </h1>
        <p className="mt-1 text-muted-foreground">
          Controle seu perfil e preferências.
        </p>
      </header>

      {/* Preferências */}
      <section className={CARD_CLASS}>
        <h2 className="font-display text-lg font-bold tracking-tight">
          Preferências
        </h2>
        <div className="mt-4 divide-y divide-black/[0.04] dark:divide-white/[0.05]">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
            <div>
              <div className="text-sm font-semibold tracking-tight">Tema</div>
              <div className="text-xs text-muted-foreground">
                Aparência da interface.
              </div>
            </div>
            <div className="inline-flex rounded-full border border-black/[0.06] bg-muted/60 p-1 dark:border-white/[0.08]">
              {(
                [
                  { value: "light", label: "Claro" },
                  { value: "dark", label: "Escuro" },
                  { value: "system", label: "Sistema" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateTheme(opt.value)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                    themePref === opt.value
                      ? "bg-primary text-primary-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
            <div>
              <div className="text-sm font-semibold tracking-tight">
                Som das notificações
              </div>
              <div className="text-xs text-muted-foreground">
                Toca um som nas vendas ao vivo.
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={soundEnabled}
              onClick={() => setSoundEnabled((s) => !s)}
              className={`flex h-7 w-12 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200 cursor-pointer ${
                soundEnabled
                  ? "justify-end bg-primary shadow-xs"
                  : "justify-start bg-muted/80 dark:bg-muted/60"
              }`}
            >
              <span className="size-6 rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.2)]" />
            </button>
          </div>
        </div>
      </section>

      {/* Extensão MediaFlowMZ Live */}
      <section className={CARD_CLASS}>
        <h2 className="font-display text-lg font-bold tracking-tight">
          Extensão MediaFlowMZ Live
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Cole esta chave no painel da extensão, na página de live do TikTok. Ela
          abre 2 aparelhos ao mesmo tempo — {Math.max(0, 2 - devices.length)}{" "}
          livre. Um aparelho parado há mais de 15 minutos cede a vaga sozinho para
          o próximo que ativar.
        </p>

        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-border bg-background p-2 pl-3">
          <code className="min-w-0 flex-1 truncate font-mono text-sm tabular-nums">
            {maskedKey}
          </code>
          <button
            type="button"
            aria-label={showKey ? "Esconder chave" : "Mostrar chave"}
            onClick={() => setShowKey((s) => !s)}
            className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
          >
            {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(licenseKey);
              setCopiedKey(true);
              setTimeout(() => setCopiedKey(false), 1500);
            }}
            className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-border bg-card px-3 text-xs font-semibold hover:bg-muted cursor-pointer"
          >
            {copiedKey ? <Check size={14} /> : <Copy size={14} />}
            {copiedKey ? "Copiada" : "Copiar"}
          </button>
        </div>

        {ext.installed && (
          <div className="mt-3 flex flex-wrap items-center gap-3 rounded-2xl border border-primary/30 bg-primary/[0.06] p-3 text-sm">
            <p className="min-w-0 flex-1">
              {ext.status === "connected"
                ? "Extensão conectada neste navegador."
                : "A extensão está instalada neste navegador. Conecte sem copiar a chave."}
              {ext.error && <span className="block text-xs text-destructive">{ext.error}</span>}
            </p>
            {ext.status !== "connected" && (
              <button
                type="button"
                disabled={ext.status === "connecting"}
                onClick={() => ext.connect(licenseKey)}
                className="h-9 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground disabled:opacity-60 cursor-pointer"
              >
                {ext.status === "connecting" ? "Conectando…" : "Conectar neste navegador"}
              </button>
            )}
          </div>
        )}

        {/* Connected Devices */}
        {devices.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {devices.map((d) => (
              <li
                key={d.deviceId}
                className="flex flex-wrap items-center gap-3 rounded-2xl bg-muted/50 p-3"
              >
                <Laptop className="size-5 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1 text-sm">
                  <p className="truncate font-semibold">{d.label}</p>
                  <p className="text-xs text-muted-foreground">{d.lastSeenAt}</p>
                </div>
                <button
                  type="button"
                  onClick={() => unbindDevice(d.deviceId)}
                  className="h-8 rounded-xl border border-border bg-background px-3 text-xs font-semibold hover:bg-muted cursor-pointer"
                >
                  Desconectar
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-muted/50 p-3">
            <Laptop className="size-5 shrink-0 text-muted-foreground" />
            <p className="min-w-0 flex-1 text-sm text-muted-foreground">
              Nenhum aparelho conectado ainda.
            </p>
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={rotateKey}
            className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground cursor-pointer"
          >
            Gerar chave nova
          </button>
          <a
            href="/downloads/mediaflowmz-live.zip"
            download
            className="text-xs font-medium text-primary underline underline-offset-4"
          >
            Baixar extensão (.zip v3.17.0){ext.installed ? ` · instalada: v${ext.version}` : ""}
          </a>
        </div>

        {/* ExtensionUpdate Collapsible */}
        <div className="mt-4 rounded-2xl bg-muted/50">
          <button
            type="button"
            aria-expanded={zipGuideOpen}
            onClick={() => setZipGuideOpen((o) => !o)}
            className="flex w-full items-center gap-2 rounded-2xl p-3 text-left text-sm transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.03] cursor-pointer"
          >
            <span className="min-w-0 flex-1">
              <span className="font-semibold">
                Instalou pelo .zip? Troque pela Chrome Web Store
              </span>
              <span className="block text-xs text-muted-foreground">
                Versão atual: <span className="tabular-nums">3.17.0</span>. Pela
                loja, a extensão se atualiza sozinha, sempre fora da live.
              </span>
            </span>
            <ChevronDown
              className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                zipGuideOpen ? "rotate-180" : ""
              }`}
            />
          </button>
          {zipGuideOpen && (
            <div className="space-y-3 px-3 pb-3 text-sm">
              <ol className="space-y-2 text-xs leading-relaxed text-muted-foreground">
                <li>
                  <strong>1.</strong> Na Chrome Web Store, clique em{" "}
                  <strong className="text-foreground">Usar no Chrome</strong>.
                </li>
                <li>
                  <strong>2.</strong> Em{" "}
                  <strong className="text-foreground">Configurações</strong>,
                  desconecte o computador da cópia antiga: a nova ocupa a vaga
                  dela.
                </li>
                <li>
                  <strong>3.</strong> Abra{" "}
                  <code className="rounded border border-border bg-background px-1.5 py-0.5 font-mono">
                    chrome://extensions
                  </code>{" "}
                  e remova a <strong className="text-foreground">MediaFlowMZ Live</strong>{" "}
                  que tem o botão <strong>↻</strong> (recarregar). É a do .zip.
                </li>
                <li>
                  <strong>4.</strong> Recarregue a página do TikTok Shop (
                  <strong className="text-foreground">F5</strong>) e cole sua chave
                  no painel. Seus clipes continuam lá.
                </li>
              </ol>
            </div>
          )}
        </div>
      </section>

      {/* Avisos no celular */}
      <section className={CARD_CLASS}>
        <div className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <BellRing className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-lg font-bold tracking-tight">
              Avisos no celular
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Se a live cair, receber um aviso de violação ou encerrar sozinha, o
              MediaFlowMZ avisa neste aparelho — mesmo com o site fechado. Vendas não
              avisam: numa live boa seria a cada poucos minutos.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {pushSubscribed ? (
            <>
              <button
                type="button"
                onClick={() => setPushSubscribed(false)}
                className="h-9 rounded-xl border border-border bg-background px-3.5 text-xs font-semibold hover:bg-muted cursor-pointer"
              >
                Desligar neste aparelho
              </button>
              <button
                type="button"
                onClick={() => {
                  setPushTestSent(true);
                  setTimeout(() => setPushTestSent(false), 2000);
                }}
                className="h-9 rounded-xl px-3.5 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              >
                {pushTestSent ? "✓ Enviado para 1 aparelho" : "Enviar um teste"}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setPushSubscribed(true)}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-3.5 text-xs font-semibold text-primary-foreground cursor-pointer"
            >
              <BellRing className="size-3.5" />
              Avisar neste aparelho
            </button>
          )}
        </div>

        {pushSubscribed && (
          <ul className="mt-4 divide-y divide-black/[0.04] dark:divide-white/[0.05]">
            <li className="flex items-center gap-3 py-2.5 text-sm">
              <Smartphone className="size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate">
                Chrome no computador
                <span className="ml-2 text-xs text-muted-foreground">(este)</span>
              </span>
            </li>
          </ul>
        )}
      </section>

      {/* Histórico de lives */}
      <section className={CARD_CLASS}>
        <h2 className="font-display text-lg font-bold tracking-tight">
          Histórico de lives
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          2 lives · 3 h 57 min no ar · 1× Timer · 1× Você parou
        </p>

        <ul className="mt-3 divide-y divide-black/[0.04] dark:divide-white/[0.05]">
          {liveSessions.map((sess) => {
            const isOpen = expandedSession === sess.id;
            return (
              <li key={sess.id} className="py-2 text-sm">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedSession(isOpen ? null : sess.id)
                  }
                  className="flex w-full flex-wrap items-center justify-between gap-2 rounded-xl py-1.5 text-left transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.03] cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <ChevronDown
                      className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                    <div>
                      <p className="font-semibold tabular-nums">
                        {sess.startedAt}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {sess.duration}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold tabular-nums">
                      {sess.gmv}
                    </p>
                    <p className="text-xs tabular-nums text-muted-foreground">
                      {sess.stats}
                    </p>
                  </div>
                </button>
                {isOpen && (
                  <ol className="my-2 ml-6 space-y-1 border-l border-black/[0.06] pl-3 dark:border-white/[0.08]">
                    {sess.events.map((ev, i) => (
                      <li key={i} className="flex gap-2 text-xs">
                        <time className="shrink-0 tabular-nums text-muted-foreground">
                          {ev.time}
                        </time>
                        <span>{ev.text}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {/* Meu Perfil Link Card */}
      <Link
        href="/painel/conta"
        className="group flex items-center justify-between rounded-3xl border border-black/[0.06] bg-card/85 p-5 shadow-2xs transition-[transform,border-color,box-shadow] duration-150 hover:border-black/[0.12] active:scale-[0.98] dark:border-white/[0.08] dark:hover:border-white/[0.16]"
      >
        <div>
          <div className="font-display font-bold tracking-tight">
            Meu Perfil
          </div>
          <div className="text-sm text-muted-foreground">
            Dados da conta, plano e segurança.
          </div>
        </div>
        <ArrowUpRight
          size={18}
          className="text-muted-foreground transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        />
      </Link>
    </div>
  );
}
