"use client";

import React, { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/components/brand";
import { formatBRL } from "@/lib/zaalys-data";
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
  "Na sua conta": "bg-primary/15 text-primary",
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
type Applyfy = { accountId: string; clientId: string | null; hasSecret: boolean; linkedAt: string | null };

/** Janela "Vincular sua conta Applyfy": ID da conta, Client ID e Client Secret da API. */
function VincularApplyfy({ atual, onClose, onSaved }: { atual: Applyfy | null; onClose: () => void; onSaved: () => void }) {
  const [accountId, setAccountId] = useState(atual?.accountId ?? "");
  const [clientId, setClientId] = useState(atual?.clientId ?? "");
  const [secret, setSecret] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErro(null);
    try {
      const res = await fetch("/api/conta/afiliado", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applyfy: { accountId: accountId.trim(), clientId: clientId.trim(), clientSecret: secret.trim() || undefined } }),
      });
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(d.error || "Não deu para salvar agora.");
      onSaved();
    } catch (err) {
      setErro((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const label = "text-[11px] font-semibold uppercase tracking-wide text-muted-foreground";
  const hint = "mt-1 text-[11px] text-muted-foreground";
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="vincular-applyfy"
        onClick={(e) => e.stopPropagation()}
        onSubmit={salvar}
        className="relative w-full max-w-md space-y-4 rounded-3xl border border-border bg-card p-6 shadow-xl"
      >
        <button type="button" onClick={onClose} aria-label="Fechar" className="absolute right-4 top-4 text-muted-foreground hover:text-foreground cursor-pointer">
          ✕
        </button>
        <div>
          <h2 id="vincular-applyfy" className="font-display text-lg font-bold tracking-tight">
            Vincular sua conta Applyfy
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            As comissões do vitalício caem direto na sua conta Applyfy, pelo split, e a Applyfy libera o saque por lá.
          </p>
        </div>
        <label className="block">
          <span className={label}>ID da conta</span>
          <input required autoFocus value={accountId} onChange={(e) => setAccountId(e.target.value)} placeholder="Cole aqui o ID da sua conta" className={`${INPUT_CLASS} mt-1.5`} />
          <p className={hint}>Na Applyfy: Configurações → Perfil → “ID da conta” (copie no ícone ao lado).</p>
        </label>
        <label className="block">
          <span className={label}>Client ID</span>
          <input required value={clientId} onChange={(e) => setClientId(e.target.value)} placeholder="Sua chave pública da API" className={`${INPUT_CLASS} mt-1.5`} />
          <p className={hint}>Na Applyfy: Integrações → API → Nova credencial → chave pública (Client ID).</p>
        </label>
        <label className="block">
          <span className={label}>Client Secret</span>
          <div className="relative mt-1.5">
            <input
              required={!atual?.hasSecret}
              type={show ? "text" : "password"}
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder={atual?.hasSecret ? "Já salvo — deixe em branco para manter" : "Sua chave privada da API"}
              autoComplete="off"
              className={`${INPUT_CLASS} pr-16`}
            />
            <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 px-2 text-[11px] font-semibold text-muted-foreground hover:text-foreground cursor-pointer">
              {show ? "Ocultar" : "Mostrar"}
            </button>
          </div>
          <p className={hint}>Usamos essas chaves só para a integração com a sua conta. O Client Secret fica criptografado e nunca é exibido de volta.</p>
        </label>
        {erro && <p className="text-sm text-red-500">{erro}</p>}
        <button type="submit" disabled={busy} className="h-11 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-xs disabled:opacity-50 cursor-pointer">
          {busy ? "Salvando…" : "Salvar e continuar"}
        </button>
      </form>
    </div>
  );
}

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
  // Vendas reais atribuídas aos links de convite da conta (também na de demonstração: aqui é dinheiro de verdade).
  const [real, setReal] = useState<typeof COMISSOES_DEMO | null>(null);
  useEffect(() => {
    fetch("/api/conta/comissoes")
      .then((res) => (res.ok ? res.json() : null))
      .then((d: typeof COMISSOES_DEMO | null) => d && setReal(d))
      .catch(() => {});
  }, []);
  const data = real ?? EMPTY;
  const router = useRouter();
  const pathname = usePathname() || "/comissoes";
  const params = useSearchParams();
  const aba = (ABAS.find((a) => a.v === params.get("aba"))?.v ?? "comissoes") as Aba;
  const [page, setPage] = useState(0);
  const [filtro, setFiltro] = useState<"todos" | "Não pagou" | "Ativo" | "Bloqueado">("todos");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pixType, setPixType] = useState("cpf");
  const [pixKey, setPixKey] = useState("");
  const [pixSaved, setPixSaved] = useState(false);
  const [saques, setSaques] = useState<Saque[]>([]);
  const [busy, setBusy] = useState(false);
  const [applyfy, setApplyfy] = useState<Applyfy | null>(null);
  const [vincular, setVincular] = useState(false);

  // Cadastro do afiliado salvo na conta: conta Applyfy (vitalício) e chave Pix (saques do mensal).
  const loadCadastro = React.useCallback(() => {
    fetch("/api/conta/afiliado")
      .then((res) => (res.ok ? res.json() : null))
      .then((d: { applyfy: Applyfy | null; pixType: string | null; pixKey: string | null; saques: Saque[] } | null) => {
        if (!d) return;
        setApplyfy(d.applyfy ?? null);
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

  // Porcentagem da conta, definida no Painel do Afiliado (aba Afiliados).
  const [ownPct, setOwnPct] = useState<number | null>(null);
  useEffect(() => {
    fetch("/api/conta/comissao")
      .then((res) => (res.ok ? res.json() : null))
      .then((d: { pct?: number } | null) => typeof d?.pct === "number" && setOwnPct(d.pct))
      .catch(() => {});
  }, []);
  const pctLabel = (ownPct ?? COMMISSION_RATE * 100).toLocaleString("pt-BR", { maximumFractionDigits: 2 });

  const r = data.resumo as typeof data.resumo & { saquePedidoCents?: number };
  const disponivel = Math.max(0, r.aReceberCents - r.estornosCents);
  const cards = [
    ["Recebido via Applyfy", formatBRL(r.recebidoApplyfyCents), "Já na sua conta"],
    ["A receber do admin", formatBRL(disponivel), r.saquePedidoCents ? `Mais ${formatBRL(r.saquePedidoCents)} em saque pedido` : "Renovações mensais"],
    ["Já repassado", formatBRL(r.repassadoCents), "Pago pelo admin no Pix"],
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
          Vendas do plano vitalício são divididas pela Applyfy no momento do pagamento — sua parte cai direto na sua conta, e o
          saque você faz por lá. Renovações do plano mensal são repassadas pelo administrador via Pix.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
          <div className="min-w-0">
            <h2 className="font-display text-lg font-bold tracking-tight">{applyfy ? "Sua conta Applyfy" : "Vincular sua conta Applyfy"}</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {applyfy ? (
                <>
                  Vinculada · ID <span className="break-all font-mono text-foreground">{applyfy.accountId}</span>
                </>
              ) : (
                "Informe o ID da conta, o Client ID e o Client Secret da sua Applyfy para receber o vitalício direto por lá. Sem isso, ele fica a receber do admin."
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setVincular(true)}
            className={cn(
              "inline-flex h-10 shrink-0 items-center rounded-xl px-4 text-xs font-semibold shadow-xs cursor-pointer",
              applyfy ? "border border-border bg-background hover:bg-muted" : "bg-primary text-primary-foreground",
            )}
          >
            {applyfy ? "Editar dados" : "Cadastrar dados da API"}
          </button>
        </div>
      </section>
      {vincular && (
        <VincularApplyfy
          atual={applyfy}
          onClose={() => setVincular(false)}
          onSaved={() => {
            setVincular(false);
            setMsg({ ok: true, text: "Conta Applyfy vinculada. As próximas vendas do vitalício caem direto nela." });
            loadCadastro();
          }}
        />
      )}

      <section className={CARD}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold tracking-tight">Saque por Pix</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Disponível para saque: <strong className="text-foreground tabular-nums">{formatBRL(disponivel)}</strong> (comissões do mensal
              {applyfy ? "" : " e do vitalício"}). Saque mínimo de R$ 10,00.
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
