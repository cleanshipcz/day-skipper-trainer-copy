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
