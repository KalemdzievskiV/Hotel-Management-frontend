'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';

export default function UsersPage() {
  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Users</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Users management page (SuperAdmin only) - Coming soon!</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
