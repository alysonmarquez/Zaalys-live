import { json } from "@/lib/http";
import { inviteSplit } from "@/lib/invite-pix";
import { createAdminClient } from "@/lib/supabase/server";

// O checkout pergunta se a cobrança pela API está disponível: então o cartão é digitado aqui. "code" é opcional.
export async function GET(req: Request) {
  const code = (new URL(req.url).searchParams.get("code") ?? "").trim().slice(0, 80);
  try {
    const split = await inviteSplit(createAdminClient(), code);
    return json({ split: Boolean(split), publicKey: split ? (process.env.APPLYFY_PUBLIC_KEY ?? "").trim() : null });
  } catch {
    return json({ split: false, publicKey: null });
  }
}
