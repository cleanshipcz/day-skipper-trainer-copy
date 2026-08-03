-- Keep reversible planning state separate from the legacy victualling quiz row.
-- A compare-and-swap revision prevents an old offline/device snapshot from
-- replacing a newer checklist. Conflicts are quarantined by the offline queue.
create or replace function public.save_victualling_checklist_progress(
  p_expected_revision bigint,
  p_checked_item_ids text[]
)
returns table(points_awarded boolean, completion_awarded boolean, awarded_points integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner uuid := auth.uid();
  current_revision bigint := 0;
  next_revision bigint;
  normalized_ids text[];
begin
  if owner is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if p_expected_revision is null or p_expected_revision < 0 then
    raise exception 'Invalid checklist revision' using errcode = '22023';
  end if;
  if p_checked_item_ids is null or cardinality(p_checked_item_ids) > 18 or exists (
    select 1 from unnest(p_checked_item_ids) id
     where id is null
        or length(id) = 0
        or octet_length(id) > 16
        or id <> all (array[
          'f1', 'f2', 'f3', 'f4', 'f5',
          's1', 's2', 's3', 's4',
          'g1', 'g2', 'g3', 'g4', 'g5',
          'p1', 'p2', 'p3', 'p4'
        ]::text[])
  ) then raise exception 'Invalid checklist item IDs' using errcode = '22023'; end if;

  select coalesce(array_agg(distinct id order by id), array[]::text[])
    into normalized_ids from unnest(p_checked_item_ids) id;
  perform pg_advisory_xact_lock(hashtextextended(owner::text || ':victualling-checklist', 0));

  select coalesce((answers_history->>'revision')::bigint, 0)
    into current_revision
    from public.user_progress
   where user_id = owner and topic_id = 'victualling-checklist';
  current_revision := coalesce(current_revision, 0);
  if current_revision <> p_expected_revision then
    raise exception 'Victualling checklist revision conflict' using errcode = '40001';
  end if;
  next_revision := current_revision + 1;

  insert into public.user_progress(user_id, topic_id, completed, score, last_accessed, answers_history)
  values (
    owner, 'victualling-checklist', false, 0, now(),
    jsonb_build_object('version', 1, 'checkedItemIds', to_jsonb(normalized_ids), 'revision', next_revision)
  )
  on conflict (user_id, topic_id) do update set
    completed = false,
    score = 0,
    answers_history = excluded.answers_history,
    last_accessed = excluded.last_accessed;

  return query select false, false, 0;
end;
$$;

revoke all on function public.save_victualling_checklist_progress(bigint, text[]) from public;
revoke all on function public.save_victualling_checklist_progress(bigint, text[]) from anon;
grant execute on function public.save_victualling_checklist_progress(bigint, text[]) to authenticated;
