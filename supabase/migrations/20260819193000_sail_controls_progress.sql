-- Isolate Sail Controls persistence from the broad progress endpoint. Both
-- functions derive ownership from auth.uid() and expose only this topic row.
create or replace function public.load_sail_controls_progress()
returns setof public.user_progress
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select up.*
  from public.user_progress up
  where auth.uid() is not null
    and up.user_id = auth.uid()
    and up.topic_id = 'nautical-terms-sail-controls'
  limit 1
$$;

create or replace function public.save_sail_controls_progress(
  p_completed boolean,
  p_score integer,
  p_answers_history jsonb
)
returns table(points_awarded boolean, completion_awarded boolean, awarded_points integer)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  owner uuid := auth.uid();
  was_completed boolean := false;
begin
  if owner is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if p_completed is null or p_score is null or p_score < 0 or p_score > 100 then
    raise exception 'Invalid Sail Controls result' using errcode = '22023';
  end if;
  if jsonb_typeof(p_answers_history) is distinct from 'object'
     or p_answers_history ->> 'module' is distinct from 'sail-controls'
     or p_answers_history ->> 'version' is distinct from '1'
     or jsonb_typeof(p_answers_history -> 'score') is distinct from 'number'
     or (p_answers_history ->> 'score')::numeric < 0
     or (p_answers_history ->> 'score')::numeric > 120
     or pg_column_size(p_answers_history) > 4096 then
    raise exception 'Invalid Sail Controls evidence' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(owner::text || ':nautical-terms-sail-controls', 0)
  );
  select coalesce(up.completed, false) into was_completed
  from public.user_progress up
  where up.user_id = owner and up.topic_id = 'nautical-terms-sail-controls';

  insert into public.user_progress (
    user_id, topic_id, completed, score, last_accessed, answers_history
  ) values (
    owner, 'nautical-terms-sail-controls', p_completed, p_score, now(), p_answers_history
  )
  on conflict (user_id, topic_id) do update
  set completed = public.user_progress.completed or excluded.completed,
      score = case when public.user_progress.completed
        then public.user_progress.score else excluded.score end,
      last_accessed = excluded.last_accessed,
      answers_history = case when public.user_progress.completed
        then public.user_progress.answers_history else excluded.answers_history end;

  return query select false, p_completed and not coalesce(was_completed, false), 0;
end;
$$;

revoke all on function public.load_sail_controls_progress() from public, anon;
grant execute on function public.load_sail_controls_progress() to authenticated;
revoke all on function public.save_sail_controls_progress(boolean, integer, jsonb) from public, anon;
grant execute on function public.save_sail_controls_progress(boolean, integer, jsonb) to authenticated;

comment on function public.load_sail_controls_progress()
is 'Returns only auth.uid() Sail Controls progress.';
comment on function public.save_sail_controls_progress(boolean, integer, jsonb)
is 'Persists auth.uid() Sail Controls completion without accepting ownership or point awards.';
