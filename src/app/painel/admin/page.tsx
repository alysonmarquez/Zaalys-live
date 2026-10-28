"use client";

import React, { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Crown, KeyRound, MailPlus, RefreshCw, Search, ShieldOff, Smartphone, UserPlus } from "lucide-react";
import { cn } from "@/components/brand";
import { AfiliadosAdmin } from "@/components/afiliados-admin";
import { formatBRL } from "@/lib/zaalys-data";

// Admin: visão geral com os números reais do sistema, usuários e acessos por plano, pagamentos da Applyfy,
// afiliados e comissões, e chamados de suporte. Só para ADMIN_EMAILS (o layout e as APIs conferem).

const CARD = "rounded-3xl border border-black/[0.06] bg-card/85 p-5 shadow-2xs sm:p-6 dark:border-white/[0.08]";
const INPUT =
  "h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-ring/30";
const BTN = "inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold disabled:opacity-50 cursor-pointer";

type Aba = "geral" | "usuarios" | "pagamentos" | "afiliados" | "saques" | "suporte";
const ABAS: { v: Aba; l: string }[] = [
  { v: "geral", l: "Visão geral" },
  { v: "usuarios", l: "Usuários e acessos" },
  { v: "pagamentos", l: "Pagamentos" },
  { v: "afiliados", l: "Afiliados" },
  { v: "saques", l: "Saques" },
  { v: "suporte", l: "Suporte" },
];

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "numeric" }) : "—";
const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

async function api<T>(url: string, body?: unknown): Promise<T> {
  const r = await fetch(url, body ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : undefined);
  const d = (await r.json().catch(() => ({}))) as T & { error?: string };
  if (!r.ok) throw new Error(d.error || (r.status === 401 ? "Sem permissão de admin (ou banco não configurado)." : "Não deu certo. Tente de novo."));
  return d;
}

export default function AdminPage() {
  return (
    <Suspense fallback={null}>
      <Admin />
    </Suspense>
  );
}

function Admin() {
  const router = useRouter();
  const pathname = usePathname() || "/painel/admin";
  const params = useSearchParams();
  const aba = (ABAS.find((a) => a.v === params.get("aba"))?.v ?? "geral") as Aba;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <header>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Admin</h1>
        <p className="mt-1 text-muted-foreground">Contas, acessos por plano, pagamentos, afiliados e suporte do MediaFlowMZ.</p>
      </header>

      <nav className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
        {ABAS.map((a) => (
          <button
            key={a.v}
            type="button"
            onClick={() => router.replace(a.v === "geral" ? pathname : `${pathname}?aba=${a.v}`, { scroll: false })}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-colors cursor-pointer",
              aba === a.v ? "bg-primary text-primary-foreground shadow-xs" : "bg-muted/40 text-muted-foreground hover:text-foreground",
            )}
          >
            {a.l}
          </button>
        ))}
      </nav>

      {aba === "geral" && <Geral onGo={(v) => router.replace(`${pathname}?aba=${v}`, { scroll: false })} />}
      {aba === "usuarios" && <Usuarios />}
      {aba === "pagamentos" && <Pagamentos />}
      {aba === "afiliados" && <AfiliadosAdmin />}
      {aba === "saques" && <Saques />}
      {aba === "suporte" && <Suporte />}
    </div>
  );
}

/* ---------------- Visão geral ---------------- */

type Resumo = {
  contas: { total: number; ultimos7: number; ultimos30: number };
  acessos: { vitalicio: number; mensal: number; manual: number; sem: number; pagosSemConta: number };
  receita: { mesCents: number; dias30Cents: number; estornos30Cents: number; vendas30: number };
  afiliados: { vendas: number; aRepassarCents: number; repassadoCents: number };
  suporte: { abertos: number };
  saques?: { pendentes: number; valorCents: number };
  lives: { dias30: number; noAr: number };
};

function Stat({ label, value, sub, onClick }: { label: string; value: string; sub?: string; onClick?: () => void }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      {...(onClick ? { type: "button" as const, onClick } : {})}
      className={cn("rounded-2xl border border-border/60 bg-card/70 p-4 text-left", onClick && "cursor-pointer hover:border-primary/40")}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-extrabold tracking-tight tabular-nums">{value}</p>
      {sub && <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>}
    </Tag>
  );
}

function Geral({ onGo }: { onGo: (v: Aba) => void }) {
  const [r, setR] = useState<Resumo | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  useEffect(() => {
    api<Resumo>("/api/admin/resumo").then(setR, (e: Error) => setErro(e.message));
  }, []);
  if (erro) return <p className="text-sm text-red-500">{erro}</p>;
  if (!r) return <p className="text-sm text-muted-foreground">Carregando…</p>;
  const ativos = r.acessos.vitalicio + r.acessos.mensal + r.acessos.manual;
  return (
    <div className="space-y-6">
      <section>
        <h2 className="mb-3 font-display text-lg font-bold">Receita</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Este mês" value={formatBRL(r.receita.mesCents)} sub="Pagamentos aprovados" onClick={() => onGo("pagamentos")} />
          <Stat label="Últimos 30 dias" value={formatBRL(r.receita.dias30Cents)} sub={`${r.receita.vendas30} ${r.receita.vendas30 === 1 ? "venda" : "vendas"}`} />
          <Stat label="Estornos (30 dias)" value={formatBRL(r.receita.estornos30Cents)} />
          <Stat label="Comissões a repassar" value={formatBRL(r.afiliados.aRepassarCents)} sub={`Já repassado: ${formatBRL(r.afiliados.repassadoCents)}`} onClick={() => onGo("afiliados")} />
        </div>
      </section>
      <section>
        <h2 className="mb-3 font-display text-lg font-bold">Contas e acessos</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Contas" value={String(r.contas.total)} sub={`+${r.contas.ultimos7} em 7 dias · +${r.contas.ultimos30} em 30 dias`} onClick={() => onGo("usuarios")} />
          <Stat label="Com acesso" value={String(ativos)} sub={`${r.acessos.vitalicio} vitalício · ${r.acessos.mensal} mensal · ${r.acessos.manual} liberado pelo admin`} onClick={() => onGo("usuarios")} />
          <Stat label="Sem acesso" value={String(r.acessos.sem)} sub="Cadastraram e não pagaram" onClick={() => onGo("usuarios")} />
          <Stat label="Pagaram sem conta" value={String(r.acessos.pagosSemConta)} sub="Entram ao se cadastrar com o e-mail" onClick={() => onGo("usuarios")} />
        </div>
      </section>
      <section>
        <h2 className="mb-3 font-display text-lg font-bold">Operação</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Vendas por afiliados" value={String(r.afiliados.vendas)} onClick={() => onGo("afiliados")} />
          <Stat label="Chamados abertos" value={String(r.suporte.abertos)} onClick={() => onGo("suporte")} />
          <Stat label="Saques a pagar" value={String(r.saques?.pendentes ?? 0)} sub={formatBRL(r.saques?.valorCents ?? 0)} onClick={() => onGo("saques")} />
          <Stat label="Lives (30 dias)" value={String(r.lives.dias30)} sub={`${r.lives.noAr} no ar agora`} />
        </div>
      </section>
    </div>
  );
}

/* ---------------- Usuários e acessos ---------------- */

type Usuario = {
  id: string;
  email: string;
  nome: string | null;
  criado: string;
  conta: boolean;
  codigo: string | null;
  comissaoPct: number | null;
  applyfy?: string | null;
  pix?: string | null;
  aparelho: { nome: string; desde: string | null } | null;
  afiliado: { vendas: number; aRepassarCents: number };
  acesso: "pago" | "manual" | "encerrado" | "sem";
  plano: "lifetime" | "monthly" | null;
  expira: string | null;
  origem: string | null;
  temManual: boolean;
  historico: { plano: string; status: string; origem: string; expira: string | null; atualizado: string }[];
};

type Filtro = "todos" | "vitalicio" | "mensal" | "manual" | "sem" | "semconta";
const FILTROS: { v: Filtro; l: string }[] = [
  { v: "todos", l: "Todos" },
  { v: "vitalicio", l: "Vitalício" },
  { v: "mensal", l: "Mensal" },
  { v: "manual", l: "Aprovados por você" },
  { v: "sem", l: "Sem acesso" },
  { v: "semconta", l: "Pagou sem conta" },
];

const PLANO = { lifetime: "Vitalício", monthly: "Mensal" } as const;
const STATUS_PT: Record<string, string> = { active: "ativo", pending: "pendente", past_due: "atrasado", canceled: "cancelado", refunded: "reembolsado" };

function selo(u: Usuario) {
  if (u.acesso === "pago") return { l: `${PLANO[u.plano!]} · pago`, cls: "bg-primary/15 text-primary" };
  if (u.acesso === "manual") return { l: `${PLANO[u.plano!]} · aprovado por você`, cls: "bg-sky-500/15 text-sky-600 dark:text-sky-400" };
  if (u.acesso === "encerrado") return { l: "Sem acesso (revogado ou cancelado)", cls: "bg-red-500/12 text-red-600 dark:text-red-400" };
  return { l: "Sem acesso", cls: "bg-muted text-muted-foreground" };
}

function Usuarios() {
  const [lista, setLista] = useState<Usuario[] | null>(null);
  const [padrao, setPadrao] = useState(40);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [aberto, setAberto] = useState<string | null>(null);
  const [salvando, setSalvando] = useState<string | null>(null);

  const carregar = useCallback(() => {
    api<{ usuarios: Usuario[]; comissaoPadrao: number }>("/api/admin/usuarios").then(
      (d) => {
        setLista(d.usuarios);
        setPadrao(d.comissaoPadrao);
        setErro(null);
      },
      (e: Error) => setErro(e.message),
    );
  }, []);
  useEffect(carregar, [carregar]);

  async function agir(key: string, body: Record<string, unknown>, ok: string) {
    setSalvando(key);
    setAviso(null);
    try {
      const d = await api<{ convite?: string | null }>("/api/admin/usuarios", body);
      const extra =
        d.convite === "enviado" ? " Convite enviado por e-mail." : d.convite === "ja-tem-conta" ? " A pessoa já tem conta." : d.convite === "falhou" ? " Não foi possível enviar o convite." : "";
      setAviso(ok + extra);
      setErro(null);
      carregar();
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setSalvando(null);
    }
  }

  const contagem = useMemo(() => {
    const c: Record<Filtro, number> = { todos: 0, vitalicio: 0, mensal: 0, manual: 0, sem: 0, semconta: 0 };
    for (const u of lista ?? []) {
      c.todos++;
      if (u.acesso === "pago" && u.plano === "lifetime") c.vitalicio++;
      if (u.acesso === "pago" && u.plano === "monthly") c.mensal++;
      if (u.acesso === "manual") c.manual++;
      if (u.acesso === "sem" || u.acesso === "encerrado") c.sem++;
      if (!u.conta) c.semconta++;
    }
    return c;
  }, [lista]);

  const visiveis = (lista ?? []).filter((u) => {
    const q = busca.trim().toLowerCase();
    if (q && !u.email.includes(q) && !(u.nome ?? "").toLowerCase().includes(q) && !(u.codigo ?? "").includes(q)) return false;
    switch (filtro) {
      case "vitalicio":
        return u.acesso === "pago" && u.plano === "lifetime";
      case "mensal":
        return u.acesso === "pago" && u.plano === "monthly";
      case "manual":
        return u.acesso === "manual";
      case "sem":
        return u.acesso === "sem" || u.acesso === "encerrado";
      case "semconta":
        return !u.conta;
      default:
        return true;
    }
  });

  return (
    <div className="space-y-5">
      <ConcederAcesso salvando={salvando === "novo"} onSubmit={(body, ok) => agir("novo", body, ok)} />

      <section className={CARD}>
        <p className="mb-4 max-w-3xl text-sm text-muted-foreground">
          “Aprovado por você” é quem entrou sem pagar, liberado por você. Isso não dá acesso de admin: o painel de admin e a
          porcentagem dos afiliados só aparecem na sua conta. Ao revogar, a pessoa fica sem acesso e o histórico abaixo de cada
          conta continua mostrando o que já aconteceu.
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="-mx-1 flex max-w-full gap-1 overflow-x-auto px-1">
            {FILTROS.map((f) => (
              <button
                key={f.v}
                type="button"
                onClick={() => setFiltro(f.v)}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold cursor-pointer",
                  filtro === f.v ? "bg-primary text-primary-foreground" : "bg-muted/40 text-muted-foreground hover:text-foreground",
                )}
              >
                {f.l} <span className="tabular-nums opacity-70">{contagem[f.v]}</span>
              </button>
            ))}
          </div>
          <div className="flex w-full gap-2 sm:w-auto">
            <label className="flex h-9 flex-1 items-center gap-2 rounded-xl border border-border bg-background px-3 sm:w-64 sm:flex-none">
              <Search size={14} className="text-muted-foreground" />
              <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Nome, e-mail ou código" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
            </label>
            <button type="button" onClick={carregar} aria-label="Atualizar" className={cn(BTN, "border border-border hover:bg-muted")}>
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {erro && <p className="mt-4 text-sm text-red-500">{erro}</p>}
        {aviso && <p className="mt-4 text-sm text-primary">{aviso}</p>}

        <ul className="mt-4 divide-y divide-border/60">
          {lista === null && !erro && <li className="py-8 text-center text-sm text-muted-foreground">Carregando…</li>}
          {lista !== null && visiveis.length === 0 && <li className="py-8 text-center text-sm text-muted-foreground">Ninguém aqui.</li>}
          {visiveis.map((u) => {
            const s = selo(u);
            const open = aberto === u.id;
            const busy = salvando === u.id;
            return (
              <li key={u.id} className="py-3">
                <button type="button" onClick={() => setAberto(open ? null : u.id)} className="flex w-full items-center gap-3 text-left cursor-pointer">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                    {(u.nome || u.email).charAt(0).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{u.nome || u.email.split("@")[0]}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {u.email} · {u.conta ? `conta desde ${fmtDate(u.criado)}` : "ainda sem conta"}
                      {u.acesso !== "sem" && u.plano === "monthly" && u.expira ? ` · até ${fmtDate(u.expira)}` : ""}
                    </span>
                  </span>
                  <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold", s.cls)}>{s.l}</span>
                  <ChevronDown size={16} className={cn("shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
                </button>

                {open && (
                  <div className="mt-3 space-y-4 rounded-2xl bg-muted/30 p-4 text-sm">
                    <div className="grid gap-3 text-xs sm:grid-cols-3">
                      <p>
                        <span className="block text-muted-foreground">Código de afiliado</span>
                        <span className="font-mono">{u.codigo ?? "—"}</span>
                      </p>
                      <p>
                        <span className="block text-muted-foreground">Vendas pelo link</span>
                        {u.afiliado.vendas} · {formatBRL(u.afiliado.aRepassarCents)} a repassar
                      </p>
                      <p>
                        <span className="block text-muted-foreground">Conta Applyfy (split do vitalício)</span>
                        <span className="break-all font-mono">{u.applyfy ?? "Não vinculada"}</span>
                      </p>
                      <p>
                        <span className="block text-muted-foreground">Chave Pix (saques)</span>
                        <span className="break-all">{u.pix ?? "Não cadastrada"}</span>
                      </p>
                      <p>
                        <span className="block text-muted-foreground">Aparelho da extensão</span>
                        {u.aparelho ? `${u.aparelho.nome}${u.aparelho.desde ? ` · desde ${fmtDate(u.aparelho.desde)}` : ""}` : "Nenhum conectado"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => agir(u.id, { action: "conceder", email: u.email, plano: "lifetime" }, `${u.email}: acesso vitalício liberado.`)}
                        className={cn(BTN, "bg-primary text-primary-foreground")}
                      >
                        <Crown size={14} /> Dar vitalício
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => agir(u.id, { action: "conceder", email: u.email, plano: "monthly", dias: 30 }, `${u.email}: +30 dias de acesso mensal.`)}
                        className={cn(BTN, "border border-border hover:bg-muted")}
                      >
                        <KeyRound size={14} /> +30 dias (mensal)
                      </button>
                      {u.temManual && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => {
                            if (confirm(`Tirar o acesso que você liberou para ${u.email}? Pagamentos continuam valendo.`))
                              agir(u.id, { action: "revogar", email: u.email }, `${u.email}: acesso revogado.`);
                          }}
                          className={cn(BTN, "border border-red-500/40 text-red-600 hover:bg-red-500/10 dark:text-red-400")}
                        >
                          <ShieldOff size={14} /> Revogar acesso
                        </button>
                      )}
                      {u.aparelho && u.conta && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => agir(u.id, { action: "liberar-aparelho", userId: u.id }, `${u.email}: aparelho desconectado.`)}
                          className={cn(BTN, "border border-border hover:bg-muted")}
                        >
                          <Smartphone size={14} /> Desconectar aparelho
                        </button>
                      )}
                    </div>

                    {u.conta && (
                      <ComissaoInput
                        valor={u.comissaoPct}
                        padrao={padrao}
                        busy={busy}
                        onSave={(pct) => agir(u.id, { action: "comissao", userId: u.id, pct }, `${u.email}: comissão ${pct == null ? `padrão (${padrao}%)` : `${pct}%`}.`)}
                      />
                    )}

                    {u.historico.length > 0 && (
                      <div>
                        <p className="mb-1 text-xs font-semibold text-muted-foreground">Histórico de acessos</p>
                        <ul className="space-y-1 text-xs">
                          {u.historico.map((h, i) => (
                            <li key={i} className="flex flex-wrap gap-x-2 text-muted-foreground">
                              <span className="text-foreground">{PLANO[h.plano as "lifetime" | "monthly"]}</span>
                              <span>{STATUS_PT[h.status] ?? h.status}</span>
                              <span>· {h.origem === "manual" ? "aprovado por você" : h.origem}</span>
                              {h.expira && <span>· até {fmtDate(h.expira)}</span>}
                              <span>· atualizado {fmtDate(h.atualizado)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function ComissaoInput({ valor, padrao, busy, onSave }: { valor: number | null; padrao: number; busy: boolean; onSave: (pct: number | null) => void }) {
  const [v, setV] = useState(valor == null ? "" : String(valor).replace(".", ","));
  const [erro, setErro] = useState(false);
  return (
    <form
      className="flex flex-wrap items-center gap-2 text-xs"
      onSubmit={(e) => {
        e.preventDefault();
        const raw = v.trim().replace(",", ".");
        const pct = raw === "" ? null : Number(raw);
        if (pct !== null && (!Number.isFinite(pct) || pct < 0 || pct > 100)) return setErro(true);
        setErro(false);
        onSave(pct);
      }}
    >
      <span className="text-muted-foreground">Comissão do afiliado</span>
      <input
        inputMode="decimal"
        value={v}
        placeholder={String(padrao)}
        onChange={(e) => setV(e.target.value)}
        className="h-9 w-16 rounded-lg border border-border bg-background px-2 text-right text-sm tabular-nums outline-none"
      />
      %
      <button type="submit" disabled={busy} className={cn(BTN, "border border-border hover:bg-muted")}>
        Salvar
      </button>
      <span className={cn("text-muted-foreground", erro && "text-red-500")}>{erro ? "Use de 0 a 100." : `Vazio = padrão (${padrao}%)`}</span>
    </form>
  );
}

function ConcederAcesso({ salvando, onSubmit }: { salvando: boolean; onSubmit: (body: Record<string, unknown>, ok: string) => void }) {
  const [email, setEmail] = useState("");
  const [plano, setPlano] = useState<"lifetime" | "monthly">("lifetime");
  const [dias, setDias] = useState("30");
  const [convidar, setConvidar] = useState(true);
  return (
    <section className={CARD}>
      <h2 className="flex items-center gap-2 font-display text-lg font-bold">
        <UserPlus size={18} className="text-primary" /> Liberar acesso
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Dá acesso sem pagamento a um e-mail. Se a pessoa ainda não tem conta, o acesso fica esperando e entra quando ela se cadastrar com esse e-mail (ou pelo convite).
      </p>
      <form
        className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          const d = Math.max(1, Math.min(3650, Number(dias) || 30));
          onSubmit(
            { action: "conceder", email: email.trim(), plano, ...(plano === "monthly" ? { dias: d } : {}), convidar },
            `${email.trim()}: ${plano === "lifetime" ? "acesso vitalício liberado" : `${d} dias de acesso mensal`}.`,
          );
        }}
      >
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">E-mail</span>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="pessoa@email.com" className={INPUT} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">Plano</span>
          <select value={plano} onChange={(e) => setPlano(e.target.value as "lifetime" | "monthly")} className={cn(INPUT, "cursor-pointer sm:w-36")}>
            <option value="lifetime">Vitalício</option>
            <option value="monthly">Mensal</option>
          </select>
        </label>
        {plano === "monthly" && (
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">Dias</span>
            <input inputMode="numeric" value={dias} onChange={(e) => setDias(e.target.value.replace(/\D/g, ""))} className={cn(INPUT, "sm:w-20")} />
          </label>
        )}
        <button type="submit" disabled={salvando} className={cn(BTN, "h-10 bg-primary px-4 text-primary-foreground")}>
          <UserPlus size={14} /> {salvando ? "Liberando…" : "Liberar"}
        </button>
        <label className="flex items-center gap-2 text-xs text-muted-foreground sm:col-span-4">
          <input type="checkbox" checked={convidar} onChange={(e) => setConvidar(e.target.checked)} className="accent-primary" />
          <MailPlus size={14} /> Enviar convite por e-mail para criar a senha (se ainda não tiver conta)
        </label>
      </form>
    </section>
  );
}

/* ---------------- Pagamentos ---------------- */

type Pagamento = { id: string; data: string; evento: string; valorCents: number | null; email: string | null; produto: string | null; forma: string | null };

function Pagamentos() {
  const [lista, setLista] = useState<Pagamento[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  useEffect(() => {
    api<{ pagamentos: Pagamento[] }>("/api/admin/pagamentos").then((d) => setLista(d.pagamentos), (e: Error) => setErro(e.message));
  }, []);
  return (
    <section className={CARD}>
      <p className="text-sm text-muted-foreground">
        Avisos de pagamento que a Applyfy mandou para o sistema (aprovações liberam o acesso sozinhas; reembolsos e cancelamentos tiram).
      </p>
      {erro && <p className="mt-4 text-sm text-red-500">{erro}</p>}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-xs text-muted-foreground">
            <tr>
              <th className="py-2 font-medium">Data</th>
              <th className="font-medium">Comprador</th>
              <th className="font-medium">Produto</th>
              <th className="font-medium">Evento</th>
              <th className="font-medium">Forma</th>
              <th className="text-right font-medium">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {lista === null && !erro && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-muted-foreground">Carregando…</td>
              </tr>
            )}
            {lista?.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-muted-foreground">Nenhum pagamento recebido ainda.</td>
              </tr>
            )}
            {lista?.map((p) => (
              <tr key={p.id}>
                <td className="py-2.5 tabular-nums">{fmtDateTime(p.data)}</td>
                <td className="text-muted-foreground">{p.email ?? "—"}</td>
                <td>{p.produto ?? "—"}</td>
                <td className="font-mono text-xs">{p.evento}</td>
                <td className="font-mono text-xs">{p.forma ?? "—"}</td>
                <td className="text-right tabular-nums">{p.valorCents == null ? "—" : formatBRL(p.valorCents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ---------------- Saques ---------------- */

type SaqueAdmin = {
  id: string;
  email: string;
  nome: string | null;
  valorCents: number;
  pixTipo: string;
  pixChave: string;
  comissoes: number;
  status: "pending" | "paid" | "rejected";
  nota: string | null;
  criado: string;
  pago: string | null;
};
const SAQUE: Record<SaqueAdmin["status"], { l: string; cls: string }> = {
  pending: { l: "Aguardando", cls: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  paid: { l: "Pago", cls: "bg-primary/15 text-primary" },
  rejected: { l: "Recusado", cls: "bg-muted text-muted-foreground" },
};

function Saques() {
  const [lista, setLista] = useState<SaqueAdmin[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<SaqueAdmin["status"] | "todos">("pending");
  const carregar = useCallback(() => {
    api<{ saques: SaqueAdmin[] }>("/api/admin/saques").then((d) => setLista(d.saques), (e: Error) => setErro(e.message));
  }, []);
  useEffect(carregar, [carregar]);

  async function agir(q: SaqueAdmin, action: "pagar" | "recusar") {
    const pergunta =
      action === "pagar"
        ? `Confirma que pagou ${formatBRL(q.valorCents)} no Pix de ${q.email} (${q.pixTipo}: ${q.pixChave})?`
        : `Recusar o saque de ${formatBRL(q.valorCents)} de ${q.email}? As comissões voltam para o saldo dele.`;
    if (!confirm(pergunta)) return;
    try {
      await api("/api/admin/saques", { id: q.id, action });
      carregar();
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  const visiveis = (lista ?? []).filter((q) => filtro === "todos" || q.status === filtro);
  return (
    <section className={CARD}>
      <p className="text-sm text-muted-foreground">
        Pedidos de saque dos afiliados (comissões do mensal e do vitalício sem split). Pague no Pix e marque como pago: as comissões viram
        “Repassada” para o afiliado.
      </p>
      <div className="mt-4 flex flex-wrap gap-1">
        {(["pending", "paid", "rejected", "todos"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFiltro(f)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold cursor-pointer",
              filtro === f ? "bg-primary text-primary-foreground" : "bg-muted/40 text-muted-foreground hover:text-foreground",
            )}
          >
            {f === "todos" ? "Todos" : SAQUE[f].l}{" "}
            <span className="tabular-nums opacity-70">{f === "todos" ? lista?.length ?? 0 : (lista ?? []).filter((q) => q.status === f).length}</span>
          </button>
        ))}
      </div>
      {erro && <p className="mt-4 text-sm text-red-500">{erro}</p>}
      <ul className="mt-4 space-y-3">
        {lista === null && !erro && <li className="py-8 text-center text-sm text-muted-foreground">Carregando…</li>}
        {lista !== null && visiveis.length === 0 && <li className="py-8 text-center text-sm text-muted-foreground">Nenhum pedido aqui.</li>}
        {visiveis.map((q) => (
          <li key={q.id} className="rounded-2xl border border-border/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold">
                {q.nome || q.email} · <span className="tabular-nums">{formatBRL(q.valorCents)}</span>
              </p>
              <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", SAQUE[q.status].cls)}>{SAQUE[q.status].l}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {q.email} · pedido em {fmtDateTime(q.criado)} · {q.comissoes} {q.comissoes === 1 ? "comissão" : "comissões"}
              {q.pago ? ` · pago em ${fmtDateTime(q.pago)}` : ""}
            </p>
            <p className="mt-2 break-all text-sm">
              Pix ({q.pixTipo}): <span className="font-mono">{q.pixChave}</span>
            </p>
            {q.status === "pending" && (
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => agir(q, "pagar")} className={cn(BTN, "bg-primary text-primary-foreground")}>
                  Marcar como pago
                </button>
                <button type="button" onClick={() => agir(q, "recusar")} className={cn(BTN, "border border-border hover:bg-muted")}>
                  Recusar
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------------- Suporte ---------------- */

type Chamado = { id: string; email: string; topic: string; message: string; page: string | null; status: "open" | "answered" | "closed"; created_at: string };
const SIT: Record<Chamado["status"], { l: string; cls: string }> = {
  open: { l: "Aberto", cls: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  answered: { l: "Respondido", cls: "bg-primary/15 text-primary" },
  closed: { l: "Fechado", cls: "bg-muted text-muted-foreground" },
};

function Suporte() {
  const [lista, setLista] = useState<Chamado[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<Chamado["status"] | "todos">("open");
  useEffect(() => {
    api<{ chamados: Chamado[] }>("/api/admin/suporte").then((d) => setLista(d.chamados), (e: Error) => setErro(e.message));
  }, []);

  async function mudar(id: string, status: Chamado["status"]) {
    try {
      await api("/api/admin/suporte", { id, status });
      setLista((l) => l?.map((c) => (c.id === id ? { ...c, status } : c)) ?? l);
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  const visiveis = (lista ?? []).filter((c) => filtro === "todos" || c.status === filtro);
  return (
    <section className={CARD}>
      <div className="flex flex-wrap gap-1">
        {(["open", "answered", "closed", "todos"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFiltro(f)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold cursor-pointer",
              filtro === f ? "bg-primary text-primary-foreground" : "bg-muted/40 text-muted-foreground hover:text-foreground",
            )}
          >
            {f === "todos" ? "Todos" : SIT[f].l} <span className="tabular-nums opacity-70">{f === "todos" ? lista?.length ?? 0 : (lista ?? []).filter((c) => c.status === f).length}</span>
          </button>
        ))}
      </div>
      {erro && <p className="mt-4 text-sm text-red-500">{erro}</p>}
      <ul className="mt-4 space-y-3">
        {lista === null && !erro && <li className="py-8 text-center text-sm text-muted-foreground">Carregando…</li>}
        {lista !== null && visiveis.length === 0 && <li className="py-8 text-center text-sm text-muted-foreground">Nenhum chamado aqui.</li>}
        {visiveis.map((c) => (
          <li key={c.id} className="rounded-2xl border border-border/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold">{c.topic}</p>
              <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", SIT[c.status].cls)}>{SIT[c.status].l}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {c.email} · {fmtDateTime(c.created_at)}
              {c.page ? ` · em ${c.page}` : ""}
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm">{c.message}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a href={`mailto:${c.email}?subject=${encodeURIComponent(`Re: ${c.topic}`)}`} className={cn(BTN, "bg-primary text-primary-foreground")}>
                Responder por e-mail
              </a>
              {c.status !== "answered" && (
                <button type="button" onClick={() => mudar(c.id, "answered")} className={cn(BTN, "border border-border hover:bg-muted")}>
                  Marcar respondido
                </button>
              )}
              {c.status !== "closed" && (
                <button type="button" onClick={() => mudar(c.id, "closed")} className={cn(BTN, "border border-border hover:bg-muted")}>
                  Fechar
                </button>
              )}
              {c.status !== "open" && (
                <button type="button" onClick={() => mudar(c.id, "open")} className={cn(BTN, "border border-border hover:bg-muted")}>
                  Reabrir
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
