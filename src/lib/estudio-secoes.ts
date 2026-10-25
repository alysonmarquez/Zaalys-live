// Itens do menu do Estúdio de LIVE que, no original (zaalys.com), não têm tela própria.
// No clone cada um abre uma página com título e estado vazio, para nenhum item ficar sem destino.
export const ESTUDIO_SECOES: Record<string, { title: string; desc: string; empty: string }> = {
  "eventos": {
    title: "Eventos LIVE",
    desc: "Agende transmissões e avise seus seguidores antes de entrar ao vivo.",
    empty: "Nenhum evento agendado.",
  },
  "kit-de-produtos": {
    title: "Kit de produtos da LIVE",
    desc: "Monte listas de produtos para reutilizar nas próximas transmissões.",
    empty: "Nenhum kit criado.",
  },
  "recompensa": {
    title: "Recompensa da LIVE",
    desc: "Crie recompensas para quem participa da sua transmissão.",
    empty: "Nenhuma recompensa ativa.",
  },
  "campanhas": {
    title: "Campanhas de vídeo curto e LIVE",
    desc: "Campanhas das quais você participa com vídeos curtos e transmissões.",
    empty: "Nenhuma campanha disponível no momento.",
  },
  "vitrine": {
    title: "Produtos da vitrine",
    desc: "Os produtos que aparecem na sua vitrine para os espectadores.",
    empty: "Sua vitrine ainda não tem produtos.",
  },
  "historico": {
    title: "Histórico de LIVE",
    desc: "Todas as transmissões que você já fez, com duração e resultados.",
    empty: "Nenhuma transmissão registrada.",
  },
  "analise-de-mercado": {
    title: "Análise de mercado",
    desc: "Categorias e produtos em alta nas transmissões ao vivo.",
    empty: "Ainda não há dados de mercado para mostrar.",
  },
  "pontos-de-qualidade": {
    title: "Pontos de qualidade das promoções",
    desc: "Sua pontuação de qualidade nas promoções feitas durante as transmissões.",
    empty: "Sem pontuação no período.",
  },
  "classificacao-de-integridade": {
    title: "Classificação de integridade do criador",
    desc: "Sua situação nas regras de conteúdo e de vendas.",
    empty: "Nenhuma ocorrência registrada.",
  },
};
