-- All v1 checklist labels changed safety meaning. Invalidate their ticks while
-- retaining revision so the first v2 write remains compare-and-swap protected.
update public.user_progress
set completed = false, score = 0, answers_history = jsonb_build_object(
  'version', 2,
  'catalogueId', 'engine-maintenance-v2',
  'checkedItemIds', '[]'::jsonb,
  'revision', coalesce((answers_history->>'revision')::bigint, 0)
)
where topic_id = 'engine-checklist'
  and answers_history->>'catalogueId' = 'engine-maintenance-v1';

-- Stable question IDs keep clients, full-exam selection and the server-owned
-- review catalogue aligned. Their safety meaning changed, so prior scheduling
-- must not treat the corrected questions as already mastered.
update public.question_reviews
set ease_factor = 2.5, interval_days = 0, repetitions = 0,
  next_review_at = now(), last_reviewed_at = null, updated_at = now()
where question_id = any(array['e1','e2','e3','e4','e5','e6','e7','e8','e9','e10','e11','e12']::text[]);

revoke all on function public.save_engine_checklist_progress(bigint, text[]) from authenticated;
drop function public.save_engine_checklist_progress(bigint, text[]);

create function public.save_engine_checklist_progress(
  p_catalogue_id text,
  p_version integer,
  p_expected_revision bigint,
  p_checked_item_ids text[]
)
returns table(points_awarded boolean, completion_awarded boolean, awarded_points integer)
language plpgsql security definer set search_path = '' as $$
declare
  owner uuid := auth.uid();
  current_revision bigint := 0;
  normalized_ids text[];
begin
  if owner is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if p_catalogue_id is distinct from 'engine-maintenance-v2' or p_version is distinct from 2 then
    raise exception 'Stale engine checklist catalogue' using errcode = '22023';
  end if;
  if p_expected_revision is null or p_expected_revision < 0 then raise exception 'Invalid checklist revision' using errcode = '22023'; end if;
  if p_checked_item_ids is null or cardinality(p_checked_item_ids) > 10 or exists (
    select 1 from unnest(p_checked_item_ids) id where id is null or id <> all(array[
      'oil','coolant','fuel','seacock','belt','impeller','filters','anodes','exhaust','battery'
    ]::text[])
  ) then raise exception 'Invalid engine checklist item IDs' using errcode = '22023'; end if;
  select coalesce(array_agg(distinct id order by id), array[]::text[]) into normalized_ids from unnest(p_checked_item_ids) id;
  perform pg_advisory_xact_lock(hashtextextended(owner::text || ':engine-checklist', 0));
  select coalesce((answers_history->>'revision')::bigint, 0) into current_revision
    from public.user_progress where user_id = owner and topic_id = 'engine-checklist';
  current_revision := coalesce(current_revision, 0);
  if current_revision <> p_expected_revision then raise exception 'Engine checklist revision conflict' using errcode = '40001'; end if;
  insert into public.user_progress(user_id, topic_id, completed, score, last_accessed, answers_history)
  values (owner, 'engine-checklist', false, 0, now(), jsonb_build_object(
    'version', 2, 'catalogueId', 'engine-maintenance-v2', 'checkedItemIds', to_jsonb(normalized_ids), 'revision', current_revision + 1
  )) on conflict (user_id, topic_id) do update set completed = false, score = 0,
    answers_history = excluded.answers_history, last_accessed = excluded.last_accessed;
  return query select false, false, 0;
end; $$;

revoke all on function public.save_engine_checklist_progress(text, integer, bigint, text[]) from public;
revoke all on function public.save_engine_checklist_progress(text, integer, bigint, text[]) from anon;
grant execute on function public.save_engine_checklist_progress(text, integer, bigint, text[]) to authenticated;
