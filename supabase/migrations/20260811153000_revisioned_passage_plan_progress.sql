create or replace function public.save_passage_plan_progress(
  p_completed boolean,
  p_score integer,
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
  v_completion_awarded boolean := false;
  v_points_awarded boolean := false;
begin
  if v_user_id is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if p_score is null or p_score < 0 or p_score > 100 then raise exception 'Score must be between 0 and 100' using errcode='22023'; end if;
  if jsonb_typeof(p_answers_history) <> 'object' or pg_column_size(p_answers_history) > 65536
     or jsonb_typeof(v_incoming) <> 'object'
     or v_incoming ->> 'ownerId' <> v_user_id::text
     or jsonb_typeof(v_incoming -> 'revision') <> 'number'
     or (v_incoming ->> 'revision')::numeric < 0
     or jsonb_typeof(v_incoming -> 'updatedAt') <> 'string'
     or jsonb_typeof(v_incoming -> 'lineage') <> 'array'
     or jsonb_typeof(v_incoming -> 'plan') <> 'object' then
    raise exception 'Invalid passage plan snapshot' using errcode='22023';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text || ':' || v_topic_id, 0));
  select up.answers_history -> 'passagePlanRecord', coalesce(up.completed,false)
    into v_existing, v_existing_completed
    from public.user_progress up where up.user_id=v_user_id and up.topic_id=v_topic_id;

  if v_existing is not null and v_existing ->> 'updatedAt' is not null
     and v_existing ->> 'updatedAt' <> v_incoming ->> 'updatedAt'
     and not (v_incoming -> 'lineage' ? (v_existing ->> 'updatedAt')) then
    raise exception 'Passage plan revision conflict' using errcode='40001';
  end if;
  if v_existing is not null and v_existing ->> 'updatedAt' = v_incoming ->> 'updatedAt'
     and v_existing -> 'plan' is distinct from v_incoming -> 'plan' then
    raise exception 'Passage plan revision conflict' using errcode='40001';
  end if;

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

revoke all on function public.save_passage_plan_progress(boolean,integer,jsonb) from public,anon;
grant execute on function public.save_passage_plan_progress(boolean,integer,jsonb) to authenticated;
comment on function public.save_passage_plan_progress(boolean,integer,jsonb)
is 'CAS persistence for owner-bound revisioned passage plans; material drafts stale prior completion and first completion awards 15 server-owned points idempotently.';
