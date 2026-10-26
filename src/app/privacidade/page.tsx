import type { Metadata } from "next";
import Link from "next/link";
import { Brand } from "@/components/brand";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Quais dados a MediaFlowMZ coleta, com que base legal trata cada um, com quem compartilha, por quanto tempo guarda e como você exerce seus direitos sob a LGPD.",
};

export default function PrivacidadePage() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="border-b border-border/60">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <Link href="/" aria-label="Início">
            <Brand />
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Entrar
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Atualizado em 12 de outubro de 2026
        </p>
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          Política de Privacidade
        </h1>
        <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
          Esta página explica quais dados a MediaFlowMZ coleta, por que trata cada
          um, com quem compartilha, por quanto tempo guarda e como você exerce
          seus direitos. Está escrita para ser lida — o resumo abaixo cobre o
          essencial, e as seções seguintes dão o detalhe que a LGPD exige.
        </p>

        <div className="mt-12 space-y-10 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:scroll-mt-24 [&_h3]:mt-6 [&_h3]:font-semibold [&_h3]:text-base [&_p]:mt-3 [&_p]:text-[15px] [&_p]:leading-relaxed [&_p]:text-muted-foreground [&_ul]:mt-3 [&_ul]:space-y-2 [&_ul]:text-[15px] [&_ul]:leading-relaxed [&_ul]:text-muted-foreground [&_li]:relative [&_li]:pl-5 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-[0.6em] [&_li]:before:size-1.5 [&_li]:before:rounded-full [&_li]:before:bg-primary/60 [&_strong]:font-semibold [&_strong]:text-foreground [&_a]:font-medium [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-primary/50 hover:[&_a]:decoration-primary">
          <section>
            <div className="rounded-3xl border border-primary/25 bg-primary/[0.06] p-6">
              <h2 className="font-display text-lg font-bold tracking-tight">
                Em resumo
              </h2>
              <ul className="mt-4">
                <li>
                  Coletamos o necessário para você{" "}
                  <strong>entrar, pagar e usar</strong> a plataforma — nome,
                  e-mail, dados da compra e o que você escreve nas ferramentas.
                </li>
                <li>
                  <strong>Não vendemos seus dados</strong> e não os cedemos para
                  publicidade de terceiros.
                </li>
                <li>
                  O que você digita nas ferramentas de IA é enviado ao provedor
                  de modelos para gerar a resposta.
                </li>
                <li>
                  Parte da nossa infraestrutura fica{" "}
                  <strong>fora do Brasil</strong>; a seção 5 diz quem, onde e
                  com que garantia.
                </li>
                <li>
                  Você pode pedir acesso, correção ou exclusão dos seus dados a
                  qualquer momento em{" "}
                  <a href="mailto:privacidade@mediaflowmz.com">
                    privacidade@mediaflowmz.com
                  </a>
                  .
                </li>
              </ul>
            </div>
          </section>

          <section id="controlador">
            <h2>
              <span className="mr-2 tabular-nums text-primary">1.</span>Quem é o
              controlador dos seus dados
            </h2>
            <p>
              O controlador é a MediaFlowMZ — quem decide como e por que seus dados
              são tratados.
            </p>
            <ul>
              <li>
                <strong>Contato geral:</strong>{" "}
                <a href="mailto:suporte@mediaflowmz.com">suporte@mediaflowmz.com</a>
              </li>
              <li>
                <strong>Encarregado pelo tratamento de dados (DPO):</strong>{" "}
                <a href="mailto:privacidade@mediaflowmz.com">
                  privacidade@mediaflowmz.com
                </a>
              </li>
            </ul>
            <p>
              Há um caso em que os papéis se invertem: no Assistente de Live,{" "}
              <strong>você é o controlador</strong> dos dados de quem comenta na
              sua transmissão e a MediaFlowMZ atua como <strong>operadora</strong>,
              tratando essas mensagens apenas para executar a funcionalidade que
              você acionou. Veja a seção 4.
            </p>
          </section>

          <section id="dados">
            <h2>
              <span className="mr-2 tabular-nums text-primary">2.</span>Quais
              dados coletamos
            </h2>
            <h3>Dados que você nos fornece</h3>
            <ul>
              <li>
                <strong>Cadastro:</strong> nome, e-mail, senha (guardada apenas
                como hash, nunca em texto), @handle e, se quiser, uma foto de
                perfil. Se você comprar sem ter conta, ela é criada no pagamento
                com o nome e o e-mail da compra.
              </li>
              <li>
                <strong>Compra:</strong> os dados que você informa no checkout.
                O e-mail é guardado assim que você o digita, antes do pagamento,
                para lembrarmos você de uma compra não concluída e enviarmos
                novidades da MediaFlowMZ — você pode sair dessa lista pelo link de
                qualquer e-mail. Os dados completos do cartão são tratados pela
                processadora de pagamento (AmploPay ou Applyfy);{" "}
                <strong>
                  não recebemos nem armazenamos o número do seu cartão
                </strong>
                .
              </li>
              <li>
                <strong>Afiliados, se você participar:</strong> sua chave PIX e,
                opcionalmente, as credenciais da sua conta Applyfy — estas
                últimas guardadas <strong>cifradas</strong>.
              </li>
              <li>
                <strong>Indique e ganhe, se você participar:</strong> a chave
                PIX onde recebe as recompensas. Mostramos a quem indicou apenas
                o primeiro nome de quem comprou.
              </li>
              <li>
                <strong>Radar do Afiliado:</strong> o e-mail que você deixa na
                página para receber a lista semanal. Você sai da lista pelo
                link em qualquer e-mail.
              </li>
              <li>
                <strong>Depoimentos:</strong> o texto, o nome e o @ que você
                enviar. Publicamos no site só com a sua autorização e depois de
                revisar.
              </li>
              <li>
                <strong>Conteúdo de uso:</strong> o que você escreve nas
                ferramentas — buscas, links de vídeo, roteiros, avatares,
                planejamentos de live — e o que decide salvar.
              </li>
              <li>
                <strong>Suporte:</strong> o conteúdo das mensagens que você nos
                envia.
              </li>
            </ul>
            <h3>Dados coletados automaticamente</h3>
            <ul>
              <li>
                <strong>Registros de acesso:</strong> endereço IP, user agent,
                data e hora, vinculados à sua sessão.
              </li>
              <li>
                <strong>Uso da plataforma:</strong> quais páginas e ferramentas
                você abriu, para entender o que funciona e apurar problemas.
              </li>
              <li>
                <strong>Cookies:</strong> usamos os necessários para manter você
                logado e proteger a sessão, os do Microsoft Clarity, que
                registram cliques e rolagem de forma anônima para entendermos
                onde o site confunde quem o usa (o Clarity mascara o que você
                digita nos formulários), e os do Meta Pixel, que medem quais
                anúncios do Facebook e do Instagram trouxeram visitas e compras.
              </li>
            </ul>
            <p>
              Não coletamos dados sensíveis (Art. 5º, II da LGPD) e não
              oferecemos a plataforma a menores de 18 anos.
            </p>
          </section>

          <section id="finalidades">
            <h2>
              <span className="mr-2 tabular-nums text-primary">3.</span>Por que
              tratamos cada dado, e com que base legal
            </h2>
            <p>
              A LGPD exige informar não só a finalidade, mas a base legal de
              cada tratamento. Esta é a lista completa:
            </p>
            <div className="mt-5 overflow-x-auto rounded-2xl border border-border/70">
              <table className="w-full min-w-[34rem] border-collapse text-left text-[13px]">
                <thead>
                  <tr className="bg-muted/60 text-foreground">
                    <th className="px-4 py-3 font-semibold">Finalidade</th>
                    <th className="px-4 py-3 font-semibold">Dados</th>
                    <th className="px-4 py-3 font-semibold">Base legal</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-t border-border/60 align-top">
                    <td className="px-4 py-3 text-foreground">
                      Criar e manter sua conta e o login
                    </td>
                    <td className="px-4 py-3">
                      Nome, e-mail, senha (guardada como hash), @handle, foto de
                      perfil
                    </td>
                    <td className="px-4 py-3">
                      Execução de contrato (Art. 7º, V)
                    </td>
                  </tr>
                  <tr className="border-t border-border/60 align-top">
                    <td className="px-4 py-3 text-foreground">
                      Processar sua compra e liberar o acesso do plano
                    </td>
                    <td className="px-4 py-3">
                      Nome, e-mail, dados do pedido, status e identificadores da
                      transação
                    </td>
                    <td className="px-4 py-3">
                      Execução de contrato (Art. 7º, V)
                    </td>
                  </tr>
                  <tr className="border-t border-border/60 align-top">
                    <td className="px-4 py-3 text-foreground">
                      Emitir documentos fiscais e guardar registros contábeis
                    </td>
                    <td className="px-4 py-3">
                      Dados da compra e de identificação
                    </td>
                    <td className="px-4 py-3">
                      Cumprimento de obrigação legal (Art. 7º, II)
                    </td>
                  </tr>
                  <tr className="border-t border-border/60 align-top">
                    <td className="px-4 py-3 text-foreground">
                      Manter registros de acesso da aplicação
                    </td>
                    <td className="px-4 py-3">
                      Endereço IP, user agent, data e hora
                    </td>
                    <td className="px-4 py-3">
                      Cumprimento de obrigação legal — Marco Civil, Art. 15
                      (Art. 7º, II)
                    </td>
                  </tr>
                  <tr className="border-t border-border/60 align-top">
                    <td className="px-4 py-3 text-foreground">
                      Fazer a plataforma funcionar: gerar roteiros, prompts,
                      análises e falas
                    </td>
                    <td className="px-4 py-3">
                      O texto e os links que você envia às ferramentas, e o que
                      você salva
                    </td>
                    <td className="px-4 py-3">
                      Execução de contrato (Art. 7º, V)
                    </td>
                  </tr>
                  <tr className="border-t border-border/60 align-top">
                    <td className="px-4 py-3 text-foreground">
                      Pagar comissões de afiliados
                    </td>
                    <td className="px-4 py-3">
                      Chave PIX ou identificador de conta Applyfy, valores e
                      status de cada comissão
                    </td>
                    <td className="px-4 py-3">
                      Execução de contrato (Art. 7º, V)
                    </td>
                  </tr>
                  <tr className="border-t border-border/60 align-top">
                    <td className="px-4 py-3 text-foreground">
                      Prevenir fraude, abuso e compartilhamento indevido de
                      conta
                    </td>
                    <td className="px-4 py-3">
                      Registros de acesso e padrões de uso
                    </td>
                    <td className="px-4 py-3">
                      Legítimo interesse (Art. 7º, IX)
                    </td>
                  </tr>
                  <tr className="border-t border-border/60 align-top">
                    <td className="px-4 py-3 text-foreground">
                      Responder ao seu suporte
                    </td>
                    <td className="px-4 py-3">
                      O que você nos escrever e os dados da sua conta
                    </td>
                    <td className="px-4 py-3">
                      Execução de contrato (Art. 7º, V)
                    </td>
                  </tr>
                  <tr className="border-t border-border/60 align-top">
                    <td className="px-4 py-3 text-foreground">
                      Enviar avisos sobre o serviço (cobrança, mudanças,
                      segurança)
                    </td>
                    <td className="px-4 py-3">Nome e e-mail</td>
                    <td className="px-4 py-3">
                      Execução de contrato (Art. 7º, V)
                    </td>
                  </tr>
                  <tr className="border-t border-border/60 align-top">
                    <td className="px-4 py-3 text-foreground">
                      Enviar novidades e conteúdo de marketing
                    </td>
                    <td className="px-4 py-3">Nome e e-mail</td>
                    <td className="px-4 py-3">
                      Consentimento (Art. 7º, I) — você pode retirar quando
                      quiser
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              Quando a base for o <strong>consentimento</strong>, você pode
              retirá-lo a qualquer momento, sem afetar o que já foi feito antes
              e sem perder o acesso ao serviço contratado. Quando for o{" "}
              <strong>legítimo interesse</strong>, você pode se opor e nós
              reavaliamos o tratamento.
            </p>
          </section>

          <section id="ia-e-live">
            <h2>
              <span className="mr-2 tabular-nums text-primary">4.</span>
              Inteligência artificial e chat de live
            </h2>
            <h3>O que vai para os modelos de IA</h3>
            <p>
              Para gerar um roteiro, um prompt ou uma análise, o texto que você
              enviou é transmitido ao provedor de modelos de linguagem. Não
              enviamos seu nome, e-mail ou dados de pagamento junto. Evite
              escrever dados pessoais de terceiros nesses campos.
            </p>
            <h3>O chat da sua live</h3>
            <p>
              Quando você conecta uma live, lemos o chat{" "}
              <strong>público</strong> daquela transmissão — apelido, avatar e
              mensagens — para separar perguntas e sugerir respostas. Esse
              conteúdo é processado durante a sessão para a exibição em tela e{" "}
              <strong>não é arquivado</strong> depois que a sessão termina.
            </p>
            <h3 id="extensao">A extensão MediaFlowMZ Live</h3>
            <p>
              A extensão do Chrome só funciona na página de transmissão do
              TikTok Shop (shop.tiktok.com/streamer). Lá, ela lê o que a
              automação precisa — o chat, os produtos da vitrine, os avisos do
              TikTok e o contador de vendas — e não lê nenhum outro site.
            </p>
            <p>
              Ela envia à MediaFlowMZ a sua chave de ativação, um identificador
              aleatório do computador (para contar as vagas da chave), o
              navegador e o sistema, a versão da extensão, o seu @ do TikTok, as
              perguntas do chat que ela vai responder e os eventos da live
              (início, fim, vendas e avisos). Os clipes de vídeo e as
              configurações ficam só no seu computador, e o som do seu microfone
              vai para a live no TikTok, não para a MediaFlowMZ.
            </p>
          </section>

          <section id="compartilhamento">
            <h2>
              <span className="mr-2 tabular-nums text-primary">5.</span>Com
              quem compartilhamos, e transferência internacional
            </h2>
            <p>
              Não vendemos seus dados. Compartilhamos apenas com quem precisa
              tratá-los para o serviço existir, sempre limitado à finalidade de
              cada um:
            </p>
            <div className="mt-5 overflow-x-auto rounded-2xl border border-border/70">
              <table className="w-full min-w-[34rem] border-collapse text-left text-[13px]">
                <thead>
                  <tr className="bg-muted/60 text-foreground">
                    <th className="px-4 py-3 font-semibold">Quem</th>
                    <th className="px-4 py-3 font-semibold">Para quê</th>
                    <th className="px-4 py-3 font-semibold">Dados</th>
                    <th className="px-4 py-3 font-semibold">Onde</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-t border-border/60 align-top">
                    <td className="px-4 py-3 text-foreground">AmploPay</td>
                    <td className="px-4 py-3">Checkout e cobrança</td>
                    <td className="px-4 py-3">
                      Nome, e-mail, telefone, CPF/CNPJ, endereço de cobrança,
                      dados do cartão e da transação
                    </td>
                    <td className="px-4 py-3">Brasil</td>
                  </tr>
                  <tr className="border-t border-border/60 align-top">
                    <td className="px-4 py-3 text-foreground">Applyfy</td>
                    <td className="px-4 py-3">
                      Checkout, cobrança e repasse de comissões
                    </td>
                    <td className="px-4 py-3">
                      Nome, e-mail, dados da compra e da transação; chave PIX de
                      afiliados
                    </td>
                    <td className="px-4 py-3">Brasil</td>
                  </tr>
                  <tr className="border-t border-border/60 align-top">
                    <td className="px-4 py-3 text-foreground">Neon</td>
                    <td className="px-4 py-3">Banco de dados da aplicação</td>
                    <td className="px-4 py-3">
                      Todos os dados de conta, uso e cobrança descritos nesta
                      política
                    </td>
                    <td className="px-4 py-3">Estados Unidos</td>
                  </tr>
                  <tr className="border-t border-border/60 align-top">
                    <td className="px-4 py-3 text-foreground">Vercel</td>
                    <td className="px-4 py-3">
                      Hospedagem e logs de requisição
                    </td>
                    <td className="px-4 py-3">
                      Endereço IP, user agent, rotas acessadas
                    </td>
                    <td className="px-4 py-3">Estados Unidos</td>
                  </tr>
                  <tr className="border-t border-border/60 align-top">
                    <td className="px-4 py-3 text-foreground">OpenRouter</td>
                    <td className="px-4 py-3">
                      Modelos de linguagem que escrevem roteiros e prompts
                    </td>
                    <td className="px-4 py-3">
                      O texto que você envia à ferramenta e os dados de produto
                      do catálogo
                    </td>
                    <td className="px-4 py-3">Estados Unidos</td>
                  </tr>
                  <tr className="border-t border-border/60 align-top">
                    <td className="px-4 py-3 text-foreground">ElevenLabs</td>
                    <td className="px-4 py-3">Narração das falas da live</td>
                    <td className="px-4 py-3">O texto a ser narrado</td>
                    <td className="px-4 py-3">Estados Unidos</td>
                  </tr>
                  <tr className="border-t border-border/60 align-top">
                    <td className="px-4 py-3 text-foreground">Euler Stream</td>
                    <td className="px-4 py-3">
                      Leitura do chat público da sua live no TikTok
                    </td>
                    <td className="px-4 py-3">
                      Apelido, avatar e mensagens públicas de quem comenta na
                      sua live
                    </td>
                    <td className="px-4 py-3">Estados Unidos</td>
                  </tr>
                  <tr className="border-t border-border/60 align-top">
                    <td className="px-4 py-3 text-foreground">Resend</td>
                    <td className="px-4 py-3">
                      Envio dos e-mails da conta: senha, acesso, lembretes e
                      dicas
                    </td>
                    <td className="px-4 py-3">Nome e e-mail</td>
                    <td className="px-4 py-3">Estados Unidos</td>
                  </tr>
                  <tr className="border-t border-border/60 align-top">
                    <td className="px-4 py-3 text-foreground">
                      Microsoft Clarity
                    </td>
                    <td className="px-4 py-3">
                      Mapas de calor e gravações anônimas de navegação, para
                      achar o que atrapalha no site
                    </td>
                    <td className="px-4 py-3">
                      Cliques, rolagem, páginas visitadas, tipo de aparelho e um
                      identificador interno da conta; campos de formulário ficam
                      mascarados
                    </td>
                    <td className="px-4 py-3">Estados Unidos</td>
                  </tr>
                  <tr className="border-t border-border/60 align-top">
                    <td className="px-4 py-3 text-foreground">
                      Meta (Facebook e Instagram)
                    </td>
                    <td className="px-4 py-3">
                      Medir quais anúncios trouxeram visitas, cadastros e
                      compras
                    </td>
                    <td className="px-4 py-3">
                      Páginas visitadas, identificadores do navegador e do
                      clique no anúncio, IP e, numa compra, o e-mail e o nome
                      cifrados (hash)
                    </td>
                    <td className="px-4 py-3">Estados Unidos</td>
                  </tr>
                  <tr className="border-t border-border/60 align-top">
                    <td className="px-4 py-3 text-foreground">Yedric</td>
                    <td className="px-4 py-3">
                      Chat de suporte dentro da plataforma
                    </td>
                    <td className="px-4 py-3">
                      Nome, e-mail, as mensagens e arquivos que você envia no
                      chat e, quando você pergunta sobre a sua conta, o plano,
                      os pagamentos e as datas de uso
                    </td>
                    <td className="px-4 py-3">Estados Unidos</td>
                  </tr>
                  <tr className="border-t border-border/60 align-top">
                    <td className="px-4 py-3 text-foreground">
                      Cloudflare (R2)
                    </td>
                    <td className="px-4 py-3">
                      Entrega dos arquivos de áudio das falas prontas
                    </td>
                    <td className="px-4 py-3">
                      Nenhum dado pessoal; apenas os áudios genéricos da
                      biblioteca
                    </td>
                    <td className="px-4 py-3">Rede global</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              Também podemos compartilhar dados com autoridades quando houver
              obrigação legal ou ordem judicial, e com terceiros em caso de
              reorganização societária — mantidos os compromissos desta
              política.
            </p>
            <h3>Transferência internacional</h3>
            <p>
              Parte desses fornecedores está nos{" "}
              <strong>Estados Unidos</strong>, o que configura transferência
              internacional de dados. Ela se apoia no Art. 33, VI e IX da LGPD —
              ser necessária para a execução do contrato que você celebrou
              conosco — e nas cláusulas contratuais de proteção de dados
              firmadas com cada fornecedor.
            </p>
          </section>

          <section id="retencao">
            <h2>
              <span className="mr-2 tabular-nums text-primary">6.</span>Por
              quanto tempo guardamos
            </h2>
            <div className="mt-2 overflow-x-auto rounded-2xl border border-border/70">
              <table className="w-full min-w-[34rem] border-collapse text-left text-[13px]">
                <thead>
                  <tr className="bg-muted/60 text-foreground">
                    <th className="px-4 py-3 font-semibold">O quê</th>
                    <th className="px-4 py-3 font-semibold">
                      Por quanto tempo
                    </th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-t border-border/60 align-top">
                    <td className="px-4 py-3 text-foreground">
                      Dados de conta
                    </td>
                    <td className="px-4 py-3">
                      Enquanto a conta existir, e por até 6 meses após o
                      encerramento
                    </td>
                  </tr>
                  <tr className="border-t border-border/60 align-top">
                    <td className="px-4 py-3 text-foreground">
                      Registros de acesso da aplicação
                    </td>
                    <td className="px-4 py-3">
                      6 meses (Marco Civil da Internet, Art. 15)
                    </td>
                  </tr>
                  <tr className="border-t border-border/60 align-top">
                    <td className="px-4 py-3 text-foreground">
                      Dados de compra, cobrança e comissões
                    </td>
                    <td className="px-4 py-3">
                      5 anos, por exigência fiscal e contábil
                    </td>
                  </tr>
                  <tr className="border-t border-border/60 align-top">
                    <td className="px-4 py-3 text-foreground">
                      Conteúdo que você gerou e salvou
                    </td>
                    <td className="px-4 py-3">
                      Até você apagar, ou 6 meses após o fim da conta
                    </td>
                  </tr>
                  <tr className="border-t border-border/60 align-top">
                    <td className="px-4 py-3 text-foreground">
                      Chat de live capturado
                    </td>
                    <td className="px-4 py-3">
                      Só durante a sessão; não é arquivado depois
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              Terminado o prazo, os dados são apagados ou anonimizados. Alguns
              registros podem ser mantidos além disso quando houver obrigação
              legal ou necessidade de defesa em processo, como permite o Art. 16
              da LGPD.
            </p>
          </section>

          <section id="direitos">
            <h2>
              <span className="mr-2 tabular-nums text-primary">7.</span>Seus
              direitos
            </h2>
            <p>
              O Art. 18 da LGPD garante a você, a qualquer momento e
              gratuitamente, o direito de pedir:
            </p>
            <ul>
              <li>Confirmação de que tratamos seus dados, e acesso a eles</li>
              <li>Correção de dados incompletos, inexatos ou desatualizados</li>
              <li>
                Anonimização, bloqueio ou eliminação de dados desnecessários ou
                tratados em desconformidade
              </li>
              <li>Portabilidade a outro fornecedor</li>
              <li>Eliminação dos dados tratados com base no consentimento</li>
              <li>Informação sobre com quem compartilhamos seus dados</li>
              <li>
                Informação sobre a possibilidade de não consentir, e sobre o que
                acontece se você não consentir
              </li>
              <li>Revogação do consentimento</li>
              <li>
                Revisão de decisões tomadas apenas por tratamento automatizado
              </li>
            </ul>
            <p>
              Escreva para{" "}
              <a href="mailto:privacidade@mediaflowmz.com">privacidade@mediaflowmz.com</a>
              . Respondemos em até 15 dias. Podemos pedir uma confirmação de
              identidade antes de atender — é para proteger a sua conta. Se não
              ficar satisfeito, você pode reclamar à{" "}
              <a
                href="https://www.gov.br/anpd"
                target="_blank"
                rel="noreferrer noopener"
              >
                ANPD
              </a>
              .
            </p>
          </section>

          <section id="seguranca">
            <h2>
              <span className="mr-2 tabular-nums text-primary">8.</span>
              Segurança
            </h2>
            <p>
              Usamos HTTPS em todo o tráfego, senhas guardadas como hash,
              credenciais de afiliado cifradas em repouso, acesso administrativo
              restrito e bancos de dados gerenciados com backup. Nenhum sistema
              é totalmente imune: se houver incidente de segurança com risco
              relevante a você, comunicaremos você e a ANPD, como manda o Art.
              48.
            </p>
          </section>

          <section id="mudancas">
            <h2>
              <span className="mr-2 tabular-nums text-primary">9.</span>
              Mudanças nesta política
            </h2>
            <p>
              Se o tratamento mudar, esta página muda junto — a data de
              atualização fica no topo. Mudanças relevantes são comunicadas por
              e-mail ou dentro da plataforma antes de passarem a valer.
            </p>
            <p>
              Veja também os <Link href="/termos">Termos de Uso</Link>.
            </p>
          </section>
        </div>

        <footer className="mt-16 border-t border-border/60 pt-8 text-sm text-muted-foreground">
          <p>
            Dúvidas sobre este documento:{" "}
            <a
              href="mailto:suporte@mediaflowmz.com"
              className="font-medium text-foreground underline underline-offset-4 decoration-primary/50"
            >
              suporte@mediaflowmz.com
            </a>
            .
          </p>
          <p className="mt-2">
            <Link
              href="/termos"
              className="underline underline-offset-4 decoration-border"
            >
              Termos de Uso
            </Link>{" "}
            ·{" "}
            <Link
              href="/privacidade"
              className="underline underline-offset-4 decoration-border"
            >
              Política de Privacidade
            </Link>
          </p>
        </footer>
      </main>
    </div>
  );
}
