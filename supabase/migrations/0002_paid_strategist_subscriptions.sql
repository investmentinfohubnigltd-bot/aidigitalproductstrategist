-- Ask the Strategist paid subscriptions. Access is granted only by verified
-- Paystack webhooks through service-role-only database functions.

create table if not exists public.strategist_checkouts (
  reference text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  plan text not null check (plan in ('builder','founder','founding50')),
  amount_kobo integer not null check (amount_kobo > 0),
  currency text not null default 'NGN' check (currency = 'NGN'),
  paystack_plan_code text not null,
  source text not null default 'direct' check (source in ('direct','academy')),
  status text not null default 'initialized' check (status in ('initialized','paid','failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists strategist_checkouts_user_created_idx
  on public.strategist_checkouts(user_id, created_at desc);

create table if not exists public.strategist_subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  plan text not null check (plan in ('builder','founder','founding50')),
  status text not null check (status in ('active','past_due','not_renewing','cancelled')),
  paystack_customer_code text,
  paystack_subscription_code text unique,
  current_period_end timestamptz,
  last_paid_at timestamptz,
  cancel_at_period_end boolean not null default false,
  domain text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists strategist_subscriptions_customer_idx
  on public.strategist_subscriptions(paystack_customer_code)
  where paystack_customer_code is not null;

create table if not exists public.strategist_billing_events (
  payload_sha256 text primary key,
  event_type text not null,
  reference text,
  received_at timestamptz not null default now()
);

alter table public.strategist_checkouts enable row level security;
alter table public.strategist_subscriptions enable row level security;
alter table public.strategist_billing_events enable row level security;

-- Explicit deny policies document that browser clients have no access. The
-- service role bypasses RLS for the checkout and verified-webhook routes.
drop policy if exists "no browser checkout access" on public.strategist_checkouts;
create policy "no browser checkout access" on public.strategist_checkouts
  for all to anon, authenticated using (false) with check (false);
drop policy if exists "no browser billing event access" on public.strategist_billing_events;
create policy "no browser billing event access" on public.strategist_billing_events
  for all to anon, authenticated using (false) with check (false);

drop policy if exists "own strategist subscription read" on public.strategist_subscriptions;
create policy "own strategist subscription read" on public.strategist_subscriptions
  for select to authenticated using ((select auth.uid()) = user_id);

create or replace function public.activate_strategist_subscription(
  p_event_hash text, p_reference text, p_amount_kobo integer, p_currency text,
  p_plan_code text, p_customer_code text, p_subscription_code text,
  p_paid_at timestamptz, p_domain text
) returns boolean language plpgsql security definer set search_path = '' as $$
declare v_checkout public.strategist_checkouts%rowtype; v_count integer;
begin
  if p_event_hash is null or length(p_event_hash) <> 64 then raise exception 'invalid event hash'; end if;
  insert into public.strategist_billing_events(payload_sha256,event_type,reference)
  values(p_event_hash,'charge.success',p_reference) on conflict do nothing;
  if not found then return false; end if;

  select * into v_checkout from public.strategist_checkouts where reference=p_reference for update;
  if not found or v_checkout.amount_kobo <> p_amount_kobo or v_checkout.currency <> upper(p_currency)
     or (p_plan_code is not null and v_checkout.paystack_plan_code <> p_plan_code) then
    raise exception 'payment does not match checkout';
  end if;

  if v_checkout.plan='founding50' then
    perform pg_advisory_xact_lock(hashtext('strategist-founding-100'));
    select count(*) into v_count from public.strategist_subscriptions
      where plan='founding50' and status in ('active','past_due','not_renewing') and user_id <> v_checkout.user_id;
    if v_count >= 100 then raise exception 'founding offer full'; end if;
  end if;

  update public.strategist_checkouts set status='paid',updated_at=now() where reference=p_reference;
  update public.profiles set tier=v_checkout.plan where id=v_checkout.user_id;
  insert into public.strategist_subscriptions(user_id,email,plan,status,paystack_customer_code,paystack_subscription_code,last_paid_at,domain)
  values(v_checkout.user_id,v_checkout.email,v_checkout.plan,'active',p_customer_code,p_subscription_code,coalesce(p_paid_at,now()),p_domain)
  on conflict(user_id) do update set email=excluded.email,plan=excluded.plan,status='active',
    paystack_customer_code=coalesce(excluded.paystack_customer_code,public.strategist_subscriptions.paystack_customer_code),
    paystack_subscription_code=coalesce(excluded.paystack_subscription_code,public.strategist_subscriptions.paystack_subscription_code),
    last_paid_at=excluded.last_paid_at,domain=excluded.domain,cancel_at_period_end=false,updated_at=now();
  return true;
end $$;

create or replace function public.process_strategist_subscription_event(
  p_event_hash text, p_event_type text, p_subscription_code text,
  p_customer_code text, p_email text, p_next_payment_date timestamptz, p_paid boolean
) returns boolean language plpgsql security definer set search_path = '' as $$
declare v_user_id uuid; v_plan text;
begin
  if p_event_hash is null or length(p_event_hash) <> 64 then raise exception 'invalid event hash'; end if;
  insert into public.strategist_billing_events(payload_sha256,event_type)
  values(p_event_hash,p_event_type) on conflict do nothing;
  if not found then return false; end if;

  select user_id,plan into v_user_id,v_plan from public.strategist_subscriptions
   where (p_subscription_code is not null and paystack_subscription_code=p_subscription_code)
      or (p_customer_code is not null and paystack_customer_code=p_customer_code)
      or (p_email is not null and lower(email)=lower(p_email))
   order by updated_at desc limit 1 for update;
  if not found then return false; end if;

  if p_event_type='subscription.disable' then
    update public.strategist_subscriptions set status='cancelled',cancel_at_period_end=false,updated_at=now() where user_id=v_user_id;
    update public.profiles set tier='free' where id=v_user_id;
  elsif p_event_type='subscription.not_renew' then
    update public.strategist_subscriptions set status='not_renewing',cancel_at_period_end=true,current_period_end=coalesce(p_next_payment_date,current_period_end),updated_at=now() where user_id=v_user_id;
  elsif p_event_type='invoice.payment_failed' then
    update public.strategist_subscriptions set status='past_due',updated_at=now() where user_id=v_user_id;
  elsif p_event_type='subscription.create' or (p_event_type='invoice.update' and p_paid) then
    update public.strategist_subscriptions set status='active',paystack_subscription_code=coalesce(p_subscription_code,paystack_subscription_code),
      current_period_end=coalesce(p_next_payment_date,current_period_end),last_paid_at=case when p_paid then now() else last_paid_at end,
      cancel_at_period_end=false,updated_at=now() where user_id=v_user_id;
    update public.profiles set tier=v_plan where id=v_user_id;
  end if;
  return true;
end $$;

revoke all on function public.activate_strategist_subscription(text,text,integer,text,text,text,text,timestamptz,text) from public, anon, authenticated;
revoke all on function public.process_strategist_subscription_event(text,text,text,text,text,timestamptz,boolean) from public, anon, authenticated;
grant execute on function public.activate_strategist_subscription(text,text,integer,text,text,text,text,timestamptz,text) to service_role;
grant execute on function public.process_strategist_subscription_event(text,text,text,text,text,timestamptz,boolean) to service_role;

-- Existing service-only functions were created before explicit EXECUTE grants
-- were part of the project standard. The trigger continues to work; the chat
-- API calls ask_consume_message through its service-role client.
revoke all on function public.ask_consume_message(uuid,integer) from public, anon, authenticated;
grant execute on function public.ask_consume_message(uuid,integer) to service_role;
revoke all on function public.handle_new_ask_user() from public, anon, authenticated;

create index if not exists plan_waitlist_user_idx on public.plan_waitlist(user_id);

drop policy if exists "own profile read" on public.profiles;
create policy "own profile read" on public.profiles for select to authenticated
  using ((select auth.uid()) = id);
drop policy if exists "own messages read" on public.ask_messages;
create policy "own messages read" on public.ask_messages for select to authenticated
  using ((select auth.uid()) = user_id);
drop policy if exists "own usage read" on public.ask_usage;
create policy "own usage read" on public.ask_usage for select to authenticated
  using ((select auth.uid()) = user_id);
