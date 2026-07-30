create table public.user_badges (
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_id text not null check (badge_id in (
    'navigation-master','safety-first','weather-wise','passage-planner','first-quiz',
    'quiz-veteran','perfect-score','points-100','points-500','points-1000',
    'streak-3','streak-7','streak-30','half-syllabus','full-syllabus'
  )),
  earned_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);
alter table public.user_badges enable row level security;
create policy "Users read own badges" on public.user_badges
  for select to authenticated using (auth.uid() = user_id);
revoke insert, update, delete on public.user_badges from authenticated;
grant select on public.user_badges to authenticated;

create table public.daily_activity (
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_date date not null,
  first_activity_at timestamptz not null default now(),
  activity_type text not null check (activity_type in ('theory_completion','quiz_completion','review')),
  primary key (user_id, activity_date)
);
create index daily_activity_user_date_idx on public.daily_activity (user_id, activity_date desc);
alter table public.daily_activity enable row level security;
create policy "Users read own activity" on public.daily_activity
  for select to authenticated using (auth.uid() = user_id);
revoke insert, update, delete on public.daily_activity from authenticated;
grant select on public.daily_activity to authenticated;

create or replace function public.record_learning_activity(p_activity_type text)
returns table(current_streak integer, bonus_points integer, unlocked_badge_ids text[])
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  current_user_id uuid := auth.uid();
  today_prague date := timezone('Europe/Prague', now())::date;
  inserted_rows integer := 0;
  streak_value integer := 0;
  bonus_value integer := 0;
  eligible_ids text[] := '{}';
  awarded_ids text[] := '{}';
  completed_roots integer := 0;
begin
  if current_user_id is null then raise exception 'Authentication required'; end if;
  if p_activity_type not in ('theory_completion','quiz_completion','review') then
    raise exception 'Unknown activity type';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(current_user_id::text || ':engagement', 0));
  insert into public.daily_activity(user_id, activity_date, activity_type)
  values (current_user_id, today_prague, p_activity_type)
  on conflict (user_id, activity_date) do nothing;
  get diagnostics inserted_rows = row_count;

  with recursive dates(day, length) as (
    select today_prague, 0
    union all
    select day - 1, length + 1 from dates
    where exists (
      select 1 from public.daily_activity
      where user_id = current_user_id and activity_date = dates.day
    ) and length < 36600
  )
  select greatest(0, max(length)) into streak_value from dates;

  if inserted_rows = 1 and streak_value > 1 then
    update public.profiles set points = coalesce(points, 0) + 5, updated_at = now()
    where user_id = current_user_id;
    bonus_value := 5;
  end if;

  select count(*) into completed_roots from (values
    (array['nautical-terms-boat-parts','nautical-terms-sail-controls','nautical-terms-quiz']::text[]),
    (array['ropework']::text[]), (array['anchorwork']::text[]), (array['victualling']::text[]),
    (array['engine']::text[]), (array['rig']::text[]),
    (array['colregs-theory','lights-theory','colregs']::text[]),
    (array['charts-theory','compass-theory','position-theory']::text[]),
    (array['pilotage-buoyage','pilotage-transits','pilotage-clearing-bearings','pilotage-plan','quiz-pilotage']::text[]),
    (array['safety-mob','safety-fire','safety-life-raft','safety-flares','safety-personal','safety-gas']::text[]),
    (array['weather-systems','weather-beaufort','weather-forecasts','weather-fog','quiz-weather']::text[]),
    (array['passage-planning-prepare','passage-planning-calculator','passage-planning-builder','passage-planning-checklist','quiz-passage-planning']::text[])
  ) roots(required_ids)
  where not exists (
    select 1 from unnest(required_ids) required(topic_id)
    where not exists (
      select 1 from public.user_progress
      where user_id=current_user_id and user_progress.topic_id=required.topic_id and completed
    )
  );

  select coalesce(array_agg(id), '{}') into eligible_ids from (
    select 'navigation-master' id where not exists (
      select 1 from unnest(array['charts-theory','compass-theory','position-theory']) required(topic_id)
      where not exists (select 1 from public.user_progress where user_id=current_user_id and user_progress.topic_id=required.topic_id and completed))
    union all select 'safety-first' where not exists (
      select 1 from unnest(array['safety-mob','safety-fire','safety-life-raft','safety-flares','safety-personal','safety-gas']) required(topic_id)
      where not exists (select 1 from public.user_progress where user_id=current_user_id and user_progress.topic_id=required.topic_id and completed))
    union all select 'weather-wise' where not exists (
      select 1 from unnest(array['weather-systems','weather-beaufort','weather-forecasts','weather-fog','quiz-weather']) required(topic_id)
      where not exists (select 1 from public.user_progress where user_id=current_user_id and user_progress.topic_id=required.topic_id and completed))
    union all select 'passage-planner' where not exists (
      select 1 from unnest(array['passage-planning-prepare','passage-planning-calculator','passage-planning-builder','passage-planning-checklist','quiz-passage-planning']) required(topic_id)
      where not exists (select 1 from public.user_progress where user_id=current_user_id and user_progress.topic_id=required.topic_id and completed))
    union all select 'first-quiz' where exists (select 1 from public.quiz_scores where user_id=current_user_id)
    union all select 'quiz-veteran' where (select count(*) from public.quiz_scores where user_id=current_user_id) >= 10
    union all select 'perfect-score' where exists (select 1 from public.quiz_scores where user_id=current_user_id and percentage=100)
    union all select 'points-100' where (select coalesce(points,0) from public.profiles where user_id=current_user_id) >= 100
    union all select 'points-500' where (select coalesce(points,0) from public.profiles where user_id=current_user_id) >= 500
    union all select 'points-1000' where (select coalesce(points,0) from public.profiles where user_id=current_user_id) >= 1000
    union all select 'streak-3' where streak_value >= 3
    union all select 'streak-7' where streak_value >= 7
    union all select 'streak-30' where streak_value >= 30
    union all select 'half-syllabus' where completed_roots >= 6
    union all select 'full-syllabus' where completed_roots >= 12
  ) eligible;

  with inserted as (
    insert into public.user_badges(user_id, badge_id)
    select current_user_id, unnest(eligible_ids)
    on conflict (user_id, badge_id) do nothing
    returning badge_id
  ) select coalesce(array_agg(badge_id), '{}') into awarded_ids from inserted;

  return query select streak_value, bonus_value, awarded_ids;
end;
$$;

revoke all on function public.record_learning_activity(text) from public;
grant execute on function public.record_learning_activity(text) to authenticated;
