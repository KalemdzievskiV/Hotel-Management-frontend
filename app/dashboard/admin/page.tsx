'use client';

import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import TodaysActivity from '@/components/dashboard/TodaysActivity';
import RoomStatusGrid from '@/components/dashboard/RoomStatusGrid';
import OccupancyTrends from '@/components/dashboard/OccupancyTrends';
import RevenueBreakdown from '@/components/dashboard/RevenueBreakdown';
import { useAuthStore } from '@/store/authStore';
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

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();

  // Fetch actual data lists
  const { data: hotelsList, isLoading: loadingHotels } = useQuery({
    queryKey: ['hotels'],
    queryFn: hotelsApi.getAll,
  });

  const { data: roomsList, isLoading: loadingRooms } = useQuery({
    queryKey: ['rooms'],
    queryFn: roomsApi.getAll,
  });

  const { data: guestsList, isLoading: loadingGuests } = useQuery({
    queryKey: ['guests'],
    queryFn: guestsApi.getAll,
  });

  const { data: reservationsList, isLoading: loadingReservations } = useQuery({
    queryKey: ['reservations'],
    queryFn: reservationsApi.getAll,
  });

  // Calculate counts
  const hotelsCount = hotelsList?.length || 0;
  const roomsCount = roomsList?.length || 0;
  const guestsCount = guestsList?.length || 0;
  const reservationsCount = reservationsList?.length || 0;

  // Calculate revenue
  const revenue = reservationsList?.reduce((sum: number, res: any) => {
    if (res.status === 3) { // CheckedOut = 3
      return sum + (res.totalAmount || 0);
    }
    return sum;
  }, 0) || 0;

  // Calculate status stats
  const statusStats = reservationsList?.reduce((acc: Record<string, number>, res: any) => {
    const statusName = ['Pending', 'Confirmed', 'CheckedIn', 'CheckedOut', 'Cancelled', 'NoShow'][res.status] || 'Unknown';
    acc[statusName] = (acc[statusName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate monthly stats
  const monthlyStats = reservationsList?.reduce((acc: Record<string, number>, res: any) => {
    const month = new Date(res.checkInDate).getMonth() + 1;
    const year = new Date(res.checkInDate).getFullYear();
    if (year === new Date().getFullYear()) {
      acc[month.toString()] = (acc[month.toString()] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const isLoading = loadingHotels || loadingRooms || loadingGuests || loadingReservations;

  // Helper function
  const getNumber = (value: any): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'object' && value !== null) {
      const firstValue = Object.values(value)[0];
      return typeof firstValue === 'number' ? firstValue : 0;
    }
    return 0;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hotel Operations Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.fullName}! Here's what's happening today.
          </p>
        </div>

        {/* Today's Activity Section */}
        <TodaysActivity />

        {/* Room Status Overview */}
        <RoomStatusGrid />

        {/* Occupancy Trends */}
        <OccupancyTrends />

        {/* Revenue Breakdown */}
        <RevenueBreakdown />

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Hotels Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Hotels</CardTitle>
              <Hotel className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? '...' : getNumber(hotelsCount)}
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
                {isLoading ? '...' : getNumber(roomsCount)}
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
                {isLoading ? '...' : getNumber(guestsCount)}
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
                {isLoading ? '...' : getNumber(reservationsCount)}
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
                {isLoading ? '...' : `$${getNumber(revenue).toLocaleString()}`}
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
              {loadingReservations ? (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Loading...
                </div>
              ) : statusStats && Object.keys(statusStats).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(statusStats).map(([status, count]) => {
                    const total = Object.values(statusStats).reduce((a: number, b: number) => a + b, 0);
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
              {loadingReservations ? (
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
                onClick={() => router.push('/dashboard/calendar')}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-center"
              >
                <Calendar className="h-6 w-6 mx-auto mb-2 text-indigo-600" />
                <span className="text-sm font-medium">View Calendar</span>
              </button>
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
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
