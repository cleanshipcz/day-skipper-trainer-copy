-- Anchorwork theory persists one canonical completion record. Register its
-- server-owned reward in the existing atomic, authenticated progress RPC.
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
    $$'ropework', 'pilotage-plan'$$,
    $$'anchorwork', 'ropework', 'pilotage-plan'$$
  );
  updated_definition := replace(
    updated_definition,
    $$when 'ropework' then 105$$,
    $$when 'anchorwork' then 100
    when 'ropework' then 105$$
  );

  if updated_definition = previous_definition
     or position($$when 'anchorwork' then 100$$ in updated_definition) = 0 then
    raise exception 'save_topic_progress anchorwork catalogue marker was not found';
  end if;

  execute updated_definition;
end;
$migration$;
