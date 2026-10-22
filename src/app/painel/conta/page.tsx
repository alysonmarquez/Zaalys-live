import { PageHeader } from "@/components/page-header";
import { requireAccess } from "@/lib/access";
import { createAdminClient } from "@/lib/supabase/server";
import { AccountTools } from "./account-tools";

export default async function Conta() {
  const access = await requireAccess();
  const { data: license } = await createAdminClient()
    .from("licenses")
    .select("key, device_id, activated_at")
    .eq("user_id", access.userId)
    .maybeSingle();

  return (
    <>
      <PageHeader title="Extensão e alertas">
        A live infinita roda pela extensão do Chrome, ativada com a sua chave em um computador por vez.
      </PageHeader>
      <AccountTools
        initialKey={license?.key ?? null}
        activatedAt={license?.device_id ? license.activated_at : null}
        vapidKey={process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ""}
      />
    </>
  );
}
