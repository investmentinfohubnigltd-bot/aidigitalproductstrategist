-- Require live payments, bound subscription codes, and bounded paid periods.
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

  if p_domain <> 'live' or p_domain is null then raise exception 'live payment required'; end if;
  if v_checkout.status='paid' then return false; end if;

  if v_checkout.plan='founding50' then
    perform pg_advisory_xact_lock(hashtext('strategist-founding-100'));
    select count(*) into v_count from public.strategist_subscriptions
      where plan='founding50' and status in ('active','past_due','not_renewing') and user_id <> v_checkout.user_id;
    if v_count >= 100 then raise exception 'founding offer full'; end if;
  end if;

  update public.strategist_checkouts set status='paid',updated_at=now() where reference=p_reference;
  update public.profiles set tier=v_checkout.plan where id=v_checkout.user_id;
  insert into public.strategist_subscriptions(user_id,email,plan,status,paystack_customer_code,paystack_subscription_code,last_paid_at,current_period_end,domain)
  values(v_checkout.user_id,v_checkout.email,v_checkout.plan,'active',p_customer_code,p_subscription_code,coalesce(p_paid_at,now()),coalesce(p_paid_at,now()) + interval '1 month',p_domain)
  on conflict(user_id) do update set email=excluded.email,plan=excluded.plan,status='active',
    paystack_customer_code=coalesce(excluded.paystack_customer_code,public.strategist_subscriptions.paystack_customer_code),
    paystack_subscription_code=coalesce(excluded.paystack_subscription_code,public.strategist_subscriptions.paystack_subscription_code),
    last_paid_at=excluded.last_paid_at,current_period_end=excluded.current_period_end,domain=excluded.domain,cancel_at_period_end=false,updated_at=now();
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
      and domain='live'
   order by updated_at desc limit 1 for update;
  if not found then return false; end if;

  if p_event_type='subscription.disable' then
    update public.strategist_subscriptions set status='cancelled',cancel_at_period_end=false,updated_at=now() where user_id=v_user_id;
    update public.profiles set tier='free' where id=v_user_id;
  elsif p_event_type='subscription.not_renew' then
    update public.strategist_subscriptions set status='not_renewing',cancel_at_period_end=true,current_period_end=coalesce(p_next_payment_date,current_period_end),updated_at=now() where user_id=v_user_id;
  elsif p_event_type='invoice.payment_failed' then
    update public.strategist_subscriptions set status='past_due',updated_at=now() where user_id=v_user_id and current_period_end <= now();
    if found then update public.profiles set tier='free' where id=v_user_id; end if;
  elsif p_event_type='invoice.update' and p_paid and p_next_payment_date > now() then
    update public.strategist_subscriptions set status='active',paystack_subscription_code=coalesce(p_subscription_code,paystack_subscription_code),
      current_period_end=greatest(p_next_payment_date,current_period_end),last_paid_at=case when p_paid then now() else last_paid_at end,
      cancel_at_period_end=false,updated_at=now() where user_id=v_user_id;
    update public.profiles set tier=v_plan where id=v_user_id;
  end if;
  return true;
end $$;

revoke all on function public.activate_strategist_subscription(text,text,integer,text,text,text,text,timestamptz,text) from public, anon, authenticated;
revoke all on function public.process_strategist_subscription_event(text,text,text,text,text,timestamptz,boolean) from public, anon, authenticated;
grant execute on function public.activate_strategist_subscription(text,text,integer,text,text,text,text,timestamptz,text) to service_role;
grant execute on function public.process_strategist_subscription_event(text,text,text,text,text,timestamptz,boolean) to service_role;

