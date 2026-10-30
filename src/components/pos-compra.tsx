"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";
import { Brand, RaisedButton } from "@/components/brand";

// Depois de pagar: mostra em que passo a pessoa está e como chegar ao painel. Com ?tx= (Pix ou cartão no nosso
// checkout) acompanha a confirmação; vinda do checkout da Applyfy, não há como saber o pagamento, só orientar.
function Step({ n, state, title, children }: { n: number; state: "done" | "now" | "next"; title: string; children?: React.ReactNode }) {
  return (
    <li className="flex gap-3 text-left">
      <span
        className={
          state === "done"
            ? "grid size-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground"
            : state === "now"
              ? "grid size-7 shrink-0 place-items-center rounded-full border-2 border-primary text-xs font-bold text-primary"
              : "grid size-7 shrink-0 place-items-center rounded-full border border-border text-xs font-bold text-muted-foreground"
        }
      >
        {state === "done" ? "✓" : n}
      </span>
      <div className="min-w-0 pt-0.5">
        <p className={state === "next" ? "text-sm font-semibold text-muted-foreground" : "text-sm font-semibold"}>{title}</p>
        {children && <p className="mt-0.5 text-pretty text-xs/relaxed text-muted-foreground">{children}</p>}
      </div>
    </li>
  );
}

function Guide() {
  const params = useSearchParams();
  const tx = params.get("tx");
  const [email, setEmail] = useState(params.get("email") ?? "");
  const fixedEmail = Boolean(params.get("email"));
  const [paid, setPaid] = useState(false);
  const [wait, setWait] = useState(0);
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!tx || paid) return;
    const check = async () => {
      const r = await fetch(`/api/checkout/status?tx=${encodeURIComponent(tx)}`).catch(() => null);
      const d = r?.ok ? ((await r.json().catch(() => null)) as { paid?: boolean } | null) : null;
      if (d?.paid) setPaid(true);
    };
    check();
    const t = setInterval(check, 4000);
    return () => clearInterval(t);
  }, [tx, paid]);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  async function resend(e: React.FormEvent) {
    e.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) return setMsg("Digite o e-mail usado na compra.");
    setSending(true);
    setMsg(null);
    const r = await fetch("/api/checkout/acesso", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: clean }),
    }).catch(() => null);
    setSending(false);
    if (!r?.ok) return setMsg("Não deu para reenviar agora. Tente de novo em instantes.");
    setWait(60);
    setMsg(`Se o pagamento de ${clean} já foi aprovado, o e-mail está a caminho. Veja também o spam.`);
  }

  const waiting = Boolean(tx) && !paid;
  const to = email.trim() ? <strong className="text-foreground">{email.trim()}</strong> : "o e-mail da compra";

  return (
    <div className="min-h-svh bg-studio">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-10 sm:py-16">
        <Link href="/">
          <Brand />
        </Link>
        <div className="rounded-3xl border border-border bg-card/85 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-8">
          <h1 className="font-display text-2xl font-extrabold tracking-tight">
            {waiting ? "Confirmando seu pagamento" : paid ? "Pagamento aprovado!" : "Falta pouco para você entrar"}
          </h1>
          <p className="mt-2 text-pretty text-sm/relaxed text-muted-foreground">
            {waiting
              ? "Costuma levar alguns segundos. Esta página atualiza sozinha."
              : paid
                ? "Seu acesso já está liberado. Siga os passos abaixo."
                : "Assim que o pagamento for aprovado, seu acesso é liberado e enviamos o caminho por e-mail."}
          </p>

          <ol className="mt-6 space-y-4">
            <Step n={1} state={paid ? "done" : "now"} title={paid ? "Pagamento confirmado" : "Confirmação do pagamento"}>
              {!paid && "Cartão e Pix costumam confirmar na hora; boleto pode levar até 3 dias úteis."}
            </Step>
            <Step n={2} state={paid ? "now" : "next"} title="Abra o e-mail “Seu acesso à MediaFlowMZ foi liberado”">
              Enviado para {to}. Não achou? Veja o spam e a aba Promoções.
            </Step>
            <Step n={3} state="next" title="Crie sua senha pelo botão do e-mail">
              Se você já tem conta, é só entrar com a sua senha.
            </Step>
          </ol>

          <form onSubmit={resend} className="mt-6 space-y-2 border-t border-border pt-5">
            <p className="text-xs font-semibold">Não recebeu o e-mail?</p>
            {!fixedEmail && (
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-mail usado na compra"
                aria-label="E-mail usado na compra"
                className="h-11 w-full rounded-xl border border-black/[0.06] bg-background/50 px-3.5 text-[15px] outline-none focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring/40 dark:border-white/[0.08] dark:bg-input/20"
              />
            )}
            <RaisedButton type="submit" disabled={sending || wait > 0} className="h-11 w-full">
              {sending ? "Enviando…" : wait > 0 ? `Reenviar em ${wait}s` : "Reenviar e-mail de acesso"}
            </RaisedButton>
            {msg && (
              <p role="status" className="text-xs/relaxed text-muted-foreground">
                {msg}
              </p>
            )}
          </form>

          <div className="mt-4 text-center">
            <Link
              href={`/login?mode=signin${email.trim() ? `&email=${encodeURIComponent(email.trim())}` : ""}`}
              className="text-xs font-semibold text-primary underline-offset-4 hover:underline"
            >
              Já tenho senha: entrar
            </Link>
          </div>
          <p className="mt-4 text-pretty text-center text-[11px]/relaxed text-muted-foreground">
            O acesso fica no e-mail usado na compra: entre sempre com ele. Pagou e nada chegou? Fale com quem te enviou o link da compra.
          </p>
        </div>
      </div>
    </div>
  );
}

export function PosCompra() {
  return (
    <Suspense fallback={null}>
      <Guide />
    </Suspense>
  );
}
