export type ProofGoal = "details" | "use" | "contents" | "fit";

export const PROOF_GOAL_LABELS: Record<ProofGoal, string> = {
  details: "Detalhes",
  use: "Como usar",
  contents: "O que vem",
  fit: "Tamanho e caimento",
};

export type ZaalysProduct = {
  id: number;
  title: string;
  category: string;
  categoryKey: string;
  priceCents: number;
  commissionPct: number;
  earningCents: number;
  salesCount: number;
  viewsCount: number;
  rating: number;
  highCommission?: boolean;
  trending?: boolean;
  imageUrl: string;
  affiliateUrl: string;
  proofGoal: ProofGoal;
  reasons: string[];
  facts: string[];
};

export const ZAALYS_CATEGORIES = [
  { key: null, label: "Top Produtos" },
  { key: "beleza", label: "Beleza e cuidados" },
  { key: "cozinha", label: "Utensílios de cozinha" },
  { key: "bolsas", label: "Malas e bolsas" },
  { key: "sapatos", label: "Sapatos" },
  { key: "casa", label: "Suprimentos domésticos" },
  { key: "texteis", label: "Têxteis e móveis" },
  { key: "esportes", label: "Esportes e ar livre" },
  { key: "eletronicos", label: "Eletrônicos" },
];

export const ZAALYS_PRODUCTS: ZaalysProduct[] = [
  {
    id: 101,
    title: "Escova Alisadora 5 em 1 Bivolt com Revestimento Cerâmico e Íons Negativos",
    category: "Beleza e cuidados",
    categoryKey: "beleza",
    priceCents: 8990,
    commissionPct: 22,
    earningCents: 1978,
    salesCount: 4820,
    viewsCount: 912000,
    rating: 4.9,
    highCommission: true,
    trending: true,
    imageUrl: "/media/central-produtos.webp",
    affiliateUrl: "https://www.tiktok.com/",
    proofGoal: "use",
    reasons: [
      "Comissão subiu de 14% para 22% nesta leitura e mantém conversão alta em vídeos de 15s.",
      "Demonstração visual imediata (mecha antes e depois em 4 segundos).",
    ],
    facts: [
      "5 níveis de temperatura (130°C a 200°C) com aquecimento PTC em 30 segundos",
      "Bivolt automático (110V/220V) e cabo giratório 360°",
      "Dentes antiescaldantes que protegem o couro cabeludo",
    ],
  },
  {
    id: 102,
    title: "HILEE Garrafa Térmica Inox 591ml com Isolamento a Vácuo e Canudo Antivazamento",
    category: "Utensílios de cozinha",
    categoryKey: "cozinha",
    priceCents: 6490,
    commissionPct: 18,
    earningCents: 1168,
    salesCount: 6340,
    viewsCount: 1240000,
    rating: 4.8,
    highCommission: true,
    trending: true,
    imageUrl: "https://s.500fd.com/tt_video/o8JfGAG62FeetAXXtJAcwMTIA63LIRqfGQAA1i~tplv-photomode-zoomcover:480:480.jpeg",
    affiliateUrl: "https://www.tiktok.com/@talitasaadshop/video/7689603617950584085",
    proofGoal: "details",
    reasons: [
      "Teste do gelo e vedação gera retenção acima de 68% nos 3 primeiros segundos.",
      "Ticket acessível com recompra para presente e academia.",
    ],
    facts: [
      "Aço inoxidável 304 parede dupla com isolamento térmico a vácuo",
      "Conserva bebidas geladas por até 24h e quentes por até 12h",
      "Tampa com trava antivazamento e bico de silicone retrátil",
    ],
  },
  {
    id: 103,
    title: "JAMI JAMI Bolsa Feminina Grande PU Premium Minimalista Versátil TM9034",
    category: "Malas e bolsas",
    categoryKey: "bolsas",
    priceCents: 11990,
    commissionPct: 20,
    earningCents: 2398,
    salesCount: 3190,
    viewsCount: 580000,
    rating: 4.9,
    highCommission: true,
    trending: true,
    imageUrl: "https://s.500fd.com/tt_video/oMIDquC4xdusEBe5usCBuPjAEiUM6D0IagfFRw~tplv-photomode-zoomcover:480:480.avif",
    affiliateUrl: "https://www.tiktok.com/@nadir.albuquerque/video/7690671131640057095",
    proofGoal: "contents",
    reasons: [
      "Ganho de R$ 23,98 por venda confirmada — top 5 da categoria Malas e bolsas.",
      "Vídeos mostrando notebook, necessaire e garrafa cabendo dentro convertem no ato.",
    ],
    facts: [
      "Couro PU macio resistente a respingos com costura reforçada",
      "Comporta notebook de até 15,6 polegadas + divisória interna com zíper",
      "Alça de ombro confortável e fechamento magnético + zíper central",
    ],
  },
  {
    id: 104,
    title: "Espeto Giratório Churrasco Flex Elétrico Soft Grill Inox com Cabo Térmico",
    category: "Utensílios de cozinha",
    categoryKey: "cozinha",
    priceCents: 13490,
    commissionPct: 19,
    earningCents: 2563,
    salesCount: 2890,
    viewsCount: 690000,
    rating: 4.8,
    highCommission: true,
    trending: false,
    imageUrl: "https://s.500fd.com/tt_video/oEABYKqI6oiBqBxrgecCqfiLiEAR2Bu52RpArI~tplv-photomode-zoomcover:480:480.jpeg",
    affiliateUrl: "https://www.tiktok.com/@achotop/video/7690638229908753684",
    proofGoal: "use",
    reasons: [
      "Comissão de R$ 25,63 por unidade vendida e forte apelo de presente.",
      "Demonstração do giro automático na churrasqueira prende atenção.",
    ],
    facts: [
      "Haste em aço inox ajustável para diferentes tamanhos de churrasqueira",
      "Motor silencioso no cabo com chave liga/desliga e cabo removível",
      "Suporta até 5 kg de carne assando de forma uniforme",
    ],
  },
  {
    id: 105,
    title: "Coberdrom Queen Com Sherpa Lã de Carneiro Dupla Face Macio e Quente",
    category: "Têxteis e móveis",
    categoryKey: "texteis",
    priceCents: 14990,
    commissionPct: 18,
    earningCents: 2698,
    salesCount: 4120,
    viewsCount: 830000,
    rating: 4.9,
    highCommission: true,
    trending: true,
    imageUrl: "https://s.500fd.com/tt_video/oIRBBFBmBVgfyhuRGqSGAfc5WqIEIcZJDcwTEg~tplv-photomode-zoomcover:480:480.jpeg",
    affiliateUrl: "https://www.tiktok.com/@jcdocuras5/video/7690389336658857236",
    proofGoal: "details",
    reasons: [
      "Maior comissão líquida por venda na categoria Casa & Têxteis (R$ 26,98).",
      "Close na textura Sherpa + volume na cama gera alto desejo imediato.",
    ],
    facts: [
      "Tamanho Queen 2,40m x 2,20m com acabamento matelado",
      "Dupla face: toque aveludado fleece de um lado e Sherpa lã de carneiro do outro",
      "Enchimento siliconado que não embola na lavagem",
    ],
  },
  {
    id: 106,
    title: "Chinelo Rasteirinha Anatômica Leve Sandlux Ortopédica Antiderrapante",
    category: "Sapatos",
    categoryKey: "sapatos",
    priceCents: 5990,
    commissionPct: 20,
    earningCents: 1198,
    salesCount: 7450,
    viewsCount: 1420000,
    rating: 4.8,
    highCommission: true,
    trending: true,
    imageUrl: "https://s.500fd.com/tt_video/oAaEsfFw7gmRDebQCtiEAQBcwBuFQvMDqp8b91~tplv-photomode-zoomcover:480:480.avif",
    affiliateUrl: "https://www.tiktok.com/@mai80038/video/7690002759554288903",
    proofGoal: "fit",
    reasons: [
      "Dor clara (esporão e dor na planta do pé) + demonstração de maciez.",
      "Altíssimo giro diário em lives infinitas e vídeos curtos.",
    ],
    facts: [
      "Palmilha anatômica em EVA de alta absorção de impacto",
      "Solado antiderrapante leve com elevação suave no calcanhar",
      "Numeração do 34 ao 40 com forma padrão brasileira",
    ],
  },
  {
    id: 107,
    title: "Percarbonato de Sódio 100% Puro Tira Manchas AlvejaPro Até 5kg Original",
    category: "Suprimentos domésticos",
    categoryKey: "casa",
    priceCents: 7490,
    commissionPct: 17,
    earningCents: 1273,
    salesCount: 5390,
    viewsCount: 910000,
    rating: 4.9,
    highCommission: false,
    trending: true,
    imageUrl: "https://s.500fd.com/tt_video/o8AX7fjlBICdt32tAViAKXI2gBPL1AAEiRwwCW~tplv-photomode-zoomcover:480:480.jpeg",
    affiliateUrl: "https://www.tiktok.com/@laissossai/video/7689876386592345351",
    proofGoal: "use",
    reasons: [
      "Demonstração química (espuma ativa tirando mancha em água morna) prende do início ao fim.",
      "Alta taxa de comentários pedindo a medida certa.",
    ],
    facts: [
      "Oxigênio ativo sem cloro: alveja brancos e preserva roupas coloridas",
      "Rende dezenas de lavagens na máquina ou no molho com água morna",
      "Elimina odores de toalhas, roupas de cama e panos de prato",
    ],
  },
  {
    id: 108,
    title: "Mochila Feminina de Viagem Impermeável Expansível com Compartimento para Sapatos",
    category: "Malas e bolsas",
    categoryKey: "bolsas",
    priceCents: 10990,
    commissionPct: 21,
    earningCents: 2308,
    salesCount: 3880,
    viewsCount: 740000,
    rating: 4.9,
    highCommission: true,
    trending: true,
    imageUrl: "https://s.500fd.com/tt_video/ogEt4vBEYhYIKyk6VA8ioiPctUBaVrAHB2AUQ~tplv-photomode-zoomcover:480:480.jpeg",
    affiliateUrl: "https://www.tiktok.com/@marianasauma/video/7689968476319993089",
    proofGoal: "contents",
    reasons: [
      "Abre 180° como mala de bordo e passa sem taxa extra em voos.",
      "Comissão subiu de 16% para 21% na última leitura.",
    ],
    facts: [
      "Medidas compatíveis com bagagem de mão gratuita (ANAC)",
      "Bolso impermeável separado para roupas úmidas + compartimento inferior para calçados",
      "Saída USB externa e bolso antifurto nas costas",
    ],
  },
];

export type ZaalysChange = {
  id: string;
  field: "commissionPct" | "priceCents";
  tone: "good" | "bad";
  from: number;
  to: number;
  observedAt: string;
  product: {
    id: number;
    title: string;
    category: string;
    imageUrl: string;
    affiliateUrl: string;
  };
  earnings?: {
    before: number;
    after: number;
  };
};

export const ZAALYS_CHANGES: ZaalysChange[] = [
  {
    id: "chg-1",
    field: "commissionPct",
    tone: "good",
    from: 14,
    to: 22,
    observedAt: "2026-10-22T08:40:00.000Z",
    product: {
      id: 101,
      title: "Escova Alisadora 5 em 1 Bivolt com Revestimento Cerâmico e Íons Negativos",
      category: "Beleza e cuidados",
      imageUrl: "/media/central-produtos.webp",
      affiliateUrl: "https://www.tiktok.com/",
    },
    earnings: { before: 1259, after: 1978 },
  },
  {
    id: "chg-2",
    field: "commissionPct",
    tone: "good",
    from: 16,
    to: 21,
    observedAt: "2026-10-22T07:15:00.000Z",
    product: {
      id: 108,
      title: "Mochila Feminina de Viagem Impermeável Expansível com Compartimento para Sapatos",
      category: "Malas e bolsas",
      imageUrl: "https://s.500fd.com/tt_video/ogEt4vBEYhYIKyk6VA8ioiPctUBaVrAHB2AUQ~tplv-photomode-zoomcover:480:480.jpeg",
      affiliateUrl: "https://www.tiktok.com/@marianasauma/video/7689968476319993089",
    },
    earnings: { before: 1758, after: 2308 },
  },
  {
    id: "chg-3",
    field: "priceCents",
    tone: "good",
    from: 7990,
    to: 6490,
    observedAt: "2026-10-22T05:50:00.000Z",
    product: {
      id: 102,
      title: "HILEE Garrafa Térmica Inox 591ml com Isolamento a Vácuo e Canudo Antivazamento",
      category: "Utensílios de cozinha",
      imageUrl: "https://s.500fd.com/tt_video/o8JfGAG62FeetAXXtJAcwMTIA63LIRqfGQAA1i~tplv-photomode-zoomcover:480:480.jpeg",
      affiliateUrl: "https://www.tiktok.com/@talitasaadshop/video/7689603617950584085",
    },
    earnings: { before: 1438, after: 1168 },
  },
  {
    id: "chg-4",
    field: "commissionPct",
    tone: "bad",
    from: 20,
    to: 11,
    observedAt: "2026-10-21T22:10:00.000Z",
    product: {
      id: 109,
      title: "Mini Processador Triturador de Alimentos Elétrico USB Recarregável 250ml",
      category: "Utensílios de cozinha",
      imageUrl: "https://s.500fd.com/tt_video/oMPGD5e19RVQ8FBBueM7NIrgAa27QcWADmsfqf~tplv-photomode-zoomcover:480:480.jpeg",
      affiliateUrl: "https://www.tiktok.com/",
    },
    earnings: { before: 798, after: 439 },
  },
  {
    id: "chg-5",
    field: "commissionPct",
    tone: "good",
    from: 15,
    to: 20,
    observedAt: "2026-10-21T18:30:00.000Z",
    product: {
      id: 103,
      title: "JAMI JAMI Bolsa Feminina Grande PU Premium Minimalista Versátil TM9034",
      category: "Malas e bolsas",
      imageUrl: "https://s.500fd.com/tt_video/oMIDquC4xdusEBe5usCBuPjAEiUM6D0IagfFRw~tplv-photomode-zoomcover:480:480.avif",
      affiliateUrl: "https://www.tiktok.com/@nadir.albuquerque/video/7690671131640057095",
    },
    earnings: { before: 1798, after: 2398 },
  },
  {
    id: "chg-6",
    field: "priceCents",
    tone: "bad",
    from: 8990,
    to: 11490,
    observedAt: "2026-10-21T14:20:00.000Z",
    product: {
      id: 110,
      title: "Fone de Ouvido Bluetooth 5.3 TWS com Cancelamento de Ruído e Display LED",
      category: "Eletrônicos",
      imageUrl: "/media/central-radar.webp",
      affiliateUrl: "https://www.tiktok.com/",
    },
    earnings: { before: 1348, after: 1149 },
  },
];

export type ZaalysModel = {
  id: string;
  name: string;
  style: string;
  image: string;
  appearance: string;
};

export const ZAALYS_MODELS: ZaalysModel[] = [
  {
    id: "bia-costa",
    name: "Bia Costa",
    style: "UGC · Casa & Beleza",
    image: "/media/models/bia-costa.jpg",
    appearance: "Mulher brasileira de 26 anos, cabelo castanho ondulado na altura dos ombros, pele morena clara natural, sorriso espontâneo, camiseta canelada off-white, iluminação natural de janela.",
  },
  {
    id: "camila-souza",
    name: "Camila Souza",
    style: "Moda & Rotina",
    image: "/media/models/camila-souza.jpg",
    appearance: "Mulher brasileira de 24 anos, cabelo longo escuro liso, olhos castanhos expressivos, argolas douradas discretas, blusa de linho bege, quarto claro minimalista.",
  },
  {
    id: "duda-ferreira",
    name: "Duda Ferreira",
    style: "Skincare & Glow",
    image: "/media/models/duda-ferreira.jpg",
    appearance: "Jovem brasileira de 22 anos, cabelo preso em coque despojado, pele iluminada com sardas suaves, roupão branco macio em banheiro moderno com luz quente.",
  },
  {
    id: "julia-santos",
    name: "Julia Santos",
    style: "Review Sincero",
    image: "/media/models/julia-santos.jpg",
    appearance: "Mulher brasileira de 29 anos, cabelo cacheado volumoso bem definido, óculos de armação fina opcional, moletom cinza mescla confortável, sala aconchegante.",
  },
  {
    id: "larissa-oliveira",
    name: "Larissa Oliveira",
    style: "Fitness & Lifestyle",
    image: "/media/models/larissa-oliveira.jpg",
    appearance: "Mulher brasileira de 27 anos, rabo de cavalo alto, top esportivo verde-oliva, expressão confiante e energética, luz matinal.",
  },
  {
    id: "lucas-mendes",
    name: "Lucas Mendes",
    style: "Tech & Setup",
    image: "/media/models/lucas-mendes.jpg",
    appearance: "Homem brasileiro de 28 anos, cabelo curto degradê, barba curta alinhada, camiseta preta básica premium, fundo de escritório moderno com luz indireta.",
  },
  {
    id: "mariana-lima",
    name: "Mariana Lima",
    style: "Cozinha & Praticidade",
    image: "/media/models/mariana-lima.jpg",
    appearance: "Mulher brasileira de 32 anos, cabelo castanho médio, camisa clara dobrada nos cotovelos, bancada de cozinha limpa e iluminada.",
  },
  {
    id: "pedro-alves",
    name: "Pedro Alves",
    style: "Churrasco & Casa",
    image: "/media/models/pedro-alves.jpg",
    appearance: "Homem brasileiro de 34 anos, barba bem cuidada, camisa polo escura, área gourmet iluminada, tom direto e confiável.",
  },
  {
    id: "rafael-costa",
    name: "Rafael Costa",
    style: "Esporte & Suplementos",
    image: "/media/models/rafael-costa.jpg",
    appearance: "Homem brasileiro de 25 anos, atlético, camiseta dry-fit grafite, cozinha ou academia moderna, fala dinâmica.",
  },
  {
    id: "thiago-rocha",
    name: "Thiago Rocha",
    style: "Achadinhos & Ofertas",
    image: "/media/models/thiago-rocha.jpg",
    appearance: "Homem brasileiro de 30 anos, expressão carismática, camisa casual sobre camiseta branca, sala iluminada.",
  },
];

export type ZaalysTemplate = {
  id: string;
  title: string;
  format: string;
  formatLabel: string;
  video: string;
  poster: string;
  needsModel: boolean;
  proofGoals: ProofGoal[];
  categories: string[];
  description: string;
};

export const ZAALYS_TEMPLATES: ZaalysTemplate[] = [
  {
    id: "tpl-hands-unboxing",
    title: "Mãos na bancada · Detalhe e textura",
    format: "hands",
    formatLabel: "Só as mãos",
    video: "/media/templates/01-hands.mp4",
    poster: "/media/templates/01-hands.jpg",
    needsModel: false,
    proofGoals: ["details", "contents", "use"],
    categories: ["Beleza e cuidados", "Utensílios de cozinha", "Malas e bolsas"],
    description: "Foco total no produto na mão, sem precisar escolher modelo. Ideal para mostrar acabamento, trava e textura.",
  },
  {
    id: "tpl-creator-hook",
    title: "Creator na câmera · Gancho + Prova em 8s",
    format: "ugc",
    formatLabel: "UGC Creator",
    video: "/media/templates/02-creator.mp4",
    poster: "/media/templates/02-creator.jpg",
    needsModel: true,
    proofGoals: ["use", "details", "fit"],
    categories: ["Beleza e cuidados", "Moda e acessórios", "Sapatos"],
    description: "O influencer de IA segura o produto nos primeiros 2 segundos, responde à principal dúvida e chama para a sacola.",
  },
  {
    id: "tpl-flow-demo",
    title: "Demonstração em uso · Antes e Depois",
    format: "demo",
    formatLabel: "Demonstração",
    video: "/media/templates/03-flow.mp4",
    poster: "/media/templates/03-flow.jpg",
    needsModel: true,
    proofGoals: ["use", "details", "contents"],
    categories: ["Utensílios de cozinha", "Suprimentos domésticos", "Têxteis e móveis"],
    description: "Mostra o problema real sendo resolvido em cena contínua com iluminação realista de celular.",
  },
  {
    id: "tpl-publish-viral",
    title: "Review de Recebido · O que vem na caixa",
    format: "review",
    formatLabel: "Review Viral",
    video: "/media/templates/04-publish.mp4",
    poster: "/media/templates/04-publish.jpg",
    needsModel: true,
    proofGoals: ["contents", "fit", "details"],
    categories: ["Malas e bolsas", "Sapatos", "Eletrônicos"],
    description: "Ritmo de achadinho recém-chegado do TikTok Shop: mostra tamanho real, divisórias e custo-benefício.",
  },
];

export type FastMossVideo = {
  id: string;
  title: string;
  creator: string;
  category: string;
  thumbnail: string;
  source: string;
  sourceUrl: string;
  tiktokUrl: string;
  views: number;
  sales: number;
  hook: string;
  structure: { stage: string; time: string; whatHappens: string }[];
  takeaways: string[];
};

export const FASTMOSS_VIDEOS: FastMossVideo[] = [
  {
    id: "7689591658052095250",
    title: "Sandália Feminina Confortável Anatômica Leve para Dia a Dia",
    creator: "jaqueamann1",
    category: "Sapatos",
    thumbnail: "https://s.500fd.com/tt_video/oAaEsfFw7gmRDebQCtiEAQBcwBuFQvMDqp8b91~tplv-photomode-zoomcover:480:480.avif",
    source: "FastMoss",
    sourceUrl: "https://www.fastmoss.com/pt/media-source/video/7689591658052095250",
    tiktokUrl: "https://www.tiktok.com/@jaqueamann1/video/7689591658052095250",
    views: 52600,
    sales: 142,
    hook: "Se você termina o dia com o calcanhar latejando, olha a espessura dessa palmilha antes de comprar qualquer outra.",
    structure: [
      { stage: "Gancho (0–2s)", time: "0:00–0:02", whatHappens: "Aperta a palmilha com o polegar em close mostrando o retorno macio do EVA." },
      { stage: "Prova (2–6s)", time: "0:02–0:06", whatHappens: "Calça no pé mostrando que não aperta na lateral e o solado não escorrega no piso." },
      { stage: "Chamada (6–8s)", time: "0:06–0:08", whatHappens: "Mostra as cores disponíveis e aponta para o carrinho laranja com frete grátis." },
    ],
    takeaways: [
      "Comece apertando ou dobrando o produto nos primeiros 1,5s sem introdução.",
      "Fale da dor específica (esporão / ficar em pé o dia todo) antes de falar o preço.",
    ],
  },
  {
    id: "7689574497564855573",
    title: "Biquíni Feminino Preto Cortininha com Amarração Lateral, Miçangas e Pingentes de Concha Moda Praia",
    creator: "Isa Fischer",
    category: "Esportes e atividades ao ar livre",
    thumbnail: "https://s.500fd.com/tt_video/o4eVp7jKIbGbf2OIG2LblIR3DLOUIACeatF49A~tplv-photomode-zoomcover:480:480.jpeg",
    source: "FastMoss",
    sourceUrl: "https://www.fastmoss.com/pt/media-source/video/7689574497564855573",
    tiktokUrl: "https://www.tiktok.com/@itsdivasdiary/video/7689574497564855573",
    views: 723900,
    sales: 130,
    hook: "Achar um biquíni preto que tenha forro duplo de verdade e esses detalhes em concha por esse preço no TikTok Shop foi sorte grande.",
    structure: [
      { stage: "Gancho (0–2s)", time: "0:00–0:02", whatHappens: "Mostra o detalhe das miçangas e conchas contra a luz natural." },
      { stage: "Prova (2–6s)", time: "0:02–0:06", whatHappens: "Estica o tecido mostrando que o forro não fica transparente e a regulagem lateral." },
      { stage: "Chamada (6–8s)", time: "0:06–0:08", whatHappens: "Indica qual tamanho pegou (M) para reduzir dúvida nos comentários." },
    ],
    takeaways: [
      "Em moda, dizer sua altura/tamanho logo no meio do vídeo dobra a conversão.",
      "Close no acabamento (costura e pingentes) remove a objeção de produto barato.",
    ],
  },
  {
    id: "7690638229908753684",
    title: "Espeto Giratório Churrasco Flex Elétrico Soft Grill Presente",
    creator: "Acho Top",
    category: "Utensílios de cozinha",
    thumbnail: "https://s.500fd.com/tt_video/oEABYKqI6oiBqBxrgecCqfiLiEAR2Bu52RpArI~tplv-photomode-zoomcover:480:480.jpeg",
    source: "FastMoss",
    sourceUrl: "https://www.fastmoss.com/pt/media-source/video/7690638229908753684",
    tiktokUrl: "https://www.tiktok.com/@achotop/video/7690638229908753684",
    views: 105500,
    sales: 127,
    hook: "Esqueceu a carne na churrasqueira e queimou um lado? Esse espeto gira sozinho e assa por igual sem você ficar vigiando.",
    structure: [
      { stage: "Gancho (0–2s)", time: "0:00–0:02", whatHappens: "Close da picanha girando sozinha na brasa com som real." },
      { stage: "Prova (2–6s)", time: "0:02–0:06", whatHappens: "Mostra a regulagem de tamanho da haste encaixando na churrasqueira e o botão no cabo." },
      { stage: "Chamada (6–8s)", time: "0:06–0:08", whatHappens: "Corta a carne suculenta no ponto e aponta para o link da sacola." },
    ],
    takeaways: [
      "Som ambiente + movimento contínuo nos primeiros 2 segundos segura o público masculino.",
      "Posicionamento como presente certeiro aumenta vendas no impulso.",
    ],
  },
  {
    id: "7689614339409497350",
    title: "Kit Cobre Leito Pratic 3 Peças - Cores Variadas",
    creator: "Tudo pra Casa",
    category: "Têxteis e móveis",
    thumbnail: "https://s.500fd.com/tt_video/o0QRtfGRBGA85A9teqrAXBQOQFW6If2MfBCFJF~tplv-photomode-zoomcover:480:480.jpeg",
    source: "FastMoss",
    sourceUrl: "https://www.fastmoss.com/pt/media-source/video/7689614339409497350",
    tiktokUrl: "https://www.tiktok.com/@lumi.oficial6/video/7689614339409497350",
    views: 47700,
    sales: 118,
    hook: "Trocar o cobre-leito muda a cara do quarto inteiro em 30 segundos — e esse kit de 3 peças saiu pelo preço de uma fronha.",
    structure: [
      { stage: "Gancho (0–2s)", time: "0:00–0:02", whatHappens: "Joga o cobre-leito aberto sobre a cama fazendo onda de ar." },
      { stage: "Prova (2–6s)", time: "0:02–0:06", whatHappens: "Mostra o caimento nas laterais da cama casal/queen e os 2 porta-travesseiros." },
      { stage: "Chamada (6–8s)", time: "0:06–0:08", whatHappens: "Mostra as cores ainda em estoque na sacolinha." },
    ],
    takeaways: [
      "Movimento amplo (estender na cama) nos primeiros 2 segundos cria satisfação visual.",
      "Destaque quantas peças vêm no pacote.",
    ],
  },
  {
    id: "7689603617950584085",
    title: "HILEE Garrafa Térmica Inox 350ml/591ml com Isolamento a Vácuo, Antivazamento, Ideal para Café, Viagem e Uso Diário",
    creator: "talitasaadshop",
    category: "Utensílios de cozinha",
    thumbnail: "https://s.500fd.com/tt_video/o8JfGAG62FeetAXXtJAcwMTIA63LIRqfGQAA1i~tplv-photomode-zoomcover:480:480.jpeg",
    source: "FastMoss",
    sourceUrl: "https://www.fastmoss.com/pt/media-source/video/7689603617950584085",
    tiktokUrl: "https://www.tiktok.com/@talitasaadshop/video/7689603617950584085",
    views: 70500,
    sales: 113,
    hook: "Virei minha garrafa cheia dentro da bolsa com o notebook só pra provar que essa trava da Hilee não pinga uma gota.",
    structure: [
      { stage: "Gancho (0–2s)", time: "0:00–0:02", whatHappens: "Sacode a garrafa de cabeça para baixo em cima da bolsa aberta." },
      { stage: "Prova (2–6s)", time: "0:02–0:06", whatHappens: "Abre com um clique só usando uma mão e mostra o gelo intacto dentro." },
      { stage: "Chamada (6–8s)", time: "0:06–0:08", whatHappens: "Mostra os dois tamanhos (350ml e 591ml) no link abaixo." },
    ],
    takeaways: [
      "Teste de risco real (virar de cabeça para baixo) gera tensão e retenção altíssima.",
    ],
  },
  {
    id: "7690671131640057095",
    title: "JAMI JAMI Bolsa Feminina Grande | Material PU Premium e Leve | Estilo Minimalista Versátil TM9034",
    creator: "Nadir Albuquerque",
    category: "Malas e bolsas",
    thumbnail: "https://s.500fd.com/tt_video/oMIDquC4xdusEBe5usCBuPjAEiUM6D0IagfFRw~tplv-photomode-zoomcover:480:480.avif",
    source: "FastMoss",
    sourceUrl: "https://www.fastmoss.com/pt/media-source/video/7690671131640057095",
    tiktokUrl: "https://www.tiktok.com/@nadir.albuquerque/video/7690671131640057095",
    views: 29500,
    sales: 112,
    hook: "Cabe notebook, marmita, necessaire e guarda-chuva sem ficar com cara de sacola — olha por dentro dessa bolsa.",
    structure: [
      { stage: "Gancho (0–2s)", time: "0:00–0:02", whatHappens: "Coloca a bolsa no ombro e abre o zíper principal mostrando o espaço interno." },
      { stage: "Prova (2–6s)", time: "0:02–0:06", whatHappens: "Guarda 5 itens grandes um por um mostrando que ainda sobra espaço e mantém o formato." },
      { stage: "Chamada (6–8s)", time: "0:06–0:08", whatHappens: "Mostra a textura do PU de perto e avisa do cupom no carrinho." },
    ],
    takeaways: [
      "Para bolsas grandes, o teste de capacidade (colocar objetos reais) vende mais que desfile.",
    ],
  },
  {
    id: "7689876386592345351",
    title: "Percarbonato de Sódio 100% Puro tira manchas - Produto Original - AlvejaPro - Até 5kg",
    creator: "Laís",
    category: "Suprimentos domésticos",
    thumbnail: "https://s.500fd.com/tt_video/o8AX7fjlBICdt32tAViAKXI2gBPL1AAEiRwwCW~tplv-photomode-zoomcover:480:480.jpeg",
    source: "FastMoss",
    sourceUrl: "https://www.fastmoss.com/pt/media-source/video/7689876386592345351",
    tiktokUrl: "https://www.tiktok.com/@laissossai/video/7689876386592345351",
    views: 19100,
    sales: 95,
    hook: "Pano de prato encardido que nem água sanitária salvava: 1 medida disso na água morna e olha a cor da água que saiu.",
    structure: [
      { stage: "Gancho (0–2s)", time: "0:00–0:02", whatHappens: "Coloca a colher de percarbonato na água morna e a espuma sobe imediatamente." },
      { stage: "Prova (2–6s)", time: "0:02–0:06", whatHappens: "Tira o pano branco limpo sem esfregar e compara com o estado anterior." },
      { stage: "Chamada (6–8s)", time: "0:06–0:08", whatHappens: "Mostra o balde de 5kg que dura meses na sacola laranja." },
    ],
    takeaways: [
      "Reação física/espuma nos primeiros 2 segundos hipnotiza o feed.",
    ],
  },
  {
    id: "7689968476319993089",
    title: "Romantic Crown Mochila Feminina de Viagem com Compartimento para Sapatos, Impermeável e Expansível",
    creator: "amarianasauma",
    category: "Malas e bolsas",
    thumbnail: "https://s.500fd.com/tt_video/ogEt4vBEYhYIKyk6VA8ioiPctUBaVrAHB2AUQ~tplv-photomode-zoomcover:480:480.jpeg",
    source: "FastMoss",
    sourceUrl: "https://www.fastmoss.com/pt/media-source/video/7689968476319993089",
    tiktokUrl: "https://www.tiktok.com/@marianasauma/video/7689968476319993089",
    views: 47300,
    sales: 98,
    hook: "Viajei 4 dias levando só essa mochila que abre igual mala e não paguei 1 real de despacho.",
    structure: [
      { stage: "Gancho (0–2s)", time: "0:00–0:02", whatHappens: "Abre o zíper 180 graus mostrando as roupas organizadas como numa mala." },
      { stage: "Prova (2–6s)", time: "0:02–0:06", whatHappens: "Mostra o compartimento de tênis embaixo e o bolso impermeável." },
      { stage: "Chamada (6–8s)", time: "0:06–0:08", whatHappens: "Fecha o zíper expansor e mostra nas costas." },
    ],
    takeaways: [
      "Associar o produto a economia imediata (não pagar bagagem) justifica o valor na hora.",
    ],
  },
];

export type TrendFormat = {
  id: string;
  title: string;
  desc: string;
  castLabel: string;
  cover: string;
  preview?: string;
  characters: { id: string; name: string; role: string; image: string }[];
};

export const TREND_FORMATS: TrendFormat[] = [
  {
    id: "street-interview",
    title: "Entrevista de Rua Viral",
    desc: "Repórter aborda personagem na rua com pergunta provocativa que termina revelando o produto.",
    castLabel: "Entrevistado",
    cover: "/media/central-trend.webp",
    preview: "/media/templates/02-creator.mp4",
    characters: [
      { id: "c1", name: "Dona Cida Sincera", role: "Aposentada sem filtro", image: "/media/models/mariana-lima.jpg" },
      { id: "c2", name: "Bia do Achadinho", role: "Viciada em TikTok Shop", image: "/media/models/bia-costa.jpg" },
      { id: "c3", name: "Lucas Cético", role: "Só acredita testando", image: "/media/models/lucas-mendes.jpg" },
    ],
  },
  {
    id: "podcast-cut",
    title: "Corte de Podcast Revelação",
    desc: "Host e convidado em estúdio escuro contam o 'segredo' por trás do produto como se fosse confidencial.",
    castLabel: "Convidado do Podcast",
    cover: "/media/central-templates.webp",
    preview: "/media/templates/03-flow.mp4",
    characters: [
      { id: "c4", name: "Thiago Estrategista", role: "Especialista de bancada", image: "/media/models/thiago-rocha.jpg" },
      { id: "c5", name: "Camila Estética", role: "Criadora de beleza", image: "/media/models/camila-souza.jpg" },
      { id: "c6", name: "Pedro Mestre", role: "Veterano de casa & brasa", image: "/media/models/pedro-alves.jpg" },
    ],
  },
  {
    id: "pov-absurd",
    title: "POV Humorado / Plot Twist",
    desc: "Situação exagerada do cotidiano resolvida em 8 segundos pelo produto com humor brasileiro.",
    castLabel: "Protagonista",
    cover: "/media/central-raiox.webp",
    preview: "/media/templates/04-publish.mp4",
    characters: [
      { id: "c7", name: "Julia Exausta", role: "Humor de rotina real", image: "/media/models/julia-santos.jpg" },
      { id: "c8", name: "Rafael Fitness", role: "Intenso demais", image: "/media/models/rafael-costa.jpg" },
      { id: "c9", name: "Duda Drama", role: "Reação cinematográfica", image: "/media/models/duda-ferreira.jpg" },
    ],
  },
];

export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function compactNumber(n: number): string {
  return new Intl.NumberFormat("pt-BR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}
