-- MediaFlow — schema do banco (Supabase / Postgres)
-- Rode no SQL Editor do Supabase, em ordem.

create extension if not exists "pgcrypto";

-- ---------- Perfis ----------
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text not null,
  name text,
  -- Números editados da LIVE (Estúdio de LIVE), sincronizados entre aparelhos
  live_settings jsonb,
  created_at timestamptz not null default now()
);

-- Cria o perfil quando um usuário se cadastra
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', ''));
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
-- Só o gatilho usa a função: não fica exposta na API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- ---------- Acesso pago ----------
create type public.plan_kind as enum ('monthly', 'lifetime');
create type public.sub_status as enum ('pending', 'active', 'past_due', 'canceled', 'refunded');

-- A assinatura é ligada ao e-mail da compra. Se a pessoa ainda não tem conta,
-- user_id fica nulo e é preenchido no primeiro login com o mesmo e-mail.
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete set null,
  email text not null,
  plan public.plan_kind not null,
  status public.sub_status not null default 'pending',
  gateway text not null,
  gateway_ref text not null,
  expires_at timestamptz, -- nulo = vitalício
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (gateway, gateway_ref)
);
create index on public.subscriptions (email);
create index on public.subscriptions (user_id);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  gateway text not null,
  event text not null,
  amount_cents integer,
  payload jsonb not null,
  received_at timestamptz not null default now()
);

-- ---------- Licenças da extensão ----------
create table public.licenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users on delete cascade,
  key text not null unique default upper(encode(gen_random_bytes(12), 'hex')),
  device_id text,           -- um computador por vez
  device_label text,        -- "Chrome · Windows", "Orion · iPhone"...
  activated_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------- Catálogo ----------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  niche text not null,
  price_cents integer not null,
  commission_pct numeric(5,2) not null,
  url text,
  image_url text,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table public.product_snapshots (
  id bigint generated always as identity primary key,
  product_id uuid not null references public.products on delete cascade,
  price_cents integer not null,
  commission_pct numeric(5,2) not null,
  read_at timestamptz not null default now()
);
create index on public.product_snapshots (product_id, read_at desc);

-- Radar: compara as duas leituras mais recentes de cada produto
create or replace view public.product_changes with (security_invoker = true) as
with ranked as (
  select s.*, row_number() over (partition by product_id order by read_at desc) as rn
  from public.product_snapshots s
)
select p.id as product_id, p.name, p.niche,
       prev.price_cents as old_price_cents, cur.price_cents as new_price_cents,
       prev.commission_pct as old_commission_pct, cur.commission_pct as new_commission_pct,
       cur.read_at
from public.products p
join ranked cur on cur.product_id = p.id and cur.rn = 1
join ranked prev on prev.product_id = p.id and prev.rn = 2
where cur.price_cents <> prev.price_cents or cur.commission_pct <> prev.commission_pct;

-- ---------- Estúdio ----------
create table public.characters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade, -- nulo = modelo pronto do estúdio
  name text not null,
  appearance text not null,
  style text,
  image_url text,
  created_at timestamptz not null default now()
);

create table public.templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  niche text not null,
  scene text not null,
  camera_motion text not null
);

create table public.trends (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  niche text,
  week_of date not null default current_date
);

create type public.script_kind as enum ('video', 'live');

create table public.scripts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  kind public.script_kind not null,
  title text not null,
  input jsonb not null,
  content jsonb not null,
  created_at timestamptz not null default now()
);

create table public.video_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  source_url text,
  transcript text not null,
  analysis jsonb not null,
  created_at timestamptz not null default now()
);

-- ---------- Lives ----------
create type public.live_mode as enum ('presenter', 'infinite');
create type public.live_status as enum ('running', 'ended', 'dropped', 'warning');

create table public.live_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  mode public.live_mode not null,
  products jsonb not null default '[]',
  status public.live_status not null default 'running',
  started_at timestamptz not null default now(),
  ended_at timestamptz
);

create table public.live_events (
  id bigint generated always as identity primary key,
  session_id uuid not null references public.live_sessions on delete cascade,
  kind text not null, -- greeting, comment, pin, answer, sale, drop, warning, end
  detail jsonb,
  at timestamptz not null default now()
);

-- ---------- Push ----------
create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

-- ---------- Seletores da extensão (atualizáveis sem nova versão) ----------
create table public.extension_config (
  id int primary key default 1 check (id = 1),
  selectors jsonb not null,
  updated_at timestamptz not null default now()
);

-- ---------- Row Level Security ----------
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;
alter table public.licenses enable row level security;
alter table public.products enable row level security;
alter table public.product_snapshots enable row level security;
alter table public.characters enable row level security;
alter table public.templates enable row level security;
alter table public.trends enable row level security;
alter table public.scripts enable row level security;
alter table public.video_analyses enable row level security;
alter table public.live_sessions enable row level security;
alter table public.live_events enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.extension_config enable row level security;

create policy "own profile" on public.profiles for select using (auth.uid() = id);
create policy "own profile update" on public.profiles for update using (auth.uid() = id);
create policy "own subscriptions" on public.subscriptions for select using (auth.uid() = user_id);
create policy "own license" on public.licenses for select using (auth.uid() = user_id);

-- Catálogo e conteúdo do estúdio: leitura para usuários logados
create policy "catalog read" on public.products for select to authenticated using (true);
create policy "snapshots read" on public.product_snapshots for select to authenticated using (true);
create policy "templates read" on public.templates for select to authenticated using (true);
create policy "trends read" on public.trends for select to authenticated using (true);

create policy "characters read" on public.characters for select to authenticated
  using (user_id is null or user_id = auth.uid());
create policy "characters write" on public.characters for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own scripts" on public.scripts for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own analyses" on public.video_analyses for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own lives" on public.live_sessions for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own live events" on public.live_events for select
  using (exists (select 1 from public.live_sessions s where s.id = session_id and s.user_id = auth.uid()));
create policy "own push" on public.push_subscriptions for all using (user_id = auth.uid()) with check (user_id = auth.uid());
-- payments e extension_config: só o servidor (service role) acessa.

-- ---------- Radar por e-mail ----------
create type public.lead_status as enum ('pending', 'confirmed', 'unsubscribed');

create table public.newsletter_leads (
  id bigint generated always as identity primary key,
  email text not null unique,
  token uuid not null unique default gen_random_uuid(),
  status public.lead_status not null default 'pending',
  source text,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  last_sent_at timestamptz
);
create index on public.newsletter_leads (status, id);
alter table public.newsletter_leads enable row level security;
-- Sem políticas: só o servidor (service role) lê e grava.

-- ---------- Suporte ----------
create type public.ticket_status as enum ('open', 'answered', 'closed');

create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete set null,
  email text not null,
  topic text not null,
  message text not null,
  page text,
  status public.ticket_status not null default 'open',
  created_at timestamptz not null default now()
);
alter table public.support_tickets enable row level security;
create policy "own tickets" on public.support_tickets for select using (user_id = auth.uid());

-- ---------- Remake de vídeo ----------
create table public.video_remakes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  analysis_id uuid references public.video_analyses on delete set null,
  product jsonb not null,
  content jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.video_remakes enable row level security;
create policy "own remakes" on public.video_remakes for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------- Dados de exemplo (apague em produção) ----------
insert into public.products (name, niche, price_cents, commission_pct) values
  ('Garrafa térmica 1 L', 'Casa', 6990, 12),
  ('Sérum facial vitamina C', 'Beleza', 4990, 18),
  ('Escova removedora de pelos', 'Pets', 3490, 15),
  ('Fone sem fio com estojo', 'Eletrônicos', 11990, 8),
  ('Organizador de gaveta (kit 6)', 'Casa', 3990, 20);

insert into public.product_snapshots (product_id, price_cents, commission_pct, read_at)
select id, price_cents + 500, commission_pct - 2, now() - interval '7 days' from public.products;
insert into public.product_snapshots (product_id, price_cents, commission_pct)
select id, price_cents, commission_pct from public.products;

insert into public.characters (name, appearance, style) values
  ('Ana', 'Mulher de 28 anos, cabelo castanho na altura dos ombros, camiseta lisa clara, maquiagem leve', 'Casual'),
  ('Rafael', 'Homem de 32 anos, barba curta, camisa social azul-clara, relógio discreto', 'Social');

insert into public.templates (name, niche, scene, camera_motion) values
  ('Unboxing na bancada', 'Geral', 'Bancada clara com luz de janela, caixa fechada no centro', 'Plano médio, leve aproximação ao abrir'),
  ('Antes e depois', 'Casa', 'Ambiente bagunçado que fica organizado', 'Câmera fixa, corte seco no meio'),
  ('Rotina de skincare', 'Beleza', 'Pia de banheiro iluminada, produto na mão', 'Close no rosto e no frasco, alternando');

insert into public.extension_config (selectors) values ('{
  "commentInput": "[data-tid=\"m4b_input_textarea\"]",
  "pinText": "^(fixar|pin)$",
  "unpinText": "fixado|desfixar|desafixar|pinned|unpin",
  "startText": "^iniciar live$|^go live$",
  "systemText": "entrou|joined|curtiu|enviou|liked|seguiu|começou a seguir|comecou a seguir|started following|compartilhou|shared|boas-vindas|welcome to tiktok|diretrizes da comunidade|community guidelines|comprou|adicionou o produto"
}');

-- ---------- Preparações de live ("Continuar uma preparação") ----------
create table public.live_preps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  product_id integer not null,
  title text not null,
  clips integer not null default 6,
  comments integer not null default 24,
  step integer not null default 0,
  created_at timestamptz not null default now()
);
create index on public.live_preps (user_id, created_at desc);
alter table public.live_preps enable row level security;
create policy "own live preps" on public.live_preps for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
