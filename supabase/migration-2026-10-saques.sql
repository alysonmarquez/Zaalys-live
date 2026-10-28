-- Para bancos já criados: rode só este arquivo no SQL Editor do Supabase.
-- Cadastro do afiliado (conta Applyfy para o split do vitalício e chave Pix) e pedidos de saque.
alter table public.profiles add column if not exists applyfy_email text;
alter table public.profiles add column if not exists pix_type text check (pix_type is null or pix_type in ('cpf','cnpj','email','telefone','aleatoria'));
alter table public.profiles add column if not exists pix_key text;
create table if not exists public.payout_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  amount_cents integer not null check (amount_cents > 0),
  pix_type text not null,
  pix_key text not null,
  sale_ids uuid[] not null default '{}',
  status text not null default 'pending' check (status in ('pending', 'paid', 'rejected')),
  note text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);
create index if not exists payout_requests_user_idx on public.payout_requests (user_id, created_at desc);
alter table public.payout_requests enable row level security;
drop policy if exists "own payout requests" on public.payout_requests;
create policy "own payout requests" on public.payout_requests for select using (user_id = auth.uid());
alter table public.affiliate_sales add column if not exists split boolean not null default false;
