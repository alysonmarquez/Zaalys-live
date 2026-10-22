import { revalidatePath } from "next/cache";
import { PageHeader } from "@/components/page-header";
import { requireAccess } from "@/lib/access";
import { createClient } from "@/lib/supabase/server";

async function createCharacter(form: FormData) {
  "use server";
  const access = await requireAccess();
  const name = String(form.get("name") ?? "").trim();
  const appearance = String(form.get("appearance") ?? "").trim();
  if (!name || appearance.length < 20) return;
  const supabase = await createClient();
  await supabase.from("characters").insert({
    user_id: access.userId,
    name,
    appearance,
    style: String(form.get("style") ?? "") || null,
  });
  revalidatePath("/painel/influencers");
}

async function deleteCharacter(form: FormData) {
  "use server";
  await requireAccess();
  const supabase = await createClient();
  await supabase.from("characters").delete().eq("id", String(form.get("id"))); // RLS só deixa apagar os seus
  revalidatePath("/painel/influencers");
}

export default async function Influencers() {
  const access = await requireAccess();
  const supabase = await createClient();
  const { data: characters } = await supabase.from("characters").select("*").order("created_at");
  const mine = (characters ?? []).filter((c) => c.user_id === access.userId);
  const ready = (characters ?? []).filter((c) => c.user_id === null);

  return (
    <>
      <PageHeader title="Influencers">
        Um personagem com aparência fixa entra igual em todos os roteiros e prompts, para os vídeos parecerem da mesma pessoa.
      </PageHeader>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <section>
            <h2 className="mb-3 text-lg font-bold">Seus personagens</h2>
            {mine.length ? (
              <ul className="grid gap-4 sm:grid-cols-2">
                {mine.map((c) => (
                  <li key={c.id} className="panel p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-bold">{c.name}</h3>
                      <form action={deleteCharacter}>
                        <input type="hidden" name="id" value={c.id} />
                        <button className="text-sm text-muted hover:text-onair">Excluir</button>
                      </form>
                    </div>
                    {c.style && <p className="text-sm text-violet">{c.style}</p>}
                    <p className="mt-2 text-sm text-muted">{c.appearance}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted">Nenhum ainda. Crie o primeiro ao lado.</p>
            )}
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold">Modelos prontos</h2>
            <ul className="grid gap-4 sm:grid-cols-2">
              {ready.map((c) => (
                <li key={c.id} className="panel p-5">
                  <h3 className="text-lg font-bold">{c.name}</h3>
                  {c.style && <p className="text-sm text-violet">{c.style}</p>}
                  <p className="mt-2 text-sm text-muted">{c.appearance}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <form action={createCharacter} className="panel h-fit space-y-4 p-5">
          <h2 className="text-lg font-bold">Novo personagem</h2>
          <div>
            <label className="label" htmlFor="name">Nome</label>
            <input id="name" name="name" required className="field" placeholder="Ex.: Bia" />
          </div>
          <div>
            <label className="label" htmlFor="style">Estilo</label>
            <input id="style" name="style" className="field" placeholder="Ex.: casual, esportivo, elegante" />
          </div>
          <div>
            <label className="label" htmlFor="appearance">Aparência</label>
            <textarea
              id="appearance"
              name="appearance"
              required
              minLength={20}
              rows={5}
              className="field"
              placeholder="Idade, cabelo, roupa, maquiagem, jeito de falar. Quanto mais específico, mais consistente nos vídeos."
            />
          </div>
          <button className="btn-primary w-full">Criar personagem</button>
        </form>
      </div>
    </>
  );
}
