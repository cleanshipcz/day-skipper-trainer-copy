-- Extend the server-owned progress/reward catalogue for Passage Planning.
-- Derive the replacement from the installed function so this migration keeps
-- the trust contract and grants introduced by the previous migration intact.
do $$
declare
  v_definition text;
begin
  select pg_get_functiondef(
    'public.save_topic_progress(text,boolean,integer,integer,jsonb)'::regprocedure
  ) into v_definition;

  v_definition := replace(
    v_definition,
    '''quiz-pilotage'', ''quiz-weather''',
    '''quiz-pilotage'', ''quiz-weather'', ''passage-planning-prepare'', ' ||
    '''passage-planning-calculator'', ''passage-planning-builder'', ' ||
    '''passage-planning-checklist'', ''quiz-passage-planning'''
  );
  v_definition := replace(
    v_definition,
    'when ''weather-fog'' then 10',
    'when ''weather-fog'' then 10' || chr(10) ||
    '    when ''passage-planning-prepare'' then 10' || chr(10) ||
    '    when ''passage-planning-calculator'' then 10' || chr(10) ||
    '    when ''passage-planning-builder'' then 15' || chr(10) ||
    '    when ''passage-planning-checklist'' then 10'
  );

  if position('quiz-passage-planning' in v_definition) = 0
     or (length(v_definition) - length(replace(v_definition, 'passage-planning-builder', '')))
        / length('passage-planning-builder') < 2 then
    raise exception 'Unable to extend save_topic_progress catalogue';
  end if;
  execute v_definition;
end;
$$;

revoke all on function public.save_topic_progress(text, boolean, integer, integer, jsonb) from public;
revoke all on function public.save_topic_progress(text, boolean, integer, integer, jsonb) from anon;
grant execute on function public.save_topic_progress(text, boolean, integer, integer, jsonb) to authenticated;
