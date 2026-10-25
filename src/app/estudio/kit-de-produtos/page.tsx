import { Boxes, PackagePlus, Radio } from "lucide-react";
import { Card, Illustration, PageTitle, TealButton } from "../ui";

export default function KitDeProdutosPage() {
  return (
    <Card className="min-h-[calc(100svh-5.5rem)]">
      <PageTitle>Kit de produtos da LIVE</PageTitle>
      <div className="mx-auto mt-16 flex max-w-[860px] flex-wrap items-center justify-center gap-14">
        <Illustration icon={Boxes} size={300} />
        <div className="max-w-[440px]">
          <p className="text-xl font-bold">Crie conjuntos de produtos e torne a transmissão ao vivo muito mais fácil</p>
          <div className="mt-8 space-y-8">
            <div className="flex gap-6">
              <Illustration icon={PackagePlus} size={64} />
              <div>
                <p className="text-base font-medium">Criar conjunto de produtos</p>
                <p className="mt-1 text-sm text-black/55">Se você apresentar repetidamente os mesmos produtos em suas transmissões ao vivo, agrupe-os em 1 conjunto.</p>
              </div>
            </div>
            <div className="flex gap-6">
              <Illustration icon={Radio} size={64} />
              <div>
                <p className="text-base font-medium">Adicionar o conjunto de produtos quando iniciar a LIVE</p>
                <p className="mt-1 text-sm text-black/55">Depois de criar seu conjunto de produtos, você pode adicioná-lo a uma LIVE com apenas um clique</p>
              </div>
            </div>
          </div>
          <TealButton className="mt-8">Criar conjunto de produtos</TealButton>
        </div>
      </div>
    </Card>
  );
}
