create table public.exam_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  attempt_id uuid not null,
  score integer not null check (score >= 0),
  percentage integer not null check (percentage between 0 and 100),
  total_questions integer not null check (total_questions between 1 and 200),
  time_taken_seconds integer not null check (time_taken_seconds between 0 and 86400),
  passed boolean not null,
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

create or replace function public.submit_exam_result(
  p_attempt_id uuid, p_score integer, p_total_questions integer,
  p_time_taken_seconds integer, p_topic_breakdown jsonb
) returns public.exam_results
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  result public.exam_results;
  calculated_percentage integer;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_total_questions not between 1 and 200 or p_score not between 0 and p_total_questions
     or p_time_taken_seconds not between 0 and 86400
     or jsonb_typeof(p_topic_breakdown) <> 'object' then
    raise exception 'Invalid exam result';
  end if;
  calculated_percentage := round((p_score::numeric / p_total_questions) * 100);
  insert into public.exam_results (
    user_id, attempt_id, score, percentage, total_questions,
    time_taken_seconds, passed, topic_breakdown
  ) values (
    auth.uid(), p_attempt_id, p_score, calculated_percentage, p_total_questions,
    p_time_taken_seconds, calculated_percentage >= 65, p_topic_breakdown
  ) on conflict (user_id, attempt_id) do update set attempt_id = excluded.attempt_id
  returning * into result;

  if found and not exists (
    select 1 from public.user_progress
    where user_id = auth.uid() and topic_id = 'exam-attempt-' || p_attempt_id::text
  ) then
    insert into public.user_progress (user_id, topic_id, completed, score)
    values (auth.uid(), 'exam-attempt-' || p_attempt_id::text, true, calculated_percentage);
    update public.profiles set points = coalesce(points, 0) + 10 +
      case when calculated_percentage >= 65 then 10 else 0 end
    where user_id = auth.uid();
  end if;
  return result;
end $$;

revoke all on function public.submit_exam_result(uuid, integer, integer, integer, jsonb) from public, anon;
grant execute on function public.submit_exam_result(uuid, integer, integer, integer, jsonb) to authenticated;
