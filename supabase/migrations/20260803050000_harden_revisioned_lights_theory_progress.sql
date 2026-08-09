do $migration$
declare
  v_definition text;
  v_updated text;
begin
  select pg_get_functiondef('public.save_topic_progress(text,boolean,integer,integer,jsonb)'::regprocedure)
    into v_definition;
  v_updated := replace(
    replace(v_definition,
      $$'colregs-theory', 'lights-theory', 'charts-theory'$$,
      $$'colregs-theory', 'charts-theory'$$),
    $$when 'lights-theory' then 10$$,
    $$$$
  );
  if v_updated = v_definition
     or position($$'lights-theory'$$ in v_updated) > 0 then
    raise exception 'Unable to remove lights-theory from generic progress RPC';
  end if;
  execute v_updated;
end;
$migration$;

revoke all on function public.save_topic_progress(text, boolean, integer, integer, jsonb) from public, anon;
grant execute on function public.save_topic_progress(text, boolean, integer, integer, jsonb) to authenticated;

create or replace function public.save_lights_theory_progress(
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
  v_was_completed boolean := false;
  v_completion_awarded boolean := false;
  v_points_awarded boolean := false;
  v_existing_history jsonb;
  v_visited jsonb;
  v_evidence_count integer;
  v_distinct_evidence_count integer;
  v_all_evidence_known boolean;
  v_expected_score integer;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if p_completed is null or p_score is null or p_answers_history is null then
    raise exception 'Lights theory fields are required' using errcode = '22023';
  end if;
  if jsonb_typeof(p_answers_history) <> 'object'
     or pg_column_size(p_answers_history) > 4096
     or p_answers_history ->> 'catalogueRevision' is distinct from 'colregs-parts-c-d-annex-iv-v1'
     or p_answers_history ->> 'completionState' is distinct from (case when p_completed then 'completed' else 'in_progress' end)
     or jsonb_typeof(p_answers_history -> 'visitedSectionIds') is distinct from 'array' then
    raise exception 'Invalid lights theory evidence' using errcode = '22023';
  end if;

  v_visited := p_answers_history -> 'visitedSectionIds';
  select count(*)::integer,
         count(distinct evidence_id)::integer,
         coalesce(bool_and(evidence_id = any(array['part-c-recognition', 'part-d-recognition', 'distress-recognition']::text[])), true),
         round(count(*) * 100.0 / 3)::integer
    into v_evidence_count, v_distinct_evidence_count, v_all_evidence_known, v_expected_score
    from jsonb_array_elements_text(v_visited) as submitted_evidence(evidence_id);
  if v_evidence_count > 3
     or not v_all_evidence_known
     or v_evidence_count <> v_distinct_evidence_count
     or p_completed is distinct from (v_evidence_count = 3)
     or p_score is distinct from v_expected_score then
    raise exception 'Invalid lights theory evidence catalogue or score' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text || ':lights-theory', 0));
  select coalesce(up.completed, false), up.answers_history into v_was_completed, v_existing_history
    from public.user_progress up
   where up.user_id = v_user_id and up.topic_id = 'lights-theory';

  -- A legacy completed row may collect the current revision. Once canonical
  -- current completion exists, a delayed incomplete queue entry may update
  -- access time but must never replace its full evidence snapshot.
  if v_was_completed then
    update public.user_progress
       set last_accessed = now(),
           answers_history = case
             when p_completed
               or v_existing_history ->> 'catalogueRevision' is distinct from 'colregs-parts-c-d-annex-iv-v1'
               or v_existing_history ->> 'completionState' is distinct from 'completed'
             then p_answers_history else answers_history end
     where user_id = v_user_id and topic_id = 'lights-theory';
    points_awarded := false;
    completion_awarded := false;
    awarded_points := 0;
    return next;
    return;
  end if;

  v_completion_awarded := p_completed;
  insert into public.user_progress (user_id, topic_id, completed, score, last_accessed, answers_history)
  values (v_user_id, 'lights-theory', p_completed, p_score, now(), p_answers_history)
  on conflict (user_id, topic_id) do update
    set completed = excluded.completed,
        score = excluded.score,
        last_accessed = excluded.last_accessed,
        answers_history = excluded.answers_history;

  if v_completion_awarded then
    insert into public.progress_awards (user_id, topic_id, points)
    values (v_user_id, 'lights-theory', 10)
    on conflict (user_id, topic_id) do nothing
    returning true into v_points_awarded;
    if coalesce(v_points_awarded, false) then
      update public.profiles set points = coalesce(points, 0) + 10 where user_id = v_user_id;
    end if;
  end if;

  points_awarded := coalesce(v_points_awarded, false);
  completion_awarded := v_completion_awarded;
  awarded_points := case when points_awarded then 10 else 0 end;
  return next;
  return;
end;
$$;

revoke all on function public.save_lights_theory_progress(boolean, integer, jsonb) from public, anon;
grant execute on function public.save_lights_theory_progress(boolean, integer, jsonb) to authenticated;
