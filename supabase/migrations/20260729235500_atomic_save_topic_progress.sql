create table if not exists public.progress_awards (
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id text not null,
  reward_kind text not null default 'completion',
  points integer not null check (points > 0),
  awarded_at timestamptz not null default now(),
  primary key (user_id, topic_id, reward_kind)
);

alter table public.progress_awards enable row level security;
revoke all on public.progress_awards from public, anon, authenticated;
grant select on public.progress_awards to authenticated;
create policy "Users can view their own progress awards"
  on public.progress_awards for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- Server-timestamped evidence is deliberately separate from resettable
-- progress and has no client grants. A completion cannot be submitted in the
-- same request that starts a theory visit.
create table if not exists public.progress_completion_evidence (
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id text not null,
  started_at timestamptz not null default clock_timestamp(),
  primary key (user_id, topic_id)
);
alter table public.progress_completion_evidence enable row level security;
revoke all on public.progress_completion_evidence from public, anon, authenticated;

-- Mark every legacy completion before installing the new write contract. The
-- marker intentionally records zero because historical profile point awards
-- cannot be reconstructed safely. Its immutable identity prevents a reset
-- from making that topic look newly rewardable in a future verified flow.
alter table public.progress_awards drop constraint if exists progress_awards_points_check;
alter table public.progress_awards add constraint progress_awards_points_check check (points >= 0);
insert into public.progress_awards (user_id, topic_id, reward_kind, points)
select up.user_id, up.topic_id, 'completion', 0
from public.user_progress up
where up.completed is true
on conflict (user_id, topic_id, reward_kind) do nothing;

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
  v_reward_points integer;
  v_points_awarded boolean := false;
  v_profile_rows integer := 0;
  v_started_at timestamptz;
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

  -- Only the new meteorology theory flow has server-observed completion
  -- evidence. Legacy callers continue to persist progress but cannot mint
  -- points through this RPC.
  v_reward_points := case p_topic_id
    when 'weather-systems' then 10 when 'weather-beaufort' then 10
    when 'weather-forecasts' then 10 when 'weather-fog' then 10
    else null
  end;
  if p_score is null or p_score < 0 or p_score > 100 then
    raise exception 'Score must be between 0 and 100' using errcode = '22023';
  end if;
  if p_answers_history is not null
     and (jsonb_typeof(p_answers_history) <> 'object'
          or pg_column_size(p_answers_history) > 65536) then
    raise exception 'Invalid answers history' using errcode = '22023';
  end if;
  if p_topic_id like 'weather-%'
     and coalesce(p_completed, false)
     and (p_score <> 100
          or p_answers_history is null
          or p_answers_history ->> 'completionState' <> 'completed') then
    raise exception 'Completed progress requires verified completion history'
      using errcode = '22023';
  end if;
  if v_reward_points is not null
     and coalesce(p_points, 0) not in (0, v_reward_points) then
    raise exception 'Invalid point value' using errcode = '22023';
  end if;

  -- Serialize attempts for one user/topic, including two concurrent first inserts.
  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text || ':' || p_topic_id, 0));

  if v_reward_points is not null and not coalesce(p_completed, false) then
    insert into public.progress_completion_evidence (user_id, topic_id)
    values (v_user_id, p_topic_id)
    on conflict (user_id, topic_id) do nothing;
  elsif v_reward_points is not null and coalesce(p_completed, false) then
    select e.started_at into v_started_at
      from public.progress_completion_evidence e
     where e.user_id = v_user_id and e.topic_id = p_topic_id;
    if v_started_at is null
       or v_started_at > clock_timestamp() - interval '15 seconds' then
      raise exception 'Completion has no eligible server-observed visit'
        using errcode = '22023';
    end if;
  end if;

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
        score = case when public.user_progress.completed
                     then public.user_progress.score else excluded.score end,
        last_accessed = excluded.last_accessed,
        answers_history = case when public.user_progress.completed
                               then public.user_progress.answers_history
                               else coalesce(excluded.answers_history, public.user_progress.answers_history) end;

  if v_completion_awarded and v_reward_points is not null then
    insert into public.progress_awards (user_id, topic_id, reward_kind, points)
    values (v_user_id, p_topic_id, 'completion', v_reward_points)
    on conflict (user_id, topic_id, reward_kind) do nothing
    returning true into v_points_awarded;

    if coalesce(v_points_awarded, false) then
      update public.profiles
         set points = coalesce(points, 0) + v_reward_points
       where user_id = v_user_id;
      get diagnostics v_profile_rows = row_count;
      if v_profile_rows <> 1 then
        raise exception 'Profile required before awarding completion'
          using errcode = '23503';
      end if;
    end if;
  end if;

  return query select
    coalesce(v_points_awarded, false),
    v_completion_awarded,
    case when coalesce(v_points_awarded, false) then v_reward_points else 0 end;
end;
$$;

revoke all on function public.save_topic_progress(text, boolean, integer, integer, jsonb) from public;
revoke all on function public.save_topic_progress(text, boolean, integer, integer, jsonb) from anon;
grant execute on function public.save_topic_progress(text, boolean, integer, integer, jsonb) to authenticated;

comment on function public.save_topic_progress(text, boolean, integer, integer, jsonb)
is 'Persists auth.uid() learning progress and awards fixed server-owned completion rewards once.';

-- Retire the legacy RPC that accepted an arbitrary user ID.
revoke all on function public.increment_user_points(uuid, integer) from public;
revoke all on function public.increment_user_points(uuid, integer) from anon;
revoke all on function public.increment_user_points(uuid, integer) from authenticated;
