-- Safely pair Paystack's subscription.create event with its later
-- charge.success event, reserve Founding 100 capacity, and bind later
-- lifecycle events to an exact live subscription code.

create table if not exists public.strategist_pending_subscriptions (
  subscription_code text primary key,
  customer_code text,
  email text not null,
  plan_code text not null,
  next_payment_date timestamptz,
  domain text not null check (domain = 'live'),
  event_hash text not null unique,
  created_at timestamptz not null default now()
);
alter table public.strategist_pending_subscriptions enable row level security;
drop policy if exists "no browser pending subscription access" on public.strategist_pending_subscriptions;
create policy "no browser pending subscription access" on public.strategist_pending_subscriptions
  for all to anon, authenticated using (false) with check (false);

create or replace function public.reserve_strategist_checkout(
  p_reference text, p_user_id uuid, p_email text, p_plan text,
  p_amount_kobo integer, p_plan_code text, p_source text
) returns boolean language plpgsql security definer set search_path = '' as $$
declare v_count integer;
begin
  if p_user_id is null or p_reference !~ '^STRAT-[A-Za-z0-9-]+$'
     or p_plan not in ('builder','founder','founding50')
     or p_amount_kobo <= 0 or p_plan_code !~ '^PLN_[A-Za-z0-9]+$'
     or p_source not in ('direct','academy') then
    raise exception 'invalid checkout';
  end if;
  if p_plan = 'founding50' then
    perform pg_advisory_xact_lock(hashtext('strategist-founding-100'));
    select count(*) into v_count from (
      select user_id from public.strategist_subscriptions
       where plan='founding50' and status in ('active','past_due','not_renewing')
         and coalesce(current_period_end, now() + interval '1 day') > now()
      union
      select user_id from public.strategist_checkouts
       where plan='founding50' and status='initialized'
         and created_at > now() - interval '30 minutes'
    ) reserved_users;
    if v_count >= 100 then return false; end if;
  end if;
  insert into public.strategist_checkouts(
    reference,user_id,email,plan,amount_kobo,currency,paystack_plan_code,source
  ) values (
    p_reference,p_user_id,lower(p_email),p_plan,p_amount_kobo,'NGN',p_plan_code,p_source
  );
  return true;
end $$;

create or replace function public.activate_strategist_subscription(
  p_event_hash text, p_reference text, p_amount_kobo integer, p_currency text,
  p_plan_code text, p_customer_code text, p_subscription_code text,
  p_paid_at timestamptz, p_domain text
) returns boolean language plpgsql security definer set search_path = '' as $$
declare
  v_checkout public.strategist_checkouts%rowtype;
  v_count integer;
  v_subscription_code text := p_subscription_code;
  v_period_end timestamptz;
begin
  if p_event_hash is null or length(p_event_hash) <> 64 then raise exception 'invalid event hash'; end if;
  if p_domain <> 'live' then raise exception 'live payment required'; end if;
  insert into public.strategist_billing_events(payload_sha256,event_type,reference)
  values(p_event_hash,'charge.success',p_reference) on conflict do nothing;
  if not found then return false; end if;

  select * into v_checkout from public.strategist_checkouts where reference=p_reference for update;
  if not found or v_checkout.status <> 'initialized'
     or v_checkout.amount_kobo <> p_amount_kobo
     or v_checkout.currency <> upper(p_currency)
     or p_plan_code is null or v_checkout.paystack_plan_code <> p_plan_code then
    raise exception 'payment does not match checkout';
  end if;

  if v_subscription_code is null then
    select subscription_code,next_payment_date
      into v_subscription_code,v_period_end
      from public.strategist_pending_subscriptions
     where plan_code=v_checkout.paystack_plan_code
       and lower(email)=lower(v_checkout.email)
       and (p_customer_code is null or customer_code=p_customer_code)
       and created_at > now() - interval '1 day'
     order by created_at desc limit 1 for update;
  else
    select next_payment_date into v_period_end
      from public.strategist_pending_subscriptions
     where subscription_code=v_subscription_code
       and plan_code=v_checkout.paystack_plan_code
       and lower(email)=lower(v_checkout.email);
  end if;
  if v_subscription_code is null then raise exception 'subscription not paired'; end if;

  if v_checkout.plan='founding50' then
    perform pg_advisory_xact_lock(hashtext('strategist-founding-100'));
    select count(*) into v_count from public.strategist_subscriptions
      where plan='founding50' and status in ('active','past_due','not_renewing')
        and coalesce(current_period_end, now() + interval '1 day') > now()
        and user_id <> v_checkout.user_id;
    if v_count >= 100 then raise exception 'founding offer full'; end if;
  end if;

  update public.strategist_checkouts set status='paid',updated_at=now() where reference=p_reference;
  update public.profiles set tier=v_checkout.plan where id=v_checkout.user_id;
  insert into public.strategist_subscriptions(
    user_id,email,plan,status,paystack_customer_code,paystack_subscription_code,
    last_paid_at,current_period_end,domain
  ) values (
    v_checkout.user_id,v_checkout.email,v_checkout.plan,'active',p_customer_code,
    v_subscription_code,coalesce(p_paid_at,now()),
    coalesce(v_period_end,coalesce(p_paid_at,now()) + interval '1 month'),'live'
  )
  on conflict(user_id) do update set
    email=excluded.email,plan=excluded.plan,status='active',
    paystack_customer_code=coalesce(excluded.paystack_customer_code,public.strategist_subscriptions.paystack_customer_code),
    paystack_subscription_code=excluded.paystack_subscription_code,
    last_paid_at=excluded.last_paid_at,current_period_end=excluded.current_period_end,
    domain='live',cancel_at_period_end=false,updated_at=now();
  delete from public.strategist_pending_subscriptions where subscription_code=v_subscription_code;
  return true;
end $$;

drop function if exists public.process_strategist_subscription_event(text,text,text,text,text,timestamptz,boolean);
create or replace function public.process_strategist_subscription_event(
  p_event_hash text, p_event_type text, p_subscription_code text,
  p_customer_code text, p_email text, p_plan_code text,
  p_next_payment_date timestamptz, p_paid boolean, p_domain text
) returns boolean language plpgsql security definer set search_path = '' as $$
declare v_user_id uuid; v_plan text;
begin
  if p_event_hash is null or length(p_event_hash) <> 64 then raise exception 'invalid event hash'; end if;
  if p_domain <> 'live' then return false; end if;
  insert into public.strategist_billing_events(payload_sha256,event_type)
  values(p_event_hash,p_event_type) on conflict do nothing;
  if not found then return false; end if;

  if p_event_type='subscription.create' then
    if p_subscription_code is null or p_email is null or p_plan_code is null then
      raise exception 'incomplete subscription';
    end if;
    insert into public.strategist_pending_subscriptions(
      subscription_code,customer_code,email,plan_code,next_payment_date,domain,event_hash
    ) values (
      p_subscription_code,p_customer_code,lower(p_email),p_plan_code,p_next_payment_date,'live',p_event_hash
    ) on conflict(subscription_code) do update set
      customer_code=excluded.customer_code,email=excluded.email,plan_code=excluded.plan_code,
      next_payment_date=excluded.next_payment_date,event_hash=excluded.event_hash;
    return true;
  end if;

  if p_subscription_code is null then return false; end if;
  select user_id,plan into v_user_id,v_plan from public.strategist_subscriptions
   where paystack_subscription_code=p_subscription_code and domain='live' for update;
  if not found then return false; end if;

  if p_event_type='subscription.disable' then
    update public.strategist_subscriptions set status='cancelled',cancel_at_period_end=false,updated_at=now() where user_id=v_user_id;
    update public.profiles set tier='free' where id=v_user_id;
  elsif p_event_type='subscription.not_renew' then
    update public.strategist_subscriptions set status='not_renewing',cancel_at_period_end=true,
      current_period_end=coalesce(p_next_payment_date,current_period_end),updated_at=now() where user_id=v_user_id;
  elsif p_event_type='invoice.payment_failed' then
    update public.strategist_subscriptions set status='past_due',updated_at=now() where user_id=v_user_id;
    update public.profiles set tier='free' where id=v_user_id
      and (select current_period_end from public.strategist_subscriptions where user_id=v_user_id) <= now();
  elsif p_event_type='invoice.update' and p_paid and p_next_payment_date > now() then
    update public.strategist_subscriptions set status='active',
      current_period_end=greatest(p_next_payment_date,current_period_end),last_paid_at=now(),
      cancel_at_period_end=false,updated_at=now() where user_id=v_user_id;
    update public.profiles set tier=v_plan where id=v_user_id;
  end if;
  return true;
end $$;

revoke all on function public.reserve_strategist_checkout(text,uuid,text,text,integer,text,text) from public, anon, authenticated;
revoke all on function public.activate_strategist_subscription(text,text,integer,text,text,text,text,timestamptz,text) from public, anon, authenticated;
revoke all on function public.process_strategist_subscription_event(text,text,text,text,text,text,timestamptz,boolean,text) from public, anon, authenticated;
grant execute on function public.reserve_strategist_checkout(text,uuid,text,text,integer,text,text) to service_role;
grant execute on function public.activate_strategist_subscription(text,text,integer,text,text,text,text,timestamptz,text) to service_role;
grant execute on function public.process_strategist_subscription_event(text,text,text,text,text,text,timestamptz,boolean,text) to service_role;
