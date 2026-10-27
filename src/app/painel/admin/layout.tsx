import { redirect } from "next/navigation";
import { requireAccess } from "@/lib/access";

export const metadata = { title: "Admin" };

// Administração do sistema: só quem está em ADMIN_EMAILS.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const access = await requireAccess("/painel/admin");
  if (!access.admin) redirect("/painel");
  return children;
}
