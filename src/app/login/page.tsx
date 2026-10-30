"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";
import { Brand, RaisedButton, Segmented, cn } from "@/components/brand";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

const INPUT_CLASS =
  "h-11 w-full rounded-xl border border-black/[0.06] bg-background/50 px-3.5 text-[15px] outline-none transition-[background-color,border-color,box-shadow] placeholder:text-muted-foreground focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring/40 dark:border-white/[0.08] dark:bg-input/20";

function EyeIcon({ off }: { off: boolean }) {
  if (off) {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
        <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
        <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
        <path d="m2 2 20 20" />
      </svg>
    );
  }
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function PasswordInput({
  value,
  onChange,
  placeholder = "••••••••",
  autoComplete,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={cn(INPUT_CLASS, "pr-11")}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Ocultar senha" : "Mostrar senha"}
        className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground transition-[transform,color] duration-100 hover:text-foreground active:scale-90 cursor-pointer"
      >
        <EyeIcon off={show} />
      </button>
    </div>
  );
}

function RightHeroPanel() {
  const pills = ["Mineração em tempo real", "Influencers de IA", "Gerações ilimitadas"];
  return (
    <div className="relative hidden overflow-hidden border-l border-border bg-background lg:block">
      <div className="absolute inset-0 bg-[radial-gradient(75%_60%_at_82%_-4%,color-mix(in_oklch,var(--primary)_52%,transparent),transparent_58%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(60%_48%_at_12%_104%,color-mix(in_oklch,var(--primary)_16%,transparent),transparent_62%)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-transparent" />
      <div className="relative flex h-full flex-col justify-end p-12">
        <div className="max-w-md">
          <h2 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight">
            Do produto viral ao vídeo final.
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            Minere o que está vendendo agora, crie um influencer de IA e transforme qualquer vídeo
            que viralizou em conteúdo seu — sem gravar nada.
          </p>
          <div className="mt-8 flex flex-wrap gap-2 text-sm text-muted-foreground">
            {pills.map((pill) => (
              <span
                key={pill}
                className="rounded-full border border-white/10 bg-card px-3.5 py-1 text-xs font-semibold text-foreground shadow-2xs"
              >
                {pill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const rawNext = params.get("next") ?? "";
  const next =
    rawNext.startsWith("/") && !rawNext.startsWith("//") && !rawNext.startsWith("/login")
      ? rawNext
      : "/painel";

  const modeParam = params.get("mode");
  const inviteParam = params.get("invite");
  const planParam = params.get("plan");
  const defaultEmail = params.get("email") ?? "";

  const [mode, setMode] = useState<"signin" | "signup">(
    modeParam === "signup" || modeParam === "signin"
      ? modeParam
      : inviteParam
        ? "signup"
        : "signin",
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    form?: string;
  }>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (defaultEmail && !email) setEmail(defaultEmail);
  }, [defaultEmail, email]);

  // Conta criada sem confirmar o e-mail: dá para pedir o link de novo.
  const [unconfirmed, setUnconfirmed] = useState<string | null>(null);
  const [resent, setResent] = useState(false);
  async function resendConfirmation() {
    if (!unconfirmed) return;
    await createClient()
      .auth.resend({ type: "signup", email: unconfirmed, options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` } })
      .catch(() => {});
    setResent(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setNotice(null);
    setResent(false);

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    const nextErrors: typeof errors = {};
    if (mode === "signup" && cleanName.length < 2) {
      nextErrors.name = "Informe seu nome";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      nextErrors.email = "E-mail inválido";
    }
    if (password.length < 6) {
      nextErrors.password = "Mínimo de 6 caracteres";
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    try {
      const goNext = () => {
        if (planParam === "monthly" || planParam === "lifetime") {
          router.replace(
            `/checkout/vitalicio?plan=${planParam}&email=${encodeURIComponent(cleanEmail)}`,
          );
          return;
        }
        router.replace(next);
        router.refresh();
      };

      // Sem banco configurado (só em desenvolvimento) o painel abre em modo demonstração.
      if (!isSupabaseConfigured()) {
        // Só abre o painel se o servidor estiver em modo demonstração; senão avisa em vez de voltar ao login.
        const { user } = await fetch("/api/auth/session").then((r) => r.json()).catch(() => ({ user: null }));
        if (!user) {
          setErrors({
            form: "Login indisponível neste site: o banco (Supabase) não está configurado e o modo demonstração está desligado. Na Vercel, defina ZAALYS_DEMO_MODE=true (ou as chaves do Supabase) e faça um novo deploy.",
          });
          return;
        }
        setNotice("Modo demonstração: abrindo o painel com dados de exemplo…");
        goNext();
        return;
      }

      const supabase = createClient();
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
        if (error) {
          const unconfirmed = error.message.toLowerCase().includes("confirm");
          setUnconfirmed(unconfirmed ? cleanEmail : null);
          setErrors({
            form: unconfirmed
              ? "Falta confirmar o seu e-mail. Abra o link que enviamos (veja também o spam) ou peça um novo abaixo."
              : "E-mail ou senha incorretos. Se você recebeu o acesso por convite, use “Esqueci minha senha” para criar a sua.",
          });
          return;
        }
        setNotice("Login confirmado! Redirecionando…");
        goNext();
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: { full_name: cleanName },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) {
        setErrors({
          form: error.message.toLowerCase().includes("registered")
            ? "Este e-mail já tem conta. Entre com sua senha. Acabou de comprar? Use o link que enviamos por e-mail ou “Esqueci minha senha”."
            : "Não foi possível criar a conta agora. Tente de novo em instantes.",
        });
        return;
      }
      if (!data.session) {
        setUnconfirmed(cleanEmail);
        setNotice("Conta criada! Enviamos um link para o seu e-mail (veja também o spam): confirme para entrar.");
        return;
      }
      setNotice("Conta criada com sucesso! Redirecionando…");
      goNext();
    } catch {
      setErrors({
        form:
          mode === "signin"
            ? "Não foi possível entrar agora. Tente de novo em instantes."
            : "Não foi possível criar a conta agora. Tente de novo em instantes.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-svh bg-studio lg:grid-cols-[1fr_1.05fr]">
      <div className="flex flex-col justify-center px-5 py-10 sm:px-10">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" className="mb-8 inline-block">
            <Brand />
          </Link>

          {inviteParam && (
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <span>✦</span> Convite Creator ativo
            </div>
          )}

          <h1 className="font-display text-3xl font-extrabold tracking-tight">
            {mode === "signin" ? "Bem-vindo de volta" : "Crie sua conta"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signin"
              ? "Entre para continuar criando."
              : inviteParam
                ? "Crie sua conta e siga para o pagamento. O acesso abre assim que o pagamento cai."
                : "Minere produtos do TikTok Shop e gere os vídeos."}
          </p>

          <div className="mt-6">
            <Segmented
              label="Entrar ou criar conta"
              value={mode}
              onChange={(val) => {
                setMode(val);
                setErrors({});
                setNotice(null);
              }}
              className="w-full [&>button]:flex-1"
              options={[
                { value: "signin", label: "Entrar" },
                { value: "signup", label: "Criar conta" },
              ]}
            />
          </div>

          <div className="mt-6">
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {mode === "signup" && (
                <div className="space-y-1.5">
                  <label htmlFor="login-name" className="text-sm font-medium text-foreground/90">
                    Nome
                  </label>
                  <input
                    id="login-name"
                    autoComplete="name"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={INPUT_CLASS}
                  />
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="login-email" className="text-sm font-medium text-foreground/90">
                  E-mail
                </label>
                <input
                  id="login-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="voce@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={INPUT_CLASS}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground/90">Senha</label>
                <PasswordInput
                  value={password}
                  onChange={setPassword}
                  placeholder={mode === "signup" ? "Mínimo de 8 caracteres" : "••••••••"}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                />
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              </div>

              {mode === "signin" && (
                <div className="-mt-2 text-right">
                  <Link
                    href={
                      email
                        ? `/redefinir-senha?email=${encodeURIComponent(email)}`
                        : "/redefinir-senha"
                    }
                    className="text-xs font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                  >
                    Esqueci minha senha
                  </Link>
                </div>
              )}

              {errors.form && (
                <p role="alert" className="text-xs text-destructive">
                  {errors.form}
                </p>
              )}

              {notice && (
                <p role="status" className="text-xs font-medium text-primary">
                  {notice}
                </p>
              )}

              <RaisedButton type="submit" size="lg" disabled={submitting} className="w-full">
                {submitting ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    {mode === "signin" ? "Entrando…" : "Criando…"}
                  </span>
                ) : mode === "signin" ? (
                  "Entrar"
                ) : (
                  "Criar conta"
                )}
              </RaisedButton>

              {unconfirmed && (
                <div className="text-center">
                  <button
                    type="button"
                    disabled={resent}
                    onClick={resendConfirmation}
                    className="text-xs font-semibold text-primary underline-offset-4 hover:underline disabled:opacity-60 cursor-pointer"
                  >
                    {resent ? `Link reenviado para ${unconfirmed}` : "Reenviar link de confirmação"}
                  </button>
                </div>
              )}

              {!isSupabaseConfigured() && (
                <div className="pt-1 text-center">
                  <Link
                    href="/painel"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary underline-offset-4 hover:underline"
                  >
                    Entrar direto na Central MediaFlowMZ (Demo) →
                  </Link>
                </div>
              )}
            </form>
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Ao continuar, você concorda com os{" "}
            <Link
              href="/termos"
              className="font-medium text-foreground/80 underline underline-offset-4 decoration-border transition-colors hover:text-foreground"
            >
              Termos
            </Link>{" "}
            e a{" "}
            <Link
              href="/privacidade"
              className="font-medium text-foreground/80 underline underline-offset-4 decoration-border transition-colors hover:text-foreground"
            >
              Política de Privacidade
            </Link>
            .
          </p>
        </div>
      </div>

      <RightHeroPanel />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginScreen />
    </Suspense>
  );
}
