import { redirect } from "next/navigation";
import { requireAccess } from "@/lib/access";

// Painel do Afiliado (números de exemplo e vendas ao vivo simuladas): só a conta de demonstração.
export default async function AfiliadoLayout({ children }: { children: React.ReactNode }) {
  const access = await requireAccess("/painel/afiliado");
  if (!access.showcase) redirect("/painel");
  return children;
}
