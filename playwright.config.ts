import { defineConfig, devices } from '@playwright/test';
import { API_URL, BACKEND_PORT, FRONTEND_PORT } from './e2e/support/env';

export default defineConfig({
  testDir: './e2e',
  // Journeys share one database and walk through a hotel's day in order
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  timeout: 120_000,
  expect: { timeout: 10_000 },
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL: `http://localhost:${FRONTEND_PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      // Resets the E2E database, then starts the API (see e2e/scripts/start-backend.sh)
      command: 'bash e2e/scripts/start-backend.sh',
      url: `http://localhost:${BACKEND_PORT}/health`,
      env: { E2E_BACKEND_PORT: String(BACKEND_PORT), E2E_FRONTEND_PORT: String(FRONTEND_PORT) },
      timeout: 180_000,
      reuseExistingServer: false,
      stdout: 'ignore',
      stderr: 'pipe',
    },
    {
      // A production build, like users get; NEXT_PUBLIC_* values are baked in at build time
      command: `npm run build && npx next start -p ${FRONTEND_PORT}`,
      url: `http://localhost:${FRONTEND_PORT}/login`,
      env: { NEXT_PUBLIC_API_URL: API_URL },
      timeout: 300_000,
      reuseExistingServer: false,
      stdout: 'ignore',
      stderr: 'pipe',
    },
  ],
});
