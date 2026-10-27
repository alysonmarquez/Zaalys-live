// Os 12 formatos do Trend AI do original (lidos em 24/10/2026), com os personagens de cada um.
// Fotos e prévias copiadas do original para public/media/trend/<slug>/ e servidas pelo próprio projeto.

const ORIGIN = process.env.NEXT_PUBLIC_TEMPLATE_MEDIA_ORIGIN || "";

export type TrendCharacter = { name: string; image: string };
export type TrendFormat = {
  slug: string;
  title: string;
  desc: string;
  /** "personagem", "objeto", "bebê"... usado em "Escolha o ___ que vai protagonizar". */
  noun: string;
  preview: string;
  /** Prévia leve para a lista. */
  previewLite: string;
  characters: TrendCharacter[];
};

const seq = (n: number) => Array.from({ length: n }, (_, i) => `char-${i + 1}.webp`);

const RAW: [string, string, string, string, string[], string[]?][] = [
  ["novelinha", "Vovôs e Vovós", "Histórias curtas com conflito, personagens e loop.", "personagem", [
    "Seu Zé da Horta", "Seu Zé no Celular", "Seu Zé Alimentando as Galinhas", "Seu Zé na Rede", "Seu Zé Tocando Viola",
    "Seu Antônio Consertando a Bicicleta", "Seu Antônio na Videochamada", "Seu Antônio no Fogão a Lenha", "Seu Antônio e o Cavalo",
    "Seu Antônio Jogando Dominó", "Seu Pedro na Colheita de Milho", "Seu Pedro e a Bronca do Chinelo", "Seu Pedro e o Carro Antigo",
    "Seu Pedro Capinando o Parreiral", "Seu Pedro Contemplando a Chuva", "Seu Chico Pescando no Rio", "Seu Chico Tocando Sanfona na Festa",
    "Seu Chico Fazendo a Barba", "Seu Chico Soltando Pipa com a Criança", "Dona Terezinha e o Bolo Caseiro", "Dona Terezinha no Celular",
    "Dona Terezinha na Cozinha", "Dona Terezinha Tricotando", "Dona Terezinha Rezando o Terço", "Dona Benedita Alimentando as Galinhas",
    "Dona Benedita Fazendo o Cabelo da Neta", "Dona Benedita na Feira", "Dona Benedita Dançando", "Dona Benedita e as Ervas",
    "Dona Cida na Máquina de Costura", "Dona Cida Assistindo Novela", "Dona Cida Fazendo Pamonha", "Dona Cida Estendendo a Roupa",
    "Dona Maria e o Gato no Colo", "Dona Maria Varrendo o Terreiro", "Dona Maria Voltando da Igreja", "Dona Maria Servindo Café",
  ]],
  ["objetos", "Objetos Falantes", "Dicas memoráveis narradas pelo próprio objeto.", "objeto", [
    "Moranguinho", "Abacate Zen", "Brócolis Rabugento", "Banana Chorona", "Furioso", "Cenoura Fortona", "Alface Murcha",
    "Laranja Chorona", "A Turma das Uvas", "Limão Azedo", "Melancia Apaixonada", "Batata Preguiçosa", "Pimentão Assustado",
    "Maçã Charmosa", "Cebola Chorona", "Air Fryer Furiosa", "Panela Enjoada", "Geladeira Cansada", "Micro-ondas Impaciente",
    "Vassoura Rabugenta", "Controle Perdido", "Chinelo Malandro", "Liquidificador Tonto", "Ventilador Exausto", "Escova Animada",
    "Torradeira Assustada", "Máquina de Lavar Tonta", "Cafeteira Ranzinza", "Aspirador Animado", "Panela de Pressão Nervosa",
  ], [
    ...seq(15),
    "char-01.webp", "char-02.webp", "char-03.webp", "char-04.webp", "char-05.webp", "char-06.webp", "char-07.webp", "char-08.webp",
    "char-09.webp", "char-010.webp", "char-011.webp", "char-012.webp", "char-013.webp", "char-014.webp", "char-015.webp",
  ]],
  ["podcast-bebe", "Podcast de Bebê", "Bebês num estúdio de podcast opinando como adultos.", "bebê", [
    "Bebê CEO", "Bebê Fofoqueira", "Bebê Coach", "Bebê Influencer", "Bebê Tiozão", "Bebê Gamer", "Bebê Sertanejo", "Bebê Dramática",
  ]],
  ["bichos", "Bichos Falantes", "Pets de verdade falando o que pensam do dono.", "bicho", [
    "Caramelo", "Gata Patroa", "Papagaio Fofoqueiro", "Capivara Zen", "Pug Dramático", "Gato Frajola", "Shih-tzu Madame", "Salsicha Ansioso",
  ]],
  ["novela-frutas", "Novela das Frutas", "Traição, barraco e revelação entre frutas — com parte 2.", "fruta", [
    "Morango Vilã", "Abacaxi Galã", "Banana Mocinha", "Coco Coronel", "Uva Fofoqueira", "Manga Sogra", "Limão Ciumento", "Melancia Mãe",
  ]],
  ["vlog-impossivel", "Vlog Impossível", "Selfie-vlog de épocas e lugares impossíveis.", "vlogueiro", [
    "Homem das Cavernas", "Astronauta na Lua", "Cangaceiro", "Pirata", "Cavaleiro Medieval", "Exploradora na Amazônia", "Faraó", "Viking",
  ]],
  ["entrevista-rua", "Entrevista na Rua", "O repórter pergunta, o povo responde do jeito mais inesperado.", "entrevistado", [
    "Tiozão da Praia", "Executiva da Paulista", "Motoboy", "Vovó da Feira", "Surfista", "Universitária", "Pagodeiro do Bar", "Rata de Academia",
  ]],
  ["anos-80", "Anos 80 em VHS", "Fita caseira dos anos 80: gente da época falando com você.", "personagem", [
    "Professora de Aeróbica", "Garoto da Locadora", "Patinadora do Rinque", "Roqueira de 85", "Dona Lurdes de Bobes",
    "Tio do Churrasco de 87", "Menina do Orelhão", "Animador de Baile",
  ]],
  ["academia-raiz", "Academia Raiz", "Atletas com bordão de treino que vira série.", "atleta", [
    "Boxeador de Rua", "Marombeiro do Supino", "Vovó da Hidro", "Personal Gritão", "Corredora da Orla", "Faixa Preta do Jiu-Jitsu",
    "Crossfiteira Raiz", "Iogue da Praça",
  ]],
  ["galanteadores", "Galanteadores", "Coroas charmosos mandando um elogio de bom dia.", "galanteador", [
    "Seu Roberto", "Dona Célia", "Seu Valdir", "Dona Marlene", "Seu Jorge", "Dona Rosa", "Seu Fernando", "Dona Sônia",
  ]],
  ["paquera", "Paquera da Melhor Idade", "Dois idosos se paquerando, com cantada e vergonha.", "casal", [
    "Seu Zezinho e Dona Cida", "Seu Benedito e Dona Neide", "Seu Tião e Dona Lourdes", "Seu Osvaldo e Dona Zilda",
    "Seu Hélio e Dona Fátima", "Seu Raimundo e Dona Socorro", "Seu Paulo e Dona Vera", "Seu Arlindo e Dona Iolanda",
  ]],
  ["casal-raiz", "Casal Raiz", "Casados há 50 anos, implicando com amor.", "casal", [
    "Dona Nair e Seu Juca", "Dona Graça e Seu Valter", "Dona Ivone e Seu Lázaro", "Dona Cleuza e Seu Nelson",
    "Dona Tereza e Seu Amaro", "Dona Alzira e Seu Nestor", "Dona Lúcia e Seu Gilberto", "Dona Jandira e Seu Moacir",
  ]],
];

export const TREND_FORMATS_ORIGINAL: TrendFormat[] = RAW.map(([slug, title, desc, noun, names, files]) => ({
  slug,
  title,
  desc,
  noun,
  preview: `${ORIGIN}/media/trend/${slug}/preview.mp4`,
  previewLite: `${ORIGIN}/media/trend/${slug}/preview.lite.mp4`,
  characters: names.map((name, i) => ({
    name,
    image: `${ORIGIN}/media/trend/${slug}/${(files ?? seq(names.length))[i]}`,
  })),
}));

export const TREND_TONES = [
  { key: "engracado", label: "Engraçado", desc: "Punchline e humor leve" },
  { key: "sarcastico", label: "Sarcástico", desc: "Humor seco, deadpan" },
  { key: "absurdo", label: "Absurdo", desc: "Viradas inesperadas, surreal" },
  { key: "dramatico", label: "Dramático", desc: "Barraco, revelação, suspense" },
  { key: "ternurinha", label: "Ternurinha", desc: "Fofo e carismático" },
  { key: "nostalgico", label: "Nostálgico", desc: "Memória afetiva quente" },
];

export const TREND_CTAS = [
  { key: "seguir", label: "Seguir", line: "Ei, você! Clica nesse mais aqui, ó, AGORA!" },
  { key: "parte2", label: "Parte 2", line: "A parte 2 é PIOR! Clica no mais aqui, ó!" },
  { key: "comentar", label: "Comentar", line: "Comenta EU QUERO aqui, ó, AGORA!" },
  { key: "mandar", label: "Mandar pra alguém", line: "Manda AGORA pra aquela amiga que faz isso! Aqui, ó!" },
  { key: "salvar", label: "Salvar", line: "Salva AGORA, aqui, ó, senão você esquece!" },
  { key: "carrinho", label: "Carrinho laranja", line: "Tá aqui, no carrinho laranja, ó! Clica!" },
];
