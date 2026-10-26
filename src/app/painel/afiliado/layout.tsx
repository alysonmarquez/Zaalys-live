import { redirect } from "next/navigation";
import { requireAccess } from "@/lib/access";

// Painel do Afiliado: conta de demonstração (números de exemplo e vendas ao vivo simuladas) e quem aprova
// afiliados (aba Afiliados).
export default async function AfiliadoLayout({ children }: { children: React.ReactNode }) {
  const access = await requireAccess("/painel/afiliado");
  if (!access.showcase && !access.admin) redirect("/painel");
  return children;
}
