import { Browser, expect, Locator, Page, TestInfo } from '@playwright/test';
import { Account, fullName } from './api';

/**
 * A separate browser (own cookies and storage) for one person in the scenario.
 * Set E2E_VIDEO=1 to record every person's screen into the test results.
 */
export async function openBrowserFor(browser: Browser, testInfo: TestInfo, person: string) {
  const context = await browser.newContext({
    baseURL: testInfo.project.use.baseURL,
    recordVideo: process.env.E2E_VIDEO ? { dir: testInfo.outputPath(`video-${person}`) } : undefined,
  });
  const page = await context.newPage();

  return {
    page,
    async close() {
      const video = page.video();
      await context.close();
      if (video) await testInfo.attach(`video: ${person}`, { path: await video.path(), contentType: 'video/webm' });
    },
  };
}

export async function signIn(page: Page, account: Account) {
  await page.goto('/login');
  await page.getByPlaceholder('Enter your email').fill(account.email);
  await page.getByPlaceholder('Enter your password').fill(account.password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  // /dashboard sends each role to its own landing page
  await page.waitForURL(/\/dashboard\/.+/);
}

export async function goTo(page: Page, navItem: string) {
  await page.getByRole('link', { name: navItem, exact: true }).click();
}

/** Opens a Radix select and picks an option */
export async function choose(page: Page, trigger: Locator, option: string | RegExp) {
  await trigger.click();
  await page.getByRole('option', { name: option }).click();
}

/** Local calendar date, days from today, as yyyy-MM-dd */
export function dateFromToday(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export const reservationRow = (page: Page, guest: Account) =>
  page.getByRole('row').filter({ hasText: fullName(guest) });

export async function expectToast(page: Page, message: string) {
  await expect(page.getByText(message).first()).toBeVisible();
}
