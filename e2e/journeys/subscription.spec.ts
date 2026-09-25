import { expect, Page, test } from '@playwright/test';
import { Account, apiGet, apiLogin, registerOwner } from '../support/api';
import { SUPER_ADMIN } from '../support/env';
import { choose, goTo, openBrowserFor, signIn } from '../support/ui';

interface BillingOverview {
  currentPlan: string;
  status: string;
  accessUntil: string;
}

async function addHotel(page: Page, name: string) {
  await page.getByLabel('Hotel Name *').fill(name);
  await page.getByLabel('Address *').fill('Kej Makedonija 1');
  await page.getByLabel('City *').fill('Ohrid');
  await page.getByLabel('Country *').fill('North Macedonia');
  await page.getByRole('button', { name: 'Create Hotel' }).click();
}

/**
 * A hotel owner's subscription from sign-up to support: the owner signs up on their own,
 * pays for Starter at the (test) checkout, outgrows it and upgrades, adds a housekeeper,
 * and the platform's SuperAdmin extends their plan after a problem at the hotel.
 */
test('an owner signs up, pays, upgrades when they outgrow their plan, and support extends it', async ({ browser, request }, testInfo) => {
  const runId = Date.now().toString(36);
  const owner: Account = { email: `owner.${runId}@e2e.test`, password: 'Passw0rd', firstName: 'Ана', lastName: 'Петровска' };

  const ownerBrowser = await openBrowserFor(browser, testInfo, 'owner');
  const support = await openBrowserFor(browser, testInfo, 'superadmin');
  const page = ownerBrowser.page;

  try {
    await test.step('Owner signs up and starts a free trial', async () => {
      await page.goto('/pricing');
      await expect(page.getByRole('heading', { name: 'Starter' })).toBeVisible();
      await page.getByRole('link', { name: 'Start free trial' }).first().click();

      await page.getByLabel('First name').fill(owner.firstName);
      await page.getByLabel('Last name').fill(owner.lastName);
      await page.getByLabel('Email').fill(owner.email);
      await page.getByLabel('Password', { exact: true }).fill(owner.password);
      await page.getByLabel('Confirm password').fill(owner.password);
      await page.getByRole('button', { name: 'Start free trial' }).click();

      await expect(page.getByText('Welcome! Your 30-day trial of every feature has started.')).toBeVisible();
    });

    await test.step('Owner adds their first hotel', async () => {
      await addHotel(page, `Lakeview Ohrid ${runId}`);
      await expect(page).toHaveURL(/\/dashboard\/hotels$/);
    });

    await test.step('Owner pays for Starter at the test checkout', async () => {
      await goTo(page, 'Billing');
      await expect(page.getByText(/Trial ends .* \(30 days left\)/)).toBeVisible();
      await page.getByRole('button', { name: 'Choose Starter' }).click();

      await expect(page.getByText('Test checkout.')).toBeVisible();
      await page.getByRole('button', { name: 'Try a declined card' }).click();
      await expect(page.getByText('The card was declined (test). Nothing was charged.')).toBeVisible();

      await page.getByRole('button', { name: 'Pay €12' }).click();
      await expect(page.getByText("Payment received. You're on the Starter plan.")).toBeVisible();
      // Starter allows one hotel, and the owner has one
      const hotels = page.getByRole('progressbar', { name: 'Hotels' });
      await expect(hotels).toHaveAttribute('aria-valuenow', '1');
      await expect(hotels).toHaveAttribute('aria-valuemax', '1');
    });

    await test.step('A second hotel is beyond Starter, and the app offers Pro', async () => {
      await page.goto('/dashboard/hotels/new');
      await addHotel(page, `Lakeview Struga ${runId}`);

      const dialog = page.getByRole('dialog');
      await expect(dialog.getByRole('heading', { name: 'Available on Pro' })).toBeVisible();
      await expect(dialog).toContainText('The Starter plan includes up to 1 hotel');
      await dialog.getByRole('link', { name: 'See plans' }).click();
    });

    await test.step('Owner upgrades to Pro and adds the second hotel', async () => {
      await expect(page).toHaveURL(/\/dashboard\/billing$/);
      await page.getByRole('button', { name: 'Upgrade to Pro' }).click();
      await expect(page.getByText("You're now on Pro")).toBeVisible();

      await page.goto('/dashboard/hotels/new');
      await addHotel(page, `Lakeview Struga ${runId}`);
      await expect(page).toHaveURL(/\/dashboard\/hotels$/);
    });

    await test.step('Owner adds a housekeeper, who can sign in', async () => {
      const housekeeper: Account = { email: `hk.${runId}@e2e.test`, password: 'Passw0rd', firstName: 'Hana', lastName: 'Housekeeper' };
      await goTo(page, 'Staff');
      await page.getByRole('button', { name: 'Add staff' }).click();

      const dialog = page.getByRole('dialog');
      await dialog.getByLabel('First name').fill(housekeeper.firstName);
      await dialog.getByLabel('Last name').fill(housekeeper.lastName);
      await dialog.getByLabel('Email').fill(housekeeper.email);
      await dialog.getByLabel('Password').fill(housekeeper.password);
      await dialog.getByRole('button', { name: 'Add staff' }).click();

      await expect(page.getByRole('row').filter({ hasText: housekeeper.email })).toContainText('Active');
      expect(await apiLogin(request, housekeeper)).toBeTruthy();
    });

    let renewalBefore = '';
    await test.step('Support extends the plan by two weeks, with the reason', async () => {
      renewalBefore = (await apiGet<BillingOverview>(request, '/billing', await apiLogin(request, owner))).accessUntil;

      const admin = support.page;
      await signIn(admin, SUPER_ADMIN as Account);
      await goTo(admin, 'Subscriptions');
      await admin.getByLabel('Search owners').fill(owner.email);
      await admin.getByRole('button', { name: `${owner.firstName} ${owner.lastName}` }).click();

      const panel = admin.getByRole('dialog');
      await expect(panel).toContainText('Pro plan');
      // Card payers get extensions, not bank transfers or free access
      await expect(panel.getByRole('button', { name: 'Record bank transfer' })).toBeDisabled();

      await panel.getByRole('button', { name: 'Extend' }).click();
      await panel.getByLabel('Days to add').fill('14');
      await panel.getByLabel('Reason').fill('Hotel closed for two weeks after flooding');
      await panel.locator('form').getByRole('button', { name: 'Extend' }).click();

      await expect(panel.getByRole('row').filter({ hasText: 'Hotel closed for two weeks after flooding' })).toContainText('by');
    });

    await test.step('The owner sees the later renewal and why', async () => {
      const after = await apiGet<BillingOverview>(request, '/billing', await apiLogin(request, owner));
      const days = (new Date(after.accessUntil).getTime() - new Date(renewalBefore).getTime()) / 86_400_000;
      expect(Math.round(days)).toBe(14);

      await goTo(page, 'Billing');
      await expect(page.getByRole('row').filter({ hasText: 'Hotel closed for two weeks after flooding' })).toContainText('Extended');
    });
  } finally {
    await ownerBrowser.close();
    await support.close();
  }
});

/**
 * A hotel that pays by bank transfer: support records the payment and the owner's plan follows it
 */
test('support records a bank transfer and the owner is on the paid plan until that date', async ({ browser, request }, testInfo) => {
  const runId = Date.now().toString(36);
  const owner: Account = { email: `transfer.${runId}@e2e.test`, password: 'Passw0rd', firstName: 'Marko', lastName: 'Markovski' };
  await registerOwner(request, owner);

  const support = await openBrowserFor(browser, testInfo, 'superadmin');
  const ownerBrowser = await openBrowserFor(browser, testInfo, 'owner');
  const paidUntil = new Date();
  paidUntil.setFullYear(paidUntil.getFullYear() + 1);
  const pad = (n: number) => String(n).padStart(2, '0');
  const untilInput = `${paidUntil.getFullYear()}-${pad(paidUntil.getMonth() + 1)}-${pad(paidUntil.getDate())}`;

  try {
    await test.step('Support records a year of Starter paid by bank transfer', async () => {
      const admin = support.page;
      await signIn(admin, SUPER_ADMIN as Account);
      await goTo(admin, 'Subscriptions');
      await admin.getByRole('tab', { name: 'On trial' }).click();
      await admin.getByLabel('Search owners').fill(owner.email);
      await admin.getByRole('button', { name: `${owner.firstName} ${owner.lastName}` }).click();

      const panel = admin.getByRole('dialog');
      await panel.getByRole('button', { name: 'Record bank transfer' }).click();
      await choose(admin, panel.getByRole('combobox', { name: 'Plan' }), 'Starter');
      await panel.getByLabel('Until').fill(untilInput);
      await panel.getByLabel('Amount received (EUR)').fill('120');
      await panel.getByLabel('Bank reference').fill(`INV-${runId}`);
      await panel.getByLabel('Reason').fill('Paid invoice by bank transfer');
      await panel.locator('form').getByRole('button', { name: 'Record bank transfer' }).click();

      await expect(panel).toContainText('Paid by bank transfer until');
      await expect(panel.getByRole('row').filter({ hasText: `INV-${runId}` })).toContainText('€120');
    });

    await test.step('The owner is on Starter, paid by bank transfer', async () => {
      const page = ownerBrowser.page;
      await signIn(page, owner);
      await goTo(page, 'Billing');
      await expect(page.getByText(/Paid by bank transfer until/)).toBeVisible();
      await expect(page.getByRole('row').filter({ hasText: 'Bank transfer recorded' })).toContainText('€120');

      const billing = await apiGet<BillingOverview>(request, '/billing', await apiLogin(request, owner));
      expect(billing.currentPlan).toBe('Starter');
      expect(new Date(billing.accessUntil).toDateString()).toBe(paidUntil.toDateString());
    });
  } finally {
    await support.close();
    await ownerBrowser.close();
  }
});
