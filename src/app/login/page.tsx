"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const raw = params.get("next") ?? "";
  const next = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/painel";
  const [mode, setMode] = useState<"entrar" | "criar">("entrar");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const supabase = createClient();
    const { error } =
      mode === "entrar"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
          });
    setLoading(false);
    if (error) return setMessage({ kind: "error", text: translate(error.message) });
    if (mode === "criar") return setMessage({ kind: "ok", text: "Enviamos um link de confirmação para o seu e-mail." });
    router.replace(next);
    router.refresh();
  }

  async function magicLink() {
    if (!email) return setMessage({ kind: "error", text: "Digite o e-mail para receber o link." });
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    setLoading(false);
    setMessage(error ? { kind: "error", text: translate(error.message) } : { kind: "ok", text: "Link de acesso enviado. Confira seu e-mail." });
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-5">
      <Link href="/" className="font-display text-2xl font-extrabold">
        {process.env.NEXT_PUBLIC_APP_NAME ?? "MediaFlow"}
      </Link>
      <h1 className="mt-8 text-3xl font-bold">{mode === "entrar" ? "Entrar na sua conta" : "Criar conta"}</h1>
      <p className="mt-2 text-sm text-muted">Use o mesmo e-mail da compra para liberar o acesso.</p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label className="label" htmlFor="email">E-mail</label>
          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="field" autoComplete="email" />
        </div>
        <div>
          <label className="label" htmlFor="password">Senha</label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field"
            autoComplete={mode === "entrar" ? "current-password" : "new-password"}
          />
        </div>
        <button className="btn-primary w-full" disabled={loading}>
          {mode === "entrar" ? "Entrar" : "Criar conta"}
        </button>
      </form>

      <button onClick={magicLink} className="btn-ghost mt-3 w-full" disabled={loading}>
        Receber link de acesso por e-mail
      </button>

      {message && (
        <p role="status" className={`mt-4 text-sm ${message.kind === "ok" ? "text-on" : "text-onair"}`}>
          {message.text}
        </p>
      )}

      <p className="mt-8 text-sm text-muted">
        {mode === "entrar" ? "Primeira vez aqui? " : "Já tem conta? "}
        <button className="font-semibold text-violet" onClick={() => setMode(mode === "entrar" ? "criar" : "entrar")}>
          {mode === "entrar" ? "Criar conta" : "Entrar"}
        </button>
      </p>
    </main>
  );
}

function translate(msg: string) {
  if (/invalid login/i.test(msg)) return "E-mail ou senha incorretos.";
  if (/already registered/i.test(msg)) return "Esse e-mail já tem conta. Entre com a senha ou peça o link.";
  if (/email not confirmed/i.test(msg)) return "Confirme o e-mail pelo link que enviamos antes de entrar.";
  return msg;
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
