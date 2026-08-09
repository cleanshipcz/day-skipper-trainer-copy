-- Catalogue rows are retained for receipt/FK integrity, but only active rows
-- may be seeded or reviewed. v6 and v12 taught unsafe tin-label and
-- oilskin/scald claims; v17 and v18 replace them without reusing identity.
alter table public.review_question_catalog
  add column active boolean not null default true;

insert into public.review_question_catalog (question_id, active) values
  ('v13', true), ('v14', true), ('v15', true), ('v16', true),
  ('v17', true), ('v18', true)
on conflict (question_id) do update set active = excluded.active;

update public.review_question_catalog set active = false
where question_id in ('v6', 'v12');

delete from public.question_reviews
where question_id in ('v6', 'v12');

-- Wrap the already-hardened RPC implementations with an active-catalogue
-- authorization gate. The internal functions retain all original validation,
-- locking, receipt idempotency and scheduling behavior.
alter function public.seed_question_reviews(text[])
  rename to seed_active_question_reviews_internal;
revoke all on function public.seed_active_question_reviews_internal(text[]) from public, anon, authenticated;

create function public.seed_question_reviews(p_question_ids text[])
returns void language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if exists (
    select 1 from unnest(p_question_ids) requested(id)
    left join public.review_question_catalog catalog
      on catalog.question_id = requested.id and catalog.active
    where catalog.question_id is null
  ) then raise exception 'Unknown or retired question id'; end if;
  perform public.seed_active_question_reviews_internal(p_question_ids);
end;
$$;
revoke all on function public.seed_question_reviews(text[]) from public, anon;
grant execute on function public.seed_question_reviews(text[]) to authenticated;

alter function public.record_question_review(text, integer, uuid, timestamptz)
  rename to record_active_question_review_internal;
revoke all on function public.record_active_question_review_internal(text, integer, uuid, timestamptz) from public, anon, authenticated;

create function public.record_question_review(
  p_question_id text,
  p_quality integer,
  p_review_id uuid,
  p_reviewed_at timestamptz default now()
) returns public.question_reviews language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if not exists (
    select 1 from public.review_question_catalog catalog
    where catalog.question_id = p_question_id and catalog.active
  ) then raise exception 'Unknown or retired question id'; end if;
  return public.record_active_question_review_internal(
    p_question_id, p_quality, p_review_id, p_reviewed_at
  );
end;
$$;
revoke all on function public.record_question_review(text, integer, uuid, timestamptz) from public, anon;
grant execute on function public.record_question_review(text, integer, uuid, timestamptz) to authenticated;
