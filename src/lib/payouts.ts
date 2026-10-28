import type { SupabaseClient } from "@supabase/supabase-js";

// Saldo do afiliado para saque: comissões pagas que o admin repassa (mensal, ou vitalício sem split),
// ainda não repassadas e fora de pedidos de saque em aberto.
export type SaleForPayout = { id: string; commission_cents: number; status: string; payout_status: string; split?: boolean | null };

export async function availableSales(db: SupabaseClient, userId: string) {
  const [{ data: sales }, { data: pending }] = await Promise.all([
    db.from("affiliate_sales").select("*").eq("affiliate_id", userId).eq("status", "paid").eq("payout_status", "a_receber"),
    db.from("payout_requests").select("sale_ids").eq("user_id", userId).eq("status", "pending"),
  ]);
  const locked = new Set((pending ?? []).flatMap((r) => (r.sale_ids as string[]) ?? []));
  const list = ((sales ?? []) as SaleForPayout[]).filter((s) => !s.split && !locked.has(s.id));
  return { list, totalCents: list.reduce((a, s) => a + s.commission_cents, 0), locked };
}

export const PIX_TYPES = ["cpf", "cnpj", "email", "telefone", "aleatoria"] as const;
