-- Every engagement claim must be backed by a server-owned persistence event.
revoke all on function public.record_learning_activity(text) from authenticated, anon, public;

create table public.engagement_events (
  user_id uuid not null references auth.users(id) on delete cascade,
  source_type text not null check (source_type in ('progress','quiz','review')),
  source_id text not null check (char_length(source_id) between 1 and 160),
  occurred_at timestamptz not null,
  activity_date date not null,
  result jsonb,
  consumed_at timestamptz,
  primary key (user_id, source_type, source_id)
);
alter table public.engagement_events enable row level security;
revoke all on public.engagement_events from anon, authenticated;

create or replace function public.consume_engagement_event(
  p_user_id uuid, p_source_type text, p_source_id text
) returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  event_row public.engagement_events;
  streak_value integer := 0;
  bonus_value integer := 0;
  completed_roots integer := 0;
  eligible_ids text[] := '{}';
  awarded_ids text[] := '{}';
  inserted_rows integer := 0;
  outcome jsonb;
begin
  if p_user_id is null then raise exception 'Event owner required'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text || ':engagement', 0));
  select * into event_row from public.engagement_events
  where user_id=p_user_id and source_type=p_source_type and source_id=p_source_id for update;
  if not found then raise exception 'Verified engagement event not found'; end if;
  if event_row.consumed_at is not null then return event_row.result; end if;

  insert into public.daily_activity(user_id, activity_date, first_activity_at, activity_type)
  values (p_user_id, event_row.activity_date, event_row.occurred_at,
    case p_source_type when 'progress' then 'theory_completion' when 'quiz' then 'quiz_completion' else 'review' end)
  on conflict (user_id, activity_date) do nothing;
  get diagnostics inserted_rows = row_count;

  with recursive dates(day, length) as (
    select event_row.activity_date, 0
    union all select day - 1, length + 1 from dates
    where exists (select 1 from public.daily_activity where user_id=p_user_id and activity_date=dates.day)
      and length < 36600
  ) select greatest(0, max(length)) into streak_value from dates;

  if inserted_rows=1 and streak_value > 1 then
    update public.profiles set points=coalesce(points,0)+5, updated_at=now() where user_id=p_user_id;
    bonus_value := 5;
  end if;

  select count(*) into completed_roots from (values
    (array['nautical-terms-boat-parts','nautical-terms-sail-controls','quiz-nautical-terms-quiz']::text[]),
    (array['quiz-ropework']::text[]), (array['quiz-anchorwork']::text[]),
    (array['quiz-victualling']::text[]), (array['quiz-engine']::text[]), (array['quiz-rig']::text[]),
    (array['colregs-theory','lights-theory','quiz-colregs']::text[]),
    (array['charts-theory','compass-theory','position-theory']::text[]),
    (array['pilotage-buoyage','pilotage-transits','pilotage-clearing-bearings','pilotage-plan','quiz-pilotage']::text[]),
    (array['safety-mob','safety-fire','safety-life-raft','safety-flares','safety-personal','safety-gas']::text[]),
    (array['weather-systems','weather-beaufort','weather-forecasts','weather-fog','quiz-weather']::text[]),
    (array['passage-planning-prepare','passage-planning-calculator','passage-planning-builder','passage-planning-checklist','quiz-passage-planning']::text[])
  ) roots(required_ids) where not exists (
    select 1 from unnest(required_ids) required(topic_id) where not exists (
      select 1 from public.user_progress where user_id=p_user_id
        and user_progress.topic_id=required.topic_id and completed));

  select coalesce(array_agg(id), '{}') into eligible_ids from (
    select 'navigation-master' id where not exists (
      select 1 from unnest(array['charts-theory','compass-theory','position-theory']) r(id)
      where not exists (select 1 from public.user_progress where user_id=p_user_id and topic_id=r.id and completed))
    union all select 'safety-first' where not exists (
      select 1 from unnest(array['safety-mob','safety-fire','safety-life-raft','safety-flares','safety-personal','safety-gas']) r(id)
      where not exists (select 1 from public.user_progress where user_id=p_user_id and topic_id=r.id and completed))
    union all select 'weather-wise' where not exists (
      select 1 from unnest(array['weather-systems','weather-beaufort','weather-forecasts','weather-fog','quiz-weather']) r(id)
      where not exists (select 1 from public.user_progress where user_id=p_user_id and topic_id=r.id and completed))
    union all select 'passage-planner' where not exists (
      select 1 from unnest(array['passage-planning-prepare','passage-planning-calculator','passage-planning-builder','passage-planning-checklist','quiz-passage-planning']) r(id)
      where not exists (select 1 from public.user_progress where user_id=p_user_id and topic_id=r.id and completed))
    union all select 'first-quiz' where exists (select 1 from public.quiz_scores where user_id=p_user_id)
    union all select 'quiz-veteran' where (select count(*) from public.quiz_scores where user_id=p_user_id)>=10
    union all select 'perfect-score' where exists (select 1 from public.quiz_scores where user_id=p_user_id and percentage=100)
    union all select 'points-100' where (select coalesce(points,0) from public.profiles where user_id=p_user_id)>=100
    union all select 'points-500' where (select coalesce(points,0) from public.profiles where user_id=p_user_id)>=500
    union all select 'points-1000' where (select coalesce(points,0) from public.profiles where user_id=p_user_id)>=1000
    union all select 'streak-3' where streak_value>=3
    union all select 'streak-7' where streak_value>=7
    union all select 'streak-30' where streak_value>=30
    union all select 'half-syllabus' where completed_roots>=6
    union all select 'full-syllabus' where completed_roots>=12
  ) eligible;
  with inserted as (
    insert into public.user_badges(user_id,badge_id) select p_user_id,unnest(eligible_ids)
    on conflict (user_id,badge_id) do nothing returning badge_id
  ) select coalesce(array_agg(badge_id),'{}') into awarded_ids from inserted;

  outcome := jsonb_build_object('current_streak',streak_value,'bonus_points',bonus_value,'unlocked_badge_ids',awarded_ids);
  update public.engagement_events set result=outcome, consumed_at=now()
  where user_id=p_user_id and source_type=p_source_type and source_id=p_source_id;
  return outcome;
end;
$$;
revoke all on function public.consume_engagement_event(uuid,text,text) from public, anon, authenticated;

create or replace function public.sync_engagement_event(p_source_type text,p_source_id text)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  return public.consume_engagement_event(auth.uid(),p_source_type,p_source_id);
end;
$$;
revoke all on function public.sync_engagement_event(text,text) from public,anon;
grant execute on function public.sync_engagement_event(text,text) to authenticated;

create or replace function public.progress_engagement_trigger() returns trigger
language plpgsql security definer set search_path=public,pg_temp as $$
declare event_time timestamptz := coalesce(new.last_accessed,now());
begin
  if new.completed and (tg_op='INSERT' or not coalesce(old.completed,false)) then
    insert into public.engagement_events(user_id,source_type,source_id,occurred_at,activity_date)
    values(new.user_id,'progress',new.topic_id,event_time,timezone('Europe/Prague',event_time)::date)
    on conflict do nothing;
    perform public.consume_engagement_event(new.user_id,'progress',new.topic_id);
  end if;
  return new;
end;
$$;
create trigger user_progress_engagement after insert or update on public.user_progress
for each row execute function public.progress_engagement_trigger();

alter table public.quiz_scores add column attempt_id uuid;
update public.quiz_scores set attempt_id=gen_random_uuid() where attempt_id is null;
alter table public.quiz_scores alter column attempt_id set not null;
alter table public.quiz_scores add constraint quiz_scores_user_attempt_unique unique(user_id,attempt_id);
revoke insert,update,delete on public.quiz_scores from authenticated,anon;
grant select on public.quiz_scores to authenticated;

create or replace function public.submit_quiz_score(
  p_attempt_id uuid,p_topic_id text,p_score integer,p_total_questions integer
) returns public.quiz_scores language plpgsql security definer set search_path=public,pg_temp as $$
declare owner uuid:=auth.uid(); existing public.quiz_scores; saved public.quiz_scores; event_time timestamptz:=now(); computed integer;
begin
  if owner is null then raise exception 'Authentication required'; end if;
  if p_attempt_id is null then raise exception 'Attempt id required'; end if;
  if p_topic_id <> all(array['nautical-terms-quiz','ropework','anchorwork','victualling','engine','rig','colregs',
    'lights-signals','safety-mob-quiz','safety-fire-quiz','safety-life-raft-quiz','safety-flares-quiz',
    'safety','pilotage','weather','passage-planning']) then raise exception 'Unknown quiz topic'; end if;
  if p_total_questions<1 or p_total_questions>100 or p_score<0 or p_score>p_total_questions then raise exception 'Invalid quiz score'; end if;
  computed:=round(p_score*100.0/p_total_questions);
  perform pg_advisory_xact_lock(hashtextextended(owner::text||':quiz:'||p_attempt_id::text,0));
  select * into existing from public.quiz_scores where user_id=owner and attempt_id=p_attempt_id;
  if found then
    if existing.topic_id<>p_topic_id or existing.score<>p_score or existing.total_questions<>p_total_questions then
      raise exception 'Attempt id already used with different payload';
    end if;
    return existing;
  end if;
  insert into public.quiz_scores(user_id,attempt_id,topic_id,score,total_questions,percentage,completed_at)
  values(owner,p_attempt_id,p_topic_id,p_score,p_total_questions,computed,event_time) returning * into saved;
  insert into public.engagement_events(user_id,source_type,source_id,occurred_at,activity_date)
  values(owner,'quiz',p_attempt_id::text,event_time,timezone('Europe/Prague',event_time)::date);
  perform public.consume_engagement_event(owner,'quiz',p_attempt_id::text);
  return saved;
end;
$$;
revoke all on function public.submit_quiz_score(uuid,text,integer,integer) from public,anon;
grant execute on function public.submit_quiz_score(uuid,text,integer,integer) to authenticated;

create or replace function public.review_engagement_trigger() returns trigger
language plpgsql security definer set search_path=public,pg_temp as $$
begin
  insert into public.engagement_events(user_id,source_type,source_id,occurred_at,activity_date)
  values(new.user_id,'review',new.review_id::text,new.reviewed_at,timezone('Europe/Prague',new.reviewed_at)::date)
  on conflict do nothing;
  perform public.consume_engagement_event(new.user_id,'review',new.review_id::text);
  return new;
end;
$$;
create trigger review_receipt_engagement after insert on public.question_review_receipts
for each row execute function public.review_engagement_trigger();
