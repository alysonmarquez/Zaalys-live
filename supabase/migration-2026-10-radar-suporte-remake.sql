-- Para bancos já criados com o schema.sql antigo: rode só este arquivo no SQL Editor.
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

