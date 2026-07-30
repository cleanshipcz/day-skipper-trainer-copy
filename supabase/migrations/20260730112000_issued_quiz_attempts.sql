-- Quiz scores are self-assessed learning signals, not anti-cheat evidence. The
-- server validates lifecycle, ownership and bounded storage; it cannot verify
-- which answers the learner selected in the browser.
create table public.quiz_attempts (
  attempt_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id text not null,
  expected_total integer not null check (expected_total between 1 and 100),
  started_at timestamptz not null default statement_timestamp(),
  completed_at timestamptz,
  unique(user_id, attempt_id)
);
create index quiz_attempts_active_idx on public.quiz_attempts(user_id, topic_id, started_at desc);
alter table public.quiz_attempts enable row level security;
revoke all on public.quiz_attempts from anon, authenticated;

create or replace function public.start_quiz_attempt(p_topic_id text)
returns public.quiz_attempts language plpgsql security definer set search_path=public,pg_temp as $$
declare owner uuid:=auth.uid(); expected integer; active public.quiz_attempts; total_count integer;
begin
  if owner is null then raise exception 'Authentication required'; end if;
  expected := case p_topic_id
    when 'nautical-terms-quiz' then 20 when 'ropework' then 12 when 'anchorwork' then 12
    when 'victualling' then 12 when 'engine' then 12 when 'rig' then 12
    when 'colregs' then 20 when 'lights-signals' then 20 when 'safety-mob-quiz' then 12
    when 'safety-fire-quiz' then 8 when 'safety-life-raft-quiz' then 10
    when 'safety-flares-quiz' then 10 when 'safety' then 20 when 'pilotage' then 20
    when 'weather' then 20 when 'passage-planning' then 20 else null end;
  if expected is null then raise exception 'Unknown quiz topic'; end if;
  perform pg_advisory_xact_lock(hashtextextended(owner::text||':quiz-attempts',0));
  select * into active from public.quiz_attempts where user_id=owner and topic_id=p_topic_id
    and completed_at is null and started_at>statement_timestamp()-interval '2 hours'
    order by started_at desc limit 1;
  if found then return active; end if;
  delete from public.quiz_attempts where user_id=owner and completed_at is null
    and started_at<statement_timestamp()-interval '24 hours';
  select count(*) into total_count from public.quiz_attempts where user_id=owner;
  if total_count>=500 then raise exception 'Quiz attempt retention limit reached'; end if;
  insert into public.quiz_attempts(user_id,topic_id,expected_total)
  values(owner,p_topic_id,expected) returning * into active;
  return active;
end;
$$;
revoke all on function public.start_quiz_attempt(text) from public,anon;
grant execute on function public.start_quiz_attempt(text) to authenticated;

create or replace function public.submit_quiz_score(
  p_attempt_id uuid,p_topic_id text,p_score integer,p_total_questions integer
) returns public.quiz_scores language plpgsql security definer set search_path=public,pg_temp as $$
declare owner uuid:=auth.uid(); issued public.quiz_attempts; existing public.quiz_scores; saved public.quiz_scores;
  event_time timestamptz:=statement_timestamp(); computed integer;
begin
  if owner is null then raise exception 'Authentication required'; end if;
  if p_attempt_id is null then raise exception 'Issued attempt id required'; end if;
  perform pg_advisory_xact_lock(hashtextextended(owner::text||':quiz:'||p_attempt_id::text,0));
  select * into issued from public.quiz_attempts where user_id=owner and attempt_id=p_attempt_id for update;
  if not found then raise exception 'Issued quiz attempt not found'; end if;
  select * into existing from public.quiz_scores where user_id=owner and attempt_id=p_attempt_id;
  if found then
    if existing.topic_id<>p_topic_id or existing.score<>p_score or existing.total_questions<>p_total_questions then
      raise exception 'Attempt already completed with different payload';
    end if;
    return existing;
  end if;
  if issued.completed_at is not null then raise exception 'Attempt already consumed'; end if;
  if issued.topic_id<>p_topic_id or issued.expected_total<>p_total_questions then raise exception 'Attempt topic or total mismatch'; end if;
  if p_score<0 or p_score>issued.expected_total then raise exception 'Invalid quiz score'; end if;
  if event_time<issued.started_at+interval '1 second' then raise exception 'Quiz submitted implausibly quickly'; end if;
  if event_time>issued.started_at+interval '2 hours' then raise exception 'Quiz attempt expired'; end if;
  computed:=round(p_score*100.0/issued.expected_total);
  insert into public.quiz_scores(user_id,attempt_id,topic_id,score,total_questions,percentage,completed_at)
  values(owner,p_attempt_id,p_topic_id,p_score,p_total_questions,computed,event_time) returning * into saved;
  update public.quiz_attempts set completed_at=event_time where attempt_id=p_attempt_id;
  insert into public.engagement_events(user_id,source_type,source_id,occurred_at,activity_date)
  values(owner,'quiz',p_attempt_id::text,event_time,timezone('Europe/Prague',event_time)::date);
  perform public.consume_engagement_event(owner,'quiz',p_attempt_id::text);
  return saved;
end;
$$;

-- Review scheduling may accept a bounded historical answer timestamp, but
-- rewards always use the immutable server receipt time.
create or replace function public.review_engagement_trigger() returns trigger
language plpgsql security definer set search_path=public,pg_temp as $$
begin
  insert into public.engagement_events(user_id,source_type,source_id,occurred_at,activity_date)
  values(new.user_id,'review',new.review_id::text,new.created_at,timezone('Europe/Prague',new.created_at)::date)
  on conflict do nothing;
  perform public.consume_engagement_event(new.user_id,'review',new.review_id::text);
  delete from public.engagement_events where user_id=new.user_id and source_type='review'
    and consumed_at<statement_timestamp()-interval '31 days';
  return new;
end;
$$;
