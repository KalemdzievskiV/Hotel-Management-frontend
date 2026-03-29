'use client';

import { useState, useMemo } from 'react';
import { useRevenueBreakdown } from '@/hooks/useAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, TrendingUp, CreditCard, Calendar } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function RevenueBreakdown() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  
  // Memoize date range to prevent infinite re-renders
  const { start, end } = useMemo(() => {
    const end = new Date();
    const start = new Date();
    
    switch (selectedPeriod) {
      case 'week':
        start.setDate(start.getDate() - 7);
        break;
      case 'month':
        start.setMonth(start.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(start.getMonth() - 3);
        break;
    }
    
    return { start, end };
  }, [selectedPeriod]);

  const { data: revenue, isLoading, error } = useRevenueBreakdown(start, end);

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Failed to load revenue data
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading || !revenue) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue Analysis</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare pie chart data for room types
  const roomTypeChartData = revenue.revenueByRoomType.map((item, index) => ({
    name: item.roomTypeName,
    value: item.revenue,
    percentage: item.percentage,
    count: item.count,
    fill: COLORS[index % COLORS.length]
  }));

  // Prepare bar chart data for payment methods
  const paymentMethodChartData = revenue.revenueByPaymentMethod.map((item) => ({
    name: item.paymentMethodName,
    revenue: item.revenue,
    count: item.count
  }));

  // Prepare data for booking types
  const bookingTypeChartData = revenue.revenueByBookingType.map((item, index) => ({
    name: item.bookingTypeName,
    revenue: item.revenue,
    count: item.count,
    avgPrice: item.averagePrice,
    fill: COLORS[index % COLORS.length]
  }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Revenue Analysis</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={selectedPeriod === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod('week')}
            >
              7 Days
            </Button>
            <Button
              variant={selectedPeriod === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod('month')}
            >
              30 Days
            </Button>
            <Button
              variant={selectedPeriod === 'quarter' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod('quarter')}
            >
              90 Days
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Total Revenue */}
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-blue-700 font-medium">Total Revenue</div>
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {formatCurrency(revenue.totalRevenue)}
            </div>
            <div className="text-xs text-blue-600 mt-1">
              {revenue.completedReservations} completed bookings
            </div>
          </div>

          {/* Average Daily Rate */}
          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-green-700 font-medium">Avg Daily Rate</div>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-900">
              {formatCurrency(revenue.averageDailyRate)}
            </div>
            <div className="text-xs text-green-600 mt-1">
              Per room night
            </div>
          </div>

          {/* RevPAR */}
          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-purple-700 font-medium">RevPAR</div>
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-900">
              {formatCurrency(revenue.revPAR)}
            </div>
            <div className="text-xs text-purple-600 mt-1">
              Revenue per available room
            </div>
          </div>

          {/* Deposits */}
          <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-orange-700 font-medium">Deposits</div>
              <CreditCard className="h-5 w-5 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-orange-900">
              {formatCurrency(revenue.depositRevenue)}
            </div>
            <div className="text-xs text-orange-600 mt-1">
              {Math.round((revenue.depositRevenue / revenue.totalRevenue) * 100)}% of total
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Revenue by Room Type - Pie Chart */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Revenue by Room Type</h3>
            {roomTypeChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={roomTypeChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {roomTypeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                            <p className="font-semibold text-gray-900">{data.name}</p>
                            <p className="text-sm text-blue-600">
                              Revenue: <span className="font-bold">{formatCurrency(data.value)}</span>
                            </p>
                            <p className="text-xs text-gray-600">
                              {data.count} bookings ({data.percentage}%)
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No data available
              </div>
            )}
          </div>

          {/* Revenue by Payment Method - Bar Chart */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Revenue by Payment Method</h3>
            {paymentMethodChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={paymentMethodChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#6b7280"
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                            <p className="font-semibold text-gray-900">{data.name}</p>
                            <p className="text-sm text-blue-600">
                              Revenue: <span className="font-bold">{formatCurrency(data.revenue)}</span>
                            </p>
                            <p className="text-xs text-gray-600">
                              {data.count} transactions
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No data available
              </div>
            )}
          </div>

          {/* Revenue by Booking Type - Pie Chart */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Revenue by Booking Type</h3>
            {bookingTypeChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={bookingTypeChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${formatCurrency(Number(value) || 0)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="revenue"
                  >
                    {bookingTypeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                            <p className="font-semibold text-gray-900">{data.name}</p>
                            <p className="text-sm text-blue-600">
                              Revenue: <span className="font-bold">{formatCurrency(data.revenue)}</span>
                            </p>
                            <p className="text-xs text-gray-600">
                              {data.count} bookings
                            </p>
                            <p className="text-xs text-gray-600">
                              Avg: {formatCurrency(data.avgPrice || 0)}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No data available
              </div>
            )}
          </div>

          {/* Additional Insights */}
          <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Key Insights</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-white rounded">
                <span className="text-sm text-gray-600">Total Room Nights Sold</span>
                <span className="font-semibold text-gray-900">{(revenue.totalRoomNights ?? 0).toFixed(1)}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-white rounded">
                <span className="text-sm text-gray-600">Completed Reservations</span>
                <span className="font-semibold text-gray-900">{revenue.completedReservations ?? 0}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-white rounded">
                <span className="text-sm text-gray-600">Cancellations</span>
                <span className="font-semibold text-red-600">{revenue.cancellationCount ?? 0}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-white rounded">
                <span className="text-sm text-gray-600">Avg Revenue per Booking</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency((revenue.completedReservations ?? 0) > 0 ? (revenue.totalRevenue ?? 0) / revenue.completedReservations : 0)}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
                <span className="text-sm text-green-700 font-medium">Success Rate</span>
                <span className="font-bold text-green-900">
                  {(() => {
                    const completed = revenue.completedReservations ?? 0;
                    const cancelled = revenue.cancellationCount ?? 0;
                    const total = completed + cancelled;
                    return total > 0 ? Math.round((completed / total) * 100) : 0;
                  })()}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Period Info */}
        <div className="mt-4 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
          Data from {new Date(revenue.periodStart).toLocaleDateString()} to {new Date(revenue.periodEnd).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
}
