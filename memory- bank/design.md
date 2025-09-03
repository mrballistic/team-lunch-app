# 🛠️ System Design (MVP)

## Overview & Goals
Decide lunch in ≤3 minutes: propose, vote, apply constraints, record history, display winner.
Non-goals: chat, reservations, payments, expenses.

## Architecture
- **Client:** Next.js (App Router, React 18, MUI 6), SWR/React Query, responsive, auto dark/light
- **Server:** Next.js API routes, Supabase Auth (JWT), Supabase Postgres (RLS), server-only Yelp/ORS calls
- **Data Flows:** Client → API → DB/external APIs → response; cache distance & Yelp results
- **Deployment:** Vercel; env secrets via Vercel settings
- **Observability:** Vercel Analytics, Supabase logs

## Data Model (Postgres)
See `data-model.md` for full schema.

## External Integrations
- Yelp Fusion (places/details)
- OpenRouteService (walking times; fallback: Haversine)

## API Contracts
- Teams: create/get/add/remove members
- Sessions: create/open/close, results
- Suggestions: add/get, Yelp expansion
- Votes: add/get, visible tally
- Reviews & History: get/add
- Utilities: places search, distance matrix

## Ranking & Tie-break
Weighted score: votes (0.5), dietary (0.2), distance (0.1), price (0.1), cooldown (0.05), novelty (0.03), busy (0.02)
Tie-break: dietary → distance → least recent visit → random

## UI/UX
- Pages: /, /team/[id], /session/[id], /results/[id]
- Components: TeamSelector, SessionConfigurator, SuggestionSearchBar, SuggestionCard, VotePanel, SortControls, ResultsList, WinnerCard, ReviewDialog
- Theming: auto dark/light (see code in design doc)

## Security & Privacy
- Supabase RLS per-team
- Server-only API calls
- Minimal PII
- Only office lat/lng stored

## Testing Plan
- Unit, integration, API, UI tests
- Quota resilience for Yelp/ORS

## Milestones (4-week MVP)
- W1: Scaffold, Supabase schema, auth
- W2: Sessions, suggestions, Yelp, distance
- W3: Voting, ranking, results, history
- W4: Reviews, polish, theming, deploy

## Acceptance (MVP DoD)
- End-to-end for ≥10 users
- RLS verified
- P95 < 2s load
- Auto dark/light
- Yelp/ORS quotas respected
