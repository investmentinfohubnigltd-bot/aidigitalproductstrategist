create table public.strategist_scholarships (
 token_hash text primary key check (token_hash ~ '^[a-f0-9]{64}$'),
 recipient_name text not null,
 claim_before timestamptz not null,
 duration_months integer not null default 3 check (duration_months between 1 and 12),
 claimed_by uuid unique references auth.users(id) on delete set null,
 claimed_at timestamptz,
 access_until timestamptz,
 revoked_at timestamptz,
 created_at timestamptz not null default now()
);
alter table public.strategist_scholarships enable row level security;
revoke all on public.strategist_scholarships from anon, authenticated;
grant all on public.strategist_scholarships to service_role;
create function public.claim_strategist_scholarship(p_token_hash text,p_user_id uuid)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare v public.strategist_scholarships%rowtype;
begin
 select * into v from public.strategist_scholarships where token_hash=p_token_hash for update;
 if not found or v.revoked_at is not null then return jsonb_build_object('error','invalid_invitation'); end if;
 if v.claimed_at is not null then
   if v.claimed_by=p_user_id then return jsonb_build_object('activated',true,'accessUntil',v.access_until); end if;
   return jsonb_build_object('error','invitation_claimed');
 end if;
 if v.claim_before<=now() then return jsonb_build_object('error','invitation_expired'); end if;
 if exists(select 1 from public.strategist_scholarships where claimed_by=p_user_id) then
   return jsonb_build_object('error','already_claimed');
 end if;
 update public.strategist_scholarships set claimed_by=p_user_id,claimed_at=now(),
   access_until=now()+make_interval(months=>v.duration_months) where token_hash=p_token_hash
   returning * into v;
 return jsonb_build_object('activated',true,'accessUntil',v.access_until);
end $$;
revoke all on function public.claim_strategist_scholarship(text,uuid) from public,anon,authenticated;
grant execute on function public.claim_strategist_scholarship(text,uuid) to service_role;
