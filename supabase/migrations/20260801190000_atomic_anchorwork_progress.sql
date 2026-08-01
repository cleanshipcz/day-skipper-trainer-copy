-- Anchorwork snapshots may be submitted by stale tabs/devices and offline
-- retries. Merge them monotonically under the same per-user/topic lock used by
-- general progress, and derive completion exclusively from the validated
-- server catalogue. The acknowledgements remain non-authoritative
-- gamification: a browser cannot cryptographically prove that a human studied.
do $migration$
declare
  function_signature constant regprocedure :=
    'public.save_topic_progress(text,boolean,integer,integer,jsonb)'::regprocedure;
  previous_definition text;
  updated_definition text;
begin
  select pg_get_functiondef(function_signature) into previous_definition;
  updated_definition := replace(
    previous_definition,
    $$'anchorwork', 'ropework', 'pilotage-plan'$$,
    $$'ropework', 'pilotage-plan'$$
  );
  updated_definition := replace(
    updated_definition,
    $$when 'anchorwork' then 100
    when 'ropework' then 105$$,
    $$when 'ropework' then 105$$
  );
  if updated_definition = previous_definition
     or position($$'anchorwork', 'ropework', 'pilotage-plan'$$ in updated_definition) > 0
     or position($$when 'anchorwork' then 100$$ in updated_definition) > 0 then
    raise exception 'generic progress anchorwork catalogue marker was not found';
  end if;
  execute updated_definition;
end;
$migration$;

create or replace function public.save_anchorwork_progress(
  p_completed_topic_ids text[]
)
returns table(points_awarded boolean, completion_awarded boolean, awarded_points integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_catalogue constant text[] := array['types', 'scope', 'procedure', 'weighing', 'swinging-room'];
  v_existing_ids text[] := array[]::text[];
  v_merged_ids text[];
  v_was_completed boolean := false;
  v_is_complete boolean;
  v_points_awarded boolean := false;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if p_completed_topic_ids is null
     or exists (
       select 1 from unnest(p_completed_topic_ids) submitted(id)
       where submitted.id is null or submitted.id <> all(v_catalogue)
     )
     or cardinality(p_completed_topic_ids) <> (
       select count(distinct submitted.id) from unnest(p_completed_topic_ids) submitted(id)
     ) then
    raise exception 'Invalid anchorwork topic IDs' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text || ':anchorwork', 0));

  select
    coalesce(up.completed, false),
    case
      when jsonb_typeof(up.answers_history) = 'object'
       and up.answers_history->>'version' = '1'
       and jsonb_typeof(up.answers_history->'completedTopicIds') = 'array'
      then array(
        select value
        from jsonb_array_elements_text(up.answers_history->'completedTopicIds') value
        where value = any(v_catalogue)
      )
      else array[]::text[]
    end
  into v_was_completed, v_existing_ids
  from public.user_progress up
  where up.user_id = v_user_id and up.topic_id = 'anchorwork';

  v_was_completed := coalesce(v_was_completed, false);
  v_existing_ids := coalesce(v_existing_ids, array[]::text[]);
  select array_agg(catalogue.id order by catalogue.ordinality)
  into v_merged_ids
  from unnest(v_catalogue) with ordinality catalogue(id, ordinality)
  where catalogue.id = any(v_existing_ids || p_completed_topic_ids);
  v_merged_ids := coalesce(v_merged_ids, array[]::text[]);
  v_is_complete := cardinality(v_merged_ids) = cardinality(v_catalogue);

  insert into public.user_progress (
    user_id, topic_id, completed, score, last_accessed, answers_history
  )
  values (
    v_user_id, 'anchorwork', v_is_complete, cardinality(v_merged_ids) * 20, now(),
    jsonb_build_object('version', 1, 'completedTopicIds', to_jsonb(v_merged_ids))
  )
  on conflict (user_id, topic_id) do update
    set completed = public.user_progress.completed or excluded.completed,
        score = greatest(coalesce(public.user_progress.score, 0), excluded.score),
        last_accessed = excluded.last_accessed,
        answers_history = excluded.answers_history;

  if v_is_complete then
    insert into public.progress_awards (user_id, topic_id, points)
    values (v_user_id, 'anchorwork', 100)
    on conflict (user_id, topic_id) do nothing
    returning true into v_points_awarded;
    if coalesce(v_points_awarded, false) then
      update public.profiles
      set points = coalesce(points, 0) + 100
      where user_id = v_user_id;
    end if;
  end if;

  return query select
    coalesce(v_points_awarded, false),
    v_is_complete and not v_was_completed,
    case when coalesce(v_points_awarded, false) then 100 else 0 end;
end;
$$;

revoke all on function public.save_anchorwork_progress(text[]) from public;
revoke all on function public.save_anchorwork_progress(text[]) from anon;
grant execute on function public.save_anchorwork_progress(text[]) to authenticated;

comment on function public.save_anchorwork_progress(text[])
is 'Monotonically merges validated Anchorwork study acknowledgements and derives non-authoritative gamification completion from the server catalogue.';
