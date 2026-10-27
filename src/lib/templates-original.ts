import type { ProofGoal, ZaalysTemplate } from "@/lib/zaalys-data";

// Os 26 templates do sistema original (lidos em 24/10/2026), na mesma ordem.
// Mídias (vídeo + capa) copiadas do original para public/media/templates e servidas pelo próprio projeto.
// Para usar outro servidor/CDN, defina NEXT_PUBLIC_TEMPLATE_MEDIA_ORIGIN.

const ORIGIN = process.env.NEXT_PUBLIC_TEMPLATE_MEDIA_ORIGIN || "";

const FORMAT_LABELS: Record<ZaalysTemplate["format"], string> = {
  "try-on": "Provando",
  unboxing: "Unboxing",
  "hands-demo": "Demonstração",
  pov: "POV",
  application: "Aplicação",
  presenter: "Apresentando",
  pet: "Pet",
};

const CATEGORY_LABELS: Record<string, string> = {
  moda: "Moda",
  fitness: "Fitness",
  beleza: "Beleza",
  saude: "Saúde",
  casa: "Casa",
  tecnologia: "Tecnologia",
  pet: "Pet",
};

type Row = [
  id: string,
  title: string,
  format: ZaalysTemplate["format"],
  cast: "full-body" | "half-body" | "hands",
  categories: string[],
  file: string,
  description: string,
  proofGoals: ProofGoal[],
];

const FIT: ProofGoal[] = ["details", "fit"];
const ALL = ["moda", "beleza", "saude", "casa", "tecnologia", "fitness", "pet"];

const ROWS: Row[] = [
  ["roupas-femininas", "Mostrando look feminino", "try-on", "full-body", ["moda", "fitness"], "01_UGC_roupas-femininas", "Selfie no espelho do corredor, girando para mostrar o caimento do look.", FIT],
  ["mostrando-calca", "Mostrando a calça", "try-on", "full-body", ["moda", "fitness"], "02_Beleza_mostrando-roupa-calça", "Selfie no espelho do quarto, com a mão no cós para mostrar o corte.", FIT],
  ["mostrando-vestido", "Caimento do vestido", "try-on", "full-body", ["moda", "fitness"], "03_Beleza_vestido", "Selfie no espelho, apontando o vestido e deixando a saia balançar.", FIT],
  ["camisa-treino", "Camisa de treino", "try-on", "full-body", ["moda", "fitness"], "04_Moda_roupa-masculina", "Selfie no espelho da academia, puxando a camisa para mostrar a elasticidade.", FIT],
  ["demonstrando-roupa", "Demonstrando a roupa", "try-on", "full-body", ["moda", "fitness"], "05_Moda_Roupa-masculina", "Selfie no espelho do closet, mão na cintura e virada de perfil.", FIT],
  ["poses-femininas", "Poses com o look", "try-on", "full-body", ["moda", "fitness"], "06_Moda_roupa-feminina", "Filmado do outro lado do quarto: poses rápidas e uma caminhada até a câmera.", FIT],
  ["experimentando-camisa", "Experimentando a camisa", "try-on", "full-body", ["moda", "fitness"], "07_Moda_camisa-ugc", "Provador: uma volta completa para mostrar as costas e a reação no final.", FIT],
  ["roupa-treino", "Roupa de treino", "try-on", "full-body", ["moda", "fitness"], "08_UGC_roupa-treino-ugc", "Parede lisa, girando em vários ângulos para mostrar o conjunto de treino.", FIT],
  ["caimento-conjunto", "Caimento do conjunto", "try-on", "full-body", ["moda", "fitness"], "09_Beleza_conjunto-feminino", "Porta iluminada, uma rotação lenta mostrando todos os lados do conjunto.", FIT],
  ["roupa-no-corpo", "Roupa no corpo", "try-on", "full-body", ["moda", "fitness"], "10_Moda_roupa-masculina-casual", "Selfie tranquila no espelho, pequenas mudanças de apoio e mão no bolso.", FIT],
  ["mostrando-vestido-2", "Mostrando o vestido", "try-on", "full-body", ["moda", "fitness"], "11_UGC_mostando-vestido", "Selfie no espelho do corredor, mão no busto e saia balançando.", FIT],
  ["mostrando-roupa-fem", "Mostrando a roupa", "try-on", "full-body", ["moda", "fitness"], "12_UGC_Vestido-Feminino", "Selfie no espelho em frente à cortina, passando pela fenda da saia.", FIT],
  ["mostrando-roupa-geral", "Mostrando a roupa", "try-on", "full-body", ["moda", "fitness"], "13_geral_Mostrando-roupa", "Mostra a peça para a câmera, depois veste e dá uma volta completa.", FIT],
  ["mostrando-roupa-ugc", "Mostrando a roupa", "try-on", "full-body", ["moda", "fitness"], "14_UGC_mostrando-roupa", "Na academia, ângulos descontraídos e a mão passando pelo cabelo.", FIT],
  ["dancinha-roupa", "Dancinha com o look", "try-on", "full-body", ["moda", "fitness"], "15_UGC_vastido-feminino", "No quarto, uma dancinha leve e um tchau no final.", FIT],
  ["unboxing-mesa", "Unboxing na mesa", "unboxing", "hands", ALL, "16_unboxing-mesa", "Só as mãos: abrindo a embalagem na mesa e tirando o produto.", ["details", "contents"]],
  ["demo-mao", "Demonstrando na mão", "hands-demo", "hands", ["casa", "tecnologia", "beleza", "saude", "pet"], "17_demo-mao", "Só as mãos: pegando o produto, usando e mostrando o resultado.", ["details", "use"]],
  ["pov-usando", "POV usando o produto", "pov", "hands", ["tecnologia", "casa", "fitness"], "18_pov-usando", "Visão em primeira pessoa olhando as próprias mãos usando o produto.", ["details"]],
  ["textura-pele", "Textura na pele", "application", "hands", ["beleza"], "19_textura-pele", "Só as mãos: um pouco do produto espalhado no dorso da mão.", ["details", "use"]],
  ["rotina-espelho", "Aplicando no espelho", "application", "half-body", ["beleza"], "20_rotina-espelho", "Espelho do banheiro, da cintura para cima, aplicando o produto no rosto.", ["details", "use"]],
  ["apresentando-produto", "Apresentando o produto", "presenter", "half-body", ALL, "21_apresentando-produto", "Da cintura para cima, segurando o produto e falando sobre ele.", ["details"]],
  ["antes-depois-casa", "Antes e depois", "hands-demo", "hands", ["casa"], "22_antes-depois-casa", "Só as mãos: superfície bagunçada, o produto em uso e o resultado arrumado.", ["details", "use"]],
  ["preparo-e-gole", "Preparo e gole", "presenter", "half-body", ["saude", "fitness"], "23_preparo-e-gole", "Bancada da cozinha, da cintura para cima, preparando a bebida e provando.", ["details"]],
  ["setup-mesa", "Setup na mesa", "hands-demo", "hands", ["tecnologia"], "24_setup-mesa", "Só as mãos: o aparelho colocado no setup da mesa e ligado.", ["details", "use"]],
  ["pet-experimentando", "Pet experimentando", "pet", "hands", ["pet"], "25_pet-experimentando", "Só as mãos: oferecendo o produto ao cachorro e ele aprovando.", ["details", "use"]],
  ["acessorio-treino", "Acessório no treino", "presenter", "full-body", ["fitness", "saude"], "26_acessorio-treino", "Corpo inteiro em casa, usando o acessório em uma repetição completa.", ["details"]],
];

const media = (file: string, ext: "jpg" | "mp4" | "lite.mp4") => {
  const path = `/media/templates/${file}.${ext}`;
  return `${ORIGIN}${encodeURI(path)}`;
};

export const TEMPLATES_ORIGINAL: ZaalysTemplate[] = ROWS.map(
  ([id, title, format, cast, categories, file, description, proofGoals]) => ({
    id,
    title,
    format,
    formatLabel: FORMAT_LABELS[format],
    cast: cast === "hands" ? "hands" : "model",
    video: media(file, "mp4"),
    videoLite: media(file, "lite.mp4"),
    poster: media(file, "jpg"),
    needsModel: cast !== "hands",
    proofGoals,
    categories: categories.map((c) => CATEGORY_LABELS[c] ?? c),
    description,
  }),
);
