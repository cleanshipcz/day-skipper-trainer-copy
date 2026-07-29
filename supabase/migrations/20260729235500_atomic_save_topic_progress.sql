create table if not exists public.progress_awards (
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id text not null,
  points integer not null check (points > 0),
  awarded_at timestamptz not null default now(),
  primary key (user_id, topic_id)
);

alter table public.progress_awards enable row level security;
revoke all on public.progress_awards from public, anon, authenticated;
grant select on public.progress_awards to authenticated;
create policy "Users can view their own progress awards"
  on public.progress_awards for select
  to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.save_topic_progress(
  p_topic_id text,
  p_completed boolean default false,
  p_score integer default 0,
  p_points integer default 0,
  p_answers_history jsonb default null
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
  v_reward integer := 0;
  v_awarded_points integer := 0;
  v_quiz_questions integer;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if p_topic_id is null or btrim(p_topic_id) = '' then
    raise exception 'Topic ID is required' using errcode = '22023';
  end if;
  -- Reward-bearing identities and amounts are server-owned. p_points remains
  -- in the signature for backwards compatibility but is never trusted.
  v_quiz_questions := case p_topic_id
    when 'quiz-nautical-terms-quiz' then 20
    when 'quiz-ropework' then 12
    when 'quiz-anchorwork' then 12
    when 'quiz-victualling' then 12
    when 'quiz-engine' then 12
    when 'quiz-rig' then 12
    when 'quiz-colregs' then 20
    when 'quiz-lights-signals' then 20
    when 'quiz-safety-mob-quiz' then 12
    when 'quiz-safety-fire-quiz' then 8
    when 'quiz-safety-life-raft-quiz' then 10
    when 'quiz-safety-flares-quiz' then 10
    when 'quiz-safety' then 20
    when 'quiz-pilotage' then 20
    when 'quiz-weather' then 20
    else null
  end;

  v_reward := case p_topic_id
    when 'pilotage-plan' then 15
    when 'nautical-terms-boat-parts' then 10
    when 'nautical-terms-sail-controls' then 10
    when 'safety-mob' then 10
    when 'safety-fire' then 10
    when 'safety-fire-drill' then 10
    when 'safety-life-raft' then 10
    when 'safety-flares' then 10
    when 'safety-flares-drill' then 10
    when 'safety-personal' then 10
    when 'safety-gas' then 10
    when 'colregs-theory' then 10
    when 'lights-theory' then 10
    when 'charts-theory' then 10
    when 'compass-theory' then 10
    when 'tides' then 10
    when 'tides-theory' then 10
    when 'tides-streams-theory' then 10
    when 'tides-heights-theory' then 10
    when 'tides-vector-tool' then 10
    when 'tidal-heights-calc' then 10
    when 'position-theory' then 10
    when 'vector-triangle' then 10
    when 'pilotage-buoyage' then 10
    when 'pilotage-transits' then 10
    when 'pilotage-clearing-bearings' then 10
    when 'weather-systems' then 10
    when 'weather-beaufort' then 10
    when 'weather-forecasts' then 10
    when 'weather-fog' then 10
    else case
      when v_quiz_questions is not null and p_score between 70 and 100
        then round((p_score::numeric * v_quiz_questions) / 100) * 20
      when v_quiz_questions is not null then 0
      else null
    end
  end;
  if v_reward is null then
    raise exception 'Unknown progress topic' using errcode = '22023';
  end if;

  -- Serialize attempts for one user/topic, including two concurrent first inserts.
  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text || ':' || p_topic_id, 0));

  select coalesce(up.completed, false)
    into v_was_completed
    from public.user_progress up
   where up.user_id = v_user_id and up.topic_id = p_topic_id;

  v_completion_awarded := coalesce(p_completed, false) and not coalesce(v_was_completed, false);

  insert into public.user_progress (
    user_id, topic_id, completed, score, last_accessed, answers_history
  )
  values (
    v_user_id,
    p_topic_id,
    coalesce(p_completed, false),
    coalesce(p_score, 0),
    now(),
    p_answers_history
  )
  on conflict (user_id, topic_id) do update
    set completed = public.user_progress.completed or excluded.completed,
        score = excluded.score,
        last_accessed = excluded.last_accessed,
        answers_history = coalesce(excluded.answers_history, public.user_progress.answers_history);

  if v_completion_awarded and v_reward > 0 then
    insert into public.progress_awards (user_id, topic_id, points)
    values (v_user_id, p_topic_id, v_reward)
    on conflict (user_id, topic_id) do nothing;

    if found then
      v_awarded_points := v_reward;
    end if;

    update public.profiles
       set points = coalesce(points, 0) + v_awarded_points
     where user_id = v_user_id
       and v_awarded_points > 0;
    if v_awarded_points > 0 and not found then
      raise exception 'Profile not found' using errcode = 'P0002';
    end if;
  end if;

  return query select
    (v_awarded_points > 0),
    v_completion_awarded,
    v_awarded_points;
end;
$$;

revoke all on function public.save_topic_progress(text, boolean, integer, integer, jsonb) from public;
revoke all on function public.save_topic_progress(text, boolean, integer, integer, jsonb) from anon;
grant execute on function public.save_topic_progress(text, boolean, integer, integer, jsonb) to authenticated;

comment on function public.save_topic_progress(text, boolean, integer, integer, jsonb)
is 'Persists allowlisted auth.uid() progress and awards server-derived points once via an immutable ledger.';

-- Retire the legacy RPC that accepted an arbitrary user ID. All point awards
-- now flow through save_topic_progress and are bound to auth.uid().
revoke all on function public.increment_user_points(uuid, integer) from public;
revoke all on function public.increment_user_points(uuid, integer) from anon;
revoke all on function public.increment_user_points(uuid, integer) from authenticated;
