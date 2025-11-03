'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import { hotelsApi, roomsApi, guestsApi, reservationsApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Hotel, 
  Users, 
  BedDouble, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  Activity
} from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Fetch statistics
  const { data: hotelsCount, isLoading: loadingHotels } = useQuery({
    queryKey: ['hotels', 'count'],
    queryFn: hotelsApi.getCount,
    enabled: isAuthenticated,
  });

  const { data: roomsCount, isLoading: loadingRooms } = useQuery({
    queryKey: ['rooms', 'count'],
    queryFn: roomsApi.getCount,
    enabled: isAuthenticated,
  });

  const { data: guestsCount, isLoading: loadingGuests } = useQuery({
    queryKey: ['guests', 'count'],
    queryFn: guestsApi.getCount,
    enabled: isAuthenticated,
  });

  const { data: reservationsCount, isLoading: loadingReservations } = useQuery({
    queryKey: ['reservations', 'count'],
    queryFn: reservationsApi.getCount,
    enabled: isAuthenticated,
  });

  const { data: revenue, isLoading: loadingRevenue } = useQuery({
    queryKey: ['reservations', 'revenue'],
    queryFn: reservationsApi.getRevenue,
    enabled: isAuthenticated,
  });

  const { data: statusStats, isLoading: loadingStatus } = useQuery({
    queryKey: ['reservations', 'by-status'],
    queryFn: reservationsApi.getByStatusStats,
    enabled: isAuthenticated,
  });

  const { data: monthlyStats, isLoading: loadingMonthly } = useQuery({
    queryKey: ['reservations', 'monthly', new Date().getFullYear()],
    queryFn: () => reservationsApi.getMonthlyStats(new Date().getFullYear()),
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  const isLoading = loadingHotels || loadingRooms || loadingGuests || loadingReservations || loadingRevenue;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.fullName}! Here's what's happening today.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Hotels Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Hotels</CardTitle>
              <Hotel className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? '...' : hotelsCount || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">Active properties</p>
            </CardContent>
          </Card>

          {/* Rooms Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
              <BedDouble className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? '...' : roomsCount || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">Inventory</p>
            </CardContent>
          </Card>

          {/* Guests Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Guests</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? '...' : guestsCount || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">Registered</p>
            </CardContent>
          </Card>

          {/* Reservations Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reservations</CardTitle>
              <Calendar className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? '...' : reservationsCount || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">Total bookings</p>
            </CardContent>
          </Card>

          {/* Revenue Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? '...' : `$${revenue?.toLocaleString() || 0}`}
              </div>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Reservations by Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Reservations by Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingStatus ? (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Loading...
                </div>
              ) : statusStats && Object.keys(statusStats).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(statusStats).map(([status, count]) => {
                    const total = Object.values(statusStats).reduce((a, b) => a + b, 0);
                    const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                    
                    const statusColors: Record<string, string> = {
                      'Pending': 'bg-yellow-500',
                      'Confirmed': 'bg-blue-500',
                      'CheckedIn': 'bg-green-500',
                      'CheckedOut': 'bg-gray-500',
                      'Cancelled': 'bg-red-500',
                      'NoShow': 'bg-orange-500',
                    };

                    return (
                      <div key={status} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{status}</span>
                          <span className="text-gray-600">{count} ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${statusColors[status] || 'bg-gray-400'}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  No reservation data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Monthly Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Monthly Reservations ({new Date().getFullYear()})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingMonthly ? (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Loading...
                </div>
              ) : monthlyStats && Object.keys(monthlyStats).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(monthlyStats).map(([month, count]) => {
                    const maxCount = Math.max(...Object.values(monthlyStats));
                    const percentage = maxCount > 0 ? ((count / maxCount) * 100).toFixed(1) : 0;
                    
                    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    const monthName = monthNames[parseInt(month) - 1] || month;

                    return (
                      <div key={month} className="flex items-center gap-3">
                        <span className="text-sm font-medium w-12">{monthName}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                          <div
                            className="bg-blue-500 h-6 rounded-full flex items-center justify-end pr-2"
                            style={{ width: `${percentage}%` }}
                          >
                            {count > 0 && (
                              <span className="text-xs font-medium text-white">{count}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  No monthly data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => router.push('/dashboard/reservations/new')}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
              >
                <Calendar className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <span className="text-sm font-medium">New Reservation</span>
              </button>
              <button
                onClick={() => router.push('/dashboard/guests/new')}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-center"
              >
                <Users className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                <span className="text-sm font-medium">Add Guest</span>
              </button>
              <button
                onClick={() => router.push('/dashboard/rooms/new')}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-center"
              >
                <BedDouble className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <span className="text-sm font-medium">Add Room</span>
              </button>
              <button
                onClick={() => router.push('/dashboard/hotels/new')}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
              >
                <Hotel className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <span className="text-sm font-medium">Add Hotel</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
