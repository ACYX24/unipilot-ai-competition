-- Cat Mediator MVP schema (Supabase PostgreSQL)
-- 在 Supabase 控制台 SQL Editor 中执行

create extension if not exists pgcrypto;

-- 调解房间
create table if not exists rooms (
  id uuid primary key default gen_random_uuid(),
  invite_code text not null unique,
  topic text not null,
  dispute_type text not null,
  status text not null default 'waiting'
    check (status in ('waiting', 'stating', 'analyzing', 'reported')),
  created_at timestamptz not null default now()
);

-- 房间参与者（A / B 两侧）
create table if not exists participants (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete cascade,
  side text not null check (side in ('A', 'B')),
  display_name text not null,
  joined_at timestamptz not null default now(),
  unique (room_id, side)
);

-- 双方观点陈述（每侧一条）
create table if not exists statements (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete cascade,
  side text not null check (side in ('A', 'B')),
  content text not null,
  submitted_at timestamptz not null default now(),
  unique (room_id, side)
);

-- AI 调解报告（结构化 JSON）
create table if not exists mediation_reports (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null unique references rooms(id) on delete cascade,
  report jsonb not null,
  model text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists idx_participants_room on participants(room_id);
create index if not exists idx_statements_room on statements(room_id);

-- MVP 阶段：所有读写经由服务端 Route Handlers（service role key）。
-- 启用 RLS 且暂不添加 anon 策略，等于禁止浏览器直连数据库。
alter table rooms enable row level security;
alter table participants enable row level security;
alter table statements enable row level security;
alter table mediation_reports enable row level security;
