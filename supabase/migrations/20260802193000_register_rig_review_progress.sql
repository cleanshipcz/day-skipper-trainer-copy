-- Register the zero-reward Rig learning review independently from both the
-- historical `rig` theory row and canonical `quiz-rig` assessment progress.
do $$
declare v_definition text;
begin
  select pg_get_functiondef('public.save_topic_progress(text,boolean,integer,integer,jsonb)'::regprocedure) into v_definition;
  v_definition := replace(v_definition, '''quiz-engine'', ''quiz-rig''', '''quiz-engine'', ''rig-review'', ''quiz-rig''');
  if position('''rig-review''' in v_definition) = 0 then raise exception 'Unable to register rig-review progress'; end if;
  execute v_definition;
end;
$$;
revoke all on function public.save_topic_progress(text, boolean, integer, integer, jsonb) from public, anon;
grant execute on function public.save_topic_progress(text, boolean, integer, integer, jsonb) to authenticated;
