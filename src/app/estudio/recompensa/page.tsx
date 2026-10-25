import { Gift, MessageCircleHeart, TrendingUp } from "lucide-react";
import { Card, Illustration, PageTitle, TealButton } from "../ui";

const STEPS = [
  ["01", "Criar Recompensa da LIVE", "Crie uma Recompensa da LIVE definindo itens da recompensa, número de ganhadores, métodos de participação e contagem regressiva."],
  ["02", "Use o Painel da transmissões ao vivo para publicar a recompensa durante sua LIVE.", "Publique a recompensa no momento certo da transmissão."],
  ["03", "Confira a lista de ganhadores e entregue os itens de recompensa para eles", "Espere que o vendedor dê a você os itens de parceria."],
];

export default function RecompensaPage() {
  return (
    <Card className="min-h-[calc(100svh-5.5rem)]">
      <PageTitle>Recompensa da LIVE</PageTitle>

      <div className="mx-auto mt-6 flex max-w-[660px] flex-col items-center text-center">
        <Illustration icon={Gift} size={200} />
        <p className="mt-6 text-xl font-medium">Iniciar Recompensa da LIVE agora</p>
        <p className="mt-3 max-w-[450px] text-sm text-black/55">
          A Recompensa da LIVE é uma ferramenta interativa na LIVE. Você pode definir produtos como itens e oferecer recompensas por tempo limitado durante a LIVE.
        </p>
        <div className="mt-8 grid gap-10 text-left sm:grid-cols-2">
          <div className="flex gap-6">
            <Illustration icon={TrendingUp} size={64} />
            <div>
              <p className="text-base font-medium">Aumente as vendas</p>
              <p className="mt-1 text-sm text-black/55">Apresente seus produtos aos espectadores e atraia mais clientes.</p>
            </div>
          </div>
          <div className="flex gap-6">
            <Illustration icon={MessageCircleHeart} size={64} />
            <div>
              <p className="text-base font-medium">Envolva a sua audiência</p>
              <p className="mt-1 text-sm text-black/55">As recompensas incentivam os espectadores a ficar mais tempo e comentar mais.</p>
            </div>
          </div>
        </div>
        <TealButton className="mt-10">Criar nova recompensa</TealButton>
      </div>

      <div className="mt-20">
        <p className="text-center text-xl font-medium">Como a Recompensa da LIVE funciona</p>
        <div className="mx-auto mt-10 grid max-w-[980px] items-center gap-10 md:grid-cols-[1fr_544px]">
          <ol className="space-y-10">
            {STEPS.map(([n, t]) => (
              <li key={n} className="flex gap-6">
                <span className="text-xl font-bold text-primary">{n}</span>
                <span className="text-xl font-medium">{t}</span>
              </li>
            ))}
          </ol>
          <div className="grid aspect-[544/327] place-items-center rounded-lg bg-primary/10">
            <Gift size={64} className="text-primary/70" />
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-[524px] space-y-4 text-base text-black/80">
          <p>{STEPS[2]![2]}</p>
          <p>{STEPS[0]![2]}</p>
        </div>
      </div>
    </Card>
  );
}
