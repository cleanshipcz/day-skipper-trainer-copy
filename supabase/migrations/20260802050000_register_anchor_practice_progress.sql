-- Practice evidence is diagnostic and deliberately carries no points. Register
-- its durable key so authenticated attempts can use the atomic/idempotent RPC.
do $migration$
declare
  function_signature constant regprocedure := 'public.save_topic_progress(text,boolean,integer,integer,jsonb)'::regprocedure;
  previous_definition text;
  updated_definition text;
begin
  select pg_get_functiondef(function_signature) into previous_definition;
  updated_definition := replace(previous_definition, $$'ropework', 'pilotage-plan'$$, $$'anchorwork-practice', 'ropework', 'pilotage-plan'$$);
  if updated_definition = previous_definition or position($$'anchorwork-practice', 'ropework', 'pilotage-plan'$$ in updated_definition) = 0 then
    raise exception 'save_topic_progress practice catalogue marker was not found';
  end if;
  execute updated_definition;
end;
$migration$;

