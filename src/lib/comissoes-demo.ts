// Dados de exemplo da tela "Saque de comissões" (mesma estrutura e volume do original).
// Nomes e e-mails são inventados — não há dados de clientes reais aqui.

export type Plano = "Vitalício" | "Mensal";
export type ComissaoRow = { date: string; plano: Plano; vendaCents: number; comissaoCents: number; status: "A receber" | "Repassada" | "Estornada" };
export type TransacaoRow = { date: string; comprador: string; plano: Plano; forma: "PIX" | "CREDIT_CARD" | "CARD"; valorCents: number; situacao: "Pago" | "Aguardando pagamento" | "Recusado / expirado" | "Reembolsado" };
export type IndicadoRow = { date: string; nome: string; email: string; plano: Plano | null; situacao: "Ativo" | "Não pagou" | "Bloqueado" };

export const COMMISSION_RATE = 0.4;
const PRICE: Record<Plano, number> = { "Vitalício": 29700, Mensal: 17000 };

const FIRST = ["Ana", "Bruno", "Carla", "Daniel", "Elisa", "Fábio", "Gabriela", "Heitor", "Isabela", "João", "Karina", "Leonardo", "Marina", "Nicolas", "Olívia", "Paulo", "Renata", "Samuel", "Tatiane", "Vinícius", "Yasmin", "Rafael", "Juliana", "Thiago", "Priscila", "Diego", "Larissa", "Felipe", "Camila", "Rodrigo"];
const LAST = ["Andrade", "Barbosa", "Cardoso", "Duarte", "Esteves", "Freitas", "Gomes", "Holanda", "Lacerda", "Macedo", "Nogueira", "Oliveira", "Pacheco", "Queiroz", "Ribeiro", "Siqueira", "Teixeira", "Vasconcelos", "Moura", "Prado"];
const DOMAINS = ["gmail.com", "gmail.com", "gmail.com", "hotmail.com", "outlook.com", "yahoo.com.br"];

// PRNG determinístico: a tela mostra sempre os mesmos dados.
function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

const fmtDate = (d: Date) =>
  `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;

function build() {
  const r = rng(20261024);
  const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)]!;
  const start = new Date(2026, 9, 23);
  const people: { nome: string; email: string }[] = [];
  for (let i = 0; i < 179; i++) {
    const nome = `${pick(FIRST)} ${pick(LAST)}`;
    const user = nome.toLowerCase().normalize("NFD").replace(/[^a-z]/g, "").slice(0, 3);
    people.push({ nome, email: `${user}•••@${pick(DOMAINS)}` });
  }

  const comissoes: ComissaoRow[] = [];
  const transacoes: TransacaoRow[] = [];
  const indicados: IndicadoRow[] = [];
  const WINDOW = 26; // dias ainda não repassados pelo admin
  let estornosCents = 0;

  // 179 indicados: 145 ativos, 27 não pagaram, 7 bloqueados (mesmas proporções do original).
  let day = 0;
  const order = Array.from({ length: 179 }, (_, i) => i);
  const situacoes: IndicadoRow["situacao"][] = [
    ...Array(145).fill("Ativo"),
    ...Array(27).fill("Não pagou"),
    ...Array(7).fill("Bloqueado"),
  ];
  // embaralha as situações de forma estável
  for (let i = situacoes.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [situacoes[i], situacoes[j]] = [situacoes[j]!, situacoes[i]!];
  }

  for (const i of order) {
    if (r() < 0.32) day++;
    const d = new Date(start);
    d.setDate(start.getDate() - day);
    const date = fmtDate(d);
    const p = people[i]!;
    const situacao = situacoes[i]!;
    const plano: Plano = r() < 0.16 ? "Mensal" : "Vitalício";
    const forma = r() < 0.55 ? "PIX" : "CREDIT_CARD";
    indicados.push({ date, nome: p.nome, email: p.email, plano: situacao === "Ativo" ? plano : null, situacao });

    if (situacao === "Não pagou") {
      transacoes.push({ date, comprador: p.email, plano, forma: forma === "PIX" ? "PIX" : "CARD", valorCents: PRICE[plano], situacao: forma === "PIX" ? "Aguardando pagamento" : "Recusado / expirado" });
      continue;
    }
    const venda = PRICE[plano];
    const comissao = Math.round(venda * COMMISSION_RATE);
    if (situacao === "Bloqueado") {
      transacoes.push({ date, comprador: p.email, plano, forma, valorCents: venda, situacao: "Reembolsado" });
      comissoes.push({ date, plano, vendaCents: venda, comissaoCents: comissao, status: "Estornada" });
      if (day <= WINDOW) estornosCents += comissao;
      continue;
    }
    // ativos: as mais recentes ainda a receber; as antigas já repassadas
    if (r() < 0.12) transacoes.push({ date, comprador: p.email, plano, forma: "PIX", valorCents: venda, situacao: "Aguardando pagamento" });
    transacoes.push({ date, comprador: p.email, plano, forma, valorCents: venda, situacao: "Pago" });
    comissoes.push({ date, plano, vendaCents: venda, comissaoCents: comissao, status: day <= WINDOW ? "A receber" : "Repassada" });
  }

  const sum = (rows: ComissaoRow[]) => rows.reduce((a, c) => a + c.comissaoCents, 0);
  const aReceber = comissoes.filter((c) => c.status === "A receber");
  const repassadas = comissoes.filter((c) => c.status === "Repassada");

  return {
    comissoes,
    transacoes,
    indicados,
    resumo: {
      recebidoApplyfyCents: 0,
      aReceberCents: sum(aReceber),
      estornosCents,
      repassadoCents: sum(repassadas),
      vendas: aReceber.length + repassadas.length,
    },
  };
}

export const COMISSOES_DEMO = build();
