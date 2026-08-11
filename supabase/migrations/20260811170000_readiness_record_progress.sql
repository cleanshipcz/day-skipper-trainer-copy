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
  -- ECMAScript String.prototype.trim whitespace and line terminators, kept in
  -- sync with the client completion gate (ASCII controls, Unicode spaces,
  -- NBSP and BOM). btrim treats this as a set of trim characters.
  whitespace_chars constant text := E' \t\n\r\f' || chr(11)
    || chr(160) || chr(5760) || chr(8192) || chr(8193) || chr(8194)
    || chr(8195) || chr(8196) || chr(8197) || chr(8198) || chr(8199)
    || chr(8200) || chr(8201) || chr(8202) || chr(8232) || chr(8233)
    || chr(8239) || chr(8287) || chr(12288) || chr(65279);
  resolved_count integer;
  was_completed boolean := false;
  awarded boolean := false;
  item record;
  history_item record;
begin
  if owner is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if p_completed is null
     or jsonb_typeof(p_answers_history) is distinct from 'object'
     or not (p_answers_history ? 'readinessRecord')
     or jsonb_typeof(v_record) is distinct from 'object'
     or not (v_record ?& array['version','context','entries','updatedAt'])
     or v_record->>'version' is distinct from '1'
     or jsonb_typeof(v_record->'context') is distinct from 'object'
     or not ((v_record->'context') ?& array['vessel','voyage','conditions'])
     or jsonb_typeof(v_record->'entries') is distinct from 'object'
     or jsonb_typeof(v_record->'updatedAt') is distinct from 'string'
     or jsonb_typeof(v_record->'context'->'vessel') is distinct from 'string'
     or jsonb_typeof(v_record->'context'->'voyage') is distinct from 'string'
     or jsonb_typeof(v_record->'context'->'conditions') is distinct from 'string'
     or pg_column_size(p_answers_history) > 65536 then
    raise exception 'Invalid readiness record' using errcode = '22023';
  end if;
  -- Cast after the type guard so malformed timestamps fail rather than being
  -- accepted as opaque strings.
  perform (v_record->>'updatedAt')::timestamptz;
  entries := v_record->'entries';
  for item in select * from jsonb_each(entries) loop
    if not (item.key = any(allowed_ids))
       or jsonb_typeof(item.value) is distinct from 'object'
       or not (item.value ?& array['status','reason','notes','evidence','responsiblePerson','history'])
       or jsonb_typeof(item.value->'status') is distinct from 'string'
       or item.value->>'status' not in ('not_checked','satisfactory','not_applicable','defect','blocked','unknown')
       or jsonb_typeof(item.value->'reason') is distinct from 'string'
       or jsonb_typeof(item.value->'notes') is distinct from 'string'
       or jsonb_typeof(item.value->'evidence') is distinct from 'string'
       or jsonb_typeof(item.value->'responsiblePerson') is distinct from 'string'
       or jsonb_typeof(item.value->'history') is distinct from 'array'
       or (item.value->>'status' = 'not_applicable' and (not (item.key = any(na_ids)) or btrim(item.value->>'reason', whitespace_chars) = ''))
       or (item.value->>'status' <> 'not_checked' and jsonb_typeof(item.value->'recordedAt') is distinct from 'string')
       or (item.value->>'status' = 'not_checked' and item.value ? 'recordedAt') then
      raise exception 'Invalid readiness entry' using errcode = '22023';
    end if;
    if item.value->>'status' <> 'not_checked' then perform (item.value->>'recordedAt')::timestamptz; end if;
    for history_item in select * from jsonb_array_elements(item.value->'history') loop
      if jsonb_typeof(history_item.value) is distinct from 'object'
         or not (history_item.value ?& array['status','reason','notes','evidence','responsiblePerson','supersededAt'])
         or jsonb_typeof(history_item.value->'status') is distinct from 'string'
         or history_item.value->>'status' not in ('satisfactory','not_applicable','defect','blocked','unknown')
         or jsonb_typeof(history_item.value->'reason') is distinct from 'string'
         or jsonb_typeof(history_item.value->'notes') is distinct from 'string'
         or jsonb_typeof(history_item.value->'evidence') is distinct from 'string'
         or jsonb_typeof(history_item.value->'responsiblePerson') is distinct from 'string'
         or jsonb_typeof(history_item.value->'recordedAt') is distinct from 'string'
         or jsonb_typeof(history_item.value->'supersededAt') is distinct from 'string' then
        raise exception 'Invalid readiness history' using errcode = '22023';
      end if;
      perform (history_item.value->>'recordedAt')::timestamptz;
      perform (history_item.value->>'supersededAt')::timestamptz;
    end loop;
  end loop;
  select count(*) into resolved_count from unnest(allowed_ids) id
   where entries->id->>'status' = 'satisfactory'
      or (id = any(na_ids) and entries->id->>'status' = 'not_applicable' and btrim(entries->id->>'reason', whitespace_chars) <> '');
  if p_completed and (
       resolved_count <> cardinality(allowed_ids)
       or btrim(v_record->'context'->>'vessel', whitespace_chars) = ''
       or btrim(v_record->'context'->>'voyage', whitespace_chars) = ''
       or btrim(v_record->'context'->>'conditions', whitespace_chars) = ''
     ) then
    raise exception 'Readiness completion does not match evidence and context' using errcode = '22023';
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
