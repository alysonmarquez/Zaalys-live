"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, HandCoins, RotateCcw, Search, UserCheck } from "lucide-react";
import { cn } from "@/components/brand";

// Aba "Afiliados" do Painel do Afiliado (quem está em ADMIN_EMAILS): contas cadastradas. Aprovar libera o painel
// sem pagamento; revogar tira essa liberação (quem pagou continua com acesso). Cada afiliado tem sua porcentagem
// de comissão (vazio = padrão de 40%).

type Situacao = "pendente" | "aprovado" | "pago";
type Afiliado = { id: string; email: string; name: string | null; createdAt: string; commissionPct: number | null; situacao: Situacao; vendas?: number; aReceberCents?: number };
const brl = (c: number) => (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const CARD = "rounded-3xl border border-black/[0.06] bg-card/85 p-5 shadow-2xs sm:p-6 dark:border-white/[0.08]";
const PADRAO_PCT = 40;

const FILTROS: { v: Situacao | "todos"; l: string }[] = [
  { v: "pendente", l: "Pendentes" },
  { v: "aprovado", l: "Aprovados" },
  { v: "pago", l: "Pagos" },
  { v: "todos", l: "Todos" },
];

const SELO: Record<Situacao, { l: string; cls: string }> = {
  pendente: { l: "Pendente", cls: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  aprovado: { l: "Aprovado", cls: "bg-primary/15 text-primary" },
  pago: { l: "Pago", cls: "bg-sky-500/15 text-sky-600 dark:text-sky-400" },
};

export function AfiliadosAdmin() {
  const [lista, setLista] = useState<Afiliado[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<Situacao | "todos">("pendente");
  const [busca, setBusca] = useState("");
  const [salvando, setSalvando] = useState<string | null>(null);
  // Porcentagens sendo digitadas (por conta), até salvar.
  const [pcts, setPcts] = useState<Record<string, string>>({});
  const [salvoPct, setSalvoPct] = useState<string | null>(null);

  async function carregar() {
    try {
      const r = await fetch("/api/admin/afiliados");
      if (!r.ok) throw new Error(r.status === 401 ? "Sem permissão (ou banco não configurado)." : "Não foi possível carregar.");
      const d = (await r.json()) as { afiliados: Afiliado[] };
      setLista(d.afiliados);
      setErro(null);
    } catch (e) {
      setErro((e as Error).message);
      setLista([]);
    }
  }
  useEffect(() => {
    carregar();
  }, []);

  async function repassar(a: Afiliado) {
    if (!confirm(`Marcar ${brl(a.aReceberCents ?? 0)} de ${a.name || a.email} como repassado?`)) return;
    setSalvando(a.id);
    try {
      const r = await fetch("/api/admin/afiliados", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: a.id, action: "repassar" }),
      });
      if (!r.ok) throw new Error();
      setLista((l) => l?.map((x) => (x.id === a.id ? { ...x, aReceberCents: 0 } : x)) ?? l);
    } catch {
      setErro("Não deu certo. Tente de novo.");
    } finally {
      setSalvando(null);
    }
  }

  async function agir(id: string, action: "aprovar" | "revogar") {
    setSalvando(id);
    try {
      const r = await fetch("/api/admin/afiliados", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id, action }),
      });
      if (!r.ok) throw new Error();
      setLista((l) => l?.map((a) => (a.id === id ? { ...a, situacao: action === "aprovar" ? "aprovado" : "pendente" } : a)) ?? l);
    } catch {
      setErro("Não deu certo. Tente de novo.");
    } finally {
      setSalvando(null);
    }
  }

  async function salvarComissao(a: Afiliado) {
    const raw = (pcts[a.id] ?? "").trim().replace(",", ".");
    const pct = raw === "" ? null : Number(raw);
    if (pct !== null && (!Number.isFinite(pct) || pct < 0 || pct > 100)) {
      setErro("A comissão deve ser de 0 a 100%.");
      return;
    }
    setSalvando(a.id);
    try {
      const r = await fetch("/api/admin/afiliados", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: a.id, action: "comissao", pct }),
      });
      const d = (await r.json().catch(() => ({}))) as { error?: string };
      if (!r.ok) throw new Error(d.error || "Não deu certo. Tente de novo.");
      setLista((l) => l?.map((x) => (x.id === a.id ? { ...x, commissionPct: pct } : x)) ?? l);
      setPcts(({ [a.id]: _, ...rest }) => rest);
      setErro(null);
      setSalvoPct(a.id);
      setTimeout(() => setSalvoPct(null), 1800);
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setSalvando(null);
    }
  }

  const contagem = useMemo(() => {
    const c = { pendente: 0, aprovado: 0, pago: 0, todos: lista?.length ?? 0 };
    for (const a of lista ?? []) c[a.situacao]++;
    return c;
  }, [lista]);

  const visiveis = (lista ?? []).filter((a) => {
    const q = busca.trim().toLowerCase();
    return (filtro === "todos" || a.situacao === filtro) && (!q || a.email.toLowerCase().includes(q) || (a.name ?? "").toLowerCase().includes(q));
  });

  return (
      <section className={CARD}>
        <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
          Aprove quem pode entrar sem pagar e defina a comissão de cada afiliado (vazio = {PADRAO_PCT}%).
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex w-fit flex-wrap gap-1 rounded-full bg-muted/40 p-1">
            {FILTROS.map((f) => (
              <button
                key={f.v}
                type="button"
                onClick={() => setFiltro(f.v)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer",
                  filtro === f.v ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {f.l} <span className="tabular-nums opacity-70">{contagem[f.v]}</span>
              </button>
            ))}
          </div>
          <label className="flex h-9 min-w-[220px] items-center gap-2 rounded-xl border border-border bg-background px-3">
            <Search size={14} className="text-muted-foreground" />
            <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar nome ou e-mail" className="flex-1 bg-transparent text-sm outline-none" />
          </label>
        </div>

        {erro && <p className="mt-4 text-sm text-red-500">{erro}</p>}

        <ul className="mt-4 divide-y divide-border/60">
          {lista === null && <li className="py-8 text-center text-sm text-muted-foreground">Carregando…</li>}
          {lista !== null && visiveis.length === 0 && <li className="py-8 text-center text-sm text-muted-foreground">Ninguém aqui.</li>}
          {visiveis.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center gap-3 py-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                {(a.name || a.email).charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{a.name || a.email.split("@")[0]}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {a.email} · cadastro em {new Date(a.createdAt).toLocaleDateString("pt-BR")}
                </p>
                {(a.vendas ?? 0) > 0 && (
                  <p className="mt-0.5 text-xs">
                    <span className="font-semibold tabular-nums">{a.vendas}</span>{" "}
                    {a.vendas === 1 ? "venda pelo link" : "vendas pelo link"} ·{" "}
                    <span className="font-semibold tabular-nums">{brl(a.aReceberCents ?? 0)}</span> a repassar
                  </p>
                )}
              </div>
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground" title="Comissão do afiliado">
                Comissão
                <input
                  inputMode="decimal"
                  value={pcts[a.id] ?? (a.commissionPct == null ? "" : String(a.commissionPct).replace(".", ","))}
                  placeholder={String(PADRAO_PCT)}
                  onChange={(e) => setPcts({ ...pcts, [a.id]: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && salvarComissao(a)}
                  className="h-9 w-14 rounded-lg border border-border bg-background px-2 text-right text-sm tabular-nums text-foreground outline-none focus-visible:border-primary/60"
                />
                %
              </label>
              {(a.id in pcts || salvoPct === a.id) && (
                <button
                  type="button"
                  disabled={salvando === a.id}
                  onClick={() => salvarComissao(a)}
                  className="inline-flex h-9 items-center gap-1 rounded-xl border border-border px-3 text-xs font-semibold hover:bg-muted disabled:opacity-50 cursor-pointer"
                >
                  {salvoPct === a.id ? <><Check size={13} /> Salva</> : "Salvar"}
                </button>
              )}
              {(a.aReceberCents ?? 0) > 0 && (
                <button
                  type="button"
                  disabled={salvando === a.id}
                  onClick={() => repassar(a)}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border px-3 text-xs font-semibold hover:bg-muted disabled:opacity-50 cursor-pointer"
                >
                  <HandCoins size={14} /> Marcar repassado
                </button>
              )}
              <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", SELO[a.situacao].cls)}>{SELO[a.situacao].l}</span>
              {a.situacao === "pendente" && (
                <button
                  type="button"
                  disabled={salvando === a.id}
                  onClick={() => agir(a.id, "aprovar")}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-3.5 text-xs font-semibold text-primary-foreground disabled:opacity-50 cursor-pointer"
                >
                  <UserCheck size={14} /> Aprovar
                </button>
              )}
              {a.situacao === "aprovado" && (
                <button
                  type="button"
                  disabled={salvando === a.id}
                  onClick={() => agir(a.id, "revogar")}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border px-3.5 text-xs font-semibold hover:bg-muted disabled:opacity-50 cursor-pointer"
                >
                  <RotateCcw size={13} /> Revogar
                </button>
              )}
              {a.situacao === "pago" && (
                <span className="inline-flex h-9 items-center gap-1 px-2 text-xs text-muted-foreground">
                  <Check size={13} /> Acesso pago
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>
  );
}
