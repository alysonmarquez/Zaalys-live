import Link from "next/link";
import { PageHeader } from "@/components/page-header";

export default function Assinar() {
  return (
    <>
      <PageHeader title="Essa ferramenta precisa de um plano ativo">
        Se você já comprou, entre com o mesmo e-mail usado no pagamento. A liberação acontece assim que o pagamento é
        confirmado.
      </PageHeader>
      <div className="flex flex-wrap gap-3">
        <Link href="/checkout/vitalicio" className="btn-primary">
          Garantir acesso vitalício
        </Link>
        <Link href="/#planos" className="btn-ghost">
          Ver planos
        </Link>
      </div>
    </>
  );
}
