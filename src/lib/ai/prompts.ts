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
  tone?: string;
  angle?: string;
}) {
  return {
    system: `${VOICE} Você cria roteiros de vídeos verticais curtos para o TikTok Shop e o prompt para gerar o vídeo numa ferramenta de vídeo por IA (Flow, Veo).`,
    prompt: `Produto: ${input.product.name}
Preço: ${input.product.price ?? "não informado"}
Detalhes: ${input.product.details ?? "não informados"}
Apresentador: ${input.character ? `${input.character.name}, ${input.character.appearance}` : "livre"}
Cena: ${input.template ? `${input.template.scene}. Câmera: ${input.template.camera_motion}` : "livre, adequada ao produto"}
Duração total: ${input.durationSeconds} segundos
Tom: ${input.tone ?? "natural"}
Ângulo do roteiro: ${input.angle ?? "livre"}

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

// ---------- Remake de vídeo ----------

export const VideoRemake = z.object({
  versions: z
    .array(
      z.object({
        angle: z.string(),
        hook: z.string(),
        beats: z.array(z.object({ time: z.string(), shot: z.string(), speech: z.string() })),
        cta: z.string(),
        videoPrompt: z.string(),
      }),
    )
    .min(3)
    .max(3),
});
export type VideoRemake = z.infer<typeof VideoRemake>;

export function videoRemakePrompt(input: {
  reference: { hook: string; structure: { stage: string; whatHappens: string }[] };
  product: ProductInput;
}) {
  return {
    system: `${VOICE} Você faz o "remake" de vídeos de venda: mantém o ritmo e a estrutura de um vídeo que já vende, com falas e cenas novas para outro produto. Nunca copie as falas do vídeo de referência.`,
    prompt: `Vídeo de referência:
- Gancho: ${input.reference.hook}
- Estrutura:
${input.reference.structure.map((s) => `  • ${s.stage}: ${s.whatHappens}`).join("\n")}

Produto novo: ${input.product.name}
Preço: ${input.product.price ?? "não informado"}
Detalhes: ${input.product.details ?? "não informados"}

Devolva um JSON com "versions": exatamente 3 versões, cada uma com um ângulo diferente (ex.: dor + prova, curiosidade, custo-benefício):
- angle: nome curto do ângulo
- hook: fala dos primeiros 2 segundos
- beats: as partes na mesma ordem e com os mesmos tempos da referência { time, shot (o que aparece), speech (fala em PT-BR) }
- cta: chamada final para o carrinho
- videoPrompt: prompt único para gerar o vídeo vertical 9:16 no Flow/Veo, com a fala entre aspas simples e "Preserve a aparência do produto de referência."`,
    maxTokens: 3000,
  };
}

// ---------- Trend AI (vídeos virais com personagem) ----------

export const TrendScripts = z.object({
  scripts: z
    .array(
      z.object({
        title: z.string(),
        hook: z.string(),
        lines: z.array(z.string()).min(1).max(4),
        cta: z.string(),
        videoPrompt: z.string(),
      }),
    )
    .min(3)
    .max(3),
});
export type TrendScripts = z.infer<typeof TrendScripts>;

export function trendScriptPrompt(input: {
  format: { title: string; desc: string };
  character: string;
  tone: { label: string; desc: string };
  cta: string;
}) {
  return {
    system: `${VOICE} Você escreve roteiros de 8 segundos para vídeos virais gerados por IA (Google Flow, Veo), feitos para retenção, comentário e compartilhamento.`,
    prompt: `Formato: ${input.format.title} — ${input.format.desc}
Personagem: ${input.character}
Tom: ${input.tone.label} (${input.tone.desc})
Chamada no final (fala exata ou bem próxima): "${input.cta}"

Devolva um JSON com "scripts": exatamente 3 roteiros diferentes, cada um com:
- title: nome curto do roteiro
- hook: primeira fala, que prende nos 2 primeiros segundos
- lines: 1 a 3 falas seguintes do personagem, em PT-BR, cabendo em 8 segundos no total
- cta: a chamada final
- videoPrompt: prompt único em inglês para gerar o vídeo vertical 9:16 de 8 segundos, descrevendo o personagem (use a imagem de referência enviada), cenário, luz, câmera e as falas em português entre aspas simples. Comece com "Use the attached character image as reference."`,
    maxTokens: 2500,
  };
}
