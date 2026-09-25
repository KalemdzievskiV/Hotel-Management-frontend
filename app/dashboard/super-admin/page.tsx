'use client';

import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/store/authStore';
import { useQuery } from '@tanstack/react-query';
import { hotelsApi } from '@/lib/api';
import { usersApi } from '@/lib/api/users';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import {
  Hotel,
  Users,
  Shield,
  TrendingUp,
  Activity,
  Plus,
  BedDouble
} from 'lucide-react';

// Roles in the order they're listed, with the bar colour for each
const ROLE_BARS = [
  { role: 'Admin', label: 'Admins', color: 'bg-purple-500' },
  { role: 'Manager', label: 'Managers', color: 'bg-orange-500' },
  { role: 'Housekeeper', label: 'Housekeepers', color: 'bg-teal-500' },
  { role: 'Guest', label: 'Guests', color: 'bg-blue-500' },
  { role: 'SuperAdmin', label: 'SuperAdmins', color: 'bg-gray-500' },
];

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;

export default function SuperAdminDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();

  const { data: hotelsList, isLoading: loadingHotels } = useQuery({
    queryKey: ['hotels'],
    queryFn: hotelsApi.getAll,
  });

  const { data: totalUsers, isLoading: loadingTotal } = useQuery({
    queryKey: ['users', 'count'],
    queryFn: usersApi.getCount,
  });

  const { data: usersByRole, isLoading: loadingRoles } = useQuery({
    queryKey: ['users', 'count-by-role'],
    queryFn: usersApi.getCountByRole,
  });

  const { data: usersList } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getAll,
  });

  const loadingUsers = loadingTotal || loadingRoles;
  const countFor = (role: string) => usersByRole?.[role] ?? 0;
  const show = (value: number | undefined, loading: boolean) => (loading ? '...' : value ?? 0);

  const hotelsCount = hotelsList?.length ?? 0;
  const activeHotels = hotelsList?.filter(h => h.isActive).length ?? 0;
  const staffCount = countFor('Manager') + countFor('Housekeeper');

  // There's no activity log yet, so show what was actually added most recently
  const recentlyAdded = [
    ...(usersList ?? []).map(u => ({
      key: `user-${u.id}`,
      type: 'user' as const,
      title: u.fullName || `${u.firstName} ${u.lastName}`,
      detail: `${u.roles?.join(', ') || 'No role'} · ${u.email}`,
      createdAt: new Date(u.createdAt),
    })),
    ...(hotelsList ?? []).map(h => ({
      key: `hotel-${h.id}`,
      type: 'hotel' as const,
      title: h.name,
      detail: `Hotel · ${h.city}, ${h.country}`,
      createdAt: new Date(h.createdAt),
    })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Administration</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.fullName}! Manage users and hotels.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{show(totalUsers, loadingTotal)}</div>
              <p className="text-xs text-gray-500 mt-1">All accounts, including guests</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <Shield className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{show(countFor('Admin'), loadingRoles)}</div>
              <p className="text-xs text-gray-500 mt-1">Hotel owners</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Hotels</CardTitle>
              <Hotel className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{show(hotelsCount, loadingHotels)}</div>
              <p className="text-xs text-gray-500 mt-1">
                {loadingHotels ? ' ' : `${activeHotels} accepting bookings`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hotel Staff</CardTitle>
              <Users className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{show(staffCount, loadingRoles)}</div>
              <p className="text-xs text-gray-500 mt-1">
                {loadingRoles
                  ? ' '
                  : `${plural(countFor('Manager'), 'manager')} · ${plural(countFor('Housekeeper'), 'housekeeper')}`}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* User Distribution */}
                <div className="space-y-3">
                  {loadingUsers ? (
                    <div className="text-center py-8 text-gray-500">Loading...</div>
                  ) : (
                    ROLE_BARS.map(({ role, label, color }) => {
                      const count = countFor(role);
                      const share = totalUsers ? (count / totalUsers) * 100 : 0;
                      return (
                        <div key={role} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{label}</span>
                            <span className="text-gray-600">{plural(count, 'user')}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className={`h-2 rounded-full ${color}`} style={{ width: `${share}%` }} />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <button
                  onClick={() => router.push('/dashboard/users')}
                  className="w-full mt-4 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Manage Users
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Hotels Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hotel className="h-5 w-5" />
                Hotels Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loadingHotels ? (
                  <div className="text-center py-8 text-gray-500">Loading...</div>
                ) : hotelsList && hotelsList.length > 0 ? (
                  <>
                    <div className="space-y-2">
                      {hotelsList.slice(0, 5).map(hotel => (
                        <div
                          key={hotel.id}
                          className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                          onClick={() => router.push(`/dashboard/hotels/${hotel.id}`)}
                        >
                          <div>
                            <p className="font-medium text-gray-900 flex items-center gap-2">
                              {hotel.name}
                              {!hotel.isActive && <Badge variant="secondary">Inactive</Badge>}
                            </p>
                            <p className="text-sm text-gray-500">
                              {hotel.city}, {hotel.country}
                              {hotel.ownerName ? ` · ${hotel.ownerName}` : ''}
                            </p>
                          </div>
                          <div className="text-right text-sm text-gray-600">
                            {hotel.stars > 0 && <p className="font-medium">{'⭐'.repeat(hotel.stars)}</p>}
                            <p className="flex items-center justify-end gap-1">
                              <BedDouble className="h-3 w-3" /> {plural(hotel.totalRooms ?? 0, 'room')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => router.push('/dashboard/hotels')}
                      className="w-full mt-4 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Hotel className="h-4 w-4" />
                      View All Hotels
                    </button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Hotel className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 mb-4">No hotels yet</p>
                    <button
                      onClick={() => router.push('/dashboard/hotels/new')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors inline-flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Create First Hotel
                    </button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recently added users and hotels */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recently Added
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentlyAdded.length === 0 ? (
                <p className="text-center py-4 text-sm text-gray-500">Nothing added yet</p>
              ) : recentlyAdded.map(item => (
                <div key={item.key} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    {item.type === 'user' ? (
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <Hotel className="h-4 w-4 text-green-600" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.detail}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {formatDistanceToNow(item.createdAt, { addSuffix: true })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => router.push('/dashboard/users')}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
              >
                <Users className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <span className="text-sm font-medium">Add User</span>
              </button>
              <button
                onClick={() => router.push('/dashboard/hotels/new')}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-center"
              >
                <Hotel className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <span className="text-sm font-medium">Add Hotel</span>
              </button>
              <button
                onClick={() => router.push('/dashboard/users')}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-center"
              >
                <Shield className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                <span className="text-sm font-medium">Manage Roles</span>
              </button>
              <button
                onClick={() => router.push('/dashboard/reports')}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-center"
              >
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-indigo-600" />
                <span className="text-sm font-medium">View Reports</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
