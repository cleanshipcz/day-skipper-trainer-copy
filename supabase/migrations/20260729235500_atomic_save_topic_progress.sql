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

-- Mark every legacy completion before installing the new write contract. The
-- marker intentionally records zero because historical profile point awards
-- cannot be reconstructed safely. Its immutable identity prevents a reset
-- from making that topic look newly rewardable in a future verified flow.
alter table public.progress_awards drop constraint if exists progress_awards_points_check;
alter table public.progress_awards add constraint progress_awards_points_check check (points >= 0);
insert into public.progress_awards (user_id, topic_id, points)
select up.user_id, up.topic_id, 0
from public.user_progress up
where up.completed is true
on conflict (user_id, topic_id) do nothing;

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
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if p_topic_id is null or btrim(p_topic_id) = '' then
    raise exception 'Topic ID is required' using errcode = '22023';
  end if;
  if not (p_topic_id = any (array[
    'pilotage-plan', 'nautical-terms-boat-parts', 'nautical-terms-sail-controls',
    'safety-mob', 'safety-fire', 'safety-fire-drill', 'safety-life-raft',
    'safety-flares', 'safety-flares-drill', 'safety-personal', 'safety-gas',
    'colregs-theory', 'lights-theory', 'charts-theory', 'compass-theory',
    'tides', 'tides-theory', 'tides-streams-theory', 'tides-heights-theory',
    'tides-vector-tool', 'tidal-heights-calc', 'position-theory',
    'vector-triangle', 'pilotage-buoyage', 'pilotage-transits',
    'pilotage-clearing-bearings', 'weather-systems', 'weather-beaufort',
    'weather-forecasts', 'weather-fog', 'quiz-nautical-terms-quiz',
    'quiz-ropework', 'quiz-anchorwork', 'quiz-victualling', 'quiz-engine',
    'quiz-rig', 'quiz-colregs', 'quiz-lights-signals', 'quiz-safety-mob-quiz',
    'quiz-safety-fire-quiz', 'quiz-safety-life-raft-quiz',
    'quiz-safety-flares-quiz', 'quiz-safety', 'quiz-pilotage', 'quiz-weather'
  ]::text[])) then
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

  -- p_completed and p_score are self-reported learning progress, not proof of
  -- achievement. Until answers are verified against server-owned quiz data,
  -- this function must never turn those claims (or p_points) into profile points.
  return query select
    false,
    v_completion_awarded,
    0;
end;
$$;

revoke all on function public.save_topic_progress(text, boolean, integer, integer, jsonb) from public;
revoke all on function public.save_topic_progress(text, boolean, integer, integer, jsonb) from anon;
grant execute on function public.save_topic_progress(text, boolean, integer, integer, jsonb) to authenticated;

comment on function public.save_topic_progress(text, boolean, integer, integer, jsonb)
is 'Persists self-reported auth.uid() learning progress without awarding points from unverified client claims.';

-- Retire the legacy RPC that accepted an arbitrary user ID.
revoke all on function public.increment_user_points(uuid, integer) from public;
revoke all on function public.increment_user_points(uuid, integer) from anon;
revoke all on function public.increment_user_points(uuid, integer) from authenticated;
