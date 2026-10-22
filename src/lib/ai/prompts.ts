import { z } from "zod";

// ---------- Schemas das respostas ----------

export const VideoScript = z.object({
  title: z.string(),
  hook: z.string(),
  scenes: z.array(
    z.object({
      shot: z.string(),
      action: z.string(),
      speech: z.string(),
      seconds: z.number(),
    }),
  ),
  cta: z.string(),
  videoPrompt: z.string(),
});
export type VideoScript = z.infer<typeof VideoScript>;

export const LiveScript = z.object({
  opening: z.string(),
  products: z.array(
    z.object({
      name: z.string(),
      steps: z.array(
        z.object({
          title: z.string(),
          seconds: z.number(),
          showOnCamera: z.string(),
          talkingPoints: z.array(z.string()),
        }),
      ),
      faq: z.array(z.object({ question: z.string(), answer: z.string() })),
    }),
  ),
  closing: z.string(),
});
export type LiveScript = z.infer<typeof LiveScript>;

export const VideoAnalysis = z.object({
  hook: z.string(),
  hookType: z.string(),
  structure: z.array(z.object({ part: z.string(), purpose: z.string(), excerpt: z.string() })),
  arguments: z.array(z.string()),
  cta: z.string(),
  recreated: z.object({
    hook: z.string(),
    structure: z.array(z.object({ part: z.string(), speech: z.string() })),
    cta: z.string(),
  }),
});
export type VideoAnalysis = z.infer<typeof VideoAnalysis>;

export const ChatReply = z.object({
  isPurchaseQuestion: z.boolean(),
  reply: z.string(),
});

export const LoopComments = z.object({ comments: z.array(z.string()).min(5) });

// ---------- Prompts ----------

const VOICE =
  "Você escreve em português do Brasil, tom natural de criador de conteúdo, frases curtas, sem exageros nem promessas que o produto não cumpre. Nunca invente características do produto que não foram informadas.";

export type ProductInput = { name: string; price?: string; details?: string };

export function videoScriptPrompt(input: {
  product: ProductInput;
  character?: { name: string; appearance: string };
  template?: { scene: string; camera_motion: string };
  durationSeconds: number;
}) {
  return {
    system: `${VOICE} Você cria roteiros de vídeos verticais curtos para o TikTok Shop e o prompt para gerar o vídeo numa ferramenta de vídeo por IA (Flow, Veo).`,
    prompt: `Produto: ${input.product.name}
Preço: ${input.product.price ?? "não informado"}
Detalhes: ${input.product.details ?? "não informados"}
Apresentador: ${input.character ? `${input.character.name}, ${input.character.appearance}` : "livre"}
Cena: ${input.template ? `${input.template.scene}. Câmera: ${input.template.camera_motion}` : "livre, adequada ao produto"}
Duração total: ${input.durationSeconds} segundos

Devolva um JSON com:
- title: nome curto do vídeo
- hook: frase dos primeiros 2 segundos
- scenes: lista de cenas { shot (enquadramento), action (o que acontece), speech (fala em PT-BR), seconds }
- cta: chamada final para comprar pelo carrinho
- videoPrompt: um prompt único, detalhado, para gerar o vídeo vertical 9:16, descrevendo apresentador, cenário, luz, enquadramento, movimento de câmera e a fala entre aspas simples. Inclua "Preserve a aparência do produto de referência."`,
    maxTokens: 1800,
  };
}

export function liveScriptPrompt(input: { products: ProductInput[]; minutesPerProduct: number }) {
  return {
    system: `${VOICE} Você monta roteiros de live de vendas no TikTok Shop para quem apresenta na câmera.`,
    prompt: `Produtos da live (na ordem):
${input.products.map((p, i) => `${i + 1}. ${p.name} — preço: ${p.price ?? "?"} — detalhes: ${p.details ?? "?"}`).join("\n")}

Tempo por produto: ${input.minutesPerProduct} minutos.

Devolva um JSON com:
- opening: fala de abertura da live (até 40 segundos)
- products: para cada produto { name, steps: [{ title, seconds, showOnCamera (o que mostrar), talkingPoints (2 a 4 frases) }], faq: [{ question, answer }] com as 4 perguntas mais prováveis no chat }
- closing: fala de encerramento
A soma dos seconds de cada produto deve dar o tempo por produto.`,
    maxTokens: 3500,
  };
}

export function videoAnalysisPrompt(input: { transcript: string; myProduct?: ProductInput }) {
  return {
    system: `${VOICE} Você analisa vídeos de venda que estão performando e explica por que funcionam.`,
    prompt: `Transcrição do vídeo:
"""
${input.transcript.slice(0, 12000)}
"""

${input.myProduct ? `Produto para recriar a estrutura: ${input.myProduct.name} — ${input.myProduct.details ?? ""}` : "Sem produto informado: recrie para um produto genérico do mesmo nicho."}

Devolva um JSON com:
- hook: o gancho, citado da fala
- hookType: tipo do gancho (pergunta, dor, curiosidade, prova, etc.)
- structure: partes do roteiro em ordem { part, purpose, excerpt (trecho da fala) }
- arguments: argumentos de venda usados
- cta: a chamada para ação
- recreated: a mesma estrutura aplicada ao produto { hook, structure: [{ part, speech }], cta }`,
    maxTokens: 2500,
  };
}

export function chatReplyPrompt(input: { question: string; product: ProductInput; context?: string }) {
  return {
    system: `${VOICE} Você ajuda quem está fazendo live a responder o chat. Respostas de no máximo 2 frases.`,
    prompt: `Produto em destaque: ${input.product.name} — ${input.product.details ?? ""} — preço: ${input.product.price ?? "?"}
${input.context ? `Contexto: ${input.context}\n` : ""}Mensagem do chat: "${input.question}"

Devolva JSON { isPurchaseQuestion (true se é dúvida de quem pode comprar), reply (resposta curta e honesta; se não souber, diga que vai confirmar) }.`,
    maxTokens: 300,
    temperature: 0.4,
  };
}

export function loopCommentsPrompt(input: { product: ProductInput; count: number }) {
  return {
    system: `${VOICE} Você escreve comentários curtos que o anfitrião da própria live publica para lembrar o público do produto. Nunca finja ser um cliente.`,
    prompt: `Produto: ${input.product.name} — ${input.product.details ?? ""} — preço: ${input.product.price ?? "?"}
Escreva ${input.count} comentários diferentes do anfitrião (até 120 caracteres cada), variando entre benefício, como usar, convite para o carrinho e convite para perguntar.
Devolva JSON { comments: [...] }.`,
    maxTokens: 900,
  };
}
