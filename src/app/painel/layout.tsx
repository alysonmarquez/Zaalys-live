import { AppShell } from "@/components/app-shell";
import { getAccess } from "@/lib/access";

export const dynamic = "force-dynamic";

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const access = await getAccess();

  return (
    <AppShell
      userEmail={access.email}
      userName={access.name || access.handle || "Criador"}
    >
      {children}
    </AppShell>
  );
}
