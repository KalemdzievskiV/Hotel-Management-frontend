import { expect, test } from '@playwright/test';
import { apiLogin, apiGet, createHotelScenario, HotelScenario } from '../support/api';
import { choose, goTo, openBrowserFor, signIn } from '../support/ui';

interface Reservation {
  id: number;
  roomNumber: string;
  guestName: string;
  status: string | number;
  totalAmount: number;
  remainingAmount: number;
  paymentStatus: string | number;
}

interface Payment {
  amount: number;
  method: number;
}

/**
 * A guest without a booking walks up to the desk: the admin registers them, checks them
 * into a room at a negotiated nightly rate with a cash deposit, and settles the minibar
 * and the balance at express checkout.
 */
test('the front desk checks a walk-in guest in and out', async ({ browser, request }, testInfo) => {
  let scenario!: HotelScenario;
  await test.step('Set up a hotel with an admin', async () => {
    scenario = await createHotelScenario(request, `walkin${Date.now().toString(36)}`);
  });

  const admin = await openBrowserFor(browser, testInfo, 'admin');
  const page = admin.page;
  const walkIn = { firstName: 'Wanda', lastName: 'Walker', email: `wanda.${Date.now().toString(36)}@e2e.test` };
  let reservation!: Reservation;

  try {
    await test.step('Admin registers the walk-in guest', async () => {
      await signIn(page, scenario.admin);
      await goTo(page, 'Walk-In');

      await page.getByRole('button', { name: 'Register New Guest' }).click();
      await page.getByLabel('First Name *').fill(walkIn.firstName);
      await page.getByLabel('Last Name *').fill(walkIn.lastName);
      await page.getByLabel('Email *').fill(walkIn.email);
      await page.getByLabel('Phone *').fill('+385 91 555 0101');
      await page.getByRole('button', { name: /Next: Select Room/ }).click();
    });

    await test.step('Admin picks a room for two nights at 100 a night with a 50 cash deposit', async () => {
      // Two nights from this afternoon; the default check-in is "now"
      const checkIn = await page.getByLabel('Check-In').inputValue();
      const checkOut = new Date(checkIn);
      checkOut.setDate(checkOut.getDate() + 2);
      checkOut.setHours(11, 0);
      const pad = (n: number) => String(n).padStart(2, '0');
      await page.getByLabel('Check-Out').fill(
        `${checkOut.getFullYear()}-${pad(checkOut.getMonth() + 1)}-${pad(checkOut.getDate())}T11:00`
      );

      await page.getByRole('button', { name: /Room 101/ }).click();
      await page.getByRole('button', { name: /Next: Pricing/ }).click();

      await page.getByLabel('Override Price ($/night)').fill('100');
      await page.getByLabel('Deposit ($)').fill('50');
      await choose(page, page.getByRole('combobox', { name: 'Payment Method' }), 'Cash');
      await expect(page.getByText('Subtotal (2 nights)')).toBeVisible();
      await expect(page.getByText('$200.00').first()).toBeVisible();
      await expect(page.getByText('Balance Due')).toBeVisible();
      await expect(page.getByText('$150.00')).toBeVisible();

      await page.getByRole('button', { name: /Review & Check In/ }).click();
      await expect(page.getByText(`${walkIn.firstName} ${walkIn.lastName} (new)`)).toBeVisible();
      await page.getByRole('button', { name: /Confirm Check-In/ }).click();
    });

    await test.step('The guest is checked in and the room is taken', async () => {
      await expect(page.getByText(`Room 101 checked in for ${walkIn.firstName} ${walkIn.lastName}`)).toBeVisible();
      // The side panel updates without a reload
      await expect(page.getByText(`${walkIn.firstName} ${walkIn.lastName}`, { exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Out', exact: true })).toBeVisible();
    });

    await test.step('The books show the negotiated price and a cash deposit', async () => {
      const token = await apiLogin(request, scenario.admin);
      const reservations = await apiGet<Reservation[]>(request, `/Reservations/hotel/${scenario.hotel.id}`, token);
      reservation = reservations.find(r => r.guestName === `${walkIn.firstName} ${walkIn.lastName}`)!;
      expect(reservation.totalAmount).toBe(200);
      expect(reservation.remainingAmount).toBe(150);

      const payments = await apiGet<Payment[]>(request, `/Reservations/${reservation.id}/payments`, token);
      expect(payments).toEqual([expect.objectContaining({ amount: 50, method: 0 /* Cash */ })]);
    });

    await test.step('At checkout the admin adds the minibar and takes the balance', async () => {
      await page.getByRole('button', { name: 'Out', exact: true }).click();
      const dialog = page.getByRole('dialog');
      await expect(dialog.getByLabel('Final Payment ($)')).toHaveValue('150');

      await dialog.getByLabel('Extra Charges ($)').fill('15');
      await dialog.getByLabel('Extra Charges Notes').fill('Minibar');

      // Paying less than the new balance is allowed; paying more is refused with the reason
      await dialog.getByLabel('Final Payment ($)').fill('500');
      await dialog.getByRole('button', { name: 'Checkout' }).click();
      await expect(dialog.getByRole('alert')).toContainText('exceeds remaining balance');

      await dialog.getByLabel('Final Payment ($)').fill('165');
      await dialog.getByRole('button', { name: 'Checkout' }).click();
      await expect(dialog).toBeHidden();
      await expect(page.getByText('Room 101 checked out')).toBeVisible();
      await expect(page.getByText('No guests checked in')).toBeVisible();
    });

    await test.step('The stay is settled and the room waits for cleaning', async () => {
      const token = await apiLogin(request, scenario.admin);
      const settled = await apiGet<Reservation>(request, `/Reservations/${reservation.id}`, token);
      expect(settled).toMatchObject({ totalAmount: 215, remainingAmount: 0 });

      const room = await apiGet<{ status: string | number }>(request, `/Rooms/${scenario.room.id}`, token);
      expect([3, 'Cleaning']).toContain(room.status);
    });
  } finally {
    await admin.close();
  }
});
