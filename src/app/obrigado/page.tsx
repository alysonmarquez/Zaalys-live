import Link from "next/link";

export const metadata = { title: "Pagamento recebido" };

export default function Obrigado() {
  return (
    <main className="mx-auto max-w-lg px-5 py-24 text-center">
      <h1 className="text-4xl font-extrabold">Pagamento em processamento</h1>
      <p className="mt-4 text-muted">
        Assim que o pagamento for confirmado, o acesso é liberado para o e-mail usado na compra. No Pix leva poucos
        segundos; no boleto, até 2 dias úteis.
      </p>
      <Link href="/login" className="btn-primary mt-8">Entrar ou criar conta com esse e-mail</Link>
    </main>
  );
}
