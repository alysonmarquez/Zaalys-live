"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";
import type { EmailOtpType } from "@supabase/supabase-js";
import { Brand, RaisedButton } from "@/components/brand";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

// Destino do convite (acesso liberado pelo admin) e do "Esqueceu a senha?": abre a sessão pelo link do e-mail e
// pede a senha nova. Aceita os três formatos do Supabase: ?token_hash=&type= (nosso e-mail), ?code= (PKCE) e
// #access_token=&refresh_token= (e-mail padrão do Supabase).
function SetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();
  const [state, setState] = useState<"checking" | "ready" | "invalid">("checking");
  const [email, setEmail] = useState<string | null>(null);
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setState("invalid");
      return;
    }
    const supabase = createClient();
    (async () => {
      try {
        const tokenHash = params.get("token_hash");
        const code = params.get("code");
        const hash = new URLSearchParams(window.location.hash.slice(1));
        if (tokenHash) {
          const type = (params.get("type") ?? "invite") as EmailOtpType;
          const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
          if (error) throw error;
        } else if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else if (hash.get("access_token") && hash.get("refresh_token")) {
          const { error } = await supabase.auth.setSession({ access_token: hash.get("access_token")!, refresh_token: hash.get("refresh_token")! });
          if (error) throw error;
          window.history.replaceState(null, "", window.location.pathname);
        }
        const { data } = await supabase.auth.getUser();
        if (!data.user) throw new Error("sem sessão");
        setEmail(data.user.email ?? null);
        setState("ready");
      } catch {
        setState("invalid");
      }
    })();
  }, [params]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pass.length < 8) return setMsg("A senha precisa de ao menos 8 caracteres.");
    if (pass !== confirm) return setMsg("As senhas não coincidem.");
    setSaving(true);
    setMsg(null);
    const { error } = await createClient().auth.updateUser({ password: pass });
    setSaving(false);
    if (error) return setMsg("Não foi possível salvar a senha agora. Tente de novo.");
    router.replace("/painel");
  }

  const input =
    "h-11 w-full rounded-xl border border-black/[0.06] bg-background/50 px-3.5 text-[15px] outline-none focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring/40 dark:border-white/[0.08] dark:bg-input/20";

  return (
    <div className="grid min-h-svh place-items-center bg-studio px-5 py-10">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 inline-block">
          <Brand />
        </Link>
        {state === "checking" && <p className="text-sm text-muted-foreground">Abrindo o seu acesso…</p>}
        {state === "invalid" && (
          <>
            <h1 className="font-display text-3xl font-extrabold tracking-tight">Link expirado</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Esse link já foi usado ou venceu. Peça um novo em{" "}
              <Link href="/redefinir-senha" className="font-semibold text-foreground underline underline-offset-4">
                Esqueceu a senha?
              </Link>{" "}
              com o mesmo e-mail: o seu acesso continua liberado.
            </p>
          </>
        )}
        {state === "ready" && (
          <>
            <h1 className="font-display text-3xl font-extrabold tracking-tight">Crie sua senha</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {email ? <>Para entrar com <strong className="text-foreground">{email}</strong>.</> : "Para entrar na sua conta."} Use pelo menos 8
              caracteres.
            </p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <input type="password" autoComplete="new-password" required value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Nova senha" aria-label="Nova senha" className={input} />
              <input type="password" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repita a senha" aria-label="Repita a senha" className={input} />
              {msg && <p className="text-sm text-red-500">{msg}</p>}
              <RaisedButton type="submit" disabled={saving} className="h-11 w-full">
                {saving ? "Salvando…" : "Salvar e entrar"}
              </RaisedButton>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function DefinirSenhaPage() {
  return (
    <Suspense fallback={null}>
      <SetPasswordForm />
    </Suspense>
  );
}
