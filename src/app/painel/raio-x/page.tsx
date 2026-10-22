import { PageHeader } from "@/components/page-header";
import { requireAccess } from "@/lib/access";
import { RaioX } from "./raio-x";

export default async function RaioXPage() {
  await requireAccess();
  return (
    <>
      <PageHeader title="Raio-X de vídeo">
        Envie a fala de um vídeo que está vendendo, ou o arquivo de áudio ou vídeo. Você vê o gancho e a estrutura, e a
        mesma estrutura recriada para o seu produto.
      </PageHeader>
      <RaioX />
    </>
  );
}
