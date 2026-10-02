# Car Bazar — Next.js Car Marketplace

Production-oriented frontend for the Express/Prisma/Supabase backend.

## Stack
- Next.js 16.3.8 (Active LTS)
- React 19.2
- Tailwind CSS 4.3
- Zustand 5.0.15 with persistence
- TypeScript 5.9

## Run
1. Copy `.env.example` to `.env.local`.
2. Set `NEXT_PUBLIC_API_URL` to your backend API, e.g. `http://localhost:4000/api`.
3. `npm install`
4. `npm run typecheck`
5. `npm run build`
6. `npm run dev`

## Authentication/security
The backend owns authentication. The frontend never stores the JWT. Login/logout/me requests use `credentials: include`, so the HttpOnly cookie remains browser-managed. Admin APIs are protected again by the backend `requireAdmin` middleware.

For a separate production frontend/backend origin, set backend cookie settings appropriately (`Secure=true`, `SameSite=None`) and configure CORS to the exact frontend origin rather than `*`.

## State strategy
- Public car data is persisted in Zustand localStorage as a cache.
- Initial public data is loaded only when the cache is empty/stale.
- Create/update/delete/status/image operations update the Zustand store from the mutation response instead of refetching the entire collection.
- Admin identity is cached only for UI continuity; `/auth/me` remains the source of truth.
