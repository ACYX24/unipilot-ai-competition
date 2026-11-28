alter table public.rooms
  add column if not exists mode text not null default 'court'
  check (mode in ('court', 'teacher'));
