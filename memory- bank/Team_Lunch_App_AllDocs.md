# 📄 Team Lunch App — Combined Documentation

---
# Part 1: Product Requirements Document (PRD)

**Product:** Team Lunch App  
**Goal:** Help teams vote on where to go to lunch  

---

## 1. Suggest Restaurants or Styles
**User Story:**  
As a team member, I want to suggest restaurants or cuisine styles so the group has options to consider.  

**Acceptance Criteria:**  
- Users can type in a restaurant name.  
- Users can type in a cuisine (“sushi,” “pizza”) and the app suggests nearby restaurants.  
- Suggestions appear in a shared list.  

---

## 2. Distance & Time to Walk
**User Story:**  
As a team member, I want to know how far a restaurant is and how long it takes to walk so I can judge feasibility during a lunch break.  

**Acceptance Criteria:**  
- Each restaurant displays approximate distance and walking time.  
- Distance is calculated from a team’s common starting point (e.g., office).  
- Users can filter by max walking time.  

---

## 3. Voting & Pile-On
**User Story:**  
As a team member, I want to vote for restaurants and support others’ choices so decisions are collaborative.  

**Acceptance Criteria:**  
- Users can cast a single vote per round.  
- Users can add their vote to an existing suggestion.  
- Votes update in real-time across the team.  

---

## 4. Dietary Restrictions
**User Story:**  
As a team member with dietary needs, I want the app to highlight which restaurants meet restrictions so I don’t waste time considering unsuitable options.  

**Acceptance Criteria:**  
- Each team member can set dietary restrictions (e.g., vegetarian, gluten-free).  
- Restaurants display indicators for which restrictions they support.  
- Restaurants that don’t meet restrictions are visually flagged.  

---

## 5. Restaurant Status (Busyness)
**User Story:**  
As a team member, I want to know how busy a restaurant is so I can avoid long waits.  

**Acceptance Criteria:**  
- App integrates with APIs (e.g., Google Maps, Yelp, or OpenTable) to show current wait times or crowd levels.  
- Restaurants display status like: “Busy,” “Moderate,” or “Light.”  

---

## 6. Price Point
**User Story:**  
As a team member, I want to see price estimates so I can choose an option within my budget.  

**Acceptance Criteria:**  
- Restaurants display $ / $$ / $$$ price tiers.  
- Users can filter suggestions by price range.  
- Users can vote specifically on price preferences.  

---

## 7. Results & Sorting
**User Story:**  
As a team, we want to see the voting results so we can quickly decide.  

**Acceptance Criteria:**  
- App displays winning option once voting closes.  
- Results can be sorted by: distance, price, votes, or “times visited.”  
- Random picker option (“I feel lucky”) is available.  

---

## 8. Restrictions & Team History
**User Story:**  
As a team, we want to avoid repetition and set rules so our lunches stay varied.  

**Acceptance Criteria:**  
- Teams can set restrictions: time limit, distance, or “haven’t been in X weeks.”  
- The app keeps a history of past lunches.  
- Users can review restaurants afterward (rating + comments).  

---

## 9. Team & Restaurant Management
**User Story:**  
As a team organizer, I want to manage who is in the lunch group and which restaurants are available so the app stays relevant.  

**Acceptance Criteria:**  
- Ability to add/remove team members.  
- Ability to add/remove restaurants from the pool.  
- Changes sync across the team.  

---

## 10. Post-Lunch Review
**User Story:**  
As a team member, I want to leave reviews after lunch so future decisions are better informed.  

**Acceptance Criteria:**  
- After lunch, app prompts for quick feedback.  
- Ratings and comments are stored in restaurant history.  
- Aggregate ratings influence future recommendations.  

---

# Part 2: Design Doc (MVP, Finalized)

## 1) Overview & Goals
Help teams decide lunch in ≤3 minutes: propose options, vote, apply constraints (time/price/dietary/cooldown), record history, and display the winner.

**Non-goals:** chat integrations, reservations, payments, expense features.

---

## 2) System Architecture

**Client**  
- Next.js (App Router, RSC where helpful), React 18, MUI 6  
- SWR/React Query for client data fetching & cache  
- Responsive + a11y; automatic **dark/light** mode

**Server**  
- Next.js API routes under `/api/*`  
- Supabase Auth (JWT)  
- Supabase Postgres (RLS)  
- Server-side calls to Yelp / ORS (keys never exposed)

**Data flows**  
- Client → API routes (authorized) → DB or external APIs → response  
- Distance matrix results cached; Yelp results cached (1h) keyed by `term+geo`  

**Deployment**  
- Vercel (Preview on PR, Production on main)  
- Env secrets via Vercel project settings

**Observability**  
- Vercel Analytics + Supabase logs

---

## 3) Data Model (Postgres)

```sql
create table users (
  id uuid primary key,
  email text unique not null,
  name text,
  avatar_url text,
  created_at timestamptz default now()
);

create table teams (
  id uuid primary key,
  name text not null,
  default_location_lat double precision not null,
  default_location_lng double precision not null,
  created_at timestamptz default now()
);

create table team_members (
  team_id uuid references teams(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  role text check (role in ('owner','member')) not null default 'member',
  dietary jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  primary key (team_id, user_id)
);

create table lunch_sessions (
  id uuid primary key,
  team_id uuid references teams(id) on delete cascade,
  status text check (status in ('draft','open','closed')) not null default 'draft',
  max_walk_minutes int,
  price_min int,
  price_max int,
  cooldown_days int,
  created_by uuid references users(id),
  created_at timestamptz default now(),
  closed_at timestamptz
);

create table suggestions (
  id uuid primary key,
  session_id uuid references lunch_sessions(id) on delete cascade,
  type text check (type in ('restaurant','style')) not null,
  label text not null,
  external_ref jsonb, -- e.g., yelp_id, categories, coords
  created_by uuid references users(id),
  created_at timestamptz default now()
);

create table votes (
  id uuid primary key,
  session_id uuid references lunch_sessions(id) on delete cascade,
  suggestion_id uuid references suggestions(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  weight int not null default 1,
  created_at timestamptz default now(),
  unique (session_id, user_id)
);

create table restaurants (
  id uuid primary key,
  team_id uuid references teams(id) on delete cascade,
  name text not null,
  yelp_id text,
  lat double precision,
  lng double precision,
  price_tier int,        -- 1..4
  tags text[],
  supports_dietary jsonb,
  created_at timestamptz default now()
);

create table visits (
  id uuid primary key,
  team_id uuid references teams(id) on delete cascade,
  restaurant_id uuid references restaurants(id),
  visited_at timestamptz not null default now(),
  session_id uuid references lunch_sessions(id)
);

create table reviews (
  id uuid primary key,
  team_id uuid references teams(id) on delete cascade,
  restaurant_id uuid references restaurants(id),
  user_id uuid references users(id),
  rating int check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);
```

---

## 4) External Integrations

- Yelp Fusion (places/details)  
- OpenRouteService (walking times; fallback to Haversine)  

---

## 5) API Contracts

All responses application/json. Errors: { error: { code, message } }.

Teams

POST /api/teams
Body: { name, defaultLocation: { lat, lng } }
201 → { id, name, defaultLocation }

GET /api/teams/:id
200 → { id, name, defaultLocation, members: [...], recentSessions: [...] }

POST /api/teams/:id/members
Body: { email } (adds existing user or invite stub)
200 → { teamId, user: {...} }

DELETE /api/teams/:id/members/:userId
204

Sessions

POST /api/sessions
Body: { teamId, maxWalkMinutes, priceMin, priceMax, cooldownDays }
201 → { id, status:'draft', ... }

POST /api/sessions/:id/open → 200 { status:'open' }

POST /api/sessions/:id/close → 200 { status:'closed', winner: {...}, ranking:[...] }

GET /api/sessions/:id/results → 200 { ranking:[{ suggestionId, score, breakdown, details }], winner }

Suggestions

POST /api/sessions/:id/suggestions
Body: { type:'restaurant'|'style', label }

If style, server queries Yelp near team office, upserts candidate restaurants, and returns top N.
201 → { suggestion: {...}, expanded?: [{...}] }

GET /api/sessions/:id/suggestions → 200 [{ id, type, label, external_ref, distanceMin, dietaryFit, priceTier, lastVisitedAt }]

Votes (visible)

POST /api/sessions/:id/votes
Body: { suggestionId } (idempotent; last write wins)
200 → { userId, suggestionId, tally: {...} }

GET /api/sessions/:id/votes → 200 { votes:[{ user:{id,name}, suggestionId }], tally:{ suggestionId: count } }

Reviews & History

GET /api/history?teamId=... → 200 [{ restaurant, visitedAt, ratingAvg, timesVisited }]

POST /api/reviews
Body: { restaurantId, rating, comment }
201 → { id, ... }

Utilities

GET /api/places/search?query=&lat=&lng=&price= → (server→Yelp) 200 [{ yelpId, name, coords, priceTier, categories, url }]

GET /api/distance?from=lat,lng&to=lat,lng[,to2=...] → (server→ORS) 200 { minutes:[...] }

---

## 6) Ranking & Tie-break

- Score = weighted combo (votes 0.5, dietary 0.2, distance 0.1, price 0.1, cooldown 0.05, novelty 0.03, busy 0.02)  
- Tie-breakers: dietary → distance → least recent visit → random weighted

---

## 7) UI / UX (MUI) + Component Tree

**Pages**: `/`, `/team/[id]`, `/session/[id]`, `/results/[id]`  

**Components**: `TeamSelector`, `SessionConfigurator`, `SuggestionSearchBar`, `SuggestionCard`, `VotePanel`, `SortControls`, `ResultsList`, `WinnerCard`, `ReviewDialog`  

**Theming (auto only)**  
```tsx
'use client';
import { createTheme, ThemeProvider, useMediaQuery } from '@mui/material';
import { useMemo } from 'react';

export default function Providers({ children }) {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = useMemo(
    () => createTheme({ palette: { mode: prefersDark ? 'dark' : 'light' } }),
    [prefersDark]
  );
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
```

---

## 8) Security & Privacy
- Supabase RLS per-team access  
- Server-only external API calls  
- Minimal PII stored  
- Only team office lat/lng stored  

---

## 9) Testing Plan
- Unit, integration, API, and UI tests  
- Quota resilience tests for Yelp/ORS  

---

## 10) Milestones (4-week MVP)
- W1: Scaffold + Supabase schema + auth  
- W2: Sessions + suggestions + Yelp search + distance matrix  
- W3: Voting + ranking + results + history  
- W4: Reviews + polish + theming + deploy  

---

## 11) Acceptance (MVP DoD)
- End-to-end flow works for team of ≥10  
- RLS verified  
- P95 < 2s load  
- Automatic dark/light works  
- Yelp + ORS quotas respected with fallback  

---

# Part 3: Task Breakdown (Granular, Mapped to PRD/ACs)

## 🟦 Foundation (Week 1)
- Init Next.js + TS + MUI  
- Supabase setup (auth, DB, RLS)  
- Vercel deployment + secrets  
- Yelp + ORS keys in env vars  

## 🟩 Team Management
- Teams API (create/get/add/remove members)  
- Team dashboard UI  

## 🟨 Session Lifecycle
- Sessions API (create/open/close)  
- Session config modal + session view  

## 🟧 Suggestions
- Suggestions API (restaurant/style → Yelp expansion)  
- Distance proxy (ORS + fallback)  
- UI: search bar, suggestion cards  

## 🟥 Voting
- Votes API (visible votes)  
- UI: Vote buttons + live tally panel  

## 🟪 Ranking & Results
- Ranking fn (weights + tie-breakers)  
- Results API + results page  
- Sort controls + Lucky picker  

## 🟫 Dietary Restrictions
- User dietary settings  
- Dietary fit in ranking fn  
- Dietary badges in UI  

## 🟪 History & Reviews
- Reviews API  
- History API  
- Post-lunch review dialog  
- Team dashboard history section  

## 🟦 Busyness
- Heuristic (time window + popularity)  
- Manual “looks busy” flag  
- Badge on suggestion cards  

## 🟩 UI/UX Polish & Theming
- Auto dark/light theming (no toggle)  
- Responsive layout  
- Accessibility checks  

## 🟨 QA / Testing
- Unit, integration, API, UI tests  
- Quota resilience tests  

---

# ✅ Deliverables per User Story

| User Story | Tasks |
|------------|-------|
| Suggest restaurants/styles | Suggestions API + Yelp integration + SuggestionCard UI |
| Show distance/time | Distance proxy + UI display |
| Vote/pile-on | Votes API + visible tally |
| Dietary restrictions | Profile settings + ranking fn + UI badges |
| Show busyness | Heuristic + manual flag + badge |
| Price point | Yelp price tiers + filter chips |
| Show results | Results API + Results page + Lucky picker |
| Sort/filter | Sort controls |
| Set restrictions | Session config modal |
| Display history | History API + UI |
| Manage team | Teams API + Team dashboard |
| Manage restaurants | Restaurants table + UI |
| Reviews | Review API + Review dialog |
| Random picker | Lucky picker |
| Auto theming | Dark/light from system prefs |  

---

# 📚 End of Combined Documentation
