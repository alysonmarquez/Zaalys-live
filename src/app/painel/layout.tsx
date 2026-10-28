import { AppShell } from "@/components/app-shell";
import type { Metadata } from "next";
import { getAccess, requireAccess } from "@/lib/access";
import { presentationMetadata } from "@/lib/presentation";

export const dynamic = "force-dynamic";

// Conta de demonstração: favicon do TikTok Shop (apresentação).
export async function generateMetadata(): Promise<Metadata> {
  return presentationMetadata((await getAccess())?.showcase);
}

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  // Sem login → /login; sem plano ativo → checkout. Em modo demonstração entra direto.
  const access = await requireAccess();

  return (
    <AppShell userEmail={access.email} userName={access.name || access.handle || "Criador"} userHandle={access.handle || undefined} demo={access.demo} showcase={access.showcase} admin={access.admin} studio={access.studio}>
      {children}
    </AppShell>
  );
}
