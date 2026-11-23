-- 增量迁移：把陈述保存与房间状态推进放进同一事务（只增不删，可重复执行）
-- 执行顺序：先应用本迁移，再部署依赖 submit_room_statement 的代码。
-- 回滚：drop function if exists submit_room_statement(uuid, text, text);

create or replace function submit_room_statement(
  p_room_id uuid,
  p_side text,
  p_content text
)
returns table (
  status text,
  inserted boolean,
  statement_id uuid
)
language plpgsql
set search_path = public, pg_temp
as $$
declare
  v_status text;
  v_statement_id uuid;
  v_inserted boolean := false;
  v_count integer;
begin
  if p_side is null or p_side not in ('A', 'B') then
    raise exception 'invalid_side' using errcode = 'P0001';
  end if;

  if p_content is null or btrim(p_content) = '' then
    raise exception 'empty_content' using errcode = 'P0001';
  end if;

  -- 锁定房间行，串行化同一房间的并发提交
  select r.status
    into v_status
    from rooms r
   where r.id = p_room_id
     for update;

  if v_status is null then
    raise exception 'room_not_found' using errcode = 'P0001';
  end if;

  select s.id
    into v_statement_id
    from statements s
   where s.room_id = p_room_id
     and s.side = p_side;

  if v_statement_id is null then
    if v_status not in ('waiting', 'collecting') then
      raise exception 'room_not_accepting_statements' using errcode = 'P0001';
    end if;

    insert into statements (room_id, side, content)
    values (p_room_id, p_side, p_content)
    returning id into v_statement_id;

    v_inserted := true;
  end if;

  -- 已有两份陈述但状态未推进时，在同一次调用中补齐
  select count(*)
    into v_count
    from statements s
   where s.room_id = p_room_id;

  if v_count >= 2 and v_status in ('waiting', 'collecting') then
    update rooms
       set status = 'analyzing'
     where id = p_room_id;

    v_status := 'analyzing';
  end if;

  return query select v_status, v_inserted, v_statement_id;
end;
$$;

revoke execute on function submit_room_statement(uuid, text, text) from public, anon, authenticated;
grant execute on function submit_room_statement(uuid, text, text) to service_role;