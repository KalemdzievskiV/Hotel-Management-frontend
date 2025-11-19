'use client';

import { useState } from 'react';
import { useOccupancyTrends } from '@/hooks/useRooms';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function OccupancyTrends() {
  const [selectedPeriod, setSelectedPeriod] = useState<7 | 30>(7);
  const { data: trends, isLoading, error } = useOccupancyTrends(selectedPeriod);

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Failed to load occupancy trends
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading || !trends) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Occupancy Trends</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data
  const chartData = trends.dailyOccupancy.map(day => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    occupancyRate: day.occupancyRate,
    occupiedRooms: day.occupiedRooms,
    totalRooms: day.totalRooms,
  }));

  // Calculate trend compared to last month
  const getTrendInfo = () => {
    const diff = trends.thisMonthAverage - trends.lastMonthAverage;
    if (Math.abs(diff) < 0.5) {
      return { icon: Minus, color: 'text-gray-500', text: 'Stable', value: '0%' };
    } else if (diff > 0) {
      return { 
        icon: TrendingUp, 
        color: 'text-green-600', 
        text: 'Up from last month', 
        value: `+${diff.toFixed(1)}%` 
      };
    } else {
      return { 
        icon: TrendingDown, 
        color: 'text-red-600', 
        text: 'Down from last month', 
        value: `${diff.toFixed(1)}%` 
      };
    }
  };

  const trend = getTrendInfo();
  const TrendIcon = trend.icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Occupancy Trends</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={selectedPeriod === 7 ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod(7)}
            >
              7 Days
            </Button>
            <Button
              variant={selectedPeriod === 30 ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod(30)}
            >
              30 Days
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Current Occupancy */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm text-blue-600 font-medium mb-1">Current</div>
            <div className="text-3xl font-bold text-blue-900">
              {trends.currentOccupancy}%
            </div>
            <div className="text-xs text-blue-600 mt-1">
              Right now
            </div>
          </div>

          {/* This Month Average */}
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-sm text-green-600 font-medium mb-1">This Month Avg</div>
            <div className="text-3xl font-bold text-green-900">
              {trends.thisMonthAverage}%
            </div>
            <div className={`flex items-center gap-1 text-xs mt-1 ${trend.color}`}>
              <TrendIcon className="h-3 w-3" />
              <span>{trend.value}</span>
            </div>
          </div>

          {/* Last Month Average */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600 font-medium mb-1">Last Month Avg</div>
            <div className="text-3xl font-bold text-gray-900">
              {trends.lastMonthAverage}%
            </div>
            <div className="text-xs text-gray-600 mt-1">
              Previous period
            </div>
          </div>
        </div>

        {/* Trend Indicator */}
        <div className={`flex items-center gap-2 mb-4 p-3 rounded-lg ${
          trend.color.includes('green') ? 'bg-green-50' :
          trend.color.includes('red') ? 'bg-red-50' :
          'bg-gray-50'
        }`}>
          <TrendIcon className={`h-5 w-5 ${trend.color}`} />
          <div>
            <span className={`font-medium ${trend.color}`}>{trend.text}</span>
            <span className="text-sm text-gray-600 ml-2">
              ({trends.totalRooms} total rooms)
            </span>
          </div>
        </div>

        {/* Line Chart */}
        <div className="w-full h-80 mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickMargin={8}
              />
              <YAxis 
                stroke="#6b7280"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickMargin={8}
                domain={[0, 100]}
                label={{ value: 'Occupancy %', angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                        <p className="font-semibold text-gray-900 mb-1">{data.date}</p>
                        <p className="text-sm text-blue-600">
                          Occupancy: <span className="font-bold">{data.occupancyRate}%</span>
                        </p>
                        <p className="text-xs text-gray-600">
                          {data.occupiedRooms} / {data.totalRooms} rooms occupied
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend 
                verticalAlign="top" 
                height={36}
                iconType="line"
              />
              <Line 
                type="monotone" 
                dataKey="occupancyRate" 
                stroke="#2563eb" 
                strokeWidth={3}
                name="Occupancy Rate (%)"
                dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {Math.max(...chartData.map(d => d.occupancyRate))}%
              </div>
              <div className="text-xs text-gray-600 mt-1">Peak</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {Math.min(...chartData.map(d => d.occupancyRate))}%
              </div>
              <div className="text-xs text-gray-600 mt-1">Lowest</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {(chartData.reduce((sum, d) => sum + d.occupancyRate, 0) / chartData.length).toFixed(1)}%
              </div>
              <div className="text-xs text-gray-600 mt-1">Average</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {selectedPeriod}
              </div>
              <div className="text-xs text-gray-600 mt-1">Days</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
