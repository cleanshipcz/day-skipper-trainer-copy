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

-- Progress writes must pass through save_topic_progress so clients cannot
-- bypass its immutable ledger. Keep reads and the existing reset flow intact.
revoke insert, update on public.user_progress from anon, authenticated;

-- A user may edit their profile, but points are an award-ledger projection and
-- must never be client writable. Replace broad mutation grants with an explicit
-- list of user-owned presentation/preferences columns.
revoke insert, update on public.profiles from anon, authenticated;
grant insert (user_id, username, display_name, avatar_url, learning_preferences, updated_at)
  on public.profiles to authenticated;
grant update (username, display_name, avatar_url, learning_preferences, updated_at)
  on public.profiles to authenticated;

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
  v_award_points integer := 0;
  v_points_awarded boolean := false;
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
  if p_score is null or p_score < 0 or p_score > 100 then
    raise exception 'Score must be between 0 and 100' using errcode = '22023';
  end if;
  if p_answers_history is not null
     and (jsonb_typeof(p_answers_history) <> 'object'
          or pg_column_size(p_answers_history) > 65536) then
    raise exception 'Invalid answers history' using errcode = '22023';
  end if;

  -- Serialize attempts for one user/topic, including two concurrent first inserts.
  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text || ':' || p_topic_id, 0));

  select coalesce(up.completed, false)
    into v_was_completed
    from public.user_progress up
   where up.user_id = v_user_id and up.topic_id = p_topic_id;

  v_completion_awarded := coalesce(p_completed, false) and not coalesce(v_was_completed, false);

  -- Completion is the authenticated user's declaration: browser activity
  -- cannot prove human reading. Points are non-authoritative gamification and
  -- must never be consumed for authorization, economic value, or certification.
  -- Reward values are an application-owned catalogue. p_points remains in the
  -- signature for backwards compatibility, but is deliberately never read.
  -- Variable client-scored quiz/activity rewards are not eligible here.
  v_award_points := case p_topic_id
    when 'pilotage-plan' then 15
    when 'colregs-theory' then 10
    when 'lights-theory' then 10
    when 'charts-theory' then 10
    when 'compass-theory' then 10
    when 'position-theory' then 10
    when 'pilotage-buoyage' then 10
    when 'pilotage-transits' then 10
    when 'pilotage-clearing-bearings' then 10
    when 'safety-mob' then 10
    when 'safety-fire' then 10
    when 'safety-fire-drill' then 10
    when 'safety-life-raft' then 10
    when 'safety-flares' then 10
    when 'safety-flares-drill' then 10
    when 'safety-personal' then 10
    when 'safety-gas' then 10
    when 'weather-systems' then 10
    when 'weather-beaufort' then 10
    when 'weather-forecasts' then 10
    when 'weather-fog' then 10
    else 0
  end;

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
        score = case when public.user_progress.completed
                     then public.user_progress.score else excluded.score end,
        last_accessed = excluded.last_accessed,
        answers_history = case when public.user_progress.completed
                               then public.user_progress.answers_history
                               else coalesce(excluded.answers_history, public.user_progress.answers_history) end;

  if v_completion_awarded and v_award_points > 0 then
    insert into public.progress_awards (user_id, topic_id, points)
    values (v_user_id, p_topic_id, v_award_points)
    on conflict (user_id, topic_id) do nothing
    returning true into v_points_awarded;

    if coalesce(v_points_awarded, false) then
      update public.profiles
         set points = coalesce(points, 0) + v_award_points
       where user_id = v_user_id;
    end if;
  end if;

  return query select
    coalesce(v_points_awarded, false),
    v_completion_awarded,
    case when coalesce(v_points_awarded, false) then v_award_points else 0 end;
end;
$$;

revoke all on function public.save_topic_progress(text, boolean, integer, integer, jsonb) from public;
revoke all on function public.save_topic_progress(text, boolean, integer, integer, jsonb) from anon;
grant execute on function public.save_topic_progress(text, boolean, integer, integer, jsonb) to authenticated;

comment on function public.save_topic_progress(text, boolean, integer, integer, jsonb)
is 'Persists auth.uid() progress and idempotently awards server-catalogued completion points; caller-supplied point amounts are ignored.';

-- Retire the legacy RPC that accepted an arbitrary user ID.
revoke all on function public.increment_user_points(uuid, integer) from public;
revoke all on function public.increment_user_points(uuid, integer) from anon;
revoke all on function public.increment_user_points(uuid, integer) from authenticated;
