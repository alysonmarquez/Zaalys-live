"use client";

import React, { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/components/brand";
import { formatBRL } from "@/lib/zaalys-data";
import { useShowcase } from "@/lib/showcase";
import { COMISSOES_DEMO, COMMISSION_RATE } from "@/lib/comissoes-demo";

const INPUT_CLASS =
  "h-11 w-full rounded-xl border border-black/[0.06] bg-background/50 px-3.5 text-[15px] outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring/40 dark:border-white/[0.08] dark:bg-input/20";
const CARD = "rounded-3xl border border-black/[0.06] bg-card/85 p-5 shadow-2xs sm:p-6 dark:border-white/[0.08]";
const PAGE = 25;

type Aba = "comissoes" | "transacoes" | "indicados";
const ABAS: { v: Aba; l: string }[] = [
  { v: "comissoes", l: "Comissões" },
  { v: "transacoes", l: "Transações" },
  { v: "indicados", l: "Indicados" },
];

const EMPTY = {
  comissoes: [],
  transacoes: [],
  indicados: [],
  resumo: { recebidoApplyfyCents: 0, aReceberCents: 0, estornosCents: 0, repassadoCents: 0, vendas: 0 },
} as unknown as typeof COMISSOES_DEMO;

const TONE: Record<string, string> = {
  "A receber": "bg-amber-500/12 text-amber-600 dark:text-amber-400",
  "Via Applyfy": "bg-sky-500/12 text-sky-600 dark:text-sky-400",
  "Saque pedido": "bg-violet-500/12 text-violet-600 dark:text-violet-400",
  Repassada: "bg-primary/15 text-primary",
  Estornada: "bg-red-500/12 text-red-600 dark:text-red-400",
  Pago: "bg-primary/15 text-primary",
  "Aguardando pagamento": "bg-amber-500/12 text-amber-600 dark:text-amber-400",
  "Recusado / expirado": "bg-muted text-muted-foreground",
  Reembolsado: "bg-red-500/12 text-red-600 dark:text-red-400",
  Ativo: "bg-primary/15 text-primary",
  "Não pagou": "bg-amber-500/12 text-amber-600 dark:text-amber-400",
  Bloqueado: "bg-red-500/12 text-red-600 dark:text-red-400",
};

type Saque = { id: string; amount_cents: number; status: "pending" | "paid" | "rejected"; created_at: string; paid_at: string | null; note: string | null };

function Badge({ s }: { s: string }) {
  return <span className={cn("whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold", TONE[s])}>{s}</span>;
}

export default function ComissoesPage() {
  return (
    <Suspense fallback={null}>
      <ComissoesContent />
    </Suspense>
  );
}

function ComissoesContent() {
  // Comissões de exemplo só na conta de demonstração.
  const demo = useShowcase();
  // Demais contas: vendas reais atribuídas aos links de convite delas.
  const [real, setReal] = useState<typeof COMISSOES_DEMO | null>(null);
  useEffect(() => {
    if (demo) return;
    fetch("/api/conta/comissoes")
      .then((res) => (res.ok ? res.json() : null))
      .then((d: typeof COMISSOES_DEMO | null) => d && setReal(d))
      .catch(() => {});
  }, [demo]);
  const data = demo ? COMISSOES_DEMO : real ?? EMPTY;
  const router = useRouter();
  const pathname = usePathname() || "/comissoes";
  const params = useSearchParams();
  const aba = (ABAS.find((a) => a.v === params.get("aba"))?.v ?? "comissoes") as Aba;
  const [page, setPage] = useState(0);
  const [filtro, setFiltro] = useState<"todos" | "Não pagou" | "Ativo" | "Bloqueado">("todos");
  const [applyfyOpen, setApplyfyOpen] = useState(false);
  const [applyfyEmail, setApplyfyEmail] = useState("");
  const [applyfySaved, setApplyfySaved] = useState(false);
  // O admin já incluiu a conta Applyfy no split do vitalício, dentro da Applyfy.
  const [splitConfirmed, setSplitConfirmed] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pixType, setPixType] = useState("cpf");
  const [pixKey, setPixKey] = useState("");
  const [pixSaved, setPixSaved] = useState(false);
  const [saques, setSaques] = useState<Saque[]>([]);
  const [busy, setBusy] = useState(false);

  // Cadastro do afiliado salvo na conta (Applyfy para o split do vitalício, Pix para os saques do mensal).
  const loadCadastro = React.useCallback(() => {
    fetch("/api/conta/afiliado")
      .then((res) => (res.ok ? res.json() : null))
      .then((d: { applyfyEmail: string | null; splitConfirmed?: boolean; pixType: string | null; pixKey: string | null; saques: Saque[] } | null) => {
        if (!d) return;
        setSplitConfirmed(d.splitConfirmed === true);
        if (d.applyfyEmail) {
          setApplyfyEmail(d.applyfyEmail);
          setApplyfySaved(true);
        }
        if (d.pixKey) {
          setPixType(d.pixType ?? "cpf");
          setPixKey(d.pixKey);
          setPixSaved(true);
        }
        setSaques(d.saques ?? []);
      })
      .catch(() => {});
  }, []);
  useEffect(loadCadastro, [loadCadastro]);

  async function salvar(body: Record<string, unknown>, ok: string) {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/conta/afiliado", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(d.error || "Não deu para salvar agora.");
      setMsg({ ok: true, text: ok });
      return true;
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message });
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function pedirSaque() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/conta/saque", { method: "POST" });
      const d = (await res.json().catch(() => ({}))) as { error?: string; amountCents?: number };
      if (!res.ok) throw new Error(d.error || "Não deu para pedir o saque agora.");
      setMsg({ ok: true, text: `Saque de ${formatBRL(d.amountCents ?? 0)} pedido. O admin paga no seu Pix e você vê aqui quando for pago.` });
      loadCadastro();
      fetch("/api/conta/comissoes").then((r) => (r.ok ? r.json() : null)).then((x) => x && setReal(x)).catch(() => {});
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  // Porcentagem da conta, definida no Painel do Afiliado (aba Afiliados); a demonstração usa a do exemplo.
  const [ownPct, setOwnPct] = useState<number | null>(null);
  useEffect(() => {
    if (demo) return;
    fetch("/api/conta/comissao")
      .then((res) => (res.ok ? res.json() : null))
      .then((d: { pct?: number } | null) => typeof d?.pct === "number" && setOwnPct(d.pct))
      .catch(() => {});
  }, [demo]);
  const pctLabel = (demo ? COMMISSION_RATE * 100 : ownPct ?? COMMISSION_RATE * 100).toLocaleString("pt-BR", { maximumFractionDigits: 2 });

  const r = data.resumo as typeof data.resumo & { saquePedidoCents?: number };
  const disponivel = Math.max(0, r.aReceberCents - r.estornosCents);
  const cards = [
    ["Recebido via Applyfy", formatBRL(r.recebidoApplyfyCents), "Vitalício: o split cai direto na sua conta"],
    ["A receber do admin", formatBRL(disponivel), r.saquePedidoCents ? `Mais ${formatBRL(r.saquePedidoCents)} em saque pedido` : `Mensal: menos ${formatBRL(r.estornosCents)} de estornos`],
    ["Já repassado", formatBRL(r.repassadoCents), "Saques pagos no Pix"],
    ["Vendas", String(r.vendas), `Comissão de ${pctLabel}%`],
  ];

  function goto(v: Aba) {
    setPage(0);
    router.replace(v === "comissoes" ? pathname : `${pathname}?aba=${v}`, { scroll: false });
  }

  const indicados = filtro === "todos" ? data.indicados : data.indicados.filter((i) => i.situacao === filtro);
  const rows = aba === "comissoes" ? data.comissoes : aba === "transacoes" ? data.transacoes : indicados;
  const total = rows.length;
  const from = page * PAGE;
  const slice = rows.slice(from, from + PAGE);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <header>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Saque de comissões</h1>
        <p className="mt-1 max-w-2xl text-muted-foreground">
          Vitalício: a Applyfy divide o pagamento na hora (split) e sua parte cai direto na sua conta Applyfy, depois
          que você cadastra a conta abaixo e o admin confirma o split. Mensal (ou vitalício antes da confirmação): a
          comissão fica em “A receber do admin” e você pede o saque por Pix.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {cards.map(([label, value, sub]) => (
          <div key={label} className="rounded-2xl border border-border/60 bg-card/70 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className="mt-1 font-display text-2xl font-extrabold tracking-tight tabular-nums">{value}</p>
            {sub && <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>}
          </div>
        ))}
      </div>

      <section className={CARD}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold tracking-tight">Sua conta Applyfy</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {!applyfySaved
                ? "Cadastre o e-mail da sua conta Applyfy para receber o vitalício pelo split. Sem cadastro, a comissão do vitalício fica a receber do admin."
                : splitConfirmed
                  ? `Conta vinculada: ${applyfyEmail}. Split confirmado: a comissão do vitalício cai direto na sua conta Applyfy.`
                  : `Conta vinculada: ${applyfyEmail}. Aguardando o admin incluir essa conta no split da Applyfy; até lá, a comissão do vitalício entra no seu saldo de saque.`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setApplyfyOpen((o) => !o)}
            className="inline-flex h-10 items-center rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-xs cursor-pointer"
          >
            {applyfySaved ? "Alterar dados da Applyfy" : "Cadastrar dados da Applyfy"}
          </button>
        </div>
        {applyfyOpen && (
          <form
            className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]"
            onSubmit={async (e) => {
              e.preventDefault();
              if (await salvar({ applyfyEmail: applyfyEmail.trim() }, "Conta Applyfy salva. Peça ao admin para incluir você no split do vitalício.")) {
                setApplyfySaved(true);
                // Relê do servidor: trocar a conta desfaz a confirmação do split; manter a mesma, não.
                loadCadastro();
                setApplyfyOpen(false);
              }
            }}
          >
            <input
              required
              type="email"
              value={applyfyEmail}
              onChange={(e) => setApplyfyEmail(e.target.value)}
              placeholder="E-mail da sua conta Applyfy"
              className={INPUT_CLASS}
            />
            <button type="submit" disabled={busy} className="h-11 rounded-xl border border-border bg-background px-5 text-xs font-semibold hover:bg-muted disabled:opacity-50 cursor-pointer">
              Salvar
            </button>
          </form>
        )}
      </section>

      <section className={CARD}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold tracking-tight">Saque por Pix</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Disponível para saque: <strong className="text-foreground tabular-nums">{formatBRL(disponivel)}</strong> (comissões do mensal e
              do vitalício sem split). Saque mínimo de R$ 10,00.
            </p>
          </div>
          <button
            type="button"
            disabled={busy || !pixSaved || disponivel < 1000}
            onClick={pedirSaque}
            className="inline-flex h-10 items-center rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-xs disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            Solicitar saque
          </button>
        </div>
        <form
          className="mt-4 grid gap-3 sm:grid-cols-[150px_1fr_auto]"
          onSubmit={async (e) => {
            e.preventDefault();
            if (await salvar({ pixType, pixKey: pixKey.trim() }, "Chave Pix salva.")) setPixSaved(true);
          }}
        >
          <select value={pixType} onChange={(e) => setPixType(e.target.value)} aria-label="Tipo de chave Pix" className={`${INPUT_CLASS} cursor-pointer`}>
            <option value="cpf">CPF</option>
            <option value="cnpj">CNPJ</option>
            <option value="email">E-mail</option>
            <option value="telefone">Telefone</option>
            <option value="aleatoria">Chave aleatória</option>
          </select>
          <input required value={pixKey} onChange={(e) => setPixKey(e.target.value)} placeholder="Sua chave Pix" aria-label="Chave Pix" className={INPUT_CLASS} />
          <button type="submit" disabled={busy} className="h-11 rounded-xl border border-border bg-background px-5 text-xs font-semibold hover:bg-muted disabled:opacity-50 cursor-pointer">
            {pixSaved ? "Atualizar" : "Salvar"}
          </button>
        </form>
        {!pixSaved && <p className="mt-2 text-xs text-muted-foreground">Cadastre a chave Pix para liberar o botão de saque.</p>}
        {msg && <p className={cn("mt-3 text-sm", msg.ok ? "text-primary" : "text-red-500")}>{msg.text}</p>}
        {saques.length > 0 && (
          <ul className="mt-4 divide-y divide-border/60 text-sm">
            {saques.map((q) => (
              <li key={q.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span className="tabular-nums">{new Date(q.created_at).toLocaleDateString("pt-BR")}</span>
                <span className="font-semibold tabular-nums">{formatBRL(q.amount_cents)}</span>
                <Badge s={q.status === "paid" ? "Pago" : q.status === "rejected" ? "Recusado / expirado" : "Aguardando pagamento"} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex w-fit gap-1 rounded-full bg-muted/40 p-1">
        {ABAS.map((a) => (
          <button
            key={a.v}
            type="button"
            onClick={() => goto(a.v)}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-semibold transition-colors cursor-pointer",
              aba === a.v ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {a.l}
          </button>
        ))}
      </div>

      <section className={CARD}>
        {aba === "comissoes" && (
          <>
            <h2 className="font-display text-lg font-bold tracking-tight">Comissões</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Uma linha por venda paga. Tentativas que não foram pagas aparecem em Transações.
            </p>
          </>
        )}
        {aba === "transacoes" && (
          <>
            <h2 className="font-display text-lg font-bold tracking-tight">Transações</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Toda tentativa de compra pelos seus links — Pix gerado, pago, recusado ou reembolsado. Compras abandonadas
              no checkout da Applyfy não aparecem aqui: ela só nos avisa quando o pagamento acontece.
            </p>
          </>
        )}
        {aba === "indicados" && (
          <>
            <h2 className="font-display text-lg font-bold tracking-tight">Indicados</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Quem entrou pelos seus links. Normalmente é o pagamento que libera o acesso — liberar alguém aqui dá o
              produto de graça e não gera comissão.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {(
                [
                  ["todos", "Todos", data.indicados.length],
                  ["Não pagou", "Não pagaram", data.indicados.filter((i) => i.situacao === "Não pagou").length],
                  ["Ativo", "Ativos", data.indicados.filter((i) => i.situacao === "Ativo").length],
                  ["Bloqueado", "Bloqueados", data.indicados.filter((i) => i.situacao === "Bloqueado").length],
                ] as const
              ).map(([v, l, n]) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => {
                    setFiltro(v);
                    setPage(0);
                  }}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-semibold cursor-pointer",
                    filtro === v ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground",
                  )}
                >
                  {l}
                  <span className="ml-1.5 tabular-nums">{n}</span>
                </button>
              ))}
            </div>
          </>
        )}

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                {aba === "comissoes" && ["Data", "Plano", "Venda", "Comissão", "Status"].map((h) => <th key={h} className="pb-2 font-semibold">{h}</th>)}
                {aba === "transacoes" && ["Data", "Comprador", "Plano", "Forma", "Valor", "Situação"].map((h) => <th key={h} className="pb-2 font-semibold">{h}</th>)}
                {aba === "indicados" && ["Entrou em", "Nome", "E-mail", "Plano", "Situação", "Ações"].map((h) => <th key={h} className="pb-2 font-semibold">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {aba === "comissoes" &&
                (slice as typeof data.comissoes).map((c, i) => (
                  <tr key={i}>
                    <td className="py-2.5 tabular-nums">{c.date}</td>
                    <td>{c.plano}</td>
                    <td className="tabular-nums">{formatBRL(c.vendaCents)}</td>
                    <td className="tabular-nums">
                      <span className="font-semibold">{formatBRL(c.comissaoCents)}</span>
                      <span className="ml-1 text-xs text-muted-foreground">({pctLabel}%)</span>
                    </td>
                    <td><Badge s={c.status} /></td>
                  </tr>
                ))}
              {aba === "transacoes" &&
                (slice as typeof data.transacoes).map((t, i) => (
                  <tr key={i}>
                    <td className="py-2.5 tabular-nums">{t.date}</td>
                    <td className="text-muted-foreground">{t.comprador}</td>
                    <td>{t.plano}</td>
                    <td className="font-mono text-xs">{t.forma}</td>
                    <td className="tabular-nums">{formatBRL(t.valorCents)}</td>
                    <td><Badge s={t.situacao} /></td>
                  </tr>
                ))}
              {aba === "indicados" &&
                (slice as typeof data.indicados).map((p, i) => (
                  <tr key={i}>
                    <td className="py-2.5 tabular-nums">{p.date}</td>
                    <td>{p.nome}</td>
                    <td className="text-muted-foreground">{p.email}</td>
                    <td>{p.plano ?? "—"}</td>
                    <td><Badge s={p.situacao} /></td>
                    <td className="text-muted-foreground">—</td>
                  </tr>
                ))}
            </tbody>
          </table>
          {total === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Nada por aqui ainda.</p>}
        </div>

        {total > 0 && (
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span className="tabular-nums">
              {from + 1}–{Math.min(from + PAGE, total)} de {total}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="h-8 rounded-lg border border-border px-3 font-semibold disabled:opacity-40 cursor-pointer"
              >
                Anterior
              </button>
              <button
                type="button"
                disabled={from + PAGE >= total}
                onClick={() => setPage((p) => p + 1)}
                className="h-8 rounded-lg border border-border px-3 font-semibold disabled:opacity-40 cursor-pointer"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
