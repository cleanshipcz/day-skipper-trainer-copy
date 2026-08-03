-- Keep issued quiz attempts aligned with the expanded comprehensive quiz.
-- This replaces only the attempt-issuing function; existing attempts retain
-- the expected_total recorded when they were issued.
create or replace function public.start_quiz_attempt(p_topic_id text)
returns public.quiz_attempts language plpgsql security definer set search_path=public,pg_temp as $$
declare owner uuid:=auth.uid(); expected integer; active public.quiz_attempts; active_count integer;
begin
  if owner is null then raise exception 'Authentication required'; end if;
  expected := case p_topic_id
    when 'nautical-terms-quiz' then 32 when 'ropework' then 12 when 'anchorwork' then 12
    when 'victualling' then 12 when 'engine' then 12 when 'rig' then 12
    when 'colregs' then 20 when 'lights-signals' then 20 when 'safety-mob-quiz' then 12
    when 'safety-fire-quiz' then 8 when 'safety-life-raft-quiz' then 10
    when 'safety-flares-quiz' then 10 when 'safety' then 24 when 'pilotage' then 20
    when 'weather' then 20 when 'passage-planning' then 20 else null end;
  if expected is null then raise exception 'Unknown quiz topic'; end if;
  perform pg_advisory_xact_lock(hashtextextended(owner::text||':quiz-attempts',0));
  select * into active from public.quiz_attempts where user_id=owner and topic_id=p_topic_id
    and completed_at is null and started_at>statement_timestamp()-interval '2 hours'
    and expected_total=expected
    order by started_at desc limit 1;
  if found then return active; end if;
  delete from public.quiz_attempts where user_id=owner and (
    (completed_at is null and started_at<statement_timestamp()-interval '24 hours')
    or completed_at<statement_timestamp()-interval '31 days'
  );
  select count(*) into active_count from public.quiz_attempts
    where user_id=owner and completed_at is null;
  if active_count>=100 then raise exception 'Quiz attempt retention limit reached'; end if;
  insert into public.quiz_attempts(user_id,topic_id,expected_total)
  values(owner,p_topic_id,expected) returning * into active;
  return active;
end;
$$;
revoke all on function public.start_quiz_attempt(text) from public,anon;
grant execute on function public.start_quiz_attempt(text) to authenticated;
