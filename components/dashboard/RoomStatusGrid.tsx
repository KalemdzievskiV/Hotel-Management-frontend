'use client';

import { useRoomStatusSummary, useOccupancyRate } from '@/hooks/useRooms';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BedDouble, 
  Loader2,
  CheckCircle2,
  Clock,
  Wrench,
  Ban,
  CalendarCheck
} from 'lucide-react';
import { RoomStatus } from '@/types';

export default function RoomStatusGrid() {
  const { data: statusSummary, isLoading: loadingSummary } = useRoomStatusSummary();
  const { data: occupancy, isLoading: loadingOccupancy } = useOccupancyRate();

  const isLoading = loadingSummary || loadingOccupancy;

  // Status configuration with colors and icons
  const statusConfig: Record<RoomStatus, { 
    label: string; 
    color: string; 
    bgColor: string; 
    icon: any;
    borderColor: string;
  }> = {
    [RoomStatus.Available]: { 
      label: 'Available', 
      color: 'text-green-700', 
      bgColor: 'bg-green-100',
      borderColor: 'border-green-300',
      icon: CheckCircle2 
    },
    [RoomStatus.Occupied]: { 
      label: 'Occupied', 
      color: 'text-blue-700', 
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-300',
      icon: BedDouble 
    },
    [RoomStatus.Cleaning]: { 
      label: 'Cleaning', 
      color: 'text-yellow-700', 
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-300',
      icon: Clock 
    },
    [RoomStatus.Maintenance]: { 
      label: 'Maintenance', 
      color: 'text-orange-700', 
      bgColor: 'bg-orange-100',
      borderColor: 'border-orange-300',
      icon: Wrench 
    },
    [RoomStatus.OutOfService]: { 
      label: 'Out of Service', 
      color: 'text-red-700', 
      bgColor: 'bg-red-100',
      borderColor: 'border-red-300',
      icon: Ban 
    },
    [RoomStatus.Reserved]: { 
      label: 'Reserved', 
      color: 'text-purple-700', 
      bgColor: 'bg-purple-100',
      borderColor: 'border-purple-300',
      icon: CalendarCheck 
    },
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  if (!statusSummary || !occupancy) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-gray-500">No room data available</p>
        </CardContent>
      </Card>
    );
  }

  // Get status counts
  const getStatusCount = (status: RoomStatus): number => {
    return statusSummary.statusBreakdown.find(s => s.status === status)?.count || 0;
  };

  const getStatusPercentage = (status: RoomStatus): number => {
    if (statusSummary.totalRooms === 0) return 0;
    const count = getStatusCount(status);
    return Math.round((count / statusSummary.totalRooms) * 100);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BedDouble className="h-5 w-5 text-blue-600" />
          Room Status Overview
          <Badge variant="outline" className="ml-auto">
            {statusSummary.totalRooms} Total Rooms
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Occupancy Rate Card */}
          <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-700">Current Occupancy</h3>
              <BedDouble className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-blue-700">
                {occupancy.occupancyRate}%
              </span>
              <span className="text-sm text-gray-600">
                ({occupancy.effectivelyOccupied}/{statusSummary.totalRooms} rooms)
              </span>
            </div>
            <div className="mt-3 h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${occupancy.occupancyRate}%` }}
              />
            </div>
            <div className="mt-2 flex items-center gap-4 text-xs text-gray-600">
              <span>✓ Occupied: {occupancy.occupiedRooms}</span>
              <span>✓ Reserved: {occupancy.reservedRooms}</span>
              <span>○ Available: {occupancy.availableRooms}</span>
            </div>
          </div>

          {/* Status Breakdown Grid */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Status Breakdown</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(statusConfig).map(([statusKey, config]) => {
                const status = Number(statusKey) as RoomStatus;
                const count = getStatusCount(status);
                const percentage = getStatusPercentage(status);
                const Icon = config.icon;

                return (
                  <div
                    key={status}
                    className={`p-4 rounded-lg border-2 ${config.borderColor} ${config.bgColor} transition-all hover:shadow-md`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Icon className={`h-5 w-5 ${config.color}`} />
                      <Badge variant="secondary" className="text-xs">
                        {percentage}%
                      </Badge>
                    </div>
                    <div className={`text-2xl font-bold ${config.color} mb-1`}>
                      {count}
                    </div>
                    <div className="text-xs font-medium text-gray-600">
                      {config.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Visual Status Bar */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Status Distribution</h3>
            <div className="flex h-8 rounded-lg overflow-hidden border border-gray-200">
              {statusSummary.statusBreakdown.map((item) => {
                const config = statusConfig[item.status as RoomStatus];
                if (!config || item.count === 0) return null;
                
                const percentage = getStatusPercentage(item.status as RoomStatus);
                
                return (
                  <div
                    key={item.status}
                    className={`${config.bgColor} flex items-center justify-center text-xs font-medium ${config.color} transition-all`}
                    style={{ width: `${percentage}%` }}
                    title={`${config.label}: ${item.count} (${percentage}%)`}
                  >
                    {percentage >= 8 && item.count}
                  </div>
                );
              })}
            </div>
            <div className="mt-2 flex flex-wrap gap-3 text-xs">
              {statusSummary.statusBreakdown.map((item) => {
                const config = statusConfig[item.status as RoomStatus];
                if (!config) return null;
                
                return (
                  <div key={item.status} className="flex items-center gap-1">
                    <div className={`w-3 h-3 rounded ${config.bgColor} border ${config.borderColor}`} />
                    <span className="text-gray-600">
                      {config.label}: {item.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
