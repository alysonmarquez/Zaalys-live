-- Para bancos já criados: rode só este arquivo no SQL Editor do Supabase.
-- Atribuição de vendas aos afiliados (links do Acesso Creator e do Indique e ganhe).

-- Código fixo de cada conta, usado nos links /convite/<codigo>.
alter table public.profiles add column if not exists ref_code text;
create unique index if not exists profiles_ref_code_key on public.profiles (ref_code);

-- Sessões de checkout abertas por um link de afiliado (a Applyfy avisa ao abrir o checkout;
-- a venda aprovada que vem depois traz a mesma sessão).
create table if not exists public.checkout_refs (
  session_guid text primary key,
  ref_code text not null,
  created_at timestamptz not null default now()
);
alter table public.checkout_refs enable row level security;

-- Uma linha por venda atribuída a um afiliado.
create table if not exists public.affiliate_sales (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid references public.profiles (id) on delete set null,
  ref_code text not null,
  gateway text not null,
  gateway_ref text not null,
  buyer_email text not null,
  buyer_name text,
  plan text not null check (plan in ('monthly', 'lifetime')),
  method text,
  amount_cents integer,
  commission_pct numeric(5, 2) not null,
  commission_cents integer not null default 0,
  status text not null check (status in ('pending', 'paid', 'canceled', 'refunded')),
  payout_status text not null default 'a_receber' check (payout_status in ('a_receber', 'repassada')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (gateway, gateway_ref)
);
create index if not exists affiliate_sales_affiliate_idx on public.affiliate_sales (affiliate_id, created_at desc);
alter table public.affiliate_sales enable row level security;
drop policy if exists "own affiliate sales" on public.affiliate_sales;
create policy "own affiliate sales" on public.affiliate_sales for select using (affiliate_id = auth.uid());
