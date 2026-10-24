"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, LogOut, Check } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

const INPUT_CLASS =
  "h-11 w-full rounded-xl border border-black/[0.06] bg-background/50 px-3.5 text-[15px] outline-none transition-[background-color,border-color,box-shadow] placeholder:text-muted-foreground focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring/40 dark:border-white/[0.08] dark:bg-input/20";

function SectionCard({
  title,
  desc,
  children,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-black/[0.06] bg-card/85 p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] sm:p-6 dark:border-white/[0.08]">
      <h2 className="font-display text-lg font-bold tracking-tight">{title}</h2>
      <p className="mt-0.5 text-sm text-muted-foreground">{desc}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function FieldLabel({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [name, setName] = useState("Criador Zaalys");
  const [handle, setHandle] = useState("criador");
  const [email, setEmail] = useState("criador@zaalys.com");
  const [savedProfile, setSavedProfile] = useState(false);

  const [currPass, setCurrPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passMsg, setPassMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then(({ user }) => {
        if (user?.name) setName(user.name);
        if (user?.handle) setHandle(user.handle);
        if (user?.email) setEmail(user.email);
      })
      .catch(() => {});
  }, []);

  async function handleSaveProfile() {
    if (isSupabaseConfigured()) {
      const { error } = await createClient().auth.updateUser({
        data: { full_name: name.trim() || "Criador Zaalys", handle: handle.trim().toLowerCase() || "criador" },
      });
      if (error) return;
    }
    setSavedProfile(true);
    setTimeout(() => setSavedProfile(false), 2000);
    router.refresh();
  }

  async function handleUpdatePassword() {
    if (newPass.length < 8) {
      setPassMsg("A nova senha precisa de ao menos 8 caracteres.");
      return;
    }
    if (newPass !== confirmPass) {
      setPassMsg("As senhas não coincidem.");
      return;
    }
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      // Confere a senha atual antes de trocar.
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password: currPass });
      if (authError) {
        setPassMsg("A senha atual está incorreta.");
        return;
      }
      const { error } = await supabase.auth.updateUser({ password: newPass });
      if (error) {
        setPassMsg("Não foi possível trocar a senha agora. Tente de novo.");
        return;
      }
    }
    setCurrPass("");
    setNewPass("");
    setConfirmPass("");
    setPassMsg("Senha atualizada com sucesso.");
    setTimeout(() => setPassMsg(null), 2500);
  }

  async function handleSignOut() {
    try {
      await fetch("/api/auth/session", { method: "DELETE" });
    } catch {}
    router.push("/login");
    router.refresh();
  }

  const initial = (name || "?").charAt(0).toUpperCase();

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <header>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          Meu Perfil
        </h1>
        <p className="mt-1 text-muted-foreground">
          Gerencie suas informações, segurança e preferências.
        </p>
      </header>

      {/* Top User Summary Card */}
      <div className="flex flex-wrap items-center gap-4 rounded-3xl border border-black/[0.06] bg-card/85 p-5 shadow-2xs dark:border-white/[0.08]">
        <span className="grid size-14 place-items-center rounded-full bg-primary/15 text-lg font-bold text-primary shadow-xs">
          {initial}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate font-display text-lg font-bold tracking-tight">
            {name}
          </div>
          <div className="truncate text-sm text-muted-foreground">{email}</div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-full bg-emerald-500/12 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            Aprovado
          </span>
          <span className="rounded-full border border-black/[0.04] bg-muted/80 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground dark:border-white/[0.06]">
            Afiliado
          </span>
          <span className="rounded-full border border-black/[0.04] bg-muted/80 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground dark:border-white/[0.06]">
            Vitalício
          </span>
        </div>
      </div>

      {/* Dados da conta */}
      <SectionCard
        title="Dados da conta"
        desc="Atualize seu nome e handle público."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldLabel label="Nome completo">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={INPUT_CLASS}
            />
          </FieldLabel>
          <FieldLabel label="@handle">
            <input
              value={handle}
              onChange={(e) => setHandle(e.target.value.toLowerCase())}
              className={INPUT_CLASS}
            />
          </FieldLabel>
          <FieldLabel label="E-mail">
            <input
              value={email}
              readOnly
              className={`${INPUT_CLASS} opacity-60`}
            />
          </FieldLabel>
        </div>
        <div className="mt-4">
          <button
            type="button"
            onClick={handleSaveProfile}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-xs transition-transform active:scale-95 cursor-pointer"
          >
            {savedProfile && <Check size={15} />}
            {savedProfile ? "Perfil atualizado" : "Salvar alterações"}
          </button>
        </div>
      </SectionCard>

      {/* Plano e Assinatura */}
      <SectionCard
        title="Plano e Assinatura"
        desc="Como está sua assinatura."
      >
        <div className="flex items-center justify-between rounded-2xl border border-border bg-card/60 p-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Plano atual
            </div>
            <div className="mt-0.5 font-display text-lg font-bold tracking-tight">
              Vitalício
            </div>
          </div>
          <span className="rounded-full bg-emerald-500/12 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            Ativo
          </span>
        </div>
      </SectionCard>

      {/* Segurança & Acesso */}
      <SectionCard title="Segurança & Acesso" desc="Troque sua senha.">
        <div className="grid gap-4 sm:grid-cols-3">
          <FieldLabel label="Senha atual">
            <input
              type="password"
              value={currPass}
              onChange={(e) => setCurrPass(e.target.value)}
              className={INPUT_CLASS}
            />
          </FieldLabel>
          <FieldLabel label="Nova senha">
            <input
              type="password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              className={INPUT_CLASS}
            />
          </FieldLabel>
          <FieldLabel label="Confirmar nova senha">
            <input
              type="password"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              className={INPUT_CLASS}
            />
          </FieldLabel>
        </div>
        {passMsg && (
          <p className="mt-3 text-xs font-medium text-primary">{passMsg}</p>
        )}
        <div className="mt-4">
          <button
            type="button"
            onClick={handleUpdatePassword}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-xs transition-transform active:scale-95 cursor-pointer"
          >
            <ShieldCheck size={16} />
            Atualizar senha
          </button>
        </div>
      </SectionCard>

      {/* Sessão */}
      <SectionCard
        title="Sessão"
        desc="Desconecte sua conta deste dispositivo."
      >
        <button
          type="button"
          onClick={handleSignOut}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-background px-4 text-xs font-semibold hover:bg-muted cursor-pointer"
        >
          <LogOut size={16} />
          Sair da conta
        </button>
      </SectionCard>
    </div>
  );
}
