# Hotel Management — Frontend

Web app for the Hotel Management system: role-based dashboards for platform admins, hotel
admins/managers, housekeepers and guests. Talks to the ASP.NET Core API in the separate
`Hotel-Management-backend` repository.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui (Radix) ·
TanStack Query · Zustand · date-fns · Recharts

## Running locally

```bash
npm ci
echo "NEXT_PUBLIC_API_URL=http://localhost:5213/api" > .env.local   # backend started with `dotnet run`
npm run dev                                                          # http://localhost:3000
```

Without `NEXT_PUBLIC_API_URL` the app calls `http://localhost:5001/api` (the Docker Compose port).
In development the login page lists the seeded demo accounts for each role.

| Script          | What it does |
|-----------------|--------------|
| `npm run dev`   | Dev server with Turbopack |
| `npm run build` | Production build (type-checked) |
| `npm start`     | Serve the production build |
| `npm run lint`  | ESLint |
| `npm run test:e2e` | End-to-end journeys with Playwright (see [e2e/README.md](e2e/README.md)) |

## What each role sees

| Role        | Lands on                     | Navigation |
|-------------|------------------------------|------------|
| SuperAdmin  | `/dashboard/super-admin`     | Users, hotels, subscriptions |
| Admin / Manager | `/dashboard/admin`       | Calendar, availability, hotels, rooms, reservations, guests, walk-in, inventory, housekeeping, reports; Admins also Staff and Billing |
| Housekeeper | `/dashboard/housekeeping`    | Housekeeping tasks for their hotel |
| Guest       | `/dashboard/reservations`    | Their reservations, availability, calendar |

The API enforces all access rules; the UI only hides what a role can't use (`hooks/usePermissions.ts`).

Public pages: `/pricing` and `/register-hotel` (hotel owners sign up for a 30-day trial). When the API
refuses something because of the owner's plan (402), `PlanLimitDialog` offers the upgrade, and
`SubscriptionBanner` warns owners about ending trials and failed payments. Until a real payment
provider is connected, `/dashboard/billing/checkout` is a test checkout that charges nothing.

## Project layout

```
app/                 Routes (App Router). (auth)/ = login/register, dashboard/ = the app
components/          UI: ui/ (shadcn primitives), layout/, dashboard/, reservations/, rooms/, auth/
hooks/               TanStack Query hooks per resource
lib/api/             Axios API client and one module per backend resource
lib/utils/           Date helpers
store/authStore.ts   Session (token + user), persisted to localStorage
types/               API types and enums (mirror the backend DTOs)
```

## Conventions

- **Session:** `store/authStore.ts` is the only place the token lives. The API client attaches it,
  and on a 401 (outside login/register) signs out and redirects to `/login`. Expired stored
  sessions are dropped on page load.
- **Stay dates** are hotel wall-clock values. Overnight stays are sent as `YYYY-MM-DD`, short stays
  as `YYYY-MM-DDTHH:mm`, without converting to UTC.
- **Money:** payments and refunds go through the reservation payment endpoints and show up in the
  reservation's payment history; reservation edits never change amounts paid.

## Deployment

Build with `NEXT_PUBLIC_API_URL` set to the public API URL (it's baked in at build time).
The `Dockerfile` takes it as a build argument; see the backend's `docker-compose.yml`.

Product direction and planned features: [ROADMAP.md](ROADMAP.md).
