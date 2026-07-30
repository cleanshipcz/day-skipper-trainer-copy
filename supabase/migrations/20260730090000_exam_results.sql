create table public.exam_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  attempt_id uuid not null,
  score integer not null check (score >= 0),
  percentage integer not null check (percentage between 0 and 100),
  total_questions integer not null check (total_questions between 1 and 200),
  time_taken_seconds integer not null check (time_taken_seconds between 0 and 86400),
  passed boolean not null,
  pass_mark integer not null default 65 check (pass_mark between 1 and 100),
  topic_breakdown jsonb not null default '{}'::jsonb,
  completed_at timestamptz not null default now(),
  unique (user_id, attempt_id),
  check (score <= total_questions)
);

alter table public.exam_results enable row level security;
create policy "Users manage own exam results" on public.exam_results
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

revoke insert, update, delete on public.exam_results from authenticated;
grant select on public.exam_results to authenticated;

create table public.exam_completion_awards (
  user_id uuid primary key references auth.users(id) on delete cascade,
  awarded_at timestamptz not null default now()
);
alter table public.exam_completion_awards enable row level security;
revoke all on public.exam_completion_awards from public, anon, authenticated;

create or replace function public.submit_exam_result(
  p_attempt_id uuid, p_score integer, p_total_questions integer,
  p_time_taken_seconds integer, p_topic_breakdown jsonb, p_pass_mark integer default 65
) returns public.exam_results
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  result public.exam_results;
  calculated_percentage integer;
  breakdown_total integer;
  breakdown_correct integer;
  item record;
  known_topics constant text[] := array[
    'nautical-terms-quiz','ropework','anchorwork','victualling','engine','rig',
    'colregs','lights-signals','safety-mob-quiz','safety-fire-quiz',
    'safety-life-raft-quiz','safety-flares-quiz','safety','pilotage','weather','passage-planning'
  ];
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_total_questions not between 1 and 200 or p_score not between 0 and p_total_questions
     or p_pass_mark not between 1 and 100
     or p_time_taken_seconds not between 0 and 86400
     or jsonb_typeof(p_topic_breakdown) <> 'object'
     or pg_column_size(p_topic_breakdown) > 16384
     or jsonb_object_length(p_topic_breakdown) not between 1 and 16 then
    raise exception 'Invalid exam result';
  end if;
  breakdown_total := 0;
  breakdown_correct := 0;
  for item in select key, value from jsonb_each(p_topic_breakdown) loop
    if not (item.key = any(known_topics))
      or jsonb_typeof(item.value) <> 'object'
      or not (item.value ?& array['correct','total','percentage'])
      or (item.value->>'correct') !~ '^[0-9]+$'
      or (item.value->>'total') !~ '^[0-9]+$'
      or (item.value->>'percentage') !~ '^[0-9]+$'
      or (item.value->>'total')::integer not between 1 and 100
      or (item.value->>'correct')::integer not between 0 and (item.value->>'total')::integer
      or (item.value->>'percentage')::integer <>
        round(((item.value->>'correct')::numeric / (item.value->>'total')::integer) * 100) then
      raise exception 'Invalid topic breakdown';
    end if;
    breakdown_total := breakdown_total + (item.value->>'total')::integer;
    breakdown_correct := breakdown_correct + (item.value->>'correct')::integer;
  end loop;
  if breakdown_total <> p_total_questions or breakdown_correct <> p_score then
    raise exception 'Topic breakdown does not match score';
  end if;
  calculated_percentage := round((p_score::numeric / p_total_questions) * 100);
  insert into public.exam_results (
    user_id, attempt_id, score, percentage, total_questions,
    time_taken_seconds, passed, pass_mark, topic_breakdown
  ) values (
    auth.uid(), p_attempt_id, p_score, calculated_percentage, p_total_questions,
    p_time_taken_seconds, calculated_percentage >= p_pass_mark, p_pass_mark, p_topic_breakdown
  ) on conflict (user_id, attempt_id) do update set attempt_id = excluded.attempt_id
  returning * into result;

  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text || ':exam-completion', 0));
  insert into public.exam_completion_awards (user_id) values (auth.uid())
    on conflict (user_id) do nothing;
  if found then
    update public.profiles set points = coalesce(points, 0) + 10 where user_id = auth.uid();
  end if;
  return result;
end $$;

revoke all on function public.submit_exam_result(uuid, integer, integer, integer, jsonb, integer) from public, anon;
grant execute on function public.submit_exam_result(uuid, integer, integer, integer, jsonb, integer) to authenticated;
