-- Practice remains diagnostic after mastery: permit checkpoint/metric updates
-- while completion is monotonic and no reward ledger entry can be created.
do $migration$
declare
  signature constant regprocedure := 'public.save_topic_progress(text,boolean,integer,integer,jsonb)'::regprocedure;
  old_definition text;
  new_definition text;
begin
  select pg_get_functiondef(signature) into old_definition;
  new_definition := replace(old_definition, $$'anchorwork-practice', 'ropework', 'pilotage-plan'$$, $$'ropework', 'pilotage-plan'$$);
  if new_definition = old_definition or position($$'anchorwork-practice', 'ropework', 'pilotage-plan'$$ in new_definition) > 0 then
    raise exception 'generic anchor practice catalogue marker was not found';
  end if;
  execute new_definition;
end;
$migration$;

create or replace function public.save_anchorwork_practice_progress(
  p_completed boolean,
  p_score integer,
  p_answers_history jsonb
)
returns table(points_awarded boolean, completion_awarded boolean, awarded_points integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_was_completed boolean := false;
  v_attempts integer;
  v_failures integer;
  v_family_count integer;
  v_submitted_family_count integer;
  v_is_complete boolean;
  v_existing_history jsonb := '{}'::jsonb;
  v_merged_families jsonb;
  v_seed bigint;
  v_index integer;
  v_identity text;
  v_identity_family text;
  v_existing_seed bigint := -1;
  v_existing_index integer := -1;
  v_use_incoming_checkpoint boolean;
begin
  if v_user_id is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if p_score < 0 or p_score > 100 then raise exception 'Score must be between 0 and 100' using errcode = '22023'; end if;
  if jsonb_typeof(p_answers_history) <> 'object'
     or jsonb_typeof(p_answers_history->'version') <> 'number'
     or p_answers_history->>'version' <> '1'
     or jsonb_typeof(p_answers_history->'completedFamilies') <> 'array'
     or jsonb_typeof(p_answers_history->'attempts') <> 'number'
     or jsonb_typeof(p_answers_history->'failedChecks') <> 'number'
     or jsonb_typeof(p_answers_history->'scenarioSeed') <> 'number'
     or jsonb_typeof(p_answers_history->'sequenceIndex') <> 'number'
     or coalesce(p_answers_history->>'scenarioIdentity', '') = ''
     or pg_column_size(p_answers_history) > 65536 then
    raise exception 'Invalid anchor practice progress' using errcode = '22023';
  end if;
  v_attempts := (p_answers_history->>'attempts')::integer;
  v_failures := (p_answers_history->>'failedChecks')::integer;
  if (p_answers_history->>'scenarioSeed') !~ '^\d+$'
     or (p_answers_history->>'scenarioSeed')::numeric > 4294967295
     or (p_answers_history->>'sequenceIndex') !~ '^\d+$'
     or (p_answers_history->>'sequenceIndex')::numeric > 2147483647 then
    raise exception 'Invalid anchor practice checkpoint bounds' using errcode = '22023';
  end if;
  v_seed := (p_answers_history->>'scenarioSeed')::bigint;
  v_index := (p_answers_history->>'sequenceIndex')::integer;
  v_identity := p_answers_history->>'scenarioIdentity';
  v_identity_family := substring(v_identity from '([a-z]+)$');
  if v_identity_family is null
     or v_identity_family <> all(array['sheltered', 'harbour', 'exposed', 'tidal'])
     or v_identity <> format('anchor-%s-%s-%s-%s', v_seed, v_index / 4 + 1, v_index % 4 + 1, v_identity_family) then
    raise exception 'Invalid anchor practice scenario identity' using errcode = '22023';
  end if;
  select count(distinct family)::integer, count(*)::integer into v_family_count, v_submitted_family_count
  from jsonb_array_elements_text(p_answers_history->'completedFamilies') family
  where family = any(array['sheltered', 'harbour', 'exposed', 'tidal']);
  if v_family_count <> v_submitted_family_count
     or v_submitted_family_count <> jsonb_array_length(p_answers_history->'completedFamilies') then
    raise exception 'Invalid anchor practice families' using errcode = '22023';
  end if;
  v_is_complete := v_family_count = 4;
  if v_attempts < 0 or v_failures < 0 or v_failures > v_attempts then
    raise exception 'Invalid anchor practice diagnostics' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text || ':anchorwork-practice', 0));
  select coalesce(completed, false), coalesce(answers_history, '{}'::jsonb)
    into v_was_completed, v_existing_history from public.user_progress
    where user_id = v_user_id and topic_id = 'anchorwork-practice';
  v_was_completed := coalesce(v_was_completed, false);

  select coalesce(jsonb_agg(catalogue.family order by catalogue.ordinality), '[]'::jsonb)
    into v_merged_families
  from unnest(array['sheltered', 'harbour', 'exposed', 'tidal']) with ordinality catalogue(family, ordinality)
  where catalogue.family in (
    select jsonb_array_elements_text(p_answers_history->'completedFamilies')
    union
    select jsonb_array_elements_text(case when jsonb_typeof(v_existing_history->'completedFamilies') = 'array' then v_existing_history->'completedFamilies' else '[]'::jsonb end)
  );
  v_family_count := jsonb_array_length(v_merged_families);
  v_is_complete := v_was_completed or v_family_count = 4;
  v_attempts := greatest(v_attempts, case when (v_existing_history->>'attempts') ~ '^\d+$' then (v_existing_history->>'attempts')::integer else 0 end);
  v_failures := greatest(v_failures, case when (v_existing_history->>'failedChecks') ~ '^\d+$' then (v_existing_history->>'failedChecks')::integer else 0 end);
  v_attempts := greatest(v_attempts, v_failures);
  if (v_existing_history->>'scenarioSeed') ~ '^\d+$' then v_existing_seed := (v_existing_history->>'scenarioSeed')::bigint; end if;
  if (v_existing_history->>'sequenceIndex') ~ '^\d+$' then v_existing_index := (v_existing_history->>'sequenceIndex')::integer; end if;
  v_use_incoming_checkpoint := v_index > v_existing_index or (v_index = v_existing_index and v_seed >= v_existing_seed);
  if not v_use_incoming_checkpoint then
    p_answers_history := jsonb_set(jsonb_set(jsonb_set(p_answers_history, '{scenarioSeed}', v_existing_history->'scenarioSeed'), '{sequenceIndex}', v_existing_history->'sequenceIndex'), '{scenarioIdentity}', v_existing_history->'scenarioIdentity');
  end if;
  p_answers_history := jsonb_set(jsonb_set(jsonb_set(p_answers_history, '{completedFamilies}', v_merged_families), '{attempts}', to_jsonb(v_attempts)), '{failedChecks}', to_jsonb(v_failures));

  insert into public.user_progress(user_id, topic_id, completed, score, last_accessed, answers_history)
  values(v_user_id, 'anchorwork-practice', v_is_complete, v_family_count * 25, now(), p_answers_history)
  on conflict (user_id, topic_id) do update set
    completed = public.user_progress.completed or excluded.completed,
    score = greatest(coalesce(public.user_progress.score, 0), excluded.score),
    last_accessed = excluded.last_accessed,
    answers_history = excluded.answers_history;

  return query select false, v_is_complete and not v_was_completed, 0;
end;
$$;

revoke all on function public.save_anchorwork_practice_progress(boolean, integer, jsonb) from public, anon;
grant execute on function public.save_anchorwork_practice_progress(boolean, integer, jsonb) to authenticated;
