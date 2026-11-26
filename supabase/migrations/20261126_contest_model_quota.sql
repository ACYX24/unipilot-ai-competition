begin;

create table if not exists public.contest_model_usage (
  singleton boolean primary key default true check (singleton),
  quota_day date not null,
  quota_minute timestamptz not null,
  day_count integer not null check (day_count >= 0),
  minute_count integer not null check (minute_count >= 0)
);

alter table public.contest_model_usage enable row level security;
revoke all on table public.contest_model_usage from public, anon, authenticated;

create or replace function public.consume_contest_model_quota(
  p_daily_limit integer,
  p_minute_limit integer
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  checked_at timestamptz := statement_timestamp();
  usage_day date := (checked_at at time zone 'Asia/Shanghai')::date;
  usage_minute timestamptz := date_trunc('minute', checked_at);
  usage_now public.contest_model_usage%rowtype;
begin
  if p_daily_limit is null or p_minute_limit is null
     or p_daily_limit < 1 or p_minute_limit < 1 then
    raise exception 'Invalid contest model quota';
  end if;

  insert into public.contest_model_usage
    (singleton, quota_day, quota_minute, day_count, minute_count)
  values (true, usage_day, usage_minute, 0, 0)
  on conflict (singleton) do nothing;

  select * into strict usage_now
    from public.contest_model_usage where singleton for update;

  -- Evaluate the windows after acquiring the row lock.
  checked_at := clock_timestamp();
  usage_day := (checked_at at time zone 'Asia/Shanghai')::date;
  usage_minute := date_trunc('minute', checked_at);

  if usage_now.quota_day = usage_day and usage_now.day_count >= p_daily_limit then
    return 'daily';
  end if;
  if usage_now.quota_minute = usage_minute and usage_now.minute_count >= p_minute_limit then
    return 'minute';
  end if;

  update public.contest_model_usage
    set quota_day = usage_day,
        quota_minute = usage_minute,
        day_count = case when usage_now.quota_day = usage_day then usage_now.day_count + 1 else 1 end,
        minute_count = case when usage_now.quota_minute = usage_minute then usage_now.minute_count + 1 else 1 end
    where singleton;
  return 'allowed';
end;
$$;

revoke execute on function public.consume_contest_model_quota(integer, integer) from public, anon, authenticated;
grant execute on function public.consume_contest_model_quota(integer, integer) to service_role;

commit;
