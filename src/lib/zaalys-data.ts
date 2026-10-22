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
  lastChange?: {
    field: "commissionPct" | "priceCents";
    tone: "good" | "bad";
    from: number;
    to: number;
  };
};

export const ZAALYS_CATEGORIES = [
  { key: null, label: "Top Produtos" },
  { key: "beleza", label: "Beleza e cuidados" },
  { key: "cozinha", label: "Casa e cozinha" },
  { key: "moda", label: "Moda e acessórios" },
  { key: "eletronicos", label: "Eletrônicos" },
  { key: "saude", label: "Saúde e bem-estar" },
  { key: "esporte", label: "Esporte e lazer" },
  { key: "pets", label: "Pets" },
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
    imageUrl: "https://s.500fd.com/tt_video/oYAcAVwdeACRKdGpIjexGngAULjxQcNesoIgD0~tplv-photomode-zoomcover:480:480.jpeg",
    affiliateUrl: "https://www.tiktok.com/@patriciaramosss1/video/7690038225196289301",
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
    lastChange: { field: "commissionPct", tone: "good", from: 14, to: 22 },
  },
  {
    id: 102,
    title: "HILEE Garrafa Térmica Inox 591ml com Isolamento a Vácuo e Canudo Antivazamento",
    category: "Casa e cozinha",
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
    lastChange: { field: "priceCents", tone: "good", from: 7990, to: 6490 },
  },
  {
    id: 103,
    title: "JAMI JAMI Bolsa Feminina Grande PU Premium Minimalista Versátil TM9034",
    category: "Moda e acessórios",
    categoryKey: "moda",
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
      "Ganho de R$ 23,98 por venda confirmada — top 5 da categoria Moda e acessórios.",
      "Vídeos mostrando notebook, necessaire e garrafa cabendo dentro convertem no ato.",
    ],
    facts: [
      "Couro PU macio resistente a respingos com costura reforçada",
      "Comporta notebook de até 15,6 polegadas + divisória interna com zíper",
      "Alça de ombro confortável e fechamento magnético + zíper central",
    ],
    lastChange: { field: "commissionPct", tone: "good", from: 15, to: 20 },
  },
  {
    id: 104,
    title: "Espeto Giratório Churrasco Flex Elétrico Soft Grill Inox com Cabo Térmico",
    category: "Casa e cozinha",
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
    category: "Casa e cozinha",
    categoryKey: "cozinha",
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
    category: "Moda e acessórios",
    categoryKey: "moda",
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
    category: "Casa e cozinha",
    categoryKey: "cozinha",
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
    category: "Moda e acessórios",
    categoryKey: "moda",
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
    lastChange: { field: "commissionPct", tone: "good", from: 16, to: 21 },
  },
  {
    id: 109,
    title: "Travesseiro Cervical ABRANUV PRO2.0 Espuma de Memória Ergonômico Ortopédico",
    category: "Saúde e bem-estar",
    categoryKey: "saude",
    priceCents: 11890,
    commissionPct: 19,
    earningCents: 2259,
    salesCount: 2940,
    viewsCount: 615000,
    rating: 4.9,
    highCommission: true,
    trending: true,
    imageUrl: "https://s.500fd.com/tt_video/oYwtdiHY1AIV9qfyABA9GQnXiCnIqIvISCtG4b~tplv-photomode-zoomcover:480:480.avif",
    affiliateUrl: "https://www.tiktok.com/@maritips_/video/7690165704250756360",
    proofGoal: "details",
    reasons: [
      "Ticket médio acima de R$ 110 com comissão de R$ 22,59 por venda.",
      "Demonstração do encaixe do pescoço e retorno lento da espuma converte público 30+.",
    ],
    facts: [
      "Espuma viscoelástica de memória de alta densidade sem odor",
      "Design anatômico com cavidade central e apoio lateral para ombro",
      "Capa respirável removível e lavável com zíper oculto",
    ],
  },
  {
    id: 110,
    title: "Kit 2 Calças Legging Canelada Poliamida Sem Costura Cintura Alta Zero Transparência",
    category: "Esporte e lazer",
    categoryKey: "esporte",
    priceCents: 9490,
    commissionPct: 20,
    earningCents: 1898,
    salesCount: 5120,
    viewsCount: 980000,
    rating: 4.8,
    highCommission: true,
    trending: true,
    imageUrl: "https://s.500fd.com/tt_video/oMOXBf4OCixuIIKTIC1wiA54IHIBAvE9SAbd7C~tplv-photomode-zoomcover:480:480.jpeg",
    affiliateUrl: "https://www.tiktok.com/@amandaxavieer/video/7689940821394607368",
    proofGoal: "fit",
    reasons: [
      "Teste de agachamento contra a luz resolve a principal objeção de compra em 3 segundos.",
      "Kit com 2 peças eleva o ticket e a comissão por pedido.",
    ],
    facts: [
      "Tecido canelado em poliamida de alta gramatura com toque gelado",
      "Cós alto anatômico que modela sem enrolar durante o treino",
      "Zero transparência no agachamento com costura reforçada",
    ],
  },
  {
    id: 111,
    title: "Fonte Bebedouro Inox Silenciosa 2,5L com Tripla Filtragem para Gatos e Cães",
    category: "Pets",
    categoryKey: "pets",
    priceCents: 8490,
    commissionPct: 18,
    earningCents: 1528,
    salesCount: 2410,
    viewsCount: 530000,
    rating: 4.9,
    highCommission: true,
    trending: true,
    imageUrl: "/media/templates/25_pet-experimentando.jpg",
    affiliateUrl: "https://www.tiktok.com/",
    proofGoal: "use",
    reasons: [
      "Gatos e cães bebendo água corrente no vídeo geram engajamento orgânico imediato.",
      "Apelo forte de saúde renal felina.",
    ],
    facts: [
      "Aço inox 304 higiênico que evita acne felina e acúmulo de bactérias",
      "Bomba ultrassilenciosa (<25dB) com desligamento automático sem água",
      "Filtro de carvão ativado + resina que retém pelos e impurezas",
    ],
  },
  {
    id: 112,
    title: "Mini Projetor Portátil Smart Wi-Fi 6 Bluetooth 5.0 180° Giratório Full HD 4K Support",
    category: "Eletrônicos",
    categoryKey: "eletronicos",
    priceCents: 21990,
    commissionPct: 15,
    earningCents: 3298,
    salesCount: 3670,
    viewsCount: 1850000,
    rating: 4.8,
    highCommission: true,
    trending: true,
    imageUrl: "/media/templates/24_setup-mesa.jpg",
    affiliateUrl: "https://www.tiktok.com/",
    proofGoal: "use",
    reasons: [
      "Comissão alta de R$ 32,98 por venda — apenas 31 vendas batem R$ 1.000 em comissão.",
      "Girar o projetor para o teto do quarto no escuro viraliza facilmente.",
    ],
    facts: [
      "Base giratória 180° para projetar na parede ou direto no teto",
      "Sistema Android integrado com correção trapezoidal automática (Auto Keystone)",
      "Conectividade Wi-Fi 6 Dual Band, Bluetooth 5.0 e entrada HDMI",
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
      imageUrl: "https://s.500fd.com/tt_video/oYAcAVwdeACRKdGpIjexGngAULjxQcNesoIgD0~tplv-photomode-zoomcover:480:480.jpeg",
      affiliateUrl: "https://www.tiktok.com/@patriciaramosss1/video/7690038225196289301",
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
      category: "Moda e acessórios",
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
      category: "Casa e cozinha",
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
      title: "Espremedor Amassador Triturador De Alho Inox Manual Cozinha Garlic Press",
      category: "Casa e cozinha",
      imageUrl: "https://s.500fd.com/tt_video/oMPGD5e19RVQ8FBBueM7NIrgAa27QcWADmsfqf~tplv-photomode-zoomcover:480:480.jpeg",
      affiliateUrl: "https://www.tiktok.com/@moraistiktokshop/video/7689293789592030470",
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
      category: "Moda e acessórios",
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
      title: "Saco de Lixo Lavanda Perfumado 34x38cm 3kg para Pia e Banheiro Kit 160 Sacos",
      category: "Casa e cozinha",
      imageUrl: "https://s.500fd.com/tt_video/ooCIApvQEfqEogbEf2HGeDxroDALAAUAAOLVIC~tplv-photomode-zoomcover:480:480.jpeg",
      affiliateUrl: "https://www.tiktok.com/@noronhashop.com.br/video/7689515077220715783",
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
    image: "/media/models/woman-casual.webp",
    appearance: "Mulher brasileira de 26 anos, cabelo castanho ondulado na altura dos ombros, pele morena clara natural, sorriso espontâneo, camiseta branca básica e jeans, iluminação natural de janela.",
  },
  {
    id: "lucas-mendes",
    name: "Lucas Mendes",
    style: "Social · Tech & Rotina",
    image: "/media/models/man-smart.webp",
    appearance: "Homem brasileiro de 28 anos, cabelo curto alinhado, barba curta bem feita, camisa social clara, fundo de estúdio moderno com luz suave.",
  },
  {
    id: "camila-souza",
    name: "Camila Souza",
    style: "Apresentadora · Rotina",
    image: "/media/templates/21_apresentando-produto.jpg",
    appearance: "Mulher brasileira de 24 anos, cabelo longo escuro liso, olhos castanhos expressivos, regata branca canelada, sala iluminada com luz do dia.",
  },
  {
    id: "duda-ferreira",
    name: "Duda Ferreira",
    style: "Skincare & Glow",
    image: "/media/templates/19_textura-pele.jpg",
    appearance: "Jovem brasileira de 23 anos, cabelo preso com presilha, pele iluminada natural, blusa marrom de tricô leve em banheiro/quarto moderno com luz quente.",
  },
  {
    id: "larissa-oliveira",
    name: "Larissa Oliveira",
    style: "Fitness & Suplementos",
    image: "/media/templates/23_preparo-e-gole.jpg",
    appearance: "Mulher brasileira de 27 anos, cabelo preso, top esportivo, cozinha iluminada preparando shake na bancada, expressão confiante e energética.",
  },
  {
    id: "pedro-alves",
    name: "Pedro Alves",
    style: "Setup & Casa",
    image: "/media/templates/24_setup-mesa.jpg",
    appearance: "Criador brasileiro de 30 anos em bancada/mesa organizada com iluminação aconchegante, tom direto e confiável.",
  },
];

export type ZaalysTemplate = {
  id: string;
  title: string;
  format: "presenter" | "application" | "hands-demo" | "try-on" | "unboxing" | "pov" | "pet";
  formatLabel: string;
  cast: "model" | "hands";
  video: string;
  poster: string;
  needsModel: boolean;
  proofGoals: ProofGoal[];
  categories: string[];
  description: string;
};

export const ZAALYS_TEMPLATES: ZaalysTemplate[] = [
  {
    id: "tpl-21-apresentando",
    title: "Apresentando o produto na mão · Gancho em 3s",
    format: "presenter",
    formatLabel: "Apresentando",
    cast: "model",
    video: "/media/templates/21_apresentando-produto.mp4",
    poster: "/media/templates/21_apresentando-produto.jpg",
    needsModel: true,
    proofGoals: ["details", "use", "contents"],
    categories: ["Beleza e cuidados", "Casa e cozinha", "Moda e acessórios"],
    description: "A criadora segura o produto na altura do rosto logo no primeiro segundo, mostra o rótulo/detalhe e faz a chamada para a sacola.",
  },
  {
    id: "tpl-19-textura",
    title: "Aplicação na pele · Textura de perto",
    format: "application",
    formatLabel: "Aplicação",
    cast: "model",
    video: "/media/templates/19_textura-pele.mp4",
    poster: "/media/templates/19_textura-pele.jpg",
    needsModel: true,
    proofGoals: ["use", "details"],
    categories: ["Beleza e cuidados", "Saúde e bem-estar"],
    description: "Mostra a textura real do produto na pele com iluminação natural próxima, ideal para séruns, cremes, maquiagem e cuidados pessoais.",
  },
  {
    id: "tpl-23-preparo",
    title: "Preparo e gole na rotina · Demonstração real",
    format: "hands-demo",
    formatLabel: "Demonstração",
    cast: "model",
    video: "/media/templates/23_preparo-e-gole.mp4",
    poster: "/media/templates/23_preparo-e-gole.jpg",
    needsModel: true,
    proofGoals: ["use", "contents", "details"],
    categories: ["Saúde e bem-estar", "Casa e cozinha", "Esporte e lazer"],
    description: "Cena de rotina preparando e usando o produto na bancada da cozinha com movimento fluido de câmera.",
  },
  {
    id: "tpl-24-setup",
    title: "Setup e bancada · Só as mãos em ação",
    format: "unboxing",
    formatLabel: "Unboxing",
    cast: "hands",
    video: "/media/templates/24_setup-mesa.mp4",
    poster: "/media/templates/24_setup-mesa.jpg",
    needsModel: false,
    proofGoals: ["details", "contents", "use"],
    categories: ["Eletrônicos", "Casa e cozinha", "Moda e acessórios"],
    description: "Foco total no produto sobre a mesa sem precisar escolher modelo. Ideal para mostrar acabamento, encaixe e o que vem na caixa.",
  },
  {
    id: "tpl-25-pet",
    title: "Pet experimentando · Reação espontânea",
    format: "pet",
    formatLabel: "Pet",
    cast: "hands",
    video: "/media/templates/25_pet-experimentando.mp4",
    poster: "/media/templates/25_pet-experimentando.jpg",
    needsModel: false,
    proofGoals: ["use", "details"],
    categories: ["Pets", "Casa e cozinha"],
    description: "Cena autêntica com pet interagindo com o produto no ambiente de casa — altíssima retenção nos primeiros 3 segundos.",
  },
  {
    id: "tpl-tryon-casual",
    title: "Provando no espelho · Caimento e tecido",
    format: "try-on",
    formatLabel: "Provando",
    cast: "model",
    video: "/media/templates/21_apresentando-produto.mp4",
    poster: "/media/models/woman-casual.webp",
    needsModel: true,
    proofGoals: ["fit", "details"],
    categories: ["Moda e acessórios", "Esporte e lazer"],
    description: "Mostra como a peça veste no corpo em movimento natural, destacando tecido, costura e numeração.",
  },
  {
    id: "tpl-presenter-smart",
    title: "Review direto de estúdio · Ponto forte e preço",
    format: "presenter",
    formatLabel: "Apresentando",
    cast: "model",
    video: "/media/templates/24_setup-mesa.mp4",
    poster: "/media/models/man-smart.webp",
    needsModel: true,
    proofGoals: ["details", "contents", "use"],
    categories: ["Eletrônicos", "Casa e cozinha", "Esporte e lazer"],
    description: "Apresentador mostra o produto com autoridade, responde à principal objeção de compra e aponta para o link.",
  },
  {
    id: "tpl-pov-bancada",
    title: "POV Primeira Pessoa · Testando na prática",
    format: "pov",
    formatLabel: "POV",
    cast: "hands",
    video: "/media/templates/23_preparo-e-gole.mp4",
    poster: "/media/templates/23_preparo-e-gole.jpg",
    needsModel: false,
    proofGoals: ["use", "contents"],
    categories: ["Casa e cozinha", "Beleza e cuidados", "Eletrônicos"],
    description: "Ângulo em primeira pessoa tirando da caixa e colocando para funcionar imediatamente.",
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
    id: "7690680479682465045",
    title: "Mini Jesus Sentado Decorativo | Enfeite Religioso Católico para Monitor Mesa Carro Prateleira e Nicho | Impressão 3D",
    creator: "Jéssica Shop",
    category: "Suprimentos domésticos",
    thumbnail: "https://s.500fd.com/tt_video/ocP5irEeIEAwaDPBsyqE6DTBuIcIUEmfgA9FiR~tplv-photomode-zoomcover:480:480.jpeg",
    source: "FastMoss",
    sourceUrl: "https://www.fastmoss.com/pt/media-source/video/7690680479682465045",
    tiktokUrl: "https://www.tiktok.com/@jessicashoppin/video/7690680479682465045",
    views: 3400000,
    sales: 4300,
    hook: "Todo mundo que entra no meu carro ou vê a tela do meu computador pergunta onde eu comprei esse Mini Jesus sentado.",
    structure: [
      { stage: "Abertura (0–2s)", time: "0:00–0:02", whatHappens: "Close no enfeite encaixado na borda do monitor e depois no painel do carro." },
      { stage: "Desenvolvimento (2–6s)", time: "0:02–0:06", whatHappens: "Mostra o acabamento em impressão 3D e como ele fica equilibrado em qualquer quina." },
      { stage: "Chamada (6–9s)", time: "0:06–0:09", whatHappens: "Fala que custa baratinho para presentear a família e aponta para a sacola laranja." },
    ],
    takeaways: [
      "Produtos de ticket baixo com apelo emocional/presente convertem no impulso em vídeos de 8 segundos.",
      "Mostrar 3 lugares diferentes onde o produto encaixa aumenta o valor percebido.",
    ],
  },
  {
    id: "7690038225196289301",
    title: "Kit Depilador Elétrico 4 em 1 Multifuncional Para Todas as Partes do Corpo Recarregável Tipo C Design Ergonômico e Confortável",
    creator: "Patrícia Ramos",
    category: "Beleza e cuidados pessoais",
    thumbnail: "https://s.500fd.com/tt_video/oYAcAVwdeACRKdGpIjexGngAULjxQcNesoIgD0~tplv-photomode-zoomcover:480:480.jpeg",
    source: "FastMoss",
    sourceUrl: "https://www.fastmoss.com/pt/media-source/video/7690038225196289301",
    tiktokUrl: "https://www.tiktok.com/@patriciaramosss1/video/7690038225196289301",
    views: 9300000,
    sales: 3600,
    hook: "Parei de gastar com lâmina que irrita a pele depois que descobri esse 4 em 1 recarregável que troca a ponteira em um clique.",
    structure: [
      { stage: "Abertura (0–2s)", time: "0:00–0:02", whatHappens: "Mostra as 4 cabeças do aparelho na mão e encaixa a principal." },
      { stage: "Desenvolvimento (2–7s)", time: "0:02–0:07", whatHappens: "Passa no braço a seco mostrando que não corta nem deixa vermelhidão." },
      { stage: "Chamada (7–10s)", time: "0:07–0:10", whatHappens: "Mostra o cabo USB-C e avisa do desconto ativo no carrinho." },
    ],
    takeaways: [
      "Demonstrar que não machuca a pele resolve a maior objeção do nicho de beleza.",
      "Destacar as 4 funções em menos de 3 segundos multiplica a retenção.",
    ],
  },
  {
    id: "7689591197848898837",
    title: "Fita Adesiva de Vedação PVC 5M Impermeável Multiuso para Cozinha e Banheiro",
    creator: "valerio.vlogs",
    category: "Ferramentas e hardware",
    thumbnail: "https://s.500fd.com/tt_video/oc22U1PViNg3Ai1CgBqIbwA62w4WAnB5CIofI8~tplv-photomode-zoomcover:480:480.avif",
    source: "FastMoss",
    sourceUrl: "https://www.fastmoss.com/pt/media-source/video/7689591197848898837",
    tiktokUrl: "https://www.tiktok.com/@valerio.vlogs/video/7689591197848898837",
    views: 1480000,
    sales: 1890,
    hook: "Aquele rejunte preto encardido atrás da pia ou do vaso sanitário some em 1 minuto com essa fita de vedação impermeável.",
    structure: [
      { stage: "Abertura (0–2s)", time: "0:00–0:02", whatHappens: "Mostra a fresta escura da pia da cozinha antes de aplicar." },
      { stage: "Desenvolvimento (2–6s)", time: "0:02–0:06", whatHappens: "Desenrola a fita vincada no canto e joga água mostrando que não descola." },
      { stage: "Chamada (6–9s)", time: "0:06–0:09", whatHappens: "Mostra o rolo de 5 metros na sacola laranja." },
    ],
    takeaways: [
      "Vídeos de 'antes e depois' de limpeza/reforma têm altíssima taxa de salvamento.",
    ],
  },
  {
    id: "7689525698939194644",
    title: "Bolsa Feminina Transversal Couro PU Macio com Alça Larga e Divisórias",
    creator: "Welen Alves",
    category: "Malas e bolsas",
    thumbnail: "https://s.500fd.com/tt_video/oMIDquC4xdusEBe5usCBuPjAEiUM6D0IagfFRw~tplv-photomode-zoomcover:480:480.avif",
    source: "FastMoss",
    sourceUrl: "https://www.fastmoss.com/pt/media-source/video/7689525698939194644",
    tiktokUrl: "https://www.tiktok.com/@welen_alves/video/7689525698939194644",
    views: 567800,
    sales: 317,
    hook: "Cabe tudo o que você precisa pro trabalho sem pesar no ombro — olha quantas divisórias tem essa bolsa.",
    structure: [
      { stage: "Abertura (0–2s)", time: "0:00–0:02", whatHappens: "Abre os 3 zíperes seguidos mostrando a abertura ampla." },
      { stage: "Desenvolvimento (2–6s)", time: "0:02–0:06", whatHappens: "Coloca celular, carteira, chave e maquiagem cada um num bolso." },
      { stage: "Chamada (6–9s)", time: "0:06–0:09", whatHappens: "Mostra no corpo e aponta para as cores na sacola." },
    ],
    takeaways: [
      "Abrir todos os compartimentos nos primeiros 2 segundos segura quem busca praticidade.",
    ],
  },
  {
    id: "7689467068764179730",
    title: "Chinelo Feminino Luxo Strass Brilhante Macio Leve",
    creator: "Segredinhos da Paty",
    category: "Sapatos",
    thumbnail: "https://s.500fd.com/tt_video/o8oeCeU2GDNVLUfIXsI8PiI0bCoQrMcA2PjWHA~tplv-photomode-zoomcover:480:480.jpeg",
    source: "FastMoss",
    sourceUrl: "https://www.fastmoss.com/pt/media-source/video/7689467068764179730",
    tiktokUrl: "https://www.tiktok.com/@segredostiktokshopoficia/video/7689467068764179730",
    views: 114300,
    sales: 310,
    hook: "Brilha igual joia no pé e é macio como chinelo nuvem — olha esse acabamento no sol.",
    structure: [
      { stage: "Abertura (0–2s)", time: "0:00–0:02", whatHappens: "Gira o chinelo contra a luz mostrando o brilho das tiras." },
      { stage: "Desenvolvimento (2–6s)", time: "0:02–0:06", whatHappens: "Dobra a sola mostrando a flexibilidade e calça no pé." },
      { stage: "Chamada (6–8s)", time: "0:06–0:08", whatHappens: "Recomenda pegar a numeração habitual no link abaixo." },
    ],
    takeaways: [
      "Luz direta nos detalhes de strass/metal cria impacto visual imediato.",
    ],
  },
  {
    id: "7690399783059524872",
    title: "Spray Pulverizador de Óleo e Azeite em Vidro 200ml para Air Fryer e Cozinha Saudável",
    creator: "Kamilla Lima",
    category: "Utensílios de cozinha",
    thumbnail: "https://s.500fd.com/tt_video/okEOkdQgcYAFyEckVVRV1ufAxnDiBBBQ9Feqkz~tplv-photomode-zoomcover:480:480.jpeg",
    source: "FastMoss",
    sourceUrl: "https://www.fastmoss.com/pt/media-source/video/7690399783059524872",
    tiktokUrl: "https://www.tiktok.com/@achadinhosdakamilla10/video/7690399783059524872",
    views: 62600,
    sales: 305,
    hook: "Parou de encharcar a comida de óleo: uma borrifada desse spray cobre a Air Fryer inteira em névoa fina.",
    structure: [
      { stage: "Abertura (0–2s)", time: "0:00–0:02", whatHappens: "Borrifa em câmera próxima mostrando o leque uniforme de azeite." },
      { stage: "Desenvolvimento (2–6s)", time: "0:02–0:06", whatHappens: "Mostra o vidro espesso de 200ml e o bico que não escorre." },
      { stage: "Chamada (6–8s)", time: "0:06–0:08", whatHappens: "Chama para clicar no carrinho antes que acabe o estoque." },
    ],
    takeaways: [
      "Para esse produto, provar que sai 'névoa' e não 'jato' fecha a venda na hora.",
    ],
  },
  {
    id: "7689940821394607368",
    title: "ARARA SPORT KIT 2 Calça Legging Canelada Poliamida Sem Costura Cintura Alta Zero Transparente",
    creator: "Amanda Xavier - SHOP CREATOR",
    category: "Esportes e atividades ao ar livre",
    thumbnail: "https://s.500fd.com/tt_video/oMOXBf4OCixuIIKTIC1wiA54IHIBAvE9SAbd7C~tplv-photomode-zoomcover:480:480.jpeg",
    source: "FastMoss",
    sourceUrl: "https://www.fastmoss.com/pt/media-source/video/7689940821394607368",
    tiktokUrl: "https://www.tiktok.com/@amandaxavieer/video/7689940821394607368",
    views: 151400,
    sales: 290,
    hook: "Duas leggings de poliamida canelada que não marcam nada e não ficam transparentes pelo preço de uma.",
    structure: [
      { stage: "Abertura (0–2s)", time: "0:00–0:02", whatHappens: "Mostra as duas cores do kit no espelho e estica o cós." },
      { stage: "Desenvolvimento (2–6s)", time: "0:02–0:06", whatHappens: "Faz o teste de elasticidade e mostra a espessura do tecido." },
      { stage: "Chamada (6–9s)", time: "0:06–0:09", whatHappens: "Diz o tamanho que está vestindo e indica a sacola." },
    ],
    takeaways: [
      "Kits de 2 ou 3 peças aumentam a conversão quando você compara com o preço unitário.",
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
      { stage: "Abertura (0–2s)", time: "0:00–0:02", whatHappens: "Close da picanha girando sozinha na brasa com som real." },
      { stage: "Desenvolvimento (2–6s)", time: "0:02–0:06", whatHappens: "Mostra a regulagem de tamanho da haste encaixando na churrasqueira e o botão no cabo." },
      { stage: "Chamada (6–8s)", time: "0:06–0:08", whatHappens: "Corta a carne suculenta no ponto e aponta para o link da sacola." },
    ],
    takeaways: [
      "Som ambiente + movimento contínuo nos primeiros 2 segundos segura o público masculino.",
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
      { stage: "Abertura (0–2s)", time: "0:00–0:02", whatHappens: "Sacode a garrafa de cabeça para baixo em cima da bolsa aberta." },
      { stage: "Desenvolvimento (2–6s)", time: "0:02–0:06", whatHappens: "Abre com um clique só usando uma mão e mostra o gelo intacto dentro." },
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
      { stage: "Abertura (0–2s)", time: "0:00–0:02", whatHappens: "Coloca a bolsa no ombro e abre o zíper principal mostrando o espaço interno." },
      { stage: "Desenvolvimento (2–6s)", time: "0:02–0:06", whatHappens: "Guarda 5 itens grandes um por um mostrando que ainda sobra espaço e mantém o formato." },
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
      { stage: "Abertura (0–2s)", time: "0:00–0:02", whatHappens: "Coloca a colher de percarbonato na água morna e a espuma sobe imediatamente." },
      { stage: "Desenvolvimento (2–6s)", time: "0:02–0:06", whatHappens: "Tira o pano branco limpo sem esfregar e compara com o estado anterior." },
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
      { stage: "Abertura (0–2s)", time: "0:00–0:02", whatHappens: "Abre o zíper 180 graus mostrando as roupas organizadas como numa mala." },
      { stage: "Desenvolvimento (2–6s)", time: "0:02–0:06", whatHappens: "Mostra o compartimento de tênis embaixo e o bolso impermeável." },
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
    preview: "/media/templates/21_apresentando-produto.mp4",
    characters: [
      { id: "c1", name: "Dona Cida Sincera", role: "Aposentada sem filtro", image: "/media/models/woman-casual.webp" },
      { id: "c2", name: "Bia do Achadinho", role: "Viciada em TikTok Shop", image: "/media/templates/21_apresentando-produto.jpg" },
      { id: "c3", name: "Lucas Cético", role: "Só acredita testando", image: "/media/models/man-smart.webp" },
    ],
  },
  {
    id: "podcast-cut",
    title: "Corte de Podcast Revelação",
    desc: "Host e convidado em estúdio escuro contam o 'segredo' por trás do produto como se fosse confidencial.",
    castLabel: "Convidado do Podcast",
    cover: "/media/central-templates.webp",
    preview: "/media/templates/23_preparo-e-gole.mp4",
    characters: [
      { id: "c4", name: "Thiago Estrategista", role: "Especialista de bancada", image: "/media/models/man-smart.webp" },
      { id: "c5", name: "Camila Estética", role: "Criadora de beleza", image: "/media/templates/19_textura-pele.jpg" },
      { id: "c6", name: "Larissa Rotina", role: "Creator de lifestyle", image: "/media/templates/23_preparo-e-gole.jpg" },
    ],
  },
  {
    id: "pov-absurd",
    title: "POV Humorado / Plot Twist",
    desc: "Situação exagerada do cotidiano resolvida em 8 segundos pelo produto com humor brasileiro.",
    castLabel: "Protagonista",
    cover: "/media/central-raiox.webp",
    preview: "/media/templates/24_setup-mesa.mp4",
    characters: [
      { id: "c7", name: "Julia Exausta", role: "Humor de rotina real", image: "/media/models/woman-casual.webp" },
      { id: "c8", name: "Pedro Setup", role: "Intenso demais", image: "/media/templates/24_setup-mesa.jpg" },
      { id: "c9", name: "Duda Drama", role: "Reação cinematográfica", image: "/media/templates/19_textura-pele.jpg" },
    ],
  },
];

export type ZaalysNotification = {
  id: string;
  productTitle: string;
  productImage: string;
  priceCents: number;
  timeAgo: string;
  unread: boolean;
};

export const ZAALYS_NOTIFICATIONS: ZaalysNotification[] = [
  {
    id: "notif-1",
    productTitle: "Escova Alisadora 5 em 1 Bivolt Cerâmica",
    productImage: "https://s.500fd.com/tt_video/oYAcAVwdeACRKdGpIjexGngAULjxQcNesoIgD0~tplv-photomode-zoomcover:480:480.jpeg",
    priceCents: 1978,
    timeAgo: "há 2 min",
    unread: true,
  },
  {
    id: "notif-2",
    productTitle: "HILEE Garrafa Térmica Inox 591ml",
    productImage: "https://s.500fd.com/tt_video/o8JfGAG62FeetAXXtJAcwMTIA63LIRqfGQAA1i~tplv-photomode-zoomcover:480:480.jpeg",
    priceCents: 1168,
    timeAgo: "há 7 min",
    unread: true,
  },
  {
    id: "notif-3",
    productTitle: "JAMI JAMI Bolsa Feminina Grande PU",
    productImage: "https://s.500fd.com/tt_video/oMIDquC4xdusEBe5usCBuPjAEiUM6D0IagfFRw~tplv-photomode-zoomcover:480:480.avif",
    priceCents: 2398,
    timeAgo: "há 14 min",
    unread: true,
  },
  {
    id: "notif-4",
    productTitle: "Coberdrom Queen Com Sherpa Lã de Carneiro",
    productImage: "https://s.500fd.com/tt_video/oIRBBFBmBVgfyhuRGqSGAfc5WqIEIcZJDcwTEg~tplv-photomode-zoomcover:480:480.jpeg",
    priceCents: 2698,
    timeAgo: "há 23 min",
    unread: true,
  },
  {
    id: "notif-5",
    productTitle: "Mochila Feminina de Viagem Impermeável",
    productImage: "https://s.500fd.com/tt_video/ogEt4vBEYhYIKyk6VA8ioiPctUBaVrAHB2AUQ~tplv-photomode-zoomcover:480:480.jpeg",
    priceCents: 2308,
    timeAgo: "há 39 min",
    unread: true,
  },
  {
    id: "notif-6",
    productTitle: "Chinelo Rasteirinha Anatômica Sandlux",
    productImage: "https://s.500fd.com/tt_video/oAaEsfFw7gmRDebQCtiEAQBcwBuFQvMDqp8b91~tplv-photomode-zoomcover:480:480.avif",
    priceCents: 1198,
    timeAgo: "há 52 min",
    unread: true,
  },
  {
    id: "notif-7",
    productTitle: "Espeto Giratório Churrasco Flex Elétrico",
    productImage: "https://s.500fd.com/tt_video/oEABYKqI6oiBqBxrgecCqfiLiEAR2Bu52RpArI~tplv-photomode-zoomcover:480:480.jpeg",
    priceCents: 2563,
    timeAgo: "há 1 h",
    unread: true,
  },
  {
    id: "notif-8",
    productTitle: "Kit 2 Calças Legging Canelada Poliamida",
    productImage: "https://s.500fd.com/tt_video/oMOXBf4OCixuIIKTIC1wiA54IHIBAvE9SAbd7C~tplv-photomode-zoomcover:480:480.jpeg",
    priceCents: 1898,
    timeAgo: "há 1 h",
    unread: true,
  },
  {
    id: "notif-9",
    productTitle: "Travesseiro Cervical ABRANUV PRO2.0",
    productImage: "https://s.500fd.com/tt_video/oYwtdiHY1AIV9qfyABA9GQnXiCnIqIvISCtG4b~tplv-photomode-zoomcover:480:480.avif",
    priceCents: 2259,
    timeAgo: "há 2 h",
    unread: true,
  },
  {
    id: "notif-10",
    productTitle: "Percarbonato de Sódio 100% Puro AlvejaPro",
    productImage: "https://s.500fd.com/tt_video/o8AX7fjlBICdt32tAViAKXI2gBPL1AAEiRwwCW~tplv-photomode-zoomcover:480:480.jpeg",
    priceCents: 1273,
    timeAgo: "há 3 h",
    unread: false,
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
