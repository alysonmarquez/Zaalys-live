// API da Applyfy (https://app.applyfy.com.br/docs/v1). Autenticação pelos cabeçalhos x-public-key e x-secret-key.
// Conta do produtor (MediaFlowMZ): APPLYFY_PUBLIC_KEY e APPLYFY_SECRET_KEY. Conta do afiliado: as chaves que ele
// vinculou no Saque de comissões (só para consultar o saldo dele).

const BASE = "https://app.applyfy.com.br/api/v1";

export type ApplyfyKeys = { publicKey: string; secretKey: string };

export class ApplyfyApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

/** Chaves da conta do produtor, se configuradas nesta implantação. */
export function producerKeys(): ApplyfyKeys | null {
  const publicKey = (process.env.APPLYFY_PUBLIC_KEY ?? "").trim();
  const secretKey = (process.env.APPLYFY_SECRET_KEY ?? "").trim();
  return publicKey && secretKey ? { publicKey, secretKey } : null;
}

async function call<T>(path: string, keys: ApplyfyKeys, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: init.method ?? "GET",
    headers: {
      "x-public-key": keys.publicKey,
      "x-secret-key": keys.secretKey,
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });
  const text = await res.text();
  let data: unknown = null;
  try {
    data = JSON.parse(text);
  } catch {
    // O firewall da Applyfy responde HTML (403) para origens bloqueadas.
  }
  if (!res.ok || data === null) {
    const msg = (data as { message?: string } | null)?.message;
    throw new ApplyfyApiError(msg || `Applyfy respondeu ${res.status}${data === null ? " (bloqueio por localização?)" : ""}`, res.status);
  }
  return data as T;
}

/** GET /gateway/producer/credentials: confere as chaves. */
export const testCredentials = (keys: ApplyfyKeys) =>
  call<{ name: string; permissions: string[]; grantAllPermissions: boolean; expiresAt: string | null }>("/gateway/producer/credentials", keys);

/** GET /gateway/producer/balance: saldo em reais (disponível, pendente e retido). */
export const getBalance = (keys: ApplyfyKeys) =>
  call<{ available: number; pending: number; fundLock: number }>("/gateway/producer/balance", keys);

export type PixCharge = {
  transactionId: string;
  status: "OK" | "FAILED" | "PENDING" | string;
  pix: { code: string; image?: string; expiresAt?: string };
  errorDescription?: string;
};

export type CardCharge = {
  transactionId: string;
  status: "OK" | "FAILED" | "PENDING" | string;
  transactionStatus?: "PENDING" | "COMPLETED" | "FAILED" | string;
  /** true: o navegador precisa autenticar o cartão no banco (3DS) com o 3ds.js da Applyfy. */
  needThreeDs?: boolean;
  errorDescription?: string;
};

/**
 * POST /gateway/card/receive: cobra no cartão. Os dados do cartão só passam por aqui a caminho da Applyfy:
 * nunca são gravados nem vão para os logs (os erros desta função não levam o corpo da requisição).
 */
export const receiveCard = (
  keys: ApplyfyKeys,
  body: {
    identifier: string;
    amount: number;
    extraFee?: number;
    client: {
      name: string;
      email: string;
      phone?: string;
      document?: string;
      address: { country: string; zipCode: string; state: string; city: string; street: string; neighborhood: string; number: string; complement?: string };
    };
    clientIp: string;
    card: { number: string; owner: string; expiresAt: string; cvv: string };
    installments: number;
    products: { id: string; name: string; quantity: number; price: number }[];
    splits?: { producerId: string; amount: number }[];
    metadata?: Record<string, string>;
    callbackUrl?: string;
  },
) => call<CardCharge>("/gateway/card/receive", keys, { method: "POST", body });

/** POST /gateway/pix/receive: cobra por Pix; `splits` manda parte do valor direto para outras contas. */
export const receivePix = (
  keys: ApplyfyKeys,
  body: {
    identifier: string;
    amount: number;
    client: { name: string; email: string; phone?: string; document?: string };
    products: { id: string; name: string; quantity: number; price: number }[];
    splits?: { producerId: string; amount: number }[];
    metadata?: Record<string, string>;
    callbackUrl?: string;
  },
) => call<PixCharge>("/gateway/pix/receive", keys, { method: "POST", body });
