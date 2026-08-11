-- Retire direct v1 writes while retaining the proven entry validator as an
-- internal implementation detail for the v2 wrapper below.
revoke execute on function public.save_readiness_record_progress(boolean,jsonb) from authenticated;

create function public.expire_readiness_record_progress()
returns boolean language plpgsql security definer set search_path = '' as $$
declare owner uuid := auth.uid(); cleaned_count integer := 0;
begin
  if owner is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  update public.user_progress set completed=false, score=0, answers_history = null, last_accessed=now()
   where user_id=owner and topic_id='passage-planning-checklist'
     and answers_history->'readinessRecord'->>'expiresAt' is not null
     and (answers_history->'readinessRecord'->>'expiresAt')::timestamptz <= now();
  get diagnostics cleaned_count = row_count;
  return cleaned_count > 0;
end; $$;

-- Deployment schedulers call this as service_role. It is deliberately not
-- executable by learners and sweeps every owner independently of page visits.
create function public.expire_all_readiness_record_progress()
returns integer language plpgsql security definer set search_path = '' as $$
declare cleaned_count integer := 0;
begin
  update public.user_progress set completed=false, score=0, answers_history = null, last_accessed=now()
   where topic_id='passage-planning-checklist'
     and answers_history->'readinessRecord'->>'expiresAt' is not null
     and (answers_history->'readinessRecord'->>'expiresAt')::timestamptz <= now();
  get diagnostics cleaned_count = row_count;
  return cleaned_count;
end; $$;

create function public.quarantine_readiness_record_progress()
returns boolean language plpgsql security definer set search_path = '' as $$
declare owner uuid := auth.uid(); cleaned_count integer := 0;
begin
  if owner is null then raise exception 'Authentication required' using errcode='42501'; end if;
  update public.user_progress set completed=false, score=0, answers_history=null, last_accessed=now()
   where user_id=owner and topic_id='passage-planning-checklist';
  get diagnostics cleaned_count = row_count;
  return cleaned_count > 0;
end; $$;

create function public.save_readiness_record_progress_v2(p_completed boolean,p_answers_history jsonb)
returns table(points_awarded boolean,completion_awarded boolean,awarded_points integer)
language plpgsql security definer set search_path = '' as $$
declare
  owner uuid := auth.uid();
  v_record jsonb := p_answers_history->'readinessRecord';
  v_legacy jsonb;
begin
  if owner is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if p_completed is null or jsonb_typeof(p_answers_history) is distinct from 'object'
     or jsonb_typeof(v_record) is distinct from 'object'
     or not (v_record ?& array['version','sessionId','catalogueFingerprint','context','entries','createdAt','updatedAt','expiresAt'])
     or v_record->>'version' is distinct from '2'
     or jsonb_typeof(v_record->'sessionId') is distinct from 'string' or btrim(v_record->>'sessionId')=''
     or jsonb_typeof(v_record->'catalogueFingerprint') is distinct from 'string' or btrim(v_record->>'catalogueFingerprint')=''
     or jsonb_typeof(v_record->'createdAt') is distinct from 'string'
     or jsonb_typeof(v_record->'updatedAt') is distinct from 'string'
     or jsonb_typeof(v_record->'expiresAt') is distinct from 'string'
     or (v_record ? 'completedAt' and jsonb_typeof(v_record->'completedAt') is distinct from 'string')
     or p_completed is distinct from (v_record ? 'completedAt')
     or pg_column_size(p_answers_history)>65536 then raise exception 'Invalid versioned readiness record' using errcode='22023';
  end if;
  perform (v_record->>'createdAt')::timestamptz;
  perform (v_record->>'updatedAt')::timestamptz;
  perform (v_record->>'expiresAt')::timestamptz;
  if v_record ? 'completedAt' then perform (v_record->>'completedAt')::timestamptz; end if;
  if (v_record->>'createdAt')::timestamptz > (v_record->>'updatedAt')::timestamptz
     or (v_record->>'updatedAt')::timestamptz > now() + interval '5 minutes'
     or (v_record->>'expiresAt')::timestamptz <= now()
     or (v_record ? 'completedAt' and ((v_record->>'completedAt')::timestamptz < (v_record->>'createdAt')::timestamptz
       or (v_record->>'completedAt')::timestamptz > (v_record->>'updatedAt')::timestamptz)) then
    raise exception 'Invalid readiness timestamp ordering' using errcode='22023';
  end if;
  perform public.expire_readiness_record_progress();
  v_legacy := jsonb_set(jsonb_set(p_answers_history,'{readinessRecord,version}','1'::jsonb),'{readinessRecord,expiresAt}','null'::jsonb) #- '{readinessRecord,expiresAt}';
  return query select * from public.save_readiness_record_progress(p_completed,v_legacy);
  v_record := jsonb_set(v_record,'{expiresAt}',to_jsonb((now() + interval '30 days')::text));
  update public.user_progress set answers_history=jsonb_set(p_answers_history,'{readinessRecord}',v_record)
   where user_id=owner and topic_id='passage-planning-checklist';
end; $$;

revoke all on function public.expire_readiness_record_progress() from public;
revoke all on function public.expire_readiness_record_progress() from anon;
grant execute on function public.expire_readiness_record_progress() to authenticated;
revoke all on function public.expire_all_readiness_record_progress() from public;
revoke all on function public.expire_all_readiness_record_progress() from anon;
revoke all on function public.expire_all_readiness_record_progress() from authenticated;
grant execute on function public.expire_all_readiness_record_progress() to service_role;
revoke all on function public.quarantine_readiness_record_progress() from public;
revoke all on function public.quarantine_readiness_record_progress() from anon;
grant execute on function public.quarantine_readiness_record_progress() to authenticated;
revoke all on function public.save_readiness_record_progress_v2(boolean,jsonb) from public;
revoke all on function public.save_readiness_record_progress_v2(boolean,jsonb) from anon;
grant execute on function public.save_readiness_record_progress_v2(boolean,jsonb) to authenticated;
