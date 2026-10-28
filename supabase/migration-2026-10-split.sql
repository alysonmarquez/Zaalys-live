-- Para bancos já criados: rode só este arquivo no SQL Editor do Supabase.
-- Split do vitalício confirmado pelo admin: só depois que a Nat inclui o afiliado no split DENTRO da Applyfy
-- as vendas do vitalício contam como pagas pelo split. Até lá, a comissão entra no saldo de saque.
alter table public.profiles add column if not exists applyfy_split_confirmed boolean not null default false;
