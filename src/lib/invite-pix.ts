import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { producerKeys, receivePix, type PixCharge } from "@/lib/applyfy-api";
import { INVITE_LIFETIME_CENTS } from "@/lib/pricing";
import { DEFAULT_COMMISSION_PCT, refFromInvite, refMark } from "@/lib/referrals";

// Vitalício pelo link de um afiliado com a conta Applyfy vinculada: o Pix é gerado pela API da Applyfy com um split,
// e a comissão (porcentagem definida pelo admin) cai direto na conta dele no pagamento. O identificador da cobrança
// leva a marca do afiliado e ".split.", e é por ele que o webhook sabe que a comissão já foi paga pelo split.

export const SPLIT_TAG = ".split.";

const reais = (cents: number) => Math.round(cents) / 100;

export async function createInvitePix(
  admin: SupabaseClient,
  input: { convite: string; name: string; email: string; phone?: string; document?: string; app: string },
): Promise<(PixCharge & { splitCents: number }) | null> {
  const keys = producerKeys();
  if (!keys) return null;
  const ref = refFromInvite(input.convite);
  if (!ref) return null;
  const { data: affiliate, error } = await admin
    .from("profiles")
    .select("email, commission_pct, applyfy_account_id")
    .eq("ref_code", ref)
    .maybeSingle();
  // Sem a migração, sem conta vinculada ou comprando pelo próprio link: segue para o checkout da Applyfy.
  if (error || !affiliate?.applyfy_account_id || String(affiliate.email).toLowerCase() === input.email) return null;

  const pct = affiliate.commission_pct != null ? Number(affiliate.commission_pct) : DEFAULT_COMMISSION_PCT;
  const splitCents = Math.round((INVITE_LIFETIME_CENTS * pct) / 100);
  const token = (process.env.APPLYFY_WEBHOOK_TOKEN ?? "").trim();
  const charge = await receivePix(keys, {
    identifier: `${refMark(ref)}${SPLIT_TAG}${randomUUID()}`,
    amount: reais(INVITE_LIFETIME_CENTS),
    client: { name: input.name, email: input.email, phone: input.phone, document: input.document },
    products: [{ id: "mediaflowmz-vitalicio", name: "MediaFlowMZ · Acesso Vitalício", quantity: 1, price: reais(INVITE_LIFETIME_CENTS) }],
    splits: splitCents > 0 ? [{ producerId: affiliate.applyfy_account_id as string, amount: reais(splitCents) }] : undefined,
    metadata: { provider: "MediaFlowMZ", orderId: refMark(ref) },
    callbackUrl: token ? `${input.app}/api/webhooks/payment?token=${encodeURIComponent(token)}` : undefined,
  });
  return { ...charge, splitCents };
}
