create table public.review_question_catalog (
  question_id text primary key check (char_length(question_id) between 1 and 160)
);

-- Server-owned catalogue mirrors the stable IDs in src/data/quizzes. Clients cannot extend it.
insert into public.review_question_catalog (question_id)
select prefix || number
from (values
  ('a', 12), ('cr', 20), ('e', 12), ('fire', 8), ('flare', 10), ('ls', 20),
  ('mob', 12), ('pilotage-', 20), ('r', 12), ('raft', 10), ('rg', 12),
  ('safety-fire', 4), ('safety-flare', 4), ('safety-gas', 4), ('safety-mob', 4),
  ('safety-personal', 4), ('safety-raft', 4), ('v', 12)
) as ranges(prefix, maximum)
cross join lateral generate_series(1, maximum) as number;

insert into public.review_question_catalog (question_id) values
  ('nt-backstay'), ('nt-beam'), ('nt-boom'), ('nt-bow'), ('nt-cockpit'), ('nt-deck'),
  ('nt-forestay'), ('nt-hull'), ('nt-jib'), ('nt-keel'), ('nt-mainsail'), ('nt-mast'),
  ('nt-port'), ('nt-rudder'), ('nt-shrouds'), ('nt-spreaders'), ('nt-starboard-light'),
  ('nt-stern'), ('nt-telltales'), ('nt-tiller');

revoke all on public.review_question_catalog from anon, authenticated;

create table public.question_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id text not null references public.review_question_catalog(question_id),
  ease_factor double precision not null default 2.5 check (ease_factor >= 1.3 and ease_factor <= 5),
  interval_days integer not null default 0 check (interval_days >= 0 and interval_days <= 36500),
  repetitions integer not null default 0 check (repetitions >= 0 and repetitions <= 100000),
  next_review_at timestamptz not null default now(),
  last_reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, question_id)
);

create index question_reviews_user_due_idx on public.question_reviews (user_id, next_review_at);
alter table public.question_reviews enable row level security;
create policy "Users read own reviews" on public.question_reviews
  for select to authenticated using (auth.uid() = user_id);
revoke insert, update, delete on public.question_reviews from authenticated;
grant select on public.question_reviews to authenticated;

-- Receipts are intentionally retained: deleting an idempotency key would make an old replay unsafe.
create table public.question_review_receipts (
  user_id uuid not null references auth.users(id) on delete cascade,
  review_id uuid not null,
  question_id text not null references public.review_question_catalog(question_id),
  quality integer not null check (quality between 0 and 5),
  reviewed_at timestamptz not null,
  result jsonb not null,
  created_at timestamptz not null default now(),
  primary key (user_id, review_id)
);
alter table public.question_review_receipts enable row level security;
revoke all on public.question_review_receipts from anon, authenticated;

create or replace function public.seed_question_reviews(p_question_ids text[])
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare
  current_user_id uuid := auth.uid();
  requested_count integer := coalesce(array_length(p_question_ids, 1), 0);
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if requested_count > 100 then raise exception 'Too many question ids'; end if;
  if exists (
    select 1 from unnest(p_question_ids) requested(id)
    left join public.review_question_catalog catalog on catalog.question_id = requested.id
    where catalog.question_id is null
  ) then raise exception 'Unknown question id'; end if;

  insert into public.question_reviews (user_id, question_id)
  select current_user_id, id from (select distinct unnest(p_question_ids) as id) values_to_seed
  where (select count(*) from public.question_reviews where user_id = current_user_id) < 204
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
  prior_receipt public.question_review_receipts;
  new_ease double precision;
  new_interval integer;
  new_repetitions integer;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_quality is null or p_quality < 0 or p_quality > 5 then
    raise exception 'quality must be an integer between 0 and 5';
  end if;
  if not exists (select 1 from public.review_question_catalog where question_id = p_question_id) then
    raise exception 'Unknown question id';
  end if;
  if p_review_id is null then raise exception 'Review id required'; end if;
  if p_reviewed_at > now() + interval '5 minutes' or p_reviewed_at < now() - interval '30 days' then
    raise exception 'Invalid review timestamp';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(current_user_id::text || ':event:' || p_review_id::text, 0));
  select * into prior_receipt from public.question_review_receipts
  where user_id = current_user_id and review_id = p_review_id;
  if found then
    if prior_receipt.question_id <> p_question_id or prior_receipt.quality <> p_quality
      or prior_receipt.reviewed_at <> p_reviewed_at then
      raise exception 'Review id already used with different payload';
    end if;
    return jsonb_populate_record(null::public.question_reviews, prior_receipt.result);
  end if;

  -- Serialize pruning/capacity. The RPC accepts only the last 30 days, so 31-day
  -- receipts retain a conservative replay margin while recovering capacity forever.
  perform pg_advisory_xact_lock(hashtextextended(current_user_id::text || ':receipt-capacity', 0));
  delete from public.question_review_receipts
  where user_id = current_user_id and reviewed_at < now() - interval '31 days';
  if (select count(*) from public.question_review_receipts where user_id = current_user_id) >= 5000 then
    raise exception 'Review receipt limit reached';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(current_user_id::text || ':question:' || p_question_id, 0));
  insert into public.question_reviews (user_id, question_id)
  values (current_user_id, p_question_id)
  on conflict (user_id, question_id) do nothing;

  select * into current_review from public.question_reviews
  where user_id = current_user_id and question_id = p_question_id for update;

  -- A late first delivery is receipted as a deterministic no-op. It can never
  -- rewind a schedule produced by a newer event, and its own replay is stable.
  if current_review.last_reviewed_at is not null and p_reviewed_at <= current_review.last_reviewed_at then
    insert into public.question_review_receipts
      (user_id, review_id, question_id, quality, reviewed_at, result)
    values (current_user_id, p_review_id, p_question_id, p_quality, p_reviewed_at, to_jsonb(current_review));
    return current_review;
  end if;

  new_ease := greatest(1.3, current_review.ease_factor +
    (0.1 - (5 - p_quality) * (0.08 + (5 - p_quality) * 0.02)));
  if p_quality < 3 then
    new_repetitions := 0; new_interval := 1;
  else
    new_repetitions := current_review.repetitions + 1;
    new_interval := case new_repetitions when 1 then 1 when 2 then 6
      else least(36500, greatest(1, round(current_review.interval_days * new_ease)::integer)) end;
  end if;

  update public.question_reviews set
    ease_factor = new_ease, interval_days = new_interval, repetitions = new_repetitions,
    next_review_at = p_reviewed_at + make_interval(days => new_interval),
    last_reviewed_at = p_reviewed_at, updated_at = now()
  where id = current_review.id returning * into current_review;

  insert into public.question_review_receipts
    (user_id, review_id, question_id, quality, reviewed_at, result)
  values (current_user_id, p_review_id, p_question_id, p_quality, p_reviewed_at, to_jsonb(current_review));
  return current_review;
end;
$$;

revoke all on function public.seed_question_reviews(text[]) from public;
revoke all on function public.record_question_review(text, integer, uuid, timestamptz) from public;
grant execute on function public.seed_question_reviews(text[]) to authenticated;
grant execute on function public.record_question_review(text, integer, uuid, timestamptz) to authenticated;
