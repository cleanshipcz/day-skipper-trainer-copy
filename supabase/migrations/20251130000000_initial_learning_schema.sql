-- The original Supabase project was created in the hosted dashboard, so its
-- foundational tables predated the first checked-in migration. Reconstruct
-- that baseline for clean local resets. IF NOT EXISTS keeps this migration
-- safe when it is deployed to an existing hosted project.
do $$
declare
  created_profiles boolean := to_regclass('public.profiles') is null;
  created_progress boolean := to_regclass('public.user_progress') is null;
  created_scores boolean := to_regclass('public.quiz_scores') is null;
begin
  create table if not exists public.profiles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null unique references auth.users(id) on delete cascade,
    username text not null,
    display_name text,
    avatar_url text,
    learning_preferences jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  );

  create table if not exists public.user_progress (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    topic_id text not null,
    completed boolean default false,
    score integer default 0,
    last_accessed timestamptz,
    created_at timestamptz not null default now()
  );

  create table if not exists public.quiz_scores (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    topic_id text not null,
    score integer not null,
    total_questions integer not null,
    percentage integer not null,
    completed_at timestamptz not null default now()
  );

  -- Do not restore broad legacy grants when this backfilled migration reaches
  -- an existing project whose later migrations have already tightened them.
  if created_profiles then
    alter table public.profiles enable row level security;
    grant select, insert, update, delete on public.profiles to authenticated;
  end if;
  if created_progress then
    alter table public.user_progress enable row level security;
    grant select, insert, update, delete on public.user_progress to authenticated;
  end if;
  if created_scores then
    alter table public.quiz_scores enable row level security;
    grant select, insert, update, delete on public.quiz_scores to authenticated;
  end if;

  if created_profiles and not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles'
      and policyname = 'Users can manage their own profile'
  ) then
    create policy "Users can manage their own profile"
      on public.profiles for all to authenticated
      using ((select auth.uid()) = user_id)
      with check ((select auth.uid()) = user_id);
  end if;

  if created_progress and not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'user_progress'
      and policyname = 'Users can manage their own progress'
  ) then
    create policy "Users can manage their own progress"
      on public.user_progress for all to authenticated
      using ((select auth.uid()) = user_id)
      with check ((select auth.uid()) = user_id);
  end if;

  if created_scores and not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'quiz_scores'
      and policyname = 'Users can manage their own quiz scores'
  ) then
    create policy "Users can manage their own quiz scores"
      on public.quiz_scores for all to authenticated
      using ((select auth.uid()) = user_id)
      with check ((select auth.uid()) = user_id);
  end if;
end
$$;
