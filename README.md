# Zaalys

Plataforma para vendedores e afiliados do TikTok Shop: live infinita com clipes em loop, assistente de live apresentada, catálogo com comissões, influencers de IA, roteiros e prompts de vídeo e Raio-X de vídeos.

Escopo completo, fases e estimativas: veja o documento de escopo do projeto.

## Stack

- **Next.js 15** (App Router, TypeScript) — landing, painel e API
- **Supabase** — Postgres com RLS, autenticação (e-mail e senha)
- **E-mail plugável** — `src/lib/email.ts` (adaptador Resend): Radar semanal, confirmação e suporte
- **Tailwind CSS 4**
- **IA plugável** — `src/lib/ai` (adaptadores Anthropic e OpenAI)
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

**Modo demonstração.** Sem Supabase configurado e fora de produção, o painel abre com um usuário de exemplo e uma faixa avisando. Em produção (`npm run build && npm start`) o modo só liga com `ZAALYS_DEMO_MODE=true`. Com Supabase configurado, o painel exige login e assinatura ativa: sem plano, a pessoa vai para o checkout.

### Supabase

1. Crie um projeto em supabase.com.
2. No SQL Editor, rode `supabase/schema.sql` inteiro. Ele cria tabelas, RLS e dados de exemplo (apague os exemplos em produção). Banco criado com a versão anterior? Rode só `supabase/migration-2026-10-radar-suporte-remake.sql`.
3. Em Authentication > URL Configuration, adicione `http://localhost:3000/auth/callback` e a URL de produção.
4. Copie URL, anon key e service role key para o `.env.local`.

### Mercado Pago

1. Crie uma aplicação em mercadopago.com.br/developers e copie o Access Token.
2. Em Webhooks, aponte para `https://SEU-DOMINIO/api/webhooks/payment` com os eventos **Pagamentos** e **Planos e assinaturas**. Copie a assinatura secreta para `MERCADOPAGO_WEBHOOK_SECRET`.
3. Para testar local, exponha o servidor com um túnel (ngrok, cloudflared) e use credenciais de teste.

Fluxo: a pessoa informa o e-mail na landing → paga no Mercado Pago → o webhook grava a assinatura com esse e-mail → no primeiro login com o mesmo e-mail, o acesso é vinculado.

- **Vitalício:** Checkout Pro (Pix, boleto, cartão em até 12x).
- **Mensal:** assinatura (preapproval). No Mercado Pago, recorrência é só no cartão.

### Preços e cupons

Os preços ficam em `src/lib/pricing.ts`, lidos de `PRICE_*` (servidor) e `NEXT_PUBLIC_PRICE_*` (checkout no navegador); mantenha os dois iguais. Padrão: R$ 540/mês e R$ 794 no vitalício (12x de R$ 84,60). Cupons valem só no vitalício e são validados no servidor: `COUPON_CODES="CODIGO:3000,OUTRO:5000"` (desconto em centavos).

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

- **IA:** `AI_PROVIDER=anthropic|openai`. Novo provedor: implemente `AIProvider` em `src/lib/ai/` e registre em `index.ts`.
- **Pagamento:** implemente `PaymentProvider` em `src/lib/payments/` (ex.: Asaas, Stripe) e registre em `index.ts`. O resto do sistema não muda.

## Estrutura

```
src/
  app/
    page.tsx                 landing
    login/                   login e cadastro (e-mail e senha)
    painel/                  área logada (catálogo, radar, influencers, roteiros, raio-x, live, conta)
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
      push/subscribe/        inscrição de alertas
      license/reset/         gera chave, desvincula computador
  lib/
    ai/                      camada de IA + prompts e schemas
    payments/                camada de pagamento
    supabase/                clientes do Supabase
    access.ts                sessão, plano ativo e modo demonstração
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
NEXT_PUBLIC_APP_URL=https://www.zaalys.com npm run extension:zip   # gera public/zaalys-extensao.zip
```

Atenção: `public/downloads/zaalys-live.zip` e `.crx` (v3.17.0, linkados em Live e Configurações) são outro pacote, que fala com `www.zaalys.com`, não com este código.

### O que precisa ser validado na página real do TikTok

Estes pontos dependem da página de LIVE do TikTok Shop, que não pôde ser testada aqui:

1. **Seletores.** Os seletores em `extension_config` (tabela do banco) são **provisórios**. Abra a página de LIVE com o DevTools, identifique o campo de comentário, o botão de enviar, os itens do chat, as entradas de quem chega, o botão de fixar produto e o aviso de fim da live, e atualize a tabela. Como ficam no banco, dá para corrigir sem nova versão da extensão.
2. **Câmera virtual.** Confirme que a página de LIVE no navegador pede a câmera por `getUserMedia`. Se a transmissão usar outro caminho (por exemplo, exigir o LIVE Studio ou uma chave de stream RTMP), a câmera virtual precisa ser trocada por envio via OBS/RTMP.
3. **Aba visível.** O Chrome reduz o ritmo de abas em segundo plano. Deixe a aba da live visível numa janela própria.
4. **Termos do TikTok.** Automação de comentários pode ser restrita pelos termos da plataforma. Deixe o ritmo conservador e avise isso nos termos de uso da Zaalys.

## O que ainda falta (próximas fases)

- Fonte de dados do catálogo e coleta periódica. As telas do painel (catálogo, radar de mudanças, galeria do Raio-X, notificações) ainda usam os dados fixos de `src/lib/zaalys-data.ts`; as tabelas `products` e `product_snapshots` já existem e alimentam o e-mail do Radar.
- Programa de indicação: o cupom `HANDLE30` e o link `/convite/...` aparecem no painel, mas não existem no servidor (adicione os cupons em `COUPON_CODES` ou crie a rota).
- Painel administrativo para catálogo, templates, tendências e seletores.
- Newsletter semanal com os produtos de maior comissão.
- Textos de termos de uso e privacidade (jurídico).
- Testes automatizados e ponta a ponta.

## Deploy

1. Suba o repositório no GitHub e importe na Vercel.
2. Configure as variáveis do `.env.example` no projeto da Vercel.
3. Ajuste `NEXT_PUBLIC_APP_URL` para o domínio final e atualize o webhook no Mercado Pago.
