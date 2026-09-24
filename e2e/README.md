# End-to-end tests

Playwright journeys that drive the real app the way people use it, with each person
(guest, admin, housekeeper, ...) in their own browser.

## Running

```bash
npx playwright install chromium    # once
npm run test:e2e                   # headless run
npm run test:e2e:ui                # Playwright UI: pick a test, watch it step by step
E2E_VIDEO=1 npm run test:e2e       # also record every person's screen
npm run test:e2e:report            # open the last HTML report (videos, traces)
```

Each run starts its own stack, next to the dev servers:

| Part     | Where                                   |
|----------|-----------------------------------------|
| Database | `HotelManagementE2E`, dropped and recreated every run |
| API      | http://localhost:5051 (environment `E2E`: SuperAdmin seeded, no demo data) |
| Frontend | http://localhost:3051 (production build) |

Requirements: the backend repository next to this one (`../Hotel-Management-backend`),
the .NET 9 SDK, `psql`, and a PostgreSQL server. Defaults match the local dev database
container; override with `E2E_DB_HOST`, `E2E_DB_PORT`, `E2E_DB_USER`, `E2E_DB_PASSWORD`,
`E2E_DB_NAME`, `E2E_BACKEND_DIR`, `E2E_BACKEND_PORT` and `E2E_FRONTEND_PORT`.

## Writing journeys

- Put each real-life story in `journeys/` as one test with `test.step`s named after what
  people do ("Admin approves the booking").
- Set up the world through the API (`support/api.ts`) and act through the UI
  (`support/ui.ts`). Every journey creates its own hotel, so journeys don't depend on
  each other.
- Give each person their own browser with `openBrowserFor(browser, testInfo, 'guest')`.
- Prefer roles, labels and visible text for selectors; add a `data-testid` only where an
  element has no accessible name.
