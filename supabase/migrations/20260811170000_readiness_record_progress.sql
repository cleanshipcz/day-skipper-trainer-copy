-- Readiness evidence remains editable after completion: a vessel/voyage/context
-- change must be able to revoke the completion flag and replace stale evidence.
create function public.save_readiness_record_progress(
  p_completed boolean,
  p_answers_history jsonb
)
returns table(points_awarded boolean, completion_awarded boolean, awarded_points integer)
language plpgsql security definer set search_path = '' as $$
declare
  owner uuid := auth.uid();
  v_record jsonb := p_answers_history->'readinessRecord';
  entries jsonb;
  allowed_ids constant text[] := array[
    'passage-plan','charts-notices','tides-ukc','forecast','planning-decision','crew-fitness','crew-brief','documents-shore','hull-openings','bilge-steering','rig-deck','electrical-gas','nav-signals','emergency-readiness','conditional-survival','provisions','stowage-hatches','cold-fluids','machinery-space','prop-clear','ventilation','start-sequence','pressure-charge','cooling-exhaust','running-scan','controls-steering','vhf-dsc','departure-ready','final-information','final-decision'
  ];
  na_ids constant text[] := array['conditional-survival','ventilation'];
  resolved_count integer;
  was_completed boolean := false;
  awarded boolean := false;
begin
  if owner is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if jsonb_typeof(p_answers_history) <> 'object' or jsonb_typeof(v_record) <> 'object'
     or v_record->>'version' <> '1' or jsonb_typeof(v_record->'context') <> 'object'
     or jsonb_typeof(v_record->'entries') <> 'object' or jsonb_typeof(v_record->'updatedAt') <> 'string'
     or jsonb_typeof(v_record->'context'->'vessel') <> 'string'
     or jsonb_typeof(v_record->'context'->'voyage') <> 'string'
     or jsonb_typeof(v_record->'context'->'conditions') <> 'string'
     or pg_column_size(p_answers_history) > 65536 then
    raise exception 'Invalid readiness record' using errcode = '22023';
  end if;
  entries := v_record->'entries';
  if exists (select 1 from jsonb_each(entries) item where not (item.key = any(allowed_ids)))
     or exists (
       select 1 from jsonb_each(entries) item
       where jsonb_typeof(item.value) <> 'object'
          or item.value->>'status' not in ('not_checked','satisfactory','not_applicable','defect','blocked','unknown')
          or jsonb_typeof(item.value->'reason') <> 'string'
          or jsonb_typeof(item.value->'notes') <> 'string'
          or jsonb_typeof(item.value->'evidence') <> 'string'
          or jsonb_typeof(item.value->'responsiblePerson') <> 'string'
          or (item.value ? 'history' and jsonb_typeof(item.value->'history') <> 'array')
          or (item.value->>'status' = 'not_applicable' and (not (item.key = any(na_ids)) or btrim(item.value->>'reason') = ''))
     ) then raise exception 'Invalid readiness entry' using errcode = '22023'; end if;
  select count(*) into resolved_count from unnest(allowed_ids) id
   where entries->id->>'status' = 'satisfactory'
      or (id = any(na_ids) and entries->id->>'status' = 'not_applicable' and btrim(entries->id->>'reason') <> '');
  if p_completed is distinct from (resolved_count = cardinality(allowed_ids)) then
    raise exception 'Readiness completion does not match evidence' using errcode = '22023';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(owner::text || ':passage-planning-checklist', 0));
  select coalesce(completed, false) into was_completed from public.user_progress where user_id = owner and topic_id = 'passage-planning-checklist';
  insert into public.user_progress(user_id, topic_id, completed, score, last_accessed, answers_history)
  values(owner, 'passage-planning-checklist', p_completed, case when p_completed then 100 else 0 end, now(), p_answers_history)
  on conflict(user_id, topic_id) do update set completed=excluded.completed, score=excluded.score, last_accessed=excluded.last_accessed, answers_history=excluded.answers_history;
  if p_completed and not coalesce(was_completed, false) then
    insert into public.progress_awards(user_id, topic_id, points) values(owner, 'passage-planning-checklist', 10)
    on conflict(user_id, topic_id) do nothing returning true into awarded;
    if coalesce(awarded, false) then update public.profiles set points=coalesce(points,0)+10 where user_id=owner; end if;
  end if;
  return query select coalesce(awarded,false), p_completed and not coalesce(was_completed,false), case when coalesce(awarded,false) then 10 else 0 end;
end; $$;

revoke all on function public.save_readiness_record_progress(boolean,jsonb) from public;
revoke all on function public.save_readiness_record_progress(boolean,jsonb) from anon;
grant execute on function public.save_readiness_record_progress(boolean,jsonb) to authenticated;
