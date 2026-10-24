import { NextResponse } from "next/server";
import { getAccess } from "@/lib/access";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/access";

// Sessão vem só do Supabase Auth (cookie assinado). Não existe mais sessão criada pelo navegador.
export async function GET() {
  const access = await getAccess();
  if (!access) return NextResponse.json({ user: null });
  return NextResponse.json({
    user: {
      userId: access.userId,
      email: access.email,
      name: access.name,
      handle: access.handle,
      active: access.active,
      plan: access.plan,
      demo: Boolean(access.demo),
    },
  });
}

export async function DELETE() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  const res = NextResponse.json({ ok: true });
  // Remove o cookie antigo, de versões anteriores.
  res.cookies.set("zaalys_session", "", { path: "/", maxAge: 0, sameSite: "lax" });
  return res;
}
