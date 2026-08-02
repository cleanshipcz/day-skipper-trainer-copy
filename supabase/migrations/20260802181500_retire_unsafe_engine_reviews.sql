-- e1-e12 changed meaning while correcting unsafe universal engine advice.
-- Retain catalogue rows for receipt/FK integrity, but never reinterpret an old
-- schedule as mastery of the replacement e13-e24 objectives.
insert into public.review_question_catalog (question_id, active)
select 'e' || number, true from generate_series(13, 24) as number
on conflict (question_id) do update set active = excluded.active;

update public.review_question_catalog set active = false
where question_id ~ '^e([1-9]|1[0-2])$';

delete from public.question_reviews
where question_id ~ '^e([1-9]|1[0-2])$';

-- Quiz completion previously had no catalogue identity at the completion
-- boundary. Reset it rather than letting a legacy e1-e12 pass seed e13-e24 or
-- appear as mastery of the replacement objectives. Historical quiz_scores are
-- retained as attempt history; only the live completion projection is retired.
update public.user_progress
set completed = false,
    score = 0,
    answers_history = null,
    last_accessed = now()
where topic_id = 'quiz-engine'
  and (completed or score <> 0 or answers_history is not null);
