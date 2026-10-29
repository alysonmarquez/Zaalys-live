import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

// Retorno do link mágico / confirmação de e-mail do Supabase.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/painel";
  const tokenHash = url.searchParams.get("token_hash");
  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  } else if (tokenHash) {
    const supabase = await createClient();
    await supabase.auth.verifyOtp({ token_hash: tokenHash, type: (url.searchParams.get("type") ?? "signup") as EmailOtpType });
  }
  // Só redireciona para caminhos internos.
  return NextResponse.redirect(new URL(next.startsWith("/") && !next.startsWith("//") ? next : "/painel", url.origin));
}
