-- The applied MOB scenarios have new semantic identities. Activate their
-- forward-only catalogue rows and retain legacy catalogue rows only for FK and
-- receipt integrity; old scheduling evidence must never transfer.
insert into public.review_question_catalog (question_id, active) values
  ('mob-applied-immediate-v2', true),
  ('mob-applied-control-v2', true),
  ('mob-applied-distress-v2', true),
  ('mob-applied-approach-v2', true),
  ('mob-applied-propeller-v2', true),
  ('mob-applied-equipment-v2', true),
  ('mob-applied-secure-v2', true),
  ('mob-applied-cold-recovery-v2', true),
  ('mob-applied-aftercare-v2', true),
  ('mob-applied-prevention-v2', true),
  ('mob-applied-roles-v2', true),
  ('mob-applied-integrated-v2', true)
on conflict (question_id) do update set active = excluded.active;

update public.review_question_catalog set active = false
where question_id ~ '^mob([1-9]|1[0-2])$';

delete from public.question_reviews
where question_id ~ '^mob([1-9]|1[0-2])$';

-- Reset both the canonical and pre-canonical projections. Historical score
-- receipts remain attempt history, but cannot appear as completion of v2.
update public.user_progress
set completed = false,
    score = 0,
    answers_history = null,
    last_accessed = now()
where topic_id in ('quiz-safety-mob-quiz', 'safety-mob-quiz')
  and (completed or score <> 0 or answers_history is not null);
