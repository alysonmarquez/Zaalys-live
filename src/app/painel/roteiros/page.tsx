import { PageHeader } from "@/components/page-header";
import { requireAccess } from "@/lib/access";
import { createClient } from "@/lib/supabase/server";
import { ScriptGenerator } from "./script-generator";

export default async function Roteiros({ searchParams }: { searchParams: Promise<{ produto?: string; preco?: string }> }) {
  await requireAccess();
  const { produto, preco } = await searchParams;
  const supabase = await createClient();
  const [{ data: characters }, { data: templates }, { data: trends }] = await Promise.all([
    supabase.from("characters").select("id, name, style").order("created_at"),
    supabase.from("templates").select("id, name, niche"),
    supabase.from("trends").select("id, title, description").order("week_of", { ascending: false }).limit(5),
  ]);

  return (
    <>
      <PageHeader title="Roteiros e prompts">
        Gere o roteiro e o prompt do vídeo. Depois, cole o prompt na ferramenta de vídeo com IA que você usa.
      </PageHeader>
      <ScriptGenerator
        characters={characters ?? []}
        templates={templates ?? []}
        initialProduct={produto ?? ""}
        initialPrice={preco ?? ""}
      />
      {!!trends?.length && (
        <section className="mt-12">
          <h2 className="mb-3 text-lg font-bold">Em alta esta semana</h2>
          <ul className="panel divide-y divide-line">
            {trends.map((t) => (
              <li key={t.id} className="px-5 py-3.5">
                <p className="font-medium">{t.title}</p>
                {t.description && <p className="text-sm text-muted">{t.description}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
