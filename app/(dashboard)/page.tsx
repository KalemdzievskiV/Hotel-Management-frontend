'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Hotel Management Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">
              {user?.fullName} ({user?.roles.join(', ')})
            </span>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-4">Welcome to the Dashboard!</h2>
            
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">✅ Frontend Setup Complete!</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>All TypeScript types created (Hotels, Rooms, Guests, Reservations, Users)</li>
                  <li>API client configured with 76+ endpoints</li>
                  <li>Authentication working (JWT tokens)</li>
                  <li>React Query setup for data fetching</li>
                  <li>Zustand store for auth state</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-2 text-blue-900">
                  🚧 Next Steps:
                </h3>
                <ul className="list-disc list-inside space-y-1 text-blue-800">
                  <li>Create sidebar navigation</li>
                  <li>Build Hotels management pages</li>
                  <li>Build Rooms inventory pages</li>
                  <li>Build Reservations booking system</li>
                  <li>Build Guests directory</li>
                  <li>Build User management (SuperAdmin)</li>
                  <li>Add statistics and charts</li>
                </ul>
              </div>

              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-2 text-green-900">
                  📊 Your Current Session:
                </h3>
                <div className="space-y-2 text-green-800">
                  <p><strong>Email:</strong> {user?.email}</p>
                  <p><strong>Name:</strong> {user?.fullName}</p>
                  <p><strong>Roles:</strong> {user?.roles.join(', ')}</p>
                  <p><strong>Status:</strong> Authenticated ✓</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
