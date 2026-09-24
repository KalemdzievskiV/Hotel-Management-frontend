import { expect, test } from '@playwright/test';
import { createHotelScenario, HotelScenario } from '../support/api';
import {
  choose, dateFromToday, expectToast, goTo, openBrowserFor, reservationRow, signIn,
} from '../support/ui';

/**
 * A guest's stay from booking to a clean room, with every person in their own browser:
 * the guest books online, the hotel admin approves it, checks the guest in, takes payment
 * and checks them out, and the housekeeper cleans the room so it can be sold again.
 */
test('a guest books a room and the hotel runs the stay through to a clean room', async ({ browser, request }, testInfo) => {
  let scenario!: HotelScenario;
  await test.step('Set up a hotel with an admin, a housekeeper and a registered guest', async () => {
    scenario = await createHotelScenario(request, Date.now().toString(36));
  });

  const guest = await openBrowserFor(browser, testInfo, 'guest');
  const admin = await openBrowserFor(browser, testInfo, 'admin');
  const housekeeper = await openBrowserFor(browser, testInfo, 'housekeeper');
  const today = dateFromToday(0);
  const tomorrow = dateFromToday(1);

  try {
    await test.step('Guest searches for a room for tonight', async () => {
      const page = guest.page;
      await signIn(page, scenario.guest);
      await goTo(page, 'Availability');

      await choose(page, page.getByRole('combobox', { name: 'Hotel' }), new RegExp(scenario.hotel.name));
      await page.getByLabel('Check-in Date').fill(`${today}T14:00`);
      await page.getByLabel('Check-out Date').fill(`${tomorrow}T11:00`);

      await expect(page.getByText('Room 101')).toBeVisible();
      await page.getByRole('button', { name: 'Select' }).first().click();
      await page.getByRole('button', { name: 'Create Reservation' }).click();
    });

    await test.step('Guest books it with the searched dates already filled in', async () => {
      const page = guest.page;
      const dialog = page.getByRole('dialog');
      await expect(dialog.getByText('Create New Reservation')).toBeVisible();
      await expect(dialog.getByLabel('Check-in *')).toHaveValue(today);
      await expect(dialog.getByLabel('Check-out *')).toHaveValue(tomorrow);
      await expect(dialog.getByText('$120.00')).toBeVisible(); // one night

      await dialog.getByRole('button', { name: 'Create Reservation' }).click();
      await expectToast(page, 'Reservation created successfully');

      await goTo(page, 'My Reservations');
      await expect(reservationRow(page, scenario.guest)).toContainText('Pending');
    });

    await test.step('Admin approves the booking', async () => {
      const page = admin.page;
      await signIn(page, scenario.admin);
      await goTo(page, 'Reservations');

      const row = reservationRow(page, scenario.guest);
      await expect(row).toContainText('Room 101');
      await row.getByRole('button', { name: 'Confirm' }).click();
      await expectToast(page, 'Reservation confirmed successfully');
      await expect(row).toContainText('Confirmed');
    });

    await test.step('Guest sees the booking confirmed, without staff-only actions', async () => {
      await guest.page.reload();
      const row = reservationRow(guest.page, scenario.guest);
      await expect(row).toContainText('Confirmed');
      await expect(row.getByRole('button', { name: 'Check-in' })).toHaveCount(0);
      await expect(row.getByRole('button', { name: 'Cancel' })).toBeVisible();
    });

    await test.step('Admin checks the guest in on arrival', async () => {
      const page = admin.page;
      const row = reservationRow(page, scenario.guest);
      await row.getByRole('button', { name: 'Check-in' }).click();
      await expectToast(page, 'Guest checked in successfully');
      await expect(row).toContainText('CheckedIn');
    });

    await test.step('Admin takes the payment', async () => {
      const page = admin.page;
      await reservationRow(page, scenario.guest).getByRole('button', { name: 'View' }).click();
      await page.getByRole('button', { name: 'Record Payment' }).click();

      const dialog = page.getByRole('dialog');
      await dialog.getByLabel('Amount *').fill('120');
      await dialog.getByLabel('Reference').fill('CARD-4242');
      await dialog.getByRole('button', { name: 'Record Payment' }).click();
      await expectToast(page, 'Payment recorded successfully');

      // The payment lands in the reservation's ledger
      const history = page.getByTestId('payment-history');
      await expect(history).toContainText('+$120.00');
      await expect(history).toContainText('CARD-4242');
    });

    await test.step('Admin checks the guest out', async () => {
      const page = admin.page;
      await goTo(page, 'Reservations');
      const row = reservationRow(page, scenario.guest);
      await row.getByRole('button', { name: 'Check-out' }).click();
      await expectToast(page, 'Guest checked out successfully');
      await expect(row).toContainText('CheckedOut');
      await expect(row).toContainText('Paid');
    });

    await test.step('Admin schedules cleaning for the rooms guests left today', async () => {
      const page = admin.page;
      await goTo(page, 'Housekeeping');
      await page.getByRole('button', { name: 'Auto-generate Tasks' }).click();

      const task = page.getByTestId('housekeeping-task').filter({ hasText: '101' });
      await expect(task).toContainText('Pending');
    });

    await test.step('Housekeeper cleans the room', async () => {
      const page = housekeeper.page;
      await signIn(page, scenario.housekeeper);
      await expect(page).toHaveURL(/\/dashboard\/housekeeping/);

      const task = page.getByTestId('housekeeping-task').filter({ hasText: '101' });
      await task.getByRole('button', { name: 'Start' }).click();
      await expect(task).toContainText('In Progress');
      await task.getByRole('button', { name: 'Complete' }).click();
      await expect(task).toContainText('Completed');
    });

    await test.step('The room is available to sell again', async () => {
      const page = admin.page;
      await goTo(page, 'Rooms');
      await expect(page.getByRole('row').filter({ hasText: '101' })).toContainText('Available');
    });

    await test.step('Guest sees a completed, paid stay', async () => {
      await guest.page.reload();
      const row = reservationRow(guest.page, scenario.guest);
      await expect(row).toContainText('CheckedOut');
      await expect(row).toContainText('Paid');
    });
  } finally {
    await Promise.all([guest.close(), admin.close(), housekeeper.close()]);
  }
});
