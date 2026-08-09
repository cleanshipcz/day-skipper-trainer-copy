-- Register the route-owned Tides leaf IDs and reconcile the two historical
-- aliases.  Merge before deleting so a stronger completion is never lost.
update public.user_progress canonical
set completed = canonical.completed or legacy.completed,
    score = greatest(canonical.score, legacy.score),
    last_accessed = greatest(canonical.last_accessed, legacy.last_accessed),
    answers_history = case
      when legacy.completed and not canonical.completed then legacy.answers_history
      else coalesce(canonical.answers_history, legacy.answers_history)
    end
from public.user_progress legacy
where canonical.user_id = legacy.user_id
  and canonical.topic_id = 'tides-heights-calc'
  and legacy.topic_id = 'tidal-heights-calc';

update public.user_progress
set topic_id = 'tides-heights-calc'
where topic_id = 'tidal-heights-calc'
  and not exists (
    select 1 from public.user_progress canonical
    where canonical.user_id = user_progress.user_id
      and canonical.topic_id = 'tides-heights-calc'
  );

delete from public.user_progress where topic_id = 'tidal-heights-calc';

-- vector-triangle was an unregistered duplicate for the vector-tool route.
update public.user_progress canonical
set completed = canonical.completed or legacy.completed,
    score = greatest(canonical.score, legacy.score),
    last_accessed = greatest(canonical.last_accessed, legacy.last_accessed),
    answers_history = case
      when legacy.completed and not canonical.completed then legacy.answers_history
      else coalesce(canonical.answers_history, legacy.answers_history)
    end
from public.user_progress legacy
where canonical.user_id = legacy.user_id
  and canonical.topic_id = 'tides-vector-tool'
  and legacy.topic_id = 'vector-triangle';

update public.user_progress
set topic_id = 'tides-vector-tool'
where topic_id = 'vector-triangle'
  and not exists (
    select 1 from public.user_progress canonical
    where canonical.user_id = user_progress.user_id
      and canonical.topic_id = 'tides-vector-tool'
  );

delete from public.user_progress where topic_id = 'vector-triangle';

-- Award identities follow the same canonical keys. Existing canonical awards
-- win, preventing a historical alias from becoming a second reward.
delete from public.progress_awards legacy
where legacy.topic_id in ('tidal-heights-calc', 'vector-triangle')
  and exists (
    select 1 from public.progress_awards canonical
    where canonical.user_id = legacy.user_id
      and canonical.topic_id = case legacy.topic_id
        when 'tidal-heights-calc' then 'tides-heights-calc'
        else 'tides-vector-tool'
      end
  );

update public.progress_awards
set topic_id = case topic_id
  when 'tidal-heights-calc' then 'tides-heights-calc'
  when 'vector-triangle' then 'tides-vector-tool'
end
where topic_id in ('tidal-heights-calc', 'vector-triangle');

-- Preserve the already-hardened function body while changing only its topic
-- catalogue. This avoids drifting from later security fixes to the RPC.
do $$
declare
  definition text;
begin
  select pg_get_functiondef('public.save_topic_progress(text,boolean,integer,integer,jsonb)'::regprocedure)
    into definition;
  definition := replace(definition, '''tidal-heights-calc''', '''tides-heights-calc''');
  definition := replace(definition, ''', ''vector-triangle''', '');
  execute definition;
end;
$$;
