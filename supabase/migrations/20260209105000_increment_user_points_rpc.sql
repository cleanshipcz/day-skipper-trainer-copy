create or replace function public.increment_user_points(p_user_id uuid, p_increment integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set points = coalesce(points, 0) + coalesce(p_increment, 0)
  where user_id = p_user_id;
end;
$$;

grant execute on function public.increment_user_points(uuid, integer) to authenticated;
