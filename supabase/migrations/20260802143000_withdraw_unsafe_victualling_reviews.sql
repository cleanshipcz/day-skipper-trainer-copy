-- v6 and v12 taught unsafe tin-label and oilskin/scald claims. Replacement
-- objectives use new stable IDs so old due-review rows can never inherit a
-- materially different answer under the same identity.
delete from public.question_reviews
where question_id in ('v6', 'v12');
