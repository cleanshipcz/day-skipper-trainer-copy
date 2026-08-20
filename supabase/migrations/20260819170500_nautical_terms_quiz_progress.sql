-- Keep the nautical terms quiz writable even when the broad progress RPC is
-- absent from PostgREST's schema cache. This narrow RPC owns only the canonical
-- quiz row and derives ownership exclusively from the authenticated session.
create or replace function public.save_nautical_terms_quiz_progress(
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
    raise exception 'Invalid nautical terms quiz result' using errcode = '22023';
  end if;
  if jsonb_typeof(p_answers_history) is distinct from 'object'
     or pg_column_size(p_answers_history) > 65536 then
    raise exception 'Invalid answers history' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(owner::text || ':quiz-nautical-terms-quiz', 0)
  );
  select coalesce(up.completed, false) into was_completed
  from public.user_progress up
  where up.user_id = owner and up.topic_id = 'quiz-nautical-terms-quiz';

  insert into public.user_progress (
    user_id, topic_id, completed, score, last_accessed, answers_history
  ) values (
    owner, 'quiz-nautical-terms-quiz', p_completed, p_score, now(), p_answers_history
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

revoke all on function public.save_nautical_terms_quiz_progress(boolean, integer, jsonb)
  from public, anon;
grant execute on function public.save_nautical_terms_quiz_progress(boolean, integer, jsonb)
  to authenticated;

comment on function public.save_nautical_terms_quiz_progress(boolean, integer, jsonb)
is 'Persists auth.uid() nautical terms quiz progress without exposing user-selected ownership or point awards.';
