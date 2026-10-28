import { redirect } from "next/navigation";
import { requireAccess } from "@/lib/access";
import { StudioShell } from "./studio-shell";

export const dynamic = "force-dynamic";

// Estúdio de LIVE: o console e o desempenho das transmissões, em tela própria (abre fora do painel).
export default async function EstudioLayout({ children }: { children: React.ReactNode }) {
  const access = await requireAccess("/estudio/console");
  // Só a Nat (admin e demonstração) e os afiliados que ela aprovou na aba Afiliados.
  if (!access.studio) redirect("/painel/live");
  return (
    <StudioShell handle={access.handle || access.name || "criador"} showcase={Boolean(access.showcase)}>
      {children}
    </StudioShell>
  );
}
