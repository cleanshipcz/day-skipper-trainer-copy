-- Ropework theory now saves progress directly under its registered root topic.
-- Keep the atomic RPC's catalogue aligned without duplicating its security-sensitive body.
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
    $$'pilotage-plan', 'nautical-terms-boat-parts'$$,
    $$'ropework', 'pilotage-plan', 'nautical-terms-boat-parts'$$
  );

  if updated_definition = previous_definition then
    raise exception 'save_topic_progress catalogue marker was not found';
  end if;

  execute updated_definition;
end;
$migration$;
