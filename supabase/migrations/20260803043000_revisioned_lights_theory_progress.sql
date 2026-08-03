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
  v_visited jsonb;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if p_score is null or p_score < 0 or p_score > 100 then
    raise exception 'Score must be between 0 and 100' using errcode = '22023';
  end if;
  if jsonb_typeof(p_answers_history) <> 'object'
     or pg_column_size(p_answers_history) > 4096
     or p_answers_history ->> 'catalogueRevision' <> 'colregs-parts-c-d-annex-iv-v1'
     or p_answers_history ->> 'completionState' <> case when p_completed then 'completed' else 'in_progress' end
     or jsonb_typeof(p_answers_history -> 'visitedSectionIds') <> 'array' then
    raise exception 'Invalid lights theory evidence' using errcode = '22023';
  end if;

  v_visited := p_answers_history -> 'visitedSectionIds';
  if jsonb_array_length(v_visited) > 3
     or exists (
       select 1 from jsonb_array_elements_text(v_visited) as evidence(id)
       where evidence.id <> all(array['part-c-recognition', 'part-d-recognition', 'distress-recognition']::text[])
     )
     or (select count(*) from jsonb_array_elements_text(v_visited))
        <> (select count(distinct evidence.id) from jsonb_array_elements_text(v_visited) as evidence(id))
     or p_completed <> (
       select count(distinct evidence.id) = 3
       from jsonb_array_elements_text(v_visited) as evidence(id)
     ) then
    raise exception 'Invalid lights theory evidence catalogue' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text || ':lights-theory', 0));
  select coalesce(up.completed, false) into v_was_completed
    from public.user_progress up
   where up.user_id = v_user_id and up.topic_id = 'lights-theory';

  if v_was_completed then
    update public.user_progress
       set last_accessed = now(), answers_history = p_answers_history
     where user_id = v_user_id and topic_id = 'lights-theory';
    return query select false, false, 0;
    return;
  end if;

  return query
    select result.points_awarded, result.completion_awarded, result.awarded_points
      from public.save_topic_progress('lights-theory', p_completed, p_score, 0, p_answers_history) result;
end;
$$;

revoke all on function public.save_lights_theory_progress(boolean, integer, jsonb) from public, anon;
grant execute on function public.save_lights_theory_progress(boolean, integer, jsonb) to authenticated;

comment on function public.save_lights_theory_progress(boolean, integer, jsonb)
is 'Validates revisioned Lights theory evidence, refreshes legacy completed rows without another award, and derives ownership from auth.uid().';
