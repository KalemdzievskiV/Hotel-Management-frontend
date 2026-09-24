import { APIRequestContext } from '@playwright/test';
import { API_URL, SUPER_ADMIN } from './env';

export interface Account {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export const fullName = (account: Account) => `${account.firstName} ${account.lastName}`;

async function call<T>(
  request: APIRequestContext,
  method: string,
  path: string,
  token?: string,
  data?: unknown
): Promise<T> {
  const response = await request.fetch(`${API_URL}${path}`, {
    method,
    data,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok()) {
    throw new Error(`${method} ${path} failed with ${response.status()}: ${await response.text()}`);
  }
  const body = await response.text();
  return (body ? JSON.parse(body) : undefined) as T;
}

export async function apiLogin(request: APIRequestContext, account: Pick<Account, 'email' | 'password'>) {
  const { token } = await call<{ token: string }>(request, 'POST', '/Auth/login', undefined, account);
  return token;
}

export interface HotelScenario {
  hotel: { id: number; name: string };
  room: { id: number; roomNumber: string; pricePerNight: number };
  admin: Account;
  housekeeper: Account;
  guest: Account;
}

/**
 * A hotel as it would be set up in real life: the platform SuperAdmin creates the hotel's
 * Admin, the Admin creates the hotel and a room, the SuperAdmin adds a housekeeper to the
 * hotel, and a guest signs up on their own.
 */
export async function createHotelScenario(request: APIRequestContext, runId: string): Promise<HotelScenario> {
  const password = 'Passw0rd!';
  const admin: Account = { email: `admin.${runId}@e2e.test`, password, firstName: 'Alice', lastName: 'Admin' };
  const housekeeper: Account = { email: `housekeeper.${runId}@e2e.test`, password, firstName: 'Hank', lastName: 'Housekeeper' };
  const guest: Account = { email: `guest.${runId}@e2e.test`, password, firstName: 'Grace', lastName: 'Guest' };

  const superAdminToken = await apiLogin(request, SUPER_ADMIN);
  await call(request, 'POST', '/Users', superAdminToken, { ...admin, role: 'Admin' });

  const adminToken = await apiLogin(request, admin);
  const hotel = await call<{ id: number; name: string }>(request, 'POST', '/Hotels', adminToken, {
    name: `Seaside Hotel ${runId}`,
    address: '1 Harbour Road',
    city: 'Split',
    country: 'Croatia',
  });
  const room = await call<{ id: number; roomNumber: string; pricePerNight: number }>(request, 'POST', '/Rooms', adminToken, {
    hotelId: hotel.id,
    roomNumber: '101',
    type: 2, // Double
    capacity: 2,
    pricePerNight: 120,
  });

  await call(request, 'POST', '/Users', superAdminToken, { ...housekeeper, role: 'Housekeeper', hotelId: hotel.id });
  await call(request, 'POST', '/Auth/register', undefined, { ...guest, role: 'Guest' });

  return { hotel, room, admin, housekeeper, guest };
}
