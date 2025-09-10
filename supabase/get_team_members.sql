-- SECURITY DEFINER function to bypass RLS for backend membership check
create or replace function get_team_members(team_id uuid, user_id uuid)
returns setof team_members
language sql
security definer
as $$
  select * from team_members
  where team_members.team_id = get_team_members.team_id
    and team_members.user_id = get_team_members.user_id;
$$;

grant execute on function get_team_members(uuid, uuid) to anon, authenticated, service_role;
