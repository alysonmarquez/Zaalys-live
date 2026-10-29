import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { producerKeys, receiveCard, receivePix, type CardCharge, type PixCharge } from "@/lib/applyfy-api";
import { INVITE_LIFETIME_CENTS, installmentQuote } from "@/lib/pricing";
import { DEFAULT_COMMISSION_PCT, refFromInvite, refMark } from "@/lib/referrals";

// Vitalício pelo link de um afiliado com a conta Applyfy vinculada: o Pix ou o cartão são cobrados pela API da
// Applyfy com um split, e a comissão (porcentagem definida pelo admin, sobre o preço do convite) cai direto na conta
// dele no pagamento. O identificador da cobrança leva a marca do afiliado e ".split.", e é por ele que o webhook
// sabe que a comissão já foi paga pelo split.

export const SPLIT_TAG = ".split.";

const reais = (cents: number) => Math.round(cents) / 100;
const PRODUCT = { id: "mediaflowmz-vitalicio", name: "MediaFlowMZ · Acesso Vitalício", quantity: 1, price: reais(INVITE_LIFETIME_CENTS) };

type Split = { ref: string; producerId: string; splitCents: number };

/** Afiliado do convite com Applyfy vinculada e as chaves da MediaFlowMZ configuradas; senão, null (checkout hospedado). */
export async function inviteSplit(admin: SupabaseClient, convite: string, buyerEmail?: string): Promise<Split | null> {
  if (!producerKeys()) return null;
  const ref = refFromInvite(convite);
  if (!ref) return null;
  const { data: affiliate, error } = await admin
    .from("profiles")
    .select("email, commission_pct, applyfy_account_id")
    .eq("ref_code", ref)
    .maybeSingle();
  // Sem a migração, sem conta vinculada ou comprando pelo próprio link: não há split.
  if (error || !affiliate?.applyfy_account_id) return null;
  if (buyerEmail && String(affiliate.email).toLowerCase() === buyerEmail) return null;
  const pct = affiliate.commission_pct != null ? Number(affiliate.commission_pct) : DEFAULT_COMMISSION_PCT;
  return { ref, producerId: affiliate.applyfy_account_id as string, splitCents: Math.round((INVITE_LIFETIME_CENTS * pct) / 100) };
}

/**
 * Coprodutores do produto na Applyfy. A cobrança pela API é um produto avulso, então a coprodução configurada
 * lá não roda nela: os coprodutores entram aqui como recebedores fixos do split.
 * APPLYFY_COPRODUCERS="<ID da conta>:20,<outro ID>:10" (% sobre o que fica para a MediaFlowMZ depois da comissão
 * do afiliado, como na coprodução).
 */
export function coproducers(): { producerId: string; pct: number }[] {
  return (process.env.APPLYFY_COPRODUCERS ?? "")
    .split(",")
    .map((p) => p.trim().split(":"))
    .map(([id, pct]) => ({ producerId: (id ?? "").trim(), pct: Number((pct ?? "").replace(",", ".")) }))
    .filter((c) => c.producerId.length >= 6 && Number.isFinite(c.pct) && c.pct > 0 && c.pct < 100);
}

/** Recebedores do split: o afiliado do convite e os coprodutores (o mesmo ID recebe as duas partes somadas). */
function splitsFor(split: Split) {
  const rest = INVITE_LIFETIME_CENTS - split.splitCents;
  const parts = [{ producerId: split.producerId, cents: split.splitCents }, ...coproducers().map((c) => ({ producerId: c.producerId, cents: Math.floor((rest * c.pct) / 100) }))];
  const byId = new Map<string, number>();
  for (const p of parts) if (p.cents > 0) byId.set(p.producerId, (byId.get(p.producerId) ?? 0) + p.cents);
  const list = [...byId].map(([producerId, cents]) => ({ producerId, amount: reais(cents) }));
  return list.length ? list : undefined;
}

function common(split: Split, app: string) {
  const token = (process.env.APPLYFY_WEBHOOK_TOKEN ?? "").trim();
  return {
    identifier: `${refMark(split.ref)}${SPLIT_TAG}${randomUUID()}`,
    products: [PRODUCT],
    splits: splitsFor(split),
    metadata: { provider: "MediaFlowMZ", orderId: refMark(split.ref) },
    callbackUrl: token ? `${app}/api/webhooks/payment?token=${encodeURIComponent(token)}` : undefined,
  };
}

export async function createInvitePix(
  admin: SupabaseClient,
  input: { convite: string; name: string; email: string; phone?: string; document?: string; app: string },
): Promise<PixCharge | null> {
  const split = await inviteSplit(admin, input.convite, input.email);
  if (!split) return null;
  return receivePix(producerKeys()!, {
    ...common(split, input.app),
    amount: reais(INVITE_LIFETIME_CENTS),
    client: { name: input.name, email: input.email, phone: input.phone, document: input.document },
  });
}

export type CardInput = {
  convite: string;
  name: string;
  email: string;
  phone?: string;
  document?: string;
  app: string;
  clientIp: string;
  installments: number;
  address: { zipCode: string; state: string; city: string; street: string; neighborhood: string; number: string; complement?: string };
  card: { number: string; owner: string; expiresAt: string; cvv: string };
};

export async function createInviteCard(admin: SupabaseClient, input: CardInput): Promise<CardCharge | null> {
  const split = await inviteSplit(admin, input.convite, input.email);
  if (!split) return null;
  // Juros do parcelamento (os mesmos da tela) entram como taxa extra; o split é só sobre o preço do convite.
  const q = installmentQuote(INVITE_LIFETIME_CENTS, Math.min(12, Math.max(1, input.installments)));
  return receiveCard(producerKeys()!, {
    ...common(split, input.app),
    amount: reais(q.totalCents),
    extraFee: q.feeCents > 0 ? reais(q.feeCents) : undefined,
    installments: q.count,
    clientIp: input.clientIp,
    client: {
      name: input.name,
      email: input.email,
      phone: input.phone,
      document: input.document,
      address: { country: "BR", ...input.address },
    },
    card: input.card,
  });
}
