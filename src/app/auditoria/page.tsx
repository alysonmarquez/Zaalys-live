import { notFound, redirect } from "next/navigation";
import { getAccess, isAuditEmail } from "@/lib/access";
import { getBalance } from "@/lib/applyfy-api";
import { coproducers } from "@/lib/invite-pix";
import { PRODUCT_PLAN, pick } from "@/lib/payments/applyfy";
import { INVITE_LIFETIME_CENTS, LIFETIME_CENTS } from "@/lib/pricing";
import { open } from "@/lib/secret-box";
import { createAdminClient } from "@/lib/supabase/server";
import { formatBRL } from "@/lib/zaalys-data";

// Auditoria do coprodutor: só AUDIT_EMAILS, fora do Admin e do menu (para os demais a página não existe). Mostra o que os
// avisos da Applyfy registraram e quanto o sistema mandou para o coprodutor. A prova do recebimento é o extrato da Applyfy.
export const metadata = { title: "Auditoria", robots: { index: false, follow: false } };

type Situacao = "Paga" | "Recusada" | "Reembolsada" | "Pendente";
const situacaoDe = (s: string): Situacao =>
  /refund|reembols|chargeback|estorn/.test(s) ? "Reembolsada" : /cancel|expir|recus|refus|fail/.test(s) ? "Recusada" : /aprov|approv|paid|pago|complet|success|active|ativ|renew/.test(s) ? "Paga" : "Pendente";

const COR: Record<Situacao, string> = {
  Paga: "bg-primary/15 text-primary",
  Recusada: "bg-destructive/15 text-destructive",
  Reembolsada: "bg-muted text-muted-foreground",
  Pendente: "bg-muted text-muted-foreground",
};

const CARD = "rounded-2xl border border-border bg-card/85 p-4";

export default async function AuditoriaPage() {
  const access = await getAccess();
  if (!access) redirect("/login?next=/auditoria");
  if (access.demo || !isAuditEmail(access.email)) notFound();

  const admin = createAdminClient();
  const copro = coproducers()[0] ?? null;
  const [{ data: events, error }, { data: sales }, { data: me }] = await Promise.all([
    admin.from("payments").select("event, amount_cents, payload, received_at").eq("gateway", "applyfy").order("received_at", { ascending: false }).limit(1000),
    admin.from("affiliate_sales").select("gateway_ref, ref_code, amount_cents, commission_cents, split").eq("gateway", "applyfy"),
    admin.from("profiles").select("applyfy_client_id, applyfy_client_secret_enc").eq("id", access.userId).maybeSingle(),
  ]);

  // Último aviso de cada transação (a lista vem do mais recente para o mais antigo).
  const seen = new Set<string>();
  const rows = (events ?? []).flatMap((e) => {
    const raw = e.payload as unknown;
    const ref = pick(raw, ["data.orderId", "orderId", "data.transaction.id", "data.transactionId", "transactionId", "data.id", "id", "transaction.id"]);
    if (!ref || seen.has(ref)) return [];
    seen.add(ref);
    const text = JSON.stringify(raw);
    const situacao = situacaoDe(String(e.event).replace(/^applyfy\./, ""));
    const identifier = pick(raw, ["transaction.identifier", "data.transaction.identifier", "identifier", "data.identifier"]) ?? "";
    const api = identifier.includes(".split.");
    const sale = (sales ?? []).find((s) => s.gateway_ref === ref);
    const mensal = Object.entries(PRODUCT_PLAN).some(([id, p]) => p === "monthly" && text.includes(id));
    // Pela API o coprodutor vai no split, sobre o preço total (sem os juros do parcelamento).
    const base = identifier.startsWith("mfz_") ? INVITE_LIFETIME_CENTS : LIFETIME_CENTS;
    const parteCents = api && copro && situacao === "Paga" ? Math.floor((base * copro.pct) / 100) : null;
    return [
      {
        ref,
        data: new Date(e.received_at as string).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" }),
        comprador: pick(raw, ["data.client.email", "data.customer.email", "client.email", "customer.email", "email"]) ?? "—",
        plano: mensal ? "Mensal" : "Vitalício",
        forma: pick(raw, ["data.paymentMethod", "transaction.paymentMethod", "paymentMethod", "data.payment.method", "data.method", "method"])?.toUpperCase() ?? "—",
        valorCents: e.amount_cents as number | null,
        situacao,
        motivo: situacao === "Recusada" ? pick(raw, ["errorDescription", "data.errorDescription", "transaction.errorDescription", "data.transaction.errorDescription", "failureReason", "data.failureReason", "reason", "data.reason"]) : null,
        api,
        afiliado: sale?.ref_code ?? null,
        parteCents,
        idNoAviso: copro ? text.includes(copro.producerId) : false,
      },
    ];
  });

  const pagas = rows.filter((r) => r.situacao === "Paga");
  const pagasApi = pagas.filter((r) => r.api);
  const pagasApplyfy = pagas.filter((r) => !r.api);
  const totalParte = pagasApi.reduce((a, r) => a + (r.parteCents ?? 0), 0);

  let saldo: string | null = null;
  const secret = open(me?.applyfy_client_secret_enc as string | null);
  if (me?.applyfy_client_id && secret) {
    try {
      const b = await getBalance({ publicKey: me.applyfy_client_id as string, secretKey: secret });
      saldo = `Disponível R$ ${Number(b.available).toFixed(2)} · A liberar R$ ${Number(b.pending).toFixed(2)}`;
    } catch {
      saldo = "Não deu para consultar agora";
    }
  }

  const stats: [string, string, string][] = [
    ["Vendas pagas", String(pagas.length), formatBRL(pagas.reduce((a, r) => a + (r.valorCents ?? 0), 0))],
    ["Sua parte no split", formatBRL(totalParte), `${pagasApi.length} venda(s) pela API`],
    ["Fora do split", String(pagasApplyfy.length), "Página da Applyfy: confira no extrato"],
    ["Recusadas", String(rows.filter((r) => r.situacao === "Recusada").length), "Inclui antifraude"],
  ];

  return (
    <div className="min-h-svh bg-studio">
      <div className="mx-auto w-full max-w-6xl space-y-5 px-4 py-8">
        <header>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Auditoria</h1>
          <p className="mt-1 text-sm text-muted-foreground">Vendas avisadas pela Applyfy e a sua parte. Confirme o recebimento no seu extrato da Applyfy.</p>
        </header>

        {error && <p className="rounded-2xl bg-destructive/15 p-3 text-sm text-destructive">Não deu para ler as vendas agora.</p>}

        <div className={CARD}>
          <p className="text-xs font-semibold text-muted-foreground">Recebedor configurado no split (APPLYFY_COPRODUCERS)</p>
          {copro ? (
            <p className="mt-1 break-all text-sm font-semibold">
              {copro.producerId} · {copro.pct}%
            </p>
          ) : (
            <p className="mt-1 text-sm font-semibold text-destructive">Nenhum: as vendas pela API não estão mandando nada para você.</p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">Confira se é o ID da sua conta. O % vale sobre o preço total. Vendas pela API feitas antes de 30/10 usaram o % sobre o que sobrava depois do afiliado.</p>
          <p className="mt-2 text-xs text-muted-foreground">Saldo na sua Applyfy: {saldo ?? "vincule a sua conta em Saque de comissões para ver aqui"}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map(([l, v, d]) => (
            <div key={l} className={CARD}>
              <p className="text-xs font-semibold text-muted-foreground">{l}</p>
              <p className="mt-1 text-xl font-extrabold">{v}</p>
              <p className="text-xs text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>

        <div className="overflow-x-auto rounded-2xl border border-border bg-card/85">
          <table className="w-full min-w-[900px] text-left text-xs">
            <thead className="text-muted-foreground">
              <tr className="border-b border-border">
                {["Data", "Comprador", "Plano", "Forma", "Valor", "Situação", "Checkout", "Afiliado", "Sua parte", "Seu ID no aviso"].map((h) => (
                  <th key={h} className="px-3 py-2.5 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.ref} className="border-b border-border/60 last:border-0">
                  <td className="whitespace-nowrap px-3 py-2.5">{r.data}</td>
                  <td className="px-3 py-2.5">{r.comprador}</td>
                  <td className="px-3 py-2.5">{r.plano}</td>
                  <td className="px-3 py-2.5">{r.forma}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">{r.valorCents != null ? formatBRL(r.valorCents) : "—"}</td>
                  <td className="px-3 py-2.5">
                    <span className={`rounded-full px-2 py-0.5 font-semibold ${COR[r.situacao]}`}>{r.situacao}</span>
                    {r.motivo && <span className="mt-1 block text-muted-foreground">{r.motivo}</span>}
                  </td>
                  <td className="px-3 py-2.5">{r.api ? "Nosso (com split)" : "Applyfy"}</td>
                  <td className="px-3 py-2.5">{r.afiliado ?? "—"}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 font-semibold">{r.parteCents != null ? formatBRL(r.parteCents) : r.situacao === "Paga" ? "Ver extrato" : "—"}</td>
                  <td className="px-3 py-2.5">{r.situacao !== "Paga" ? "—" : r.idNoAviso ? "Sim" : "Não"}</td>
                </tr>
              ))}
              {rows.length === 0 && !error && (
                <tr>
                  <td colSpan={10} className="px-3 py-8 text-center text-muted-foreground">
                    Nenhuma venda registrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
