import { expect, test } from '@playwright/test';
import { createHotelScenario, HotelScenario } from '../support/api';
import { goTo, openBrowserFor, signIn } from '../support/ui';

/**
 * Stock-keeping: the admin adds towels, can't book out more than are on the shelf,
 * sees the low-stock warning once they run low, and restocks.
 */
test('the admin keeps towel stock in line with what is used', async ({ browser, request }, testInfo) => {
  let scenario!: HotelScenario;
  await test.step('Set up a hotel with an admin', async () => {
    scenario = await createHotelScenario(request, `stock${Date.now().toString(36)}`);
  });

  const admin = await openBrowserFor(browser, testInfo, 'admin');
  const page = admin.page;
  const towelRow = () => page.getByRole('row').filter({ hasText: 'Bath Towels' });

  try {
    await test.step('Admin adds 10 bath towels, warning below 5', async () => {
      await signIn(page, scenario.admin);
      await goTo(page, 'Inventory');
      await page.getByRole('button', { name: /Add Item/ }).click();

      const dialog = page.getByRole('dialog');
      await dialog.getByLabel('Name').fill('Bath Towels');
      await dialog.getByLabel('Quantity').fill('10');
      await dialog.getByLabel('Min. Threshold').fill('5');
      await dialog.getByRole('button', { name: 'Add Item' }).click();
      await expect(dialog).toBeHidden();

      await expect(towelRow()).toContainText('10');
      await expect(towelRow()).toContainText('OK');
    });

    await test.step('Booking out more towels than are in stock is refused with the reason', async () => {
      await towelRow().getByRole('button', { name: 'Use' }).click();
      const dialog = page.getByRole('dialog');
      await dialog.getByLabel('Quantity').fill('12');
      await dialog.getByRole('button', { name: 'Record' }).click();

      await expect(dialog.getByRole('alert')).toHaveText('Only 10 Bath Towels in stock');
      await dialog.getByRole('button', { name: 'Cancel' }).click();
      await expect(towelRow()).toContainText('10');
    });

    await test.step('Using 7 leaves 3 and flags the towels as low stock', async () => {
      await towelRow().getByRole('button', { name: 'Use' }).click();
      const dialog = page.getByRole('dialog');
      // The refused attempt from before is not shown again
      await expect(dialog.getByRole('alert')).toHaveCount(0);
      await dialog.getByLabel('Quantity').fill('7');
      await dialog.getByRole('button', { name: 'Record' }).click();
      await expect(dialog).toBeHidden();

      await expect(towelRow()).toContainText('Low Stock');
    });

    await test.step('A restock of 20 clears the warning and both movements are logged', async () => {
      await towelRow().getByRole('button', { name: 'Restock' }).click();
      const dialog = page.getByRole('dialog');
      await dialog.getByLabel('Quantity').fill('20');
      await dialog.getByRole('button', { name: 'Record' }).click();
      await expect(dialog).toBeHidden();

      await expect(towelRow()).toContainText('23');
      await expect(towelRow()).toContainText('OK');

      await page.getByRole('tab', { name: 'Transactions' }).click();
      const log = page.getByRole('row').filter({ hasText: 'Bath Towels' });
      await expect(log).toHaveCount(2);
    });
  } finally {
    await admin.close();
  }
});
