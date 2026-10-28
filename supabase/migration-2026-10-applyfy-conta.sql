-- Para bancos já criados: rode só este arquivo no SQL Editor do Supabase.
-- Conta Applyfy vinculada pelo afiliado no Saque de comissões: ID da conta (recebe o split do vitalício),
-- Client ID e Client Secret da API (o segredo fica criptografado pelo servidor e nunca volta para a tela).
alter table public.profiles add column if not exists applyfy_account_id text;
alter table public.profiles add column if not exists applyfy_client_id text;
alter table public.profiles add column if not exists applyfy_client_secret_enc text;
alter table public.profiles add column if not exists applyfy_linked_at timestamptz;
