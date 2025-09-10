
JON WUZ HERE - 4 Realz

# 🍽️ Team Lunch App

Lightweight MVP to help teams pick a lunch spot: create teams, suggest restaurants or cuisine styles, vote, and view results. Built with Next.js (App Router), Supabase, and MUI.

This repository is an in-progress MVP. Recent work focused on hardening server routes, TypeScript fixes, and improving SSR safety.

## Current status (summary)
- App compiles and builds locally (Next.js 14). Static prerendering and SSR errors have been addressed.
- API routes updated to consistently use a server-side Supabase admin client (see "Notable fixes").
- TypeScript and linting run successfully across the modified files.

## Features
- Team management (add/remove members)
- Suggest restaurants or styles (Yelp-powered prepopulation)
- Vote on suggestions and tally results
- Dietary restrictions support
- Price and distance constraints
- Session history and reviews (basic)

## Tech stack
- Next.js (App Router)
- Supabase (Auth, Postgres)
- Material UI (MUI)
- Yelp Fusion & OpenRouteService (optional integrations)

## Getting started (developer) — quick ordered checklist

Follow these steps in order to get a local developer environment running:

1) Install dependencies

```bash
pnpm install
```

2) Create a Supabase project and apply the schema

```bash
# from the repo root
psql < supabase/schema.sql
```

3) Create an environment file

Create a `.env.local` (or copy from `.env.example`) in the repo root and add the values below.

Minimal required variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
# Optional / integrations
YELP_API_KEY=your-yelp-key
OPENROUTE_SERVICE_API_KEY=your-ors-key
# Helpful for scripts
TEAM_ID=your-team-id
TEAM_LAT=45.52761
TEAM_LON=-122.71472
```

4) Run the dev server

```bash
pnpm dev
```

5) Optional: prepopulate restaurants

Use the helper script to import restaurants from Yelp for a given team. It will read `.env.local` or `.env` and accepts `TEAM_ID`, `TEAM_LAT`, and `TEAM_LON`.

```bash
pnpm ts-node scripts/prepopulate-restaurants.ts
```

## Notable fixes & implementation notes
- Replaced direct `supabaseAdmin` imports with `getSupabaseAdminClient()` and instantiated the admin client inside server route handlers. This prevents incorrect client-side usage and aligns with server-only service role usage.
- Fixed several API route files under `src/app/api/*` to avoid build-time errors and TypeScript issues.
- Converted pages that used client-only hooks (`useTheme`) during prerender to server-safe implementations or moved hooks into client components to avoid SSR/runtime errors during static generation.
- `src/components/teams/TeamMembers.tsx` received a small API update: `onAddMember` is now optional and rendered for owners.
- Converted dynamic helper imports in suggestion handling to static imports for better type checking and build-time resolution.

## Tests & lint
- Run TypeScript type checking and ESLint (project scripts)

```bash
pnpm lint
pnpm build # also runs type checks
```

## Next steps / TODOs
- Expand tests (unit + integration). There are existing integration tests for Supabase in `src/__tests__`.
- Improve error handling and monitoring for external API calls.
- Add CI workflow for automated lint/build/test on PRs.

## Resources
- SUPABASE_SETUP.md — instructions for Supabase initialization
- DEPLOYMENT.md — deployment notes

## License
MIT — see [LICENSE](LICENSE)

---
Made with ❤️ by your team.
