import Link from "next/link";
import { PageHeader } from "@/components/page-header";

export default function Assinar() {
  return (
    <>
      <PageHeader title="Essa ferramenta precisa de um plano ativo">
        Se você já comprou, entre com o mesmo e-mail usado no pagamento. A liberação acontece assim que o pagamento é
        confirmado.
      </PageHeader>
      <Link href="/#planos" className="btn-primary">Ver planos</Link>
    </>
  );
}
