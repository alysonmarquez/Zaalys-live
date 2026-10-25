import Link from "next/link";
import { CalendarClock, CalendarPlus, Gift, ListChecks, Radio } from "lucide-react";
import { requireAccess } from "@/lib/access";
import { Card, Empty, Illustration, TealButton } from "../ui";

export default async function InicioEstudio() {
  const access = await requireAccess("/estudio/inicio");
  const nome = access.name || access.handle || "criador";
  return (
    <div className="space-y-4">
      <h1 className="text-[28px] font-medium leading-[52px] text-black/90">Olá, {nome}!</h1>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="space-y-4">
          <Link href="/estudio/console" className="block rounded-lg bg-card p-5 hover:shadow-sm">
            <span className="grid size-12 place-items-center rounded-full bg-[#fde8ec]">
              <Radio size={22} className="text-[#e5394e]" />
            </span>
            <p className="mt-4 text-base font-medium">Configurar LIVE rápida</p>
            <p className="mt-1 text-sm text-black/55">Configure uma LIVE a qualquer momento, sem necessidade de agendamento</p>
          </Link>
          <Link href="/estudio/eventos" className="block rounded-lg bg-card p-5 hover:shadow-sm">
            <span className="grid size-12 place-items-center rounded-full bg-primary/10">
              <CalendarPlus size={22} className="text-primary" />
            </span>
            <p className="mt-4 text-base font-medium">Agendar evento de LIVE</p>
            <p className="mt-1 text-sm text-black/55">Crie um público antes de iniciar uma LIVE</p>
          </Link>
        </div>

        <Card>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium">Seus próximos eventos</h2>
            <Link href="/estudio/eventos" className="text-sm font-medium text-primary">
              Todos os eventos ›
            </Link>
          </div>
          <Empty
            icon={CalendarClock}
            title="Nenhum evento agendado"
            text="Crie um evento para gerar expectativa e dar aos espectadores uma maneira de se cadastrar para sua próxima LIVE."
          >
            <TealButton>+ Agendar evento</TealButton>
          </Empty>
        </Card>
      </div>

      <section className="flex flex-wrap items-center justify-between gap-6 rounded-lg bg-[#e6f6f5] p-6">
        <div className="max-w-[667px]">
          <h2 className="text-xl font-medium">Obtenha 15% mais visibilidade com Recompensa da LIVE</h2>
          <p className="mt-1 text-sm text-black/65">
            Ofereça itens grátis aos seus espectadores durante a LIVE. Use tarefas personalizadas para aumentar o engajamento e as vendas.
          </p>
          <Link href="/estudio/recompensa" className="mt-4 inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-white">
            Começar
          </Link>
        </div>
        <Illustration icon={Gift} size={110} />
      </section>

      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium">Tarefas de LIVE</h2>
          <span className="text-base font-medium text-primary">Ver mais ›</span>
        </div>
        <div className="flex flex-col items-center py-8 text-center">
          <Illustration icon={ListChecks} size={72} />
          <p className="mt-3 text-sm font-medium">Todas as tarefas concluídas</p>
          <p className="text-xs text-black/55">Você está atualizado!</p>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-medium">Tutoriais de leilões de LIVE</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            ["O que é um leilão de LIVE?", "Leilões de LIVE permitem que você anuncie produtos e deixe os espectadores competirem pelo maior lance em tempo real."],
            ["O que é um anúncio temporário?", "Configure Lances ao Vivo rapidamente para vendas rápidas com anúncios temporários."],
            ["Evite violações", "Antes do seu primeiro Lance ao Vivo, saiba quais atividades evitar."],
          ].map(([t, d]) => (
            <div key={t}>
              <div className="grid aspect-[342/165] place-items-center rounded-lg bg-gradient-to-br from-primary/15 to-primary/5">
                <Radio size={36} className="text-primary/70" />
              </div>
              <p className="mt-3 text-sm font-medium">{t}</p>
              <p className="mt-1 text-xs text-black/55">{d}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
