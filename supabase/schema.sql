-- Create users table
create table public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  avatar_url text,
  created_at timestamptz default now()
);

-- Create teams table
create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  default_location_lat double precision not null,
  default_location_lng double precision not null,
  created_at timestamptz default now()
);

-- Create team_members table
create table public.team_members (
  team_id uuid references public.teams(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  role text check (role in ('owner','member')) not null default 'member',
  dietary jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  primary key (team_id, user_id)
);

-- Create lunch_sessions table
create table public.lunch_sessions (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) on delete cascade,
  status text check (status in ('draft','open','closed')) not null default 'draft',
  max_walk_minutes int,
  price_min int,
  price_max int,
  cooldown_days int,
  created_by uuid references public.users(id),
  created_at timestamptz default now(),
  closed_at timestamptz
);

-- Create suggestions table
create table public.suggestions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.lunch_sessions(id) on delete cascade,
  type text check (type in ('restaurant','style')) not null,
  label text not null,
  external_ref jsonb, -- e.g., yelp_id, categories, coords
  created_by uuid references public.users(id),
  created_at timestamptz default now()
);

-- Create votes table
create table public.votes (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.lunch_sessions(id) on delete cascade,
  suggestion_id uuid references public.suggestions(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  weight int not null default 1,
  created_at timestamptz default now(),
  unique (session_id, user_id)
);

-- Create restaurants table
create table public.restaurants (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) on delete cascade,
  name text not null,
  yelp_id text,
  lat double precision,
  lng double precision,
  price_tier int,        -- 1..4
  tags text[],
  supports_dietary jsonb,
  created_at timestamptz default now()
);

-- Create visits table
create table public.visits (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) on delete cascade,
  restaurant_id uuid references public.restaurants(id),
  visited_at timestamptz not null default now(),
  session_id uuid references public.lunch_sessions(id)
);

-- Create reviews table
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) on delete cascade,
  restaurant_id uuid references public.restaurants(id),
  user_id uuid references public.users(id),
  rating int check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.users enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.lunch_sessions enable row level security;
alter table public.suggestions enable row level security;
alter table public.votes enable row level security;
alter table public.restaurants enable row level security;
alter table public.visits enable row level security;
alter table public.reviews enable row level security;

create policy "Users can view their own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.users
  for update using (auth.uid() = id);

create policy "Users can insert their own profile" on public.users
  for insert with check (auth.uid() = id);

-- RLS Policies for teams table
create policy "Team members can view their teams" on public.teams
    exists (
      select 1 from public.team_members 
      where team_id = id and user_id = auth.uid()
    )
  );

create policy "Anyone can create teams" on public.teams
  for insert with check (true);

create policy "Team owners can update teams" on public.teams
  for update using (
    exists (
      select 1 from public.team_members 
      where team_id = id and user_id = auth.uid() and role = 'owner'
    )
  );

-- RLS Policies for team_members table
create policy "Team members can view team membership" on public.team_members
  for select using (
    exists (
      select 1 from public.team_members tm
      where tm.team_id = team_id and tm.user_id = auth.uid()
    )
  );

create policy "Team owners can manage members" on public.team_members
  for all using (
    exists (
      select 1 from public.team_members 
      where team_id = team_members.team_id and user_id = auth.uid() and role = 'owner'
    )
  );

create policy "Users can join teams" on public.team_members
  for insert with check (user_id = auth.uid());

-- RLS Policies for lunch_sessions table
create policy "Team members can view sessions" on public.lunch_sessions
  for select using (
    exists (
      select 1 from public.team_members 
      where team_id = lunch_sessions.team_id and user_id = auth.uid()
    )
  );

create policy "Team members can create sessions" on public.lunch_sessions
  for insert with check (
    exists (
      select 1 from public.team_members 
      where team_id = lunch_sessions.team_id and user_id = auth.uid()
    )
  );

create policy "Session creators can update sessions" on public.lunch_sessions
  for update using (created_by = auth.uid());

-- RLS Policies for suggestions table
create policy "Team members can view suggestions" on public.suggestions
  for select using (
    exists (
      select 1 from public.lunch_sessions ls
      join public.team_members tm on tm.team_id = ls.team_id
      where ls.id = suggestions.session_id and tm.user_id = auth.uid()
    )
  );

create policy "Team members can create suggestions" on public.suggestions
  for insert with check (
    exists (
      select 1 from public.lunch_sessions ls
      join public.team_members tm on tm.team_id = ls.team_id
      where ls.id = suggestions.session_id and tm.user_id = auth.uid()
    )
  );

-- RLS Policies for votes table
create policy "Team members can view votes" on public.votes
  for select using (
    exists (
      select 1 from public.lunch_sessions ls
      join public.team_members tm on tm.team_id = ls.team_id
      where ls.id = votes.session_id and tm.user_id = auth.uid()
    )
  );

create policy "Users can manage their own votes" on public.votes
  for all using (user_id = auth.uid());

-- RLS Policies for restaurants table
create policy "Team members can view restaurants" on public.restaurants
  for select using (
    exists (
      select 1 from public.team_members 
      where team_id = restaurants.team_id and user_id = auth.uid()
    )
  );

create policy "Team members can add restaurants" on public.restaurants
  for insert with check (
    exists (
      select 1 from public.team_members 
      where team_id = restaurants.team_id and user_id = auth.uid()
    )
  );

-- RLS Policies for visits table
create policy "Team members can view visits" on public.visits
  for select using (
    exists (
      select 1 from public.team_members 
      where team_id = visits.team_id and user_id = auth.uid()
    )
  );

create policy "Team members can record visits" on public.visits
  for insert with check (
    exists (
      select 1 from public.team_members 
      where team_id = visits.team_id and user_id = auth.uid()
    )
  );

-- RLS Policies for reviews table
create policy "Team members can view reviews" on public.reviews
  for select using (
    exists (
      select 1 from public.team_members 
      where team_id = reviews.team_id and user_id = auth.uid()
    )
  );

create policy "Users can manage their own reviews" on public.reviews
  for all using (user_id = auth.uid());
