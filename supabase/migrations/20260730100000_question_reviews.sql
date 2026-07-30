create table public.question_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id text not null check (char_length(question_id) between 1 and 160),
  ease_factor double precision not null default 2.5 check (ease_factor >= 1.3 and ease_factor <= 5),
  interval_days integer not null default 0 check (interval_days >= 0 and interval_days <= 36500),
  repetitions integer not null default 0 check (repetitions >= 0 and repetitions <= 100000),
  next_review_at timestamptz not null default now(),
  last_reviewed_at timestamptz,
  last_review_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, question_id)
);

create index question_reviews_user_due_idx on public.question_reviews (user_id, next_review_at);

alter table public.question_reviews enable row level security;
create policy "Users manage own reviews" on public.question_reviews
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.seed_question_reviews(p_question_ids text[])
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare current_user_id uuid := auth.uid();
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if coalesce(array_length(p_question_ids, 1), 0) > 100 then raise exception 'Too many question ids'; end if;
  if exists (select 1 from unnest(p_question_ids) id where char_length(id) not between 1 and 160) then
    raise exception 'Invalid question id';
  end if;
  insert into public.question_reviews (user_id, question_id)
  select current_user_id, id from (select distinct unnest(p_question_ids) as id) values_to_seed
  on conflict (user_id, question_id) do nothing;
end;
$$;

create or replace function public.record_question_review(
  p_question_id text,
  p_quality integer,
  p_review_id uuid,
  p_reviewed_at timestamptz default now()
) returns public.question_reviews language plpgsql security definer set search_path = public, pg_temp as $$
declare
  current_user_id uuid := auth.uid();
  current_review public.question_reviews;
  new_ease double precision;
  new_interval integer;
  new_repetitions integer;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_quality is null or p_quality < 0 or p_quality > 5 then
    raise exception 'quality must be an integer between 0 and 5';
  end if;
  if p_question_id is null or char_length(p_question_id) not between 1 and 160 then
    raise exception 'Invalid question id';
  end if;
  if p_review_id is null then raise exception 'Review id required'; end if;
  if p_reviewed_at > now() + interval '5 minutes' or p_reviewed_at < now() - interval '30 days' then
    raise exception 'Invalid review timestamp';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(current_user_id::text || ':' || p_question_id, 0));
  insert into public.question_reviews (user_id, question_id)
  values (current_user_id, p_question_id)
  on conflict (user_id, question_id) do nothing;

  select * into current_review from public.question_reviews
  where user_id = current_user_id and question_id = p_question_id for update;
  if current_review.last_review_id = p_review_id then return current_review; end if;

  new_ease := greatest(1.3, current_review.ease_factor +
    (0.1 - (5 - p_quality) * (0.08 + (5 - p_quality) * 0.02)));
  if p_quality < 3 then
    new_repetitions := 0; new_interval := 1;
  else
    new_repetitions := current_review.repetitions + 1;
    new_interval := case new_repetitions when 1 then 1 when 2 then 6
      else greatest(1, round(current_review.interval_days * new_ease)::integer) end;
  end if;

  update public.question_reviews set
    ease_factor = new_ease, interval_days = new_interval, repetitions = new_repetitions,
    next_review_at = p_reviewed_at + make_interval(days => new_interval),
    last_reviewed_at = p_reviewed_at, last_review_id = p_review_id, updated_at = now()
  where id = current_review.id returning * into current_review;
  return current_review;
end;
$$;

revoke all on function public.seed_question_reviews(text[]) from public;
revoke all on function public.record_question_review(text, integer, uuid, timestamptz) from public;
grant execute on function public.seed_question_reviews(text[]) to authenticated;
grant execute on function public.record_question_review(text, integer, uuid, timestamptz) to authenticated;
