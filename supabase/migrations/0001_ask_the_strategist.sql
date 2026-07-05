-- ============================================================================
-- Ask the Strategist — schema
-- Run this in the Supabase SQL editor (or `supabase db push`) for the Ask Aurum
-- project. Safe to re-run: guarded with IF NOT EXISTS / OR REPLACE.
-- ============================================================================

-- ── profiles ────────────────────────────────────────────────────────────────
-- One row per auth user. `tier` gates access; free users get FREE_LIMIT messages.
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  first_name text,
  tier       text not null default 'free'
             check (tier in ('free', 'builder', 'founder', 'founding50')),
  created_at timestamptz not null default now()
);

-- ── ask_messages ────────────────────────────────────────────────────────────
-- Full chat transcript, one row per message.
create table if not exists public.ask_messages (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  role       text not null check (role in ('user', 'assistant')),
  content    text not null,
  created_at timestamptz not null default now()
);
create index if not exists ask_messages_user_created_idx
  on public.ask_messages (user_id, created_at);

-- ── ask_usage ───────────────────────────────────────────────────────────────
-- Lifetime free-message counter, enforced server-side via ask_consume_message().
create table if not exists public.ask_usage (
  user_id       uuid primary key references auth.users (id) on delete cascade,
  message_count int not null default 0,
  updated_at    timestamptz not null default now()
);

-- ── plan_waitlist ───────────────────────────────────────────────────────────
-- Captured plan interest while payments are gated (no Paystack yet).
create table if not exists public.plan_waitlist (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users (id) on delete set null,
  email      text not null,
  plan       text not null check (plan in ('builder', 'founder', 'founding50')),
  created_at timestamptz not null default now()
);

-- ── atomic free-message consumption ──────────────────────────────────────────
-- Increments the counter only while under the limit, in a single guarded UPDATE
-- so concurrent requests can't overspend. Returns { allowed, remaining }.
create or replace function public.ask_consume_message(p_user_id uuid, p_limit int)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  insert into public.ask_usage (user_id, message_count)
  values (p_user_id, 0)
  on conflict (user_id) do nothing;

  update public.ask_usage
     set message_count = message_count + 1,
         updated_at = now()
   where user_id = p_user_id
     and message_count < p_limit
  returning message_count into v_count;

  if v_count is null then
    return json_build_object('allowed', false, 'remaining', 0);
  end if;

  return json_build_object('allowed', true, 'remaining', greatest(p_limit - v_count, 0));
end;
$$;

-- ── auto-create a profile on signup ──────────────────────────────────────────
create or replace function public.handle_new_ask_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, tier)
  values (new.id, new.raw_user_meta_data ->> 'first_name', 'free')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_ask on auth.users;
create trigger on_auth_user_created_ask
  after insert on auth.users
  for each row execute function public.handle_new_ask_user();

-- ── Row Level Security ───────────────────────────────────────────────────────
-- All writes go through the service-role key (which bypasses RLS). RLS is on with
-- self-read policies so that even if the anon key touched these tables directly,
-- a user could only ever read their own rows. No client-side writes are allowed.
alter table public.profiles     enable row level security;
alter table public.ask_messages enable row level security;
alter table public.ask_usage    enable row level security;
alter table public.plan_waitlist enable row level security;

drop policy if exists "own profile read" on public.profiles;
create policy "own profile read" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "own messages read" on public.ask_messages;
create policy "own messages read" on public.ask_messages
  for select using (auth.uid() = user_id);

drop policy if exists "own usage read" on public.ask_usage;
create policy "own usage read" on public.ask_usage
  for select using (auth.uid() = user_id);
-- plan_waitlist: no policies → not readable/writable with the anon key at all.
