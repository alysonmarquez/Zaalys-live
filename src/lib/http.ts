import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AIError } from "@/lib/ai";
import { createAdminClient } from "@/lib/supabase/server";

export const json = (data: unknown, status = 200) => NextResponse.json(data, { status });

/** Converte erros conhecidos em respostas JSON com mensagem em português. */
export function fail(err: unknown) {
  if (err instanceof ZodError) return json({ error: "Dados inválidos", issues: err.issues }, 400);
  if (err instanceof AIError) return json({ error: err.message }, err.status);
  console.error(err);
  return json({ error: "Erro interno" }, 500);
}

export const unauthorized = () => json({ error: "Faça login com um plano ativo" }, 401);

/**
 * Autentica a extensão pela chave de licença + id do dispositivo.
 * Header: Authorization: License <chave>:<deviceId>
 */
export async function licenseAuth(req: Request) {
  const header = req.headers.get("authorization") ?? "";
  const match = header.match(/^License ([A-F0-9]+):([\w-]{8,64})$/i);
  if (!match) return null;
  const [, key, deviceId] = match;
  const admin = createAdminClient();
  const { data: lic } = await admin
    .from("licenses")
    .select("user_id, device_id")
    .eq("key", key.toUpperCase())
    .maybeSingle();
  if (!lic || lic.device_id !== deviceId) return null;

  const { data: subs } = await admin
    .from("subscriptions")
    .select("plan, expires_at")
    .eq("user_id", lic.user_id)
    .eq("status", "active");
  const active = (subs ?? []).some(
    (s) => s.plan === "lifetime" || (s.expires_at && Date.parse(s.expires_at) > Date.now()),
  );
  return active ? { userId: lic.user_id as string } : null;
}
