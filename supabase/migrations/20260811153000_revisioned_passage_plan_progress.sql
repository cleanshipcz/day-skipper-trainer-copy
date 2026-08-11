create or replace function public.save_passage_plan_progress(
  p_completed boolean,
  p_score integer,
  p_expected_updated_at text,
  p_answers_history jsonb
)
returns table(points_awarded boolean, completion_awarded boolean, awarded_points integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_topic_id constant text := 'passage-planning-builder';
  v_incoming jsonb := p_answers_history -> 'passagePlanRecord';
  v_existing jsonb;
  v_existing_completed boolean := false;
  v_existing_revision integer;
  v_completion_awarded boolean := false;
  v_points_awarded boolean := false;
begin
  if v_user_id is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if p_score is null or p_score not in (0,100) then raise exception 'Passage plan score must be 0 or 100' using errcode='22023'; end if;
  if jsonb_typeof(p_answers_history) <> 'object' or pg_column_size(p_answers_history) > 65536
     or jsonb_typeof(v_incoming) <> 'object'
     or v_incoming ->> 'ownerId' <> v_user_id::text
     or jsonb_typeof(v_incoming -> 'revision') <> 'number'
     or (v_incoming ->> 'revision')::numeric < 1
     or (v_incoming ->> 'revision')::numeric <> trunc((v_incoming ->> 'revision')::numeric)
     or jsonb_typeof(v_incoming -> 'updatedAt') <> 'string'
     or jsonb_typeof(v_incoming -> 'lineage') <> 'array'
     or jsonb_array_length(v_incoming -> 'lineage') > 256
     or exists(select 1 from jsonb_array_elements(v_incoming -> 'lineage') item where jsonb_typeof(item) <> 'string')
     or jsonb_typeof(v_incoming -> 'plan') <> 'object'
     or v_incoming -> 'plan' ->> 'version' <> '3'
     or jsonb_typeof(v_incoming -> 'plan' -> 'name') <> 'string'
     or length(btrim(v_incoming -> 'plan' ->> 'name')) > 200
     or jsonb_typeof(v_incoming -> 'plan' -> 'points') <> 'array'
     or jsonb_array_length(v_incoming -> 'plan' -> 'points') > 100
     or jsonb_typeof(v_incoming -> 'plan' -> 'safety') <> 'object'
     or jsonb_typeof(v_incoming -> 'plan' -> 'provenance') <> 'object' then
    raise exception 'Invalid passage plan snapshot' using errcode='22023';
  end if;
  perform (v_incoming ->> 'updatedAt')::timestamptz;
  if (v_incoming ->> 'updatedAt')::timestamptz > now()+interval '5 minutes'
     or exists(select 1 from jsonb_array_elements(v_incoming -> 'lineage') item where (item#>>'{}')::timestamptz is null) then
    raise exception 'Invalid passage plan timestamps' using errcode='22023';
  end if;
  if p_completed <> coalesce(((v_incoming ->> 'completionStatus')='confirmed'
       and (v_incoming ->> 'completedRevision')::numeric=(v_incoming ->> 'revision')::numeric),false)
     or p_score <> case when p_completed then 100 else 0 end
     or (not p_completed and ((v_incoming ->> 'completionStatus')<>'draft' or v_incoming -> 'completedRevision' <> 'null'::jsonb)) then
    raise exception 'Inconsistent passage plan completion metadata' using errcode='22023';
  end if;
  if p_completed and (
    jsonb_array_length(v_incoming -> 'plan' -> 'points') < 2
    or length(btrim(v_incoming -> 'plan' ->> 'name'))=0
    or coalesce((v_incoming -> 'plan' ->> 'speed')::numeric,0)<=0
    or (v_incoming -> 'plan' ->> 'speed')::numeric>80
    or (v_incoming -> 'plan' ->> 'departure')::timestamptz < now()-interval '24 hours'
    or (v_incoming -> 'plan' ->> 'departure')::timestamptz > now()+interval '366 days'
    or exists(select 1 from (values('departureBerth'),('destinationBerth'),('limits'),('abortDecision'),('alternatives'),('manualVerification')) required(key)
      where length(btrim(coalesce(v_incoming -> 'plan' -> 'safety' ->> required.key,'')))=0)
    or exists(select 1 from (values('weather'),('tide'),('chart'),('publications'),('preparedAt'),('revisedAt')) required(key)
      where length(btrim(coalesce(v_incoming -> 'plan' -> 'provenance' ->> required.key,'')))=0)
    or exists(select 1 from jsonb_array_elements(v_incoming -> 'plan' -> 'points') point
      where jsonb_typeof(point)<>'object' or length(btrim(coalesce(point->>'id','')))=0
        or length(btrim(coalesce(point->>'name','')))=0 or length(btrim(coalesce(point->>'latitude','')))=0
        or length(btrim(coalesce(point->>'longitude','')))=0)
    or exists(select 1 from jsonb_array_elements(v_incoming -> 'plan' -> 'points') with ordinality point(value,position)
      where (position=1 and value->'inboundLeg' is distinct from 'null'::jsonb)
        or (position>1 and (jsonb_typeof(value->'inboundLeg')<>'object'
          or jsonb_typeof(value->'inboundLeg'->'course')<>'number'
          or (value->'inboundLeg'->>'course')::numeric<0 or (value->'inboundLeg'->>'course')::numeric>360
          or jsonb_typeof(value->'inboundLeg'->'distanceNm')<>'number'
          or (value->'inboundLeg'->>'distanceNm')::numeric<=0))
    or coalesce(v_incoming -> 'plan' -> 'provenance' ->> 'weather','') !~* 'issue.*valid'
    or (v_incoming -> 'plan' -> 'provenance' ->> 'preparedAt')::timestamptz > now()
    or (v_incoming -> 'plan' -> 'provenance' ->> 'preparedAt')::timestamptz < now()-interval '30 days'
    or (v_incoming -> 'plan' -> 'provenance' ->> 'revisedAt')::timestamptz > now()
    or (v_incoming -> 'plan' -> 'provenance' ->> 'revisedAt')::timestamptz < (v_incoming -> 'plan' -> 'provenance' ->> 'preparedAt')::timestamptz
  ) then raise exception 'Incomplete passage plan cannot be confirmed' using errcode='22023'; end if;

  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text || ':' || v_topic_id, 0));
  select up.answers_history -> 'passagePlanRecord', coalesce(up.completed,false),
         (up.answers_history -> 'passagePlanRecord' ->> 'revision')::integer
    into v_existing, v_existing_completed, v_existing_revision
    from public.user_progress up where up.user_id=v_user_id and up.topic_id=v_topic_id;

  if v_existing is null and (p_expected_updated_at is not null or (v_incoming->>'revision')::integer<>1) then
    raise exception 'Passage plan revision conflict' using errcode='40001';
  end if;
  if v_existing is not null and p_expected_updated_at is distinct from v_existing->>'updatedAt' then
    raise exception 'Passage plan revision conflict' using errcode='40001';
  end if;
  if v_existing is not null and not (
    ((v_incoming->>'revision')::integer=v_existing_revision and v_incoming->>'updatedAt'=v_existing->>'updatedAt'
      and v_incoming->'plan'=v_existing->'plan' and (p_completed or p_completed=v_existing_completed))
    or ((v_incoming->>'revision')::integer=v_existing_revision+1 and v_incoming->>'updatedAt'<>v_existing->>'updatedAt')
  ) then raise exception 'Passage plan revision conflict' using errcode='40001'; end if;

  v_completion_awarded := coalesce(p_completed,false) and not v_existing_completed;
  insert into public.user_progress(user_id,topic_id,completed,score,last_accessed,answers_history)
  values(v_user_id,v_topic_id,coalesce(p_completed,false),coalesce(p_score,0),now(),p_answers_history)
  on conflict(user_id,topic_id) do update set
    completed=excluded.completed,
    score=excluded.score,
    last_accessed=excluded.last_accessed,
    answers_history=excluded.answers_history;

  if v_completion_awarded then
    insert into public.progress_awards(user_id,topic_id,points)
    values(v_user_id,v_topic_id,15)
    on conflict(user_id,topic_id) do nothing
    returning true into v_points_awarded;
    if coalesce(v_points_awarded,false) then
      update public.profiles set points=coalesce(points,0)+15 where user_id=v_user_id;
    end if;
  end if;

  return query select coalesce(v_points_awarded,false),v_completion_awarded,
    case when coalesce(v_points_awarded,false) then 15 else 0 end;
end;
$$;

revoke all on function public.save_passage_plan_progress(boolean,integer,text,jsonb) from public,anon;
grant execute on function public.save_passage_plan_progress(boolean,integer,text,jsonb) to authenticated;
comment on function public.save_passage_plan_progress(boolean,integer,text,jsonb)
is 'CAS persistence for owner-bound revisioned passage plans; material drafts stale prior completion and first completion awards 15 server-owned points idempotently.';
