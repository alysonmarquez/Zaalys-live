# MediaFlowMZ

Plataforma para vendedores e afiliados do TikTok Shop: live infinita com clipes em loop, assistente de live apresentada, catálogo com comissões, influencers de IA, roteiros e prompts de vídeo e Raio-X de vídeos.

Escopo completo, fases e estimativas: veja o documento de escopo do projeto.

## Stack

- **Next.js 15** (App Router, TypeScript) — landing, painel e API
- **Supabase** — Postgres com RLS, autenticação (e-mail e senha)
- **E-mail plugável** — `src/lib/email.ts` (adaptador Resend): Radar semanal, confirmação e suporte
- **Tailwind CSS 4**
- **IA plugável** — `src/lib/ai` (adaptadores Groq — padrão —, Anthropic e OpenAI)
- **Pagamento plugável** — `src/lib/payments` (adaptador Mercado Pago)
- **Extensão Chrome MV3** — `extension/`
- **Web Push** — alertas de queda da live no celular

## Rodando localmente

```bash
npm install
cp .env.example .env.local      # preencha as variáveis
npm run vapid                   # gera as chaves de push; copie para o .env.local
npm run dev
```

**Modo demonstração.** Sem Supabase configurado e fora de produção, o painel abre com um usuário de exemplo e uma faixa avisando. Nesse modo, Raio-X, remake, roteiros, templates e "adicionar produto" mostram as mesmas respostas de exemplo do sistema original, sem chamar a IA. Com Supabase configurado, tudo usa a IA real. Em produção (`npm run build && npm start`) o modo só liga com `ZAALYS_DEMO_MODE=true`. Com Supabase configurado, o painel exige login e assinatura ativa: sem plano, a pessoa vai para o checkout.

### Supabase

1. Crie um projeto em supabase.com.
2. No SQL Editor, rode `supabase/schema.sql` inteiro. Ele cria tabelas, RLS e dados de exemplo (apague os exemplos em produção). Banco criado com a versão anterior? Rode só `supabase/migration-2026-10-radar-suporte-remake.sql`.
3. Em Authentication > URL Configuration, adicione `http://localhost:3000/auth/callback` e a URL de produção.
4. Copie URL, anon key e service role key para o `.env.local`.

### Applyfy (padrão)

O pagamento usa os links de checkout da Applyfy (`src/lib/checkout-links.ts`):

| Uso | Vitalício | Mensal |
|---|---|---|
| Landing e checkout do site (valor cheio) | `KXSWOMU` — R$ 594 | `POL2VBI` — R$ 340 |
| Convites Acesso Creator / Indique (`/convite/...`) | `UCYM6OR` — R$ 297 | `95RF27C` — R$ 170 |

O formulário de `/checkout/vitalicio` leva para o link da Applyfy com o e-mail. Para liberar o acesso automaticamente, cadastre o postback de vendas na Applyfy apontando para `https://SEU-DOMINIO/api/webhooks/payment` e coloque o token do webhook gerado pela Applyfy em `APPLYFY_WEBHOOK_TOKEN` (na Vercel). O site aceita o token no endereço (`?token=`), nos cabeçalhos `x-webhook-token`, `x-applyfy-token`, `x-token` ou `Authorization: Bearer`, ou no campo `token` do corpo, e registra no log onde ele veio; se a Applyfy não enviar o token sozinha, use o endereço com `?token=`. O formato do postback ainda precisa ser confirmado: o adaptador (`src/lib/payments/applyfy.ts`) registra no log cada postback recebido para ajustar o mapeamento.

### Mercado Pago (alternativo)

Use com `PAYMENT_PROVIDER=mercadopago` e `NEXT_PUBLIC_PAYMENT_PROVIDER=mercadopago`.

1. Crie uma aplicação em mercadopago.com.br/developers e copie o Access Token.
2. Em Webhooks, aponte para `https://SEU-DOMINIO/api/webhooks/payment` com os eventos **Pagamentos** e **Planos e assinaturas**. Copie a assinatura secreta para `MERCADOPAGO_WEBHOOK_SECRET`.
3. Para testar local, exponha o servidor com um túnel (ngrok, cloudflared) e use credenciais de teste.

Fluxo: a pessoa informa o e-mail na landing → paga no Mercado Pago → o webhook grava a assinatura com esse e-mail → no primeiro login com o mesmo e-mail, o acesso é vinculado.

- **Vitalício:** Checkout Pro (Pix, boleto, cartão em até 12x).
- **Mensal:** assinatura (preapproval). No Mercado Pago, recorrência é só no cartão.

### Preços e cupons

Os preços ficam em `src/lib/pricing.ts`, lidos de `PRICE_*` (servidor) e `NEXT_PUBLIC_PRICE_*` (checkout no navegador); mantenha os dois iguais. Padrão: R$ 340/mês e R$ 594 no vitalício, iguais às ofertas cheias da Applyfy. Cupons valem só no vitalício e são validados no servidor: `COUPON_CODES="CODIGO:3000,OUTRO:5000"` (desconto em centavos).

O checkout não processa cartão nem gera Pix/boleto na própria página: tudo é pago na página segura do Mercado Pago. Se o gateway falhar, a pessoa vê uma mensagem de erro.

### Radar por e-mail (lead magnet)

1. Crie uma conta na Resend, verifique o domínio e preencha `RESEND_API_KEY` e `EMAIL_FROM`.
2. Inscrição: `POST /api/webhooks/leads` → e-mail com link de confirmação (`/api/radar/confirm`) → página `/newsletter`.
3. Envio semanal: `vercel.json` agenda `GET /api/cron/radar` toda segunda às 8h (Brasília). Defina `CRON_SECRET` na Vercel. O e-mail lista os 10 produtos que mais pagam por venda e as mudanças do Radar.
4. Descadastro em um clique (`/api/radar/unsubscribe`, também via cabeçalho `List-Unsubscribe`).

Sem `RESEND_API_KEY`, os e-mails só aparecem no log do servidor.

### Suporte

O botão Suporte do painel grava o chamado em `support_tickets` e envia um e-mail para `SUPPORT_INBOX` com resposta direta para quem abriu.

### Trocar de provedor

- **IA:** padrão Groq (`GROQ_API_KEY`; modelo `GROQ_MODEL`, padrão `llama-3.3-70b-versatile`; transcrição do Raio-X com `whisper-large-v3-turbo`). `AI_PROVIDER=anthropic|openai` e `TRANSCRIPTION_PROVIDER=openai` trocam de provedor. Novo provedor: implemente `AIProvider` em `src/lib/ai/` e registre em `index.ts`; provedores com a API da OpenAI usam `OpenAICompatibleProvider`.
- **Pagamento:** implemente `PaymentProvider` em `src/lib/payments/` (ex.: Asaas, Stripe) e registre em `index.ts`. O resto do sistema não muda.

## Estrutura

```
src/
  app/
    page.tsx                 landing
    login/                   login e cadastro (e-mail e senha)
    painel/                  área logada (catálogo, radar, influencers, roteiros, raio-x, live, conta)
    estudio/                 Estúdio de LIVE (console, painel de LIVE em tempo real, desempenho, histórico)
    api/
      checkout/              cria o pagamento
      webhooks/payment/      libera/revoga acesso
      ai/*                   roteiro de vídeo, roteiro de live, raio-x, remake, resposta de chat
      checkout/coupon/       valida cupom
      webhooks/leads/        inscrição no Radar
      radar/*                confirmação e descadastro
      cron/radar/            envio semanal
      support/               chamados de suporte
      extension/*            ativação, seletores, comentários, respostas, eventos da live
      live/stats/            LIVEs e vendas reais da conta (dashboard e Estúdio)
      push/subscribe/        inscrição de alertas
      license/reset/         gera chave, desvincula computador
  lib/
    ai/                      camada de IA + prompts e schemas
    payments/                camada de pagamento
    supabase/                clientes do Supabase
    access.ts                sessão, plano ativo, modo demonstração e contas de demonstração
    showcase.tsx             contexto "conta de demonstração" para as telas
    dashboard-demo.ts        números de exemplo do dashboard
    estudio-lives.ts         LIVEs e indicadores do Estúdio (exemplo ou reais)
    estudio-live-sim.ts      LIVE simulada (pedidos caindo) da conta de demonstração
    pricing.ts               preços, parcelamento e cupons
    email.ts                 envio de e-mail
    radar.ts                 conteúdo do Radar semanal
    push.ts                  envio de push
extension/                   extensão Chrome (live infinita)
supabase/schema.sql          banco
```

## Extensão (live infinita)

Como funciona:

- `inject.js` roda no contexto da página e substitui `getUserMedia`: quando a live infinita está ligada, a página recebe um stream com os clipes em loop (canvas 1080×1920) e o áudio dos clipes ou de uma narração em loop.
- `content.js` injeta o painel (botão **MF** no canto) e automatiza a página: comentários do anfitrião, fixar produto, saudar quem entra, responder perguntas (via IA), comemorar vendas, trocar de produto. Cada comentário respeita um intervalo mínimo de 8 s.
- `background.js` fala com a API usando a chave de licença + id do computador, e avisa queda se a aba da live for fechada.

Instalar para teste: `chrome://extensions` → Modo do desenvolvedor → Carregar sem compactação → pasta `extension/`. Para produção, gere o zip já apontando para o domínio real (troca `DEFAULT_API` e a permissão de `localhost` no manifest):

```bash
NEXT_PUBLIC_APP_URL=https://mediaflow-gamma.vercel.app npm run extension:zip   # gera public/downloads/mediaflowmz-live.zip e .crx
```

Atenção: `public/downloads/mediaflowmz-live.zip` e `.crx` (v3.17.0, linkados em Live e Configurações) são outro pacote, que fala com `www.zaalys.com`, não com este código.

### O que precisa ser validado na página real do TikTok

Estes pontos dependem da página de LIVE do TikTok Shop, que não pôde ser testada aqui:

1. **Seletores.** Os seletores em `extension_config` (tabela do banco) são **provisórios**. Abra a página de LIVE com o DevTools, identifique o campo de comentário, o botão de enviar, os itens do chat, as entradas de quem chega, o botão de fixar produto e o aviso de fim da live, e atualize a tabela. Como ficam no banco, dá para corrigir sem nova versão da extensão.
2. **Câmera virtual.** Confirme que a página de LIVE no navegador pede a câmera por `getUserMedia`. Se a transmissão usar outro caminho (por exemplo, exigir o LIVE Studio ou uma chave de stream RTMP), a câmera virtual precisa ser trocada por envio via OBS/RTMP.
3. **Aba visível.** O Chrome reduz o ritmo de abas em segundo plano. Deixe a aba da live visível numa janela própria.
4. **Termos do TikTok.** Automação de comentários pode ser restrita pelos termos da plataforma. Deixe o ritmo conservador e avise isso nos termos de uso da MediaFlowMZ.

## Dados de exemplo lidos do sistema original

Para o painel mostrar o mesmo conteúdo do original, parte dos dados foi lida do zaalys.com em 24/10/2026 (com login da conta) e salva no repositório:

| O quê | Onde | Observação |
|---|---|---|
| 133 produtos (os mais vendidos de cada categoria) | `src/data/catalogo-original.json` → `src/lib/catalogo-original.ts` | Preço, comissão, vendas, fotos (FastMoss/TikTok) e link do TikTok Shop. Alimentam Produtos, Radar, Raio-X e a notificação de venda. |
| 26 templates de vídeo | `src/lib/templates-original.ts` | 5 mídias estão em `public/media/templates`; as outras 21 ainda são carregadas do servidor do original. |
| 12 formatos do Trend AI e seus personagens | `src/lib/trend-formats.ts` | Fotos e prévias carregadas do servidor do original (`/media/trend/...`). |
| 98 vídeos de referência do Raio-X | `src/data/raiox-videos.json` → `src/lib/raiox-videos.ts` | Números do FastMoss coletados em 02/10/2026. |

Os dados são fixos: não se atualizam sozinhos. No original, o catálogo é relido a cada poucos minutos a partir do FastMoss e do Kalodata (via Firecrawl), e o Radar compara as leituras.

As mídias dos templates (26 vídeos + capas) e do Trend AI (12 prévias + personagens) já estão em `public/media/` e são servidas pelo próprio projeto — não há dependência do servidor do original. `NEXT_PUBLIC_TEMPLATE_MEDIA_ORIGIN` só é necessário se quiser servi-las de um CDN.

## Conta de demonstração

Os números de exemplo — dashboard, vendas ao vivo, notificações de venda, Painel do Afiliado, saque de
comissões, Estúdio de LIVE (LIVEs de exemplo, pedidos caindo, "Editar números") — e as opções extras da página
Live (Abrir o Estúdio, comentários automáticos, OBS, Editar desempenho) aparecem **só** para as contas em
`SHOWCASE_EMAILS` (padrão: `nathalyahoff@gmail.com`). A regra é pelo e-mail logado no Supabase
(`isShowcaseEmail` em `src/lib/access.ts`).

As demais contas veem o próprio faturamento, lido de `live_sessions` e `live_events` (eventos `sale`) pela rota
`/api/live/stats`. A extensão ainda não envia os eventos `sale`, então essas contas aparecem zeradas até isso
ser feito.

Sem Supabase (desenvolvimento local), o usuário fictício do modo demonstração também conta como conta de
demonstração.

Qualquer conta pode abrir o Estúdio de LIVE e usar "Editar desempenho da LIVE" e "Editar números": os valores
digitados valem na LIVE de hoje e nos períodos do Desempenho. Ficam no navegador e, com a coluna
`profiles.live_settings` (`supabase/migration-2026-10-live-settings.sql`), também na conta, valendo em qualquer
aparelho. Comentários automáticos e OBS continuam só nas contas de demonstração.

### Marca de apresentação

As contas de demonstração (`SHOWCASE_EMAILS`) veem o logo e o favicon do TikTok Shop no Estúdio de LIVE
(`public/presentation/`), para apresentar a ideia em sala. As demais contas veem a marca MediaFlowMZ.

## Aprovar afiliados e comissões

As contas em `ADMIN_EMAILS` (padrão: `nathalyahoff@gmail.com`) veem o **Painel do Afiliado** no menu da conta, com
a aba **Afiliados** (`/painel/afiliado?aba=afiliados`):

- **Aprovar** cria uma assinatura vitalícia `gateway = 'manual'` ativa para a conta, que entra no painel sem pagar;
  **Revogar** cancela só essa assinatura (quem pagou continua com acesso).
- **Comissão**: porcentagem de cada afiliado (`profiles.commission_pct`; vazio = 40%), mostrada no Saque de
  comissões dele. Precisa de `supabase/migration-2026-10-afiliados.sql`.

## O que ainda falta (próximas fases)

- Extensão enviar as vendas da LIVE (`kind: "sale"` em `/api/extension/event`, com `amountCents`, `commissionCents`, `title`, `imageUrl`, `qty`), para o faturamento real aparecer.
- Fonte de dados do catálogo e coleta periódica. As telas do painel (catálogo, radar de mudanças, galeria do Raio-X, notificações) ainda usam os dados fixos de `src/lib/zaalys-data.ts`; as tabelas `products` e `product_snapshots` já existem e alimentam o e-mail do Radar.
- Programa de indicação: o cupom `HANDLE30` e o link `/convite/...` aparecem no painel, mas não existem no servidor (adicione os cupons em `COUPON_CODES` ou crie a rota).
- Painel administrativo para catálogo, templates, tendências e seletores.
- Newsletter semanal com os produtos de maior comissão.
- Textos de termos de uso e privacidade (jurídico).
- Testes automatizados e ponta a ponta.

## Deploy

1. Suba o repositório no GitHub e importe na Vercel.
2. Configure as variáveis do `.env.example` no projeto da Vercel. Sem `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` o login não funciona em produção.
   `SHOWCASE_EMAILS` define as contas de demonstração e `ADMIN_EMAILS` quem aprova afiliados.
   Rode no SQL Editor do Supabase `supabase/migration-2026-10-live-settings.sql` (números editados entre aparelhos)
   e `supabase/migration-2026-10-afiliados.sql` (comissão por afiliado).
4. Em Settings → Functions, deixe a região das funções a mesma do Supabase (ex.: São Paulo, `gru1`): cada página do
   painel consulta o banco, e regiões distantes deixam tudo mais lento.
3. Ajuste `NEXT_PUBLIC_APP_URL` para o domínio final e atualize o webhook no Mercado Pago.
