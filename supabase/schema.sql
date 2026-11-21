-- Cat Mediator 双人房间系统 schema (Supabase PostgreSQL)
-- 在 Supabase 控制台 SQL Editor 中执行。
-- 注意：如果之前执行过初始化阶段的旧版 schema，请先执行下面三行清掉旧表：
-- drop table if exists mediation_reports cascade;
-- drop table if exists statements cascade;
-- drop table if exists participants cascade;
-- drop table if exists rooms cascade;

create extension if not exists pgcrypto;

-- 调解房间
-- 状态机: waiting(仅A已加入) -> collecting(B已加入,等待双方提交)
--         -> analyzing(双方均已提交, 等待或正在生成报告) -> completed(报告已生成)
-- analyzing 阶段的失败通过 analysis_error 记录错误码并释放租约，允许重试
create table if not exists rooms (
  id uuid primary key default gen_random_uuid(),
  invite_code text not null unique,
  topic text not null,
  dispute_type text not null,
  status text not null default 'waiting'
    check (status in ('waiting', 'collecting', 'analyzing', 'completed')),
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now(),
  analysis_lease_until timestamptz,
  analysis_attempts integer not null default 0,
  analysis_error text,
  analysis_error_at timestamptz,
  analysis_completed_at timestamptz
);

-- 房间参与者（每间房最多 A/B 两人，由 unique(room_id, side) 保证）
-- access_token_hash: 参与者访问凭证的 SHA-256，原始 token 只在创建/加入时返回一次
create table if not exists participants (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete cascade,
  side text not null check (side in ('A', 'B')),
  display_name text not null,
  access_token_hash text not null,
  joined_at timestamptz not null default now(),
  unique (room_id, side)
);

-- 双方观点陈述（每侧一条，unique 约束防止重复提交覆盖）
create table if not exists statements (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete cascade,
  side text not null check (side in ('A', 'B')),
  content text not null,
  submitted_at timestamptz not null default now(),
  unique (room_id, side)
);

-- AI 调解报告（下一阶段使用）
create table if not exists mediation_reports (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null unique references rooms(id) on delete cascade,
  report jsonb not null,
  model text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists idx_participants_room on participants(room_id);
create index if not exists idx_participants_token on participants(access_token_hash);
create index if not exists idx_statements_room on statements(room_id);
create index if not exists idx_rooms_analysis_lease on rooms(analysis_lease_until);

-- 原子领取分析任务：并发请求中只有一个能把租约写入 rooms，
-- 其余请求读取到有效租约后返回 202 analyzing。
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

-- 失败时释放租约，仅记录错误码
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

revoke execute on function claim_room_analysis(uuid, integer) from public;
revoke execute on function release_room_analysis(uuid, text) from public;
grant execute on function claim_room_analysis(uuid, integer) to service_role;
grant execute on function release_room_analysis(uuid, text) to service_role;

-- 访问控制：所有表开启 RLS 且不添加任何 anon/authenticated 策略，
-- 浏览器无法直连数据库读写；所有读写经由服务端 Route Handlers
-- （service role key，仅在服务端环境变量中存在），并在代码中校验参与者凭证。
alter table rooms enable row level security;
alter table participants enable row level security;
alter table statements enable row level security;
alter table mediation_reports enable row level security;
