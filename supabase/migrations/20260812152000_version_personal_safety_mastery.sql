-- Personal-safety completion now requires the complete v2 scenario receipt.
-- Older completion flags remain historical evidence and award receipts but
-- cannot bypass the added personal-beacon decision.
create table public.personal_safety_legacy_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  schema_version integer not null default 1 check (schema_version = 1),
  previous_completed boolean not null,
  previous_score integer not null,
  previous_last_accessed timestamptz,
  previous_answers_history jsonb,
  award_receipt_preserved boolean not null,
  archived_at timestamptz not null default statement_timestamp()
);

alter table public.personal_safety_legacy_progress enable row level security;
revoke all on public.personal_safety_legacy_progress from public, anon, authenticated;
grant select on public.personal_safety_legacy_progress to authenticated;
create policy "Users can view their own legacy personal safety progress"
  on public.personal_safety_legacy_progress for select
  to authenticated
  using ((select auth.uid()) = user_id);

comment on table public.personal_safety_legacy_progress
is 'Immutable one-row-per-owner audit snapshot retired by the personal-safety v2 catalogue; never current mastery evidence.';

create or replace function public.validate_personal_safety_mastery()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  evidence jsonb := new.answers_history -> 'personalSafetyMastery';
begin
  if new.topic_id = 'safety-personal' and new.completed and (
    jsonb_typeof(evidence) is distinct from 'object'
    or evidence ->> 'revision' <> 'personal-safety-practical-v2'
    or jsonb_typeof(evidence -> 'masteredScenarioIds') is distinct from 'array'
    or not (evidence -> 'masteredScenarioIds' @> '["pfd","fit","tether","kill-cord","beacon"]'::jsonb)
    or jsonb_array_length(evidence -> 'masteredScenarioIds') <> 5
  ) then
    raise exception 'Current personal safety mastery evidence is required' using errcode = '22023';
  end if;
  return new;
end;
$$;

drop trigger if exists validate_personal_safety_mastery on public.user_progress;
create trigger validate_personal_safety_mastery
before insert or update on public.user_progress
for each row execute function public.validate_personal_safety_mastery();

insert into public.personal_safety_legacy_progress (
  user_id, previous_completed, previous_score, previous_last_accessed,
  previous_answers_history, award_receipt_preserved
)
select up.user_id, up.completed, up.score, up.last_accessed, up.answers_history,
       exists (
         select 1 from public.progress_awards award
         where award.user_id = up.user_id and award.topic_id = up.topic_id
       )
from public.user_progress up
where up.topic_id = 'safety-personal'
  and (up.completed or up.score <> 0 or up.answers_history is not null)
  and (
    jsonb_typeof(up.answers_history -> 'personalSafetyMastery') is distinct from 'object'
    or up.answers_history -> 'personalSafetyMastery' ->> 'revision' <> 'personal-safety-practical-v2'
    or jsonb_typeof(up.answers_history -> 'personalSafetyMastery' -> 'masteredScenarioIds') is distinct from 'array'
    or not (up.answers_history -> 'personalSafetyMastery' -> 'masteredScenarioIds' @> '["pfd","fit","tether","kill-cord","beacon"]'::jsonb)
    or jsonb_array_length(up.answers_history -> 'personalSafetyMastery' -> 'masteredScenarioIds') <> 5
  )
on conflict (user_id) do nothing;

update public.user_progress
set completed = false,
    score = 0,
    answers_history = null
where topic_id = 'safety-personal'
  and (completed or score <> 0 or answers_history is not null)
  and (
    jsonb_typeof(answers_history -> 'personalSafetyMastery') is distinct from 'object'
    or answers_history -> 'personalSafetyMastery' ->> 'revision' <> 'personal-safety-practical-v2'
    or jsonb_typeof(answers_history -> 'personalSafetyMastery' -> 'masteredScenarioIds') is distinct from 'array'
    or not (answers_history -> 'personalSafetyMastery' -> 'masteredScenarioIds' @> '["pfd","fit","tether","kill-cord","beacon"]'::jsonb)
    or jsonb_array_length(answers_history -> 'personalSafetyMastery' -> 'masteredScenarioIds') <> 5
  );

comment on function public.validate_personal_safety_mastery()
is 'Requires auditable current scenario evidence before safety-personal can be completed.';
