-- Para bancos já criados: rode só este arquivo no SQL Editor do Supabase.
-- Porcentagem de comissão de cada afiliado, definida no Painel do Afiliado (aba Afiliados).
-- Nulo = padrão de 40%.
alter table public.profiles add column if not exists commission_pct numeric(5,2)
  check (commission_pct is null or (commission_pct >= 0 and commission_pct <= 100));
