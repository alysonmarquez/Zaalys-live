import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Retorno do link mágico / confirmação de e-mail do Supabase.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/painel";
  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }
  // Só redireciona para caminhos internos.
  return NextResponse.redirect(new URL(next.startsWith("/") && !next.startsWith("//") ? next : "/painel", url.origin));
}
