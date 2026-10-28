import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

// Criptografia (AES-256-GCM) de segredos guardados no banco, como o Client Secret da Applyfy do afiliado.
// A chave vem de SECRETS_KEY; sem ela, é derivada da service role do Supabase (que só existe no servidor).

function key() {
  const base = process.env.SECRETS_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base) throw new Error("SECRETS_KEY não configurada");
  return createHash("sha256").update(`mediaflowmz:${base}`).digest();
}

/** Texto → "v1:<iv>:<tag>:<cifrado>" (base64url). */
export function seal(plain: string) {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", key(), iv);
  const data = Buffer.concat([c.update(plain, "utf8"), c.final()]);
  return ["v1", iv, c.getAuthTag(), data].map((p) => (typeof p === "string" ? p : p.toString("base64url"))).join(":");
}

/** Desfaz o seal; devolve null se o valor não for válido ou a chave tiver mudado. */
export function open(sealed: string | null | undefined) {
  const [v, iv, tag, data] = (sealed ?? "").split(":");
  if (v !== "v1" || !iv || !tag || !data) return null;
  try {
    const d = createDecipheriv("aes-256-gcm", key(), Buffer.from(iv, "base64url"));
    d.setAuthTag(Buffer.from(tag, "base64url"));
    return Buffer.concat([d.update(Buffer.from(data, "base64url")), d.final()]).toString("utf8");
  } catch {
    return null;
  }
}
