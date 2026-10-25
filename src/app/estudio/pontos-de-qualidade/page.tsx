import { BadgeCheck } from "lucide-react";
import { Card, Illustration } from "../ui";

export default function PontosDeQualidadePage() {
  return (
    <Card className="flex min-h-[calc(100svh-5.5rem)] items-center justify-center">
      <div className="flex max-w-[576px] flex-col items-center text-center">
        <Illustration icon={BadgeCheck} size={128} />
        <p className="mt-4 text-base font-medium">
          Seus pontos de qualidade da promoção não estão disponíveis, pois você ainda não tem 30 pedidos válidos.
        </p>
        <p className="mt-2 text-sm text-black/55">
          Os pontos de qualidade da promoção estarão disponíveis quando você tiver mais de 30 pedidos válidos feitos por meio da promoção em pelo menos uma categoria nos últimos 90 dias.
        </p>
      </div>
    </Card>
  );
}
