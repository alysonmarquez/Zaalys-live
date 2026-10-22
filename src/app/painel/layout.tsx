import Link from "next/link";
import { redirect } from "next/navigation";
import { Brand } from "@/components/brand";
import { SidebarNav } from "@/components/sidebar-nav";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function signOut() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-5 py-6 md:grid-cols-[220px_1fr]">
      <aside className="md:sticky md:top-6 md:h-[calc(100dvh-3rem)] md:border-r md:border-line md:pr-6">
        <div className="mb-6 flex items-center justify-between md:mb-10 md:block">
          <Link href="/painel" aria-label="Início do painel">
            <Brand />
          </Link>
          <form action={signOut} className="md:mt-2">
            <button className="text-xs text-muted hover:text-ink">Sair ({user.email})</button>
          </form>
        </div>
        <SidebarNav />
      </aside>
      <main className="min-w-0 pb-16">{children}</main>
    </div>
  );
}
