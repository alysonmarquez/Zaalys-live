import { redirect } from "next/navigation";
import { requireAccess } from "@/lib/access";

// Aprovar afiliados: só quem está em ADMIN_EMAILS.
export default async function AprovarAfiliadosLayout({ children }: { children: React.ReactNode }) {
  const access = await requireAccess("/painel/aprovar-afiliados");
  if (!access.admin) redirect("/painel");
  return children;
}
