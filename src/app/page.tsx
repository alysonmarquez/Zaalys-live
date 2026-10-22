import Link from "next/link";
import { CheckoutForm } from "@/components/checkout-form";
import { LiveConsole } from "@/components/live-console";
import { brl, PRICES } from "@/lib/payments";

const name = process.env.NEXT_PUBLIC_APP_NAME ?? "MediaFlow";

const STEPS = [
  { title: "Grave ou gere os clipes", text: "Alguns clipes curtos do produto, feitos por você ou numa ferramenta de vídeo com IA, com os prompts que o estúdio escreve." },
  { title: "Configure no painel", text: "Escolha os produtos, o ritmo dos comentários e o que a live faz sozinha. A extensão do Chrome guarda tudo." },
  { title: "Entre ao vivo", text: "Abra a página de LIVE do TikTok Shop no computador e ligue. Se a transmissão cair, o celular avisa." },
];

const TOOLS = [
  { title: "Live infinita", text: "Seus clipes rodam em loop como vídeo da live, com narração. Até oito produtos alternando." },
  { title: "Live apresentada", text: "Roteiro por produto em tela cheia, com tempo por etapa e as perguntas do chat separadas." },
  { title: "Catálogo e radar", text: "Preço, comissão e ganho por venda lado a lado, e o que mudou desde a última leitura." },
  { title: "Influencer de IA", text: "Crie um personagem com aparência fixa e use em todos os roteiros e prompts." },
  { title: "Roteiro e prompt de vídeo", text: "Gancho, cenas, falas e um prompt pronto para gerar o vídeo vertical." },
  { title: "Raio-X de vídeo", text: "Envie a fala de um vídeo que vende e veja o gancho e a estrutura, recriados para o seu produto." },
];

const FAQ = [
  { q: "Preciso aparecer na câmera?", a: "Não. A live infinita usa seus clipes como vídeo, e os vídeos podem ter um influencer de IA." },
  { q: "O vídeo final sai pronto daqui?", a: `Não. O ${name} prepara roteiro, personagem e prompt. A geração do vídeo acontece numa ferramenta externa, com créditos à parte.` },
  { q: "O que preciso para a live infinita?", a: "Um computador com Google Chrome, a extensão instalada e acesso à página de LIVE do TikTok Shop." },
  { q: "Qual a diferença entre os planos?", a: "Nenhuma nas ferramentas. O mensal é cobrado todo mês e pode ser cancelado; o vitalício é pago uma vez." },
  { q: "Posso pedir reembolso?", a: "Sim, em até 7 dias após a compra, pelo direito de arrependimento." },
];

export default function Home() {
  const installment = Math.ceil(PRICES.lifetimeCents / PRICES.installments);
  return (
    <main>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Link href="/" className="font-display text-xl font-extrabold">
          {name}
        </Link>
        <nav className="flex items-center gap-5 text-sm font-medium">
          <a href="#ferramentas" className="hidden hover:text-violet sm:inline">Ferramentas</a>
          <a href="#planos" className="hidden hover:text-violet sm:inline">Planos</a>
          <Link href="/login" className="btn-ghost">Entrar</Link>
        </nav>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pt-10 pb-20 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <h1 className="text-5xl font-extrabold sm:text-6xl lg:text-7xl">Sua loja ao vivo, mesmo quando você sai da frente da câmera.</h1>
          <p className="mt-6 max-w-xl text-lg text-muted">
            A live do TikTok Shop continua com seus clipes, responde o chat e mantém o produto fixado. No mesmo acesso,
            você prepara roteiros e prompts de vídeo com IA.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#planos" className="btn-primary px-6 py-3 text-base">Ver planos</a>
            <a href="#como" className="btn-ghost px-6 py-3 text-base">Como funciona</a>
          </div>
        </div>
        <div className="flex justify-center lg:justify-end">
          <LiveConsole />
        </div>
      </section>

      <section id="como" className="border-y border-line bg-card">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="max-w-2xl text-4xl font-bold">Três passos até a primeira live sozinha</h2>
          <ol className="mt-12 grid gap-10 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title}>
                <span className="font-display text-5xl font-extrabold text-violet">{i + 1}</span>
                <h3 className="mt-3 text-xl font-bold">{s.title}</h3>
                <p className="mt-2 text-muted">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="ferramentas" className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="max-w-2xl text-4xl font-bold">Tudo o que entra no acesso</h2>
        <dl className="mt-10 grid gap-x-12 gap-y-8 md:grid-cols-2">
          {TOOLS.map((t) => (
            <div key={t.title} className="border-l-4 border-violet pl-5">
              <dt className="font-display text-xl font-bold">{t.title}</dt>
              <dd className="mt-1.5 text-muted">{t.text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section id="planos" className="border-y border-line bg-night text-white">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="text-4xl font-bold">Escolha como pagar</h2>
          <p className="mt-3 max-w-xl text-white/70">As ferramentas são as mesmas. Muda só a forma de pagamento.</p>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border-2 border-violet bg-card p-7 text-ink">
              <h3 className="text-2xl font-bold">Vitalício</h3>
              <p className="mt-1 text-muted">Paga uma vez, sem mensalidade.</p>
              <p className="mt-6 font-display text-4xl font-extrabold">
                {PRICES.installments}x {brl(installment)}
              </p>
              <p className="mb-6 text-sm text-muted">ou {brl(PRICES.lifetimeCents)} à vista no Pix</p>
              <CheckoutForm plan="lifetime" label="Comprar acesso vitalício" primary />
            </div>
            <div className="rounded-2xl border border-white/20 p-7">
              <h3 className="text-2xl font-bold">Mensal</h3>
              <p className="mt-1 text-white/70">Cancele quando quiser.</p>
              <p className="mt-6 font-display text-4xl font-extrabold">{brl(PRICES.monthlyCents)}</p>
              <p className="mb-6 text-sm text-white/70">por mês, no cartão</p>
              <div className="rounded-xl bg-card p-3 text-ink">
                <CheckoutForm plan="monthly" label="Assinar o mensal" />
              </div>
            </div>
          </div>
          <p className="mt-6 text-sm text-white/60">
            Parcelamento com juros da operadora. Créditos de ferramentas externas de vídeo não estão incluídos.
            Reembolso em até 7 dias. <Link href="/termos" className="underline">Termos de uso</Link>.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-20">
        <h2 className="text-4xl font-bold">Perguntas frequentes</h2>
        <div className="mt-8 divide-y divide-line border-y border-line">
          {FAQ.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="cursor-pointer list-none text-lg font-semibold marker:hidden">
                <span className="mr-3 inline-block text-violet transition-transform group-open:rotate-45">+</span>
                {f.q}
              </summary>
              <p className="mt-3 pl-7 text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm text-muted">
          <span>
            {name} é independente e não tem vínculo com o TikTok.
          </span>
          <span className="flex gap-5">
            <Link href="/termos">Termos</Link>
            <Link href="/privacidade">Privacidade</Link>
            <Link href="/login">Entrar</Link>
          </span>
        </div>
      </footer>
    </main>
  );
}
