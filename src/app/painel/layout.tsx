import { AppShell } from "@/components/app-shell";
import { requireAccess } from "@/lib/access";

export const dynamic = "force-dynamic";

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  // Sem login → /login; sem plano ativo → checkout. Em modo demonstração entra direto.
  const access = await requireAccess();

  return (
    <AppShell userEmail={access.email} userName={access.name || access.handle || "Criador"} userHandle={access.handle || undefined} demo={access.demo} showcase={access.showcase} admin={access.admin} studio={access.studio}>
      {children}
    </AppShell>
  );
}
