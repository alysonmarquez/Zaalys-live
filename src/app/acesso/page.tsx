import Link from "next/link";
import { Brand } from "@/components/brand";

export const metadata = {
  title: "Liberando seu acesso",
  description: "Estamos confirmando seu pagamento.",
};

export default function AcessoPage() {
  return (
    <div className="min-h-svh bg-studio">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-10 sm:py-16">
        <Link href="/">
          <Brand />
        </Link>
        <div className="rounded-3xl border border-border bg-card/85 p-8 text-center shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-muted text-muted-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-spin"
              aria-hidden="true"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          </div>
          <h1 className="mt-5 font-display text-2xl font-extrabold tracking-tight">
            Confirmando seu pagamento
          </h1>
          <p className="mt-2 text-pretty text-sm/relaxed text-muted-foreground">
            Costuma levar alguns segundos. Pode deixar esta página aberta: o acesso abre sozinho.
          </p>
          <p className="mt-5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Não feche até a confirmação
          </p>
          <div className="mt-6">
            <Link
              href="/login"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-background/60 px-4 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Entrar ou criar conta com o e-mail da compra
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
