// Ports of the E2E stack; it runs on its own ports and database, next to the dev servers
export const FRONTEND_PORT = Number(process.env.E2E_FRONTEND_PORT ?? 3051);
export const BACKEND_PORT = Number(process.env.E2E_BACKEND_PORT ?? 5051);
export const API_URL = `http://localhost:${BACKEND_PORT}/api`;

// Seeded by the API on startup in every non-production environment
export const SUPER_ADMIN = { email: 'superadmin@hotel.com', password: 'SuperAdmin123!' };
