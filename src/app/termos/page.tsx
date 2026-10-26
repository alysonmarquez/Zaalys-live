import type { Metadata } from "next";
import Link from "next/link";
import { Brand } from "@/components/brand";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description:
    "As regras de uso da MediaFlowMZ: o que a plataforma entrega, como funcionam a assinatura e o cancelamento, e o que você é responsável por ao publicar o que gera aqui.",
};

export default function TermosPage() {
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
          Termos de Uso
        </h1>
        <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
          Estas são as regras do uso da MediaFlowMZ. Em resumo: você assina um plano,
          usa as ferramentas para pesquisar produtos e gerar roteiros e vídeos,
          e o que você publica é seu — e de sua responsabilidade. A MediaFlowMZ não é
          o TikTok e não garante venda nenhuma.
        </p>

        <div className="mt-12 space-y-10 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:scroll-mt-24 [&_h3]:mt-6 [&_h3]:font-semibold [&_h3]:text-base [&_p]:mt-3 [&_p]:text-[15px] [&_p]:leading-relaxed [&_p]:text-muted-foreground [&_ul]:mt-3 [&_ul]:space-y-2 [&_ul]:text-[15px] [&_ul]:leading-relaxed [&_ul]:text-muted-foreground [&_li]:relative [&_li]:pl-5 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-[0.6em] [&_li]:before:size-1.5 [&_li]:before:rounded-full [&_li]:before:bg-primary/60 [&_strong]:font-semibold [&_strong]:text-foreground [&_a]:font-medium [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-primary/50 hover:[&_a]:decoration-primary">
          <section id="quem-somos">
            <h2>
              <span className="mr-2 tabular-nums text-primary">1.</span>Quem
              somos e o que é a MediaFlowMZ
            </h2>
            <p>
              A MediaFlowMZ é uma plataforma independente de pesquisa e criação de
              conteúdo para afiliados do TikTok Shop Brasil. Ela reúne um
              catálogo de produtos com preço e comissão, modelos de vídeo,
              geração de roteiros e prompts por inteligência artificial, um
              Raio-X de vídeos que já vendem e um assistente para lives.
            </p>
            <p>
              <strong>
                A MediaFlowMZ não tem vínculo, parceria, patrocínio ou aprovação do
                TikTok, da TikTok Shop, da ByteDance ou de qualquer uma de suas
                afiliadas.
              </strong>{" "}
              Marcas de terceiros citadas na plataforma pertencem a seus
              titulares e aparecem apenas para identificar do que se está
              falando.
            </p>
            <p>
              Contato para qualquer assunto tratado aqui:{" "}
              <a href="mailto:suporte@mediaflowmz.com">suporte@mediaflowmz.com</a>.
              Escrevemos de volta por esse mesmo endereço.
            </p>
          </section>

          <section id="aceite">
            <h2>
              <span className="mr-2 tabular-nums text-primary">2.</span>Aceite
              destes Termos
            </h2>
            <p>
              Ao criar uma conta, assinar um plano ou usar qualquer parte da
              plataforma, você declara que leu e concorda com estes Termos e com
              a <Link href="/privacidade">Política de Privacidade</Link>. Se não
              concordar, não use a MediaFlowMZ.
            </p>
            <p>
              Você declara ainda ter pelo menos 18 anos e capacidade civil para
              contratar. Se usar a plataforma em nome de uma pessoa jurídica,
              declara ter poderes para obrigá-la.
            </p>
          </section>

          <section id="conta">
            <h2>
              <span className="mr-2 tabular-nums text-primary">3.</span>Sua
              conta
            </h2>
            <p>
              A conta é pessoal e intransferível. Você é responsável por manter
              sua senha em sigilo e por tudo que acontecer na sua conta.
              Avise-nos imediatamente se suspeitar de acesso indevido.
            </p>
            <p>
              Contas novas passam por aprovação antes de abrir o acesso às
              ferramentas. Podemos recusar, suspender ou encerrar uma conta que
              viole estes Termos, que apresente indícios de fraude no pagamento,
              ou que compartilhe o acesso com terceiros.
            </p>
            <ul>
              <li>
                Não crie mais de uma conta para contornar limites ou bloqueios.
              </li>
              <li>Não compartilhe, revenda, alugue ou ceda seu acesso.</li>
              <li>
                Não tente extrair o catálogo em massa, fazer engenharia reversa
                da plataforma, burlar limites técnicos ou sobrecarregar a
                infraestrutura.
              </li>
            </ul>
          </section>

          <section id="planos">
            <h2>
              <span className="mr-2 tabular-nums text-primary">4.</span>Planos,
              preços e pagamento
            </h2>
            <p>
              A MediaFlowMZ é oferecida em dois planos, e todas as ferramentas —
              incluindo o Raio-X de Vídeo e o Assistente de Live — estão
              incluídas em ambos, sem cobrança adicional:
            </p>
            <ul>
              <li>
                <strong>Assinatura mensal:</strong> cobrança recorrente,
                renovada automaticamente a cada ciclo até que você cancele.
              </li>
              <li>
                <strong>Vitalício:</strong> pagamento único, com acesso pelo
                tempo em que a plataforma for oferecida ao público.
              </li>
            </ul>
            <p>
              O preço vigente é sempre o exibido na página de checkout no
              momento da compra. O pagamento é processado pela{" "}
              <strong>AmploPay</strong> ou pela <strong>Applyfy</strong>, que é
              quem emite a cobrança e registra a transação; os meios de
              pagamento disponíveis são os que ela oferecer.
            </p>
            <p>
              Podemos alterar preços a qualquer momento. Alterações não afetam
              ciclos já pagos. Para assinaturas em curso, um novo preço só passa
              a valer no ciclo seguinte e será comunicado com antecedência
              mínima de 30 dias, e você pode cancelar antes disso sem nenhum
              custo.
            </p>
          </section>

          <section id="arrependimento">
            <h2>
              <span className="mr-2 tabular-nums text-primary">5.</span>
              Arrependimento, cancelamento e reembolso
            </h2>
            <h3>Liberação imediata do acesso</h3>
            <p>
              Ao concluir a compra, você aceita estes Termos e pede, de forma
              expressa, que o acesso à MediaFlowMZ seja{" "}
              <strong>
                liberado imediatamente após a confirmação do pagamento
              </strong>
              , sem esperar o fim de nenhum prazo. A partir desse momento o
              serviço contratado passa a ser prestado e todo o conteúdo da
              plataforma fica disponível para uso.
            </p>
            <h3>Prazo de 7 dias e como pedir</h3>
            <p>
              O prazo de reflexão de <strong>7 dias</strong>, previsto no artigo
              49 do Código de Defesa do Consumidor para compras à distância, é
              assegurado e contado da confirmação do pagamento. Para exercê-lo,
              escreva para{" "}
              <a href="mailto:suporte@mediaflowmz.com">suporte@mediaflowmz.com</a> ou use
              o formulário de Suporte dentro da plataforma, dentro do prazo.
              Confirmamos o recebimento na hora, por e-mail, e respondemos em
              até 5 dias.
            </p>
            <h3>O que conta como uso</h3>
            <p>
              Conta como uso{" "}
              <strong>
                qualquer ferramenta ou funcionalidade da MediaFlowMZ usada depois da
                confirmação do pagamento
              </strong>
              , por exemplo:
            </p>
            <ul>
              <li>abrir, buscar ou consultar produtos no catálogo;</li>
              <li>
                gerar roteiros, planos de live, templates, avatares ou
                documentos;
              </li>
              <li>usar o Raio-X de vídeo, o remake de vídeo ou o Trend Boost;</li>
              <li>
                ativar a extensão MediaFlowMZ Live ou os alertas da live no celular;
              </li>
              <li>fazer uma live com a extensão, por qualquer tempo.</li>
            </ul>
            <p>
              Não contam como uso: entrar na conta, alterar senha ou dados
              cadastrais, ler estes Termos e falar com o suporte.
            </p>
            <h3>Sem uso, reembolso integral</h3>
            <p>
              Se você pedir dentro dos 7 dias e não houver uso, devolvemos tudo
              o que você pagou, de forma integral, pelo mesmo meio de pagamento.
            </p>
            <h3>Com uso, sem reembolso integral</h3>
            <p>
              O uso de qualquer ferramenta caracteriza a{" "}
              <strong>fruição efetiva do serviço contratado</strong>: você pediu
              a liberação imediata, o serviço foi prestado, e o que foi usado e
              gerado não tem como ser devolvido. Por isso, depois do uso, o
              pedido de cancelamento deixa de ser mero arrependimento e{" "}
              <strong>não é possível processar o reembolso integral</strong>.
            </p>
            <h3>Falha técnica</h3>
            <p>
              Um uso que não funcionou por falha da MediaFlowMZ (por exemplo, uma
              live que não transmitiu por erro nosso) não conta como uso.
              Responda ao nosso e-mail contando o que aconteceu, e uma pessoa
              revisa o seu caso. Restrições, avisos ou bloqueios aplicados pelo
              TikTok à sua conta seguem as regras do TikTok e não são falha da
              MediaFlowMZ (cláusula 1).
            </p>
            <h3>Registros de uso</h3>
            <p>
              Guardamos a data e a hora do uso de cada ferramenta, e os
              registros de acesso da sua conta (data, IP e navegador). Enviamos
              esses registros a você, se pedir.
            </p>
            <p>
              Esta cláusula não limita os seus direitos em caso de vício do
              serviço ou de descumprimento da oferta (artigos 18, 20 e 35 do
              Código de Defesa do Consumidor).
            </p>
            <h3>Cancelamento da assinatura</h3>
            <p>
              Você pode cancelar a renovação da assinatura mensal a qualquer
              momento, pelo mesmo e-mail. O cancelamento interrompe as cobranças
              futuras e o acesso continua até o fim do período já pago. Não
              fazemos reembolso proporcional de um ciclo em andamento.
            </p>
            <p>
              Se encerrarmos o serviço por decisão nossa, devolvemos a parte
              proporcional do período pago e não utilizado.
            </p>
          </section>

          <section id="ia">
            <h2>
              <span className="mr-2 tabular-nums text-primary">6.</span>O que a
              inteligência artificial gera
            </h2>
            <p>
              Roteiros, prompts, ganchos, falas de live e análises de vídeo são
              produzidos por modelos de linguagem de terceiros. Isso tem
              consequências que você precisa conhecer antes de publicar qualquer
              coisa:
            </p>
            <ul>
              <li>
                <strong>O resultado não é verificado.</strong> Modelos de
                linguagem erram, inventam dados e afirmam coisas falsas com
                confiança. Confira tudo antes de usar.
              </li>
              <li>
                <strong>O resultado não é exclusivo.</strong> Outra pessoa pode
                receber algo semelhante a partir de um pedido parecido.
              </li>
              <li>
                <strong>Você responde pelo que publica.</strong> Promessas de
                resultado, alegações de saúde, preços e condições que você
                divulgar são de sua responsabilidade, inclusive perante o Código
                de Defesa do Consumidor e as regras do TikTok Shop.
              </li>
            </ul>
            <p>
              Na medida em que a lei permita, os textos e imagens que você gera
              na plataforma são seus, para uso comercial inclusive. Não
              reivindicamos propriedade sobre eles.
            </p>
          </section>

          <section id="dados-catalogo">
            <h2>
              <span className="mr-2 tabular-nums text-primary">7.</span>Os
              dados do catálogo
            </h2>
            <p>
              Preço, comissão e métricas de produto são leituras periódicas de
              fontes públicas e de terceiros. Eles descrevem o que foi observado
              na última leitura e{" "}
              <strong>podem estar desatualizados ou incorretos</strong> no
              momento em que você os consulta. O Radar de mudanças existe
              justamente para mostrar o que mudou desde a leitura anterior.
            </p>
            <p>
              Confirme preço e comissão na própria TikTok Shop antes de gravar,
              anunciar ou prometer qualquer coisa a partir deles.
            </p>
          </section>

          <section id="lives">
            <h2>
              <span className="mr-2 tabular-nums text-primary">8.</span>
              Assistente de Live e dados de terceiros
            </h2>
            <p>
              Ao conectar uma live, a plataforma lê o chat público daquela
              transmissão para separar perguntas e sugerir respostas. Isso
              inclui apelido, avatar e mensagens de outras pessoas.
            </p>
            <p>
              Em relação a esses dados,{" "}
              <strong>você é o controlador e a MediaFlowMZ é operadora</strong>: nós
              tratamos essas informações apenas para executar a funcionalidade
              que você pediu. Você é responsável por usar o que aparece no chat
              de acordo com a lei e com as regras da plataforma de origem.
            </p>
          </section>

          <section id="afiliados">
            <h2>
              <span className="mr-2 tabular-nums text-primary">9.</span>
              Programa de afiliados
            </h2>
            <p>
              Se você participar do programa de afiliados, receberá uma comissão
              sobre as vendas efetivamente pagas e confirmadas que vierem do seu
              link, no percentual combinado e informado no seu painel.
            </p>
            <ul>
              <li>
                Comissões de vendas{" "}
                <strong>estornadas, canceladas ou reembolsadas</strong> não são
                devidas e são retiradas do saldo.
              </li>
              <li>
                O repasse depende dos dados que você cadastrar (chave PIX ou
                conta Applyfy) estarem corretos e no seu nome.
              </li>
              <li>
                É proibido divulgar a MediaFlowMZ com spam, promessas de ganho
                garantido, marcas de terceiros, anúncios sobre nossa própria
                marca ou qualquer prática enganosa. Nesses casos a comissão pode
                ser cancelada e o acesso encerrado.
              </li>
            </ul>
          </section>

          <section id="uso-proibido">
            <h2>
              <span className="mr-2 tabular-nums text-primary">10.</span>Uso
              proibido
            </h2>
            <p>Não use a MediaFlowMZ para:</p>
            <ul>
              <li>
                Produzir conteúdo ilegal, enganoso, difamatório, discriminatório
                ou sexualmente explícito.
              </li>
              <li>
                Divulgar produtos proibidos ou fazer alegações de saúde e de
                resultado sem respaldo.
              </li>
              <li>
                Usar a imagem, a voz ou o nome de uma pessoa real sem
                autorização dela.
              </li>
              <li>Violar direitos de propriedade intelectual de terceiros.</li>
              <li>
                Atacar, sobrecarregar ou tentar obter acesso não autorizado à
                plataforma.
              </li>
            </ul>
          </section>

          <section id="disponibilidade">
            <h2>
              <span className="mr-2 tabular-nums text-primary">11.</span>
              Disponibilidade e mudanças
            </h2>
            <p>
              Fazemos o possível para manter a plataforma no ar, mas ela é
              fornecida <strong>no estado em que se encontra</strong>, sem
              garantia de funcionamento ininterrupto ou livre de erros.
              Dependemos de serviços de terceiros — pagamento, hospedagem,
              modelos de IA — que podem falhar ou mudar.
            </p>
            <p>
              Podemos alterar, incluir ou remover funcionalidades. Se uma
              mudança reduzir de forma relevante o que o seu plano entrega,
              avisaremos com antecedência.
            </p>
            <p>
              <strong>
                Nada aqui é promessa de venda, de faturamento ou de resultado.
              </strong>{" "}
              O desempenho do seu conteúdo depende de você, do produto, do
              mercado e do algoritmo da plataforma onde você publica.
            </p>
          </section>

          <section id="responsabilidade">
            <h2>
              <span className="mr-2 tabular-nums text-primary">12.</span>
              Limitação de responsabilidade
            </h2>
            <p>
              Na máxima extensão permitida pela legislação brasileira, e sem
              prejuízo dos direitos que o Código de Defesa do Consumidor
              assegura a você, nossa responsabilidade total por qualquer
              reclamação relacionada à plataforma fica limitada ao valor que
              você pagou à MediaFlowMZ nos 12 meses anteriores ao fato.
            </p>
            <p>
              Não respondemos por lucros cessantes, perda de oportunidade,
              alcance perdido, suspensão da sua conta em plataformas de
              terceiros, nem por decisões comerciais que você tome a partir do
              que leu aqui.
            </p>
          </section>

          <section id="encerramento">
            <h2>
              <span className="mr-2 tabular-nums text-primary">13.</span>
              Encerramento
            </h2>
            <p>
              Você pode encerrar sua conta quando quiser. Podemos encerrá-la em
              caso de violação destes Termos, fraude ou exigência legal, com
              aviso sempre que possível.
            </p>
            <p>
              Depois do encerramento, seus dados são tratados conforme a{" "}
              <Link href="/privacidade">Política de Privacidade</Link>. O
              conteúdo que você já gerou e baixou continua seu.
            </p>
          </section>

          <section id="gerais">
            <h2>
              <span className="mr-2 tabular-nums text-primary">14.</span>
              Disposições gerais
            </h2>
            <p>
              Podemos atualizar estes Termos. A data de atualização fica no topo
              desta página, e mudanças relevantes serão comunicadas por e-mail
              ou dentro da plataforma antes de entrarem em vigor. Continuar
              usando a MediaFlowMZ depois disso significa aceitar a nova versão.
            </p>
            <p>
              Se alguma cláusula for considerada inválida, as demais continuam
              valendo. Estes Termos são regidos pelas leis brasileiras. Fica
              eleito o foro do domicílio do consumidor para resolver qualquer
              controvérsia.
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
