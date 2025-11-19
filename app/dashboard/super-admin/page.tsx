'use client';

import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/store/authStore';
import { useQuery } from '@tanstack/react-query';
import { hotelsApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Hotel, 
  Users, 
  Shield,
  TrendingUp,
  Activity,
  Plus
} from 'lucide-react';

export default function SuperAdminDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();

  // Fetch hotels for overview
  const { data: hotelsList, isLoading: loadingHotels } = useQuery({
    queryKey: ['hotels'],
    queryFn: hotelsApi.getAll,
  });

  const hotelsCount = hotelsList?.length || 0;

  // Mock user stats (in real app, these would come from API)
  const totalUsers = 25;
  const adminUsers = 8;
  const managerUsers = 12;
  const guestUsers = 5;

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
          {/* Total Users Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-gray-500 mt-1">System users</p>
            </CardContent>
          </Card>

          {/* Admins Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <Shield className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminUsers}</div>
              <p className="text-xs text-gray-500 mt-1">Hotel owners</p>
            </CardContent>
          </Card>

          {/* Total Hotels Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Hotels</CardTitle>
              <Hotel className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingHotels ? '...' : hotelsCount}
              </div>
              <p className="text-xs text-gray-500 mt-1">Active properties</p>
            </CardContent>
          </Card>

          {/* Managers Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Managers</CardTitle>
              <Users className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{managerUsers}</div>
              <p className="text-xs text-gray-500 mt-1">Hotel staff</p>
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
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Admins</span>
                      <span className="text-gray-600">{adminUsers} users</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-purple-500"
                        style={{ width: `${(adminUsers / totalUsers) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Managers</span>
                      <span className="text-gray-600">{managerUsers} users</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-orange-500"
                        style={{ width: `${(managerUsers / totalUsers) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Guests</span>
                      <span className="text-gray-600">{guestUsers} users</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${(guestUsers / totalUsers) * 100}%` }}
                      />
                    </div>
                  </div>
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
                      {hotelsList.slice(0, 5).map((hotel: any) => (
                        <div 
                          key={hotel.id} 
                          className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                          onClick={() => router.push(`/dashboard/hotels/${hotel.id}`)}
                        >
                          <div>
                            <p className="font-medium text-gray-900">{hotel.name}</p>
                            <p className="text-sm text-gray-500">{hotel.city}, {hotel.country}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-600">
                              {hotel.starRating} ⭐
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

        {/* System Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { action: 'New admin user created', user: 'John Doe', time: '2 hours ago', type: 'user' },
                { action: 'Hotel "Grand Plaza" added', user: 'Jane Smith', time: '5 hours ago', type: 'hotel' },
                { action: 'Manager assigned to hotel', user: 'Mike Johnson', time: '1 day ago', type: 'user' },
                { action: 'Hotel settings updated', user: 'Admin', time: '2 days ago', type: 'hotel' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    {activity.type === 'user' ? (
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <Hotel className="h-4 w-4 text-green-600" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-500">by {activity.user}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{activity.time}</span>
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
                onClick={() => router.push('/dashboard/users/new')}
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
                onClick={() => router.push('/dashboard/hotels')}
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
