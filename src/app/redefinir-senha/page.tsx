"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { Suspense, useState } from "react";
import { Brand, RaisedButton } from "@/components/brand";
import { createClient } from "@/lib/supabase/client";

function ResetPasswordForm() {
  const params = useSearchParams();
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [status, setStatus] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setStatus({ kind: "error", text: "Informe um e-mail válido." });
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/callback?next=/painel/conta`,
      });
      if (error) {
        setStatus({
          kind: "error",
          text: "Não foi possível enviar o link agora. Tente novamente em instantes.",
        });
      } else {
        setStatus({
          kind: "ok",
          text: "Se houver uma conta com esse e-mail, enviamos o link para criar uma senha nova.",
        });
      }
    } catch {
      setStatus({
        kind: "error",
        text: "Não foi possível enviar o link agora. Tente novamente em instantes.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-svh place-items-center bg-studio px-5 py-10">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 inline-block">
          <Brand />
        </Link>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Esqueceu a senha?</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Digite o e-mail da sua conta e mandamos um link para você criar uma senha nova.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="reset-email" className="text-sm font-medium text-foreground/90">
              E-mail
            </label>
            <input
              id="reset-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              placeholder="voce@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 w-full rounded-xl border border-black/[0.06] bg-background/50 px-3.5 text-[15px] outline-none transition-[background-color,border-color,box-shadow] placeholder:text-muted-foreground focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring/40 dark:border-white/[0.08] dark:bg-input/20"
            />
          </div>

          {status && (
            <p
              role="status"
              className={`text-xs ${status.kind === "ok" ? "text-primary" : "text-destructive"}`}
            >
              {status.text}
            </p>
          )}

          <RaisedButton type="submit" size="lg" disabled={loading} className="w-full">
            {loading ? "Enviando…" : "Enviar o link"}
          </RaisedButton>
        </form>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Lembrou a senha?{" "}
          <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
