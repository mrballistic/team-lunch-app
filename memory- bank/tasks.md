# 📋 Task Breakdown

## Foundation (Week 1)
- Init Next.js + TS + MUI
- Supabase setup (auth, DB, RLS)
- Vercel deployment + secrets
- Yelp + ORS keys in env vars

## Team Management
- Teams API (create/get/add/remove members)
- Team dashboard UI

## Session Lifecycle
- Sessions API (create/open/close)
- Session config modal + session view

## Suggestions
- Suggestions API (restaurant/style → Yelp expansion)
- Distance proxy (ORS + fallback)
- UI: search bar, suggestion cards ✅

## Voting
- Votes API (visible votes)
- UI: Vote buttons + live tally panel ✅

## Ranking & Results
- Ranking fn (weights + tie-breakers) ✅
- Results API + results page ✅
- Sort controls + Lucky picker ✅

## Dietary Restrictions
- User dietary settings
- Dietary fit in ranking fn ✅
- Dietary badges in UI ✅

## History & Reviews
- Reviews API
- History API
- Post-lunch review dialog
- Team dashboard history section

## Busyness
- Heuristic (time window + popularity)
- Manual “looks busy” flag
- Badge on suggestion cards

## UI/UX Polish & Theming
- Auto dark/light theming (no toggle) ✅
- Responsive layout ✅
- Accessibility checks ✅

## QA / Testing
- Unit, integration, API, UI tests
- Quota resilience tests
