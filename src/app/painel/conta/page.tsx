"use client";

import { useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";
import { RaisedButton, Segmented } from "@/components/brand";
import { formatBRL } from "@/lib/zaalys-data";

function ContaInner() {
  const searchParams = useSearchParams();
  const initialTab =
    searchParams.get("aba") === "indique"
      ? "indique"
      : searchParams.get("aba") === "perfil"
        ? "perfil"
        : "preferencias";

  const [tab, setTab] = useState<"preferencias" | "perfil" | "indique">(initialTab);
  const [licenseKey, setLicenseKey] = useState("ZLYS-9F4A-8C2E-71B0-LIVE");
  const [copiedKey, setCopiedKey] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [pushTestSent, setPushTestSent] = useState(false);
  const [pixKey, setPixKey] = useState("");
  const [pixSaved, setPixSaved] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);

  useEffect(() => {
    const a = searchParams.get("aba");
    if (a === "indique" || a === "perfil" || a === "preferencias") setTab(a);
  }, [searchParams]);

  function regenerateKey() {
    const seg = () => Math.random().toString(16).substring(2, 6).toUpperCase();
    setLicenseKey(`ZLYS-${seg()}-${seg()}-${seg()}-LIVE`);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            {tab === "indique"
              ? "Indique e ganhe"
              : tab === "perfil"
                ? "Meu Perfil"
                : "Configurações"}
          </h1>
          <p className="mt-1.5 text-muted-foreground">
            {tab === "indique"
              ? "Ganhe R$ 50,00 no Pix a cada indicação confirmada."
              : tab === "perfil"
                ? "Gerencie suas informações, segurança e preferências."
                : "Controle sua extensão Zaalys Live, alertas no celular e preferências."}
          </p>
        </div>

        <Segmented
          label="Seção de configurações"
          value={tab}
          onChange={setTab}
          options={[
            { value: "preferencias", label: "Preferências" },
            { value: "perfil", label: "Meu Perfil" },
            { value: "indique", label: "Indique e ganhe" },
          ]}
        />
      </header>

      {tab === "preferencias" && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Extensão Zaalys Live */}
          <section className="apple-card space-y-4 p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-bold">Extensão Zaalys Live</h2>
                <p className="text-xs text-muted-foreground">
                  Conecte a extensão em um navegador por vez usando sua chave exclusiva.
                </p>
              </div>
              <span className="rounded-full bg-primary/15 px-2.5 py-0.5 font-mono text-xs font-semibold text-primary">
                3.17.0
              </span>
            </div>

            <div className="rounded-2xl border border-border bg-background/60 p-3.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Sua chave de ativação
              </span>
              <div className="mt-1 flex items-center justify-between gap-2">
                <code className="font-mono text-sm font-bold text-primary">{licenseKey}</code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(licenseKey).catch(() => {});
                    setCopiedKey(true);
                    setTimeout(() => setCopiedKey(false), 2000);
                  }}
                  className="rounded-lg border border-border px-2.5 py-1 text-xs font-semibold hover:bg-foreground/[0.05] cursor-pointer"
                >
                  {copiedKey ? "Copiada!" : "Copiar"}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <a href="/downloads/zaalys-live.crx" download className="btn-primary py-2 text-xs">
                ⬇ Baixar zaalys-live.crx
              </a>
              <a href="/downloads/zaalys-live.zip" download className="btn-ghost py-2 text-xs">
                ⬇ Baixar .zip
              </a>
              <button
                type="button"
                onClick={regenerateKey}
                className="btn-ghost py-2 text-xs"
              >
                ↻ Trocar de computador
              </button>
            </div>
          </section>

          {/* Avisos no celular */}
          <section className="apple-card space-y-4 p-5 sm:p-6">
            <div>
              <h2 className="font-display text-lg font-bold">Avisos no celular</h2>
              <p className="text-xs text-muted-foreground">
                Se a sua live cair, travar ou tomar restrição no TikTok Shop, seu celular toca na
                hora.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-background/60 p-3.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">
                  Este aparelho ({pushEnabled ? "Ativo" : "Desligado"})
                </span>
                <span className="size-2 rounded-full bg-primary" />
              </div>
              <p className="mt-1 text-muted-foreground">
                Notificações Web Push configuradas para alertas de queda e vendas ao vivo.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <RaisedButton
                size="sm"
                onClick={() => {
                  setPushTestSent(true);
                  setTimeout(() => setPushTestSent(false), 2500);
                }}
              >
                {pushTestSent ? "✓ Alerta de teste enviado!" : "Enviar um teste"}
              </RaisedButton>
              <button
                type="button"
                onClick={() => setPushEnabled((p) => !p)}
                className="btn-ghost py-2 text-xs"
              >
                {pushEnabled ? "Desligar neste aparelho" : "Ligar neste aparelho"}
              </button>
            </div>
          </section>
        </div>
      )}

      {tab === "perfil" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="apple-card space-y-4 p-5 sm:p-6">
            <h2 className="font-display text-lg font-bold">Dados da conta</h2>
            <div className="space-y-3 text-sm">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Nome</label>
                <input defaultValue="Criador Zaalys" className="field text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">E-mail</label>
                <input defaultValue="criador@zaalys.com" readOnly className="field text-sm opacity-75" />
              </div>
            </div>
          </section>

          <section className="apple-card space-y-4 p-5 sm:p-6">
            <h2 className="font-display text-lg font-bold">Plano atual</h2>
            <div className="rounded-2xl border border-primary/30 bg-primary/[0.06] p-4">
              <span className="rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                Vitalício
              </span>
              <p className="mt-2 font-display text-xl font-extrabold">Acesso Vitalício Zaalys</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Todas as ferramentas liberadas sem mensalidade e sem renovação.
              </p>
            </div>
          </section>
        </div>
      )}

      {tab === "indique" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="apple-card space-y-4 p-5 sm:p-6">
            <h2 className="font-display text-lg font-bold">Seu link de indicação</h2>
            <p className="text-xs text-muted-foreground">
              Você recebe {formatBRL(5000)} por venda confirmada e seu convidado ganha{" "}
              {formatBRL(3000)} de desconto no plano Vitalício.
            </p>
            <div className="rounded-2xl border border-border bg-background/60 p-3.5 font-mono text-xs text-primary">
              https://www.zaalys.com/checkout/vitalicio?invite=criador
            </div>
            <div className="flex flex-wrap gap-2">
              <RaisedButton
                size="sm"
                onClick={() => {
                  navigator.clipboard
                    ?.writeText("https://www.zaalys.com/checkout/vitalicio?invite=criador")
                    .catch(() => {});
                  setCopiedInvite(true);
                  setTimeout(() => setCopiedInvite(false), 2000);
                }}
              >
                {copiedInvite ? "Link copiado!" : "Copiar meu link"}
              </RaisedButton>
            </div>
          </section>

          <section className="apple-card space-y-4 p-5 sm:p-6">
            <h2 className="font-display text-lg font-bold">Onde você recebe</h2>
            <p className="text-xs text-muted-foreground">
              Pagamos o valor de cada indicação nesta chave Pix.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setPixSaved(true);
                setTimeout(() => setPixSaved(false), 2000);
              }}
              className="space-y-3"
            >
              <input
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                placeholder="CPF, e-mail, celular ou chave aleatória"
                className="field text-sm"
              />
              <RaisedButton type="submit" size="sm">
                {pixSaved ? "✓ Chave Pix salva!" : "Salvar chave Pix"}
              </RaisedButton>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default function ContaPage() {
  return (
    <Suspense fallback={null}>
      <ContaInner />
    </Suspense>
  );
}
