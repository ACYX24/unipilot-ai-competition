-- 增量迁移：AI 分析租约与可重试状态（只增不删，可重复执行）
-- 在目标 Supabase 项目确认备份后执行；不要执行 schema.sql 中的 DROP TABLE 示例。

alter table rooms add column if not exists analysis_lease_until timestamptz;
alter table rooms add column if not exists analysis_attempts integer not null default 0;
alter table rooms add column if not exists analysis_error text;
alter table rooms add column if not exists analysis_error_at timestamptz;
alter table rooms add column if not exists analysis_completed_at timestamptz;

create index if not exists idx_rooms_analysis_lease
  on rooms (analysis_lease_until);

-- 原子领取分析任务：
-- 仅当房间处于 analyzing、没有有效租约时由一个请求领取成功，
-- 其余并发请求返回 false（接口回 202 analyzing）。
create or replace function claim_room_analysis(
  p_room_id uuid,
  p_lease_seconds integer default 90
)
returns boolean
language plpgsql
set search_path = public, pg_temp
as $$
declare
  claimed boolean;
begin
  if p_lease_seconds is null or p_lease_seconds < 10 or p_lease_seconds > 600 then
    raise exception 'invalid lease seconds';
  end if;

  update rooms
  set analysis_lease_until = now() + make_interval(secs => p_lease_seconds),
      analysis_attempts = analysis_attempts + 1,
      analysis_error = null,
      analysis_error_at = null
  where id = p_room_id
    and status = 'analyzing'
    and (analysis_lease_until is null or analysis_lease_until < now())
  returning true into claimed;

  return coalesce(claimed, false);
end;
$$;

-- 失败时释放租约并记录错误类别（仅存错误码，不存模型原文或用户陈述）
create or replace function release_room_analysis(
  p_room_id uuid,
  p_error text
)
returns void
language plpgsql
set search_path = public, pg_temp
as $$
begin
  update rooms
  set analysis_lease_until = null,
      analysis_error = left(coalesce(p_error, 'analysis_failed'), 60),
      analysis_error_at = now()
  where id = p_room_id
    and status = 'analyzing';
end;
$$;

-- 仅服务端 service role 可调用，浏览器 anon/authenticated 无权执行
revoke execute on function claim_room_analysis(uuid, integer) from public, anon, authenticated;
revoke execute on function release_room_analysis(uuid, text) from public, anon, authenticated;
grant execute on function claim_room_analysis(uuid, integer) to service_role;
grant execute on function release_room_analysis(uuid, text) to service_role;
