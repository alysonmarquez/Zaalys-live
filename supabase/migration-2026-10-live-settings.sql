-- Para bancos já criados: rode só este arquivo no SQL Editor do Supabase.
-- Números editados em "Editar desempenho da LIVE" e "Editar números" (Estúdio), por conta,
-- para valerem em qualquer aparelho.
alter table public.profiles add column if not exists live_settings jsonb;
