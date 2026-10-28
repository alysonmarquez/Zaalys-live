import { apiAccess } from "@/lib/access";
import { fail, json, unauthorized } from "@/lib/http";
import { createAdminClient } from "@/lib/supabase/server";

// Vendas atribuídas à conta (links de convite), no formato da tela "Saque de comissões".
type Sale = {
  created_at: string;
  buyer_email: string;
  buyer_name: string | null;
  plan: "monthly" | "lifetime";
  method: string | null;
  amount_cents: number | null;
  commission_cents: number;
  status: "pending" | "paid" | "canceled" | "refunded";
  payout_status: "a_receber" | "repassada";
  /** Vitalício pago com split da Applyfy: a comissão já caiu na conta do afiliado. */
  split?: boolean | null;
  id: string;
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "numeric" });
const plano = (p: Sale["plan"]) => (p === "lifetime" ? "Vitalício" : "Mensal");
// E-mail parcialmente oculto, como no original.
const mask = (email: string) => {
  const [user = "", domain = ""] = email.split("@");
  return `${user.slice(0, 3)}•••@${domain}`;
};

export async function GET() {
  const access = await apiAccess();
  if (!access) return unauthorized();
  if (access.demo) return json(null);
  try {
    const { data, error } = await createAdminClient()
      .from("affiliate_sales")
      .select("*")
      .eq("affiliate_id", access.userId)
      .order("created_at", { ascending: false })
      .limit(2000);
    if (error) return fail(error);
    const sales = (data ?? []) as Sale[];
    // Comissões já incluídas em pedidos de saque em aberto.
    const { data: pend } = await createAdminClient().from("payout_requests").select("sale_ids, amount_cents").eq("user_id", access.userId).eq("status", "pending");
    const requested = new Set((pend ?? []).flatMap((r) => (r.sale_ids as string[]) ?? []));

    const comissoes = sales
      .filter((s) => s.status === "paid" || s.status === "refunded")
      .map((s) => ({
        date: fmt(s.created_at),
        plano: plano(s.plan),
        vendaCents: s.amount_cents ?? 0,
        comissaoCents: s.commission_cents,
        status:
          s.status === "refunded"
            ? "Estornada"
            : s.split
              ? "Via Applyfy"
              : s.payout_status === "repassada"
                ? "Repassada"
                : requested.has(s.id)
                  ? "Saque pedido"
                  : "A receber",
      }));

    const transacoes = sales.map((s) => ({
      date: fmt(s.created_at),
      comprador: mask(s.buyer_email),
      plano: plano(s.plan),
      forma: s.method === "PIX" ? "PIX" : s.method?.includes("CREDIT") ? "CREDIT_CARD" : "CARD",
      valorCents: s.amount_cents ?? 0,
      situacao:
        s.status === "paid" ? "Pago" : s.status === "refunded" ? "Reembolsado" : s.status === "canceled" ? "Recusado / expirado" : "Aguardando pagamento",
    }));

    // Um indicado por comprador, com a situação da compra mais recente.
    const byBuyer = new Map<string, Sale>();
    for (const s of sales) if (!byBuyer.has(s.buyer_email)) byBuyer.set(s.buyer_email, s);
    const indicados = [...byBuyer.values()].map((s) => ({
      date: fmt(s.created_at),
      nome: s.buyer_name || s.buyer_email.split("@")[0],
      email: mask(s.buyer_email),
      plano: s.status === "paid" ? plano(s.plan) : null,
      situacao: s.status === "paid" ? "Ativo" : s.status === "refunded" ? "Bloqueado" : "Não pagou",
    }));

    const sum = (f: (s: Sale) => boolean) => sales.filter(f).reduce((a, s) => a + s.commission_cents, 0);
    const estornosCents = sum((s) => s.status === "refunded");
    const owed = (s: Sale) => s.status === "paid" && !s.split;
    return json({
      comissoes,
      transacoes,
      indicados,
      resumo: {
        recebidoApplyfyCents: sum((s) => s.status === "paid" && Boolean(s.split)),
        // Na tela aparece "a receber − estornos": os estornos entram aqui para o líquido ficar certo.
        aReceberCents: sum((s) => owed(s) && s.payout_status === "a_receber" && !requested.has(s.id)) + estornosCents,
        estornosCents,
        repassadoCents: sum((s) => owed(s) && s.payout_status === "repassada"),
        saquePedidoCents: (pend ?? []).reduce((a, r) => a + (r.amount_cents ?? 0), 0),
        vendas: sales.filter((s) => s.status === "paid").length,
      },
    });
  } catch (err) {
    return fail(err);
  }
}
