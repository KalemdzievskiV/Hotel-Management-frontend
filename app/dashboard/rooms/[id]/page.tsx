'use client';

import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useRoom } from '@/hooks/useRooms';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RoomTypeLabels, RoomStatusLabels } from '@/types';
import { formatDate } from '@/lib/utils/date';

export default function ViewRoomPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = parseInt(params.id as string);
  
  const { data: room, isLoading, error } = useRoom(roomId);

  const getStatusBadgeColor = (status: string) => {
    const statusStyles = {
      Available: 'bg-green-100 text-green-800 hover:bg-green-100',
      Occupied: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
      Cleaning: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
      Maintenance: 'bg-red-100 text-red-800 hover:bg-red-100',
      OutOfService: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
      Reserved: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
    };
    
    return statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800 hover:bg-gray-100';
  };

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading room. Please try again.</p>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading || !room) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading room...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Room {room.roomNumber}</h1>
            <p className="mt-1 text-gray-600">{room.hotelName}</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => router.push(`/dashboard/rooms/${room.id}/edit`)}>
              Edit Room
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/rooms')}
            >
              Back to List
            </Button>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex gap-3">
          <Badge className={getStatusBadgeColor(RoomStatusLabels[room.status])}>
            {RoomStatusLabels[room.status]}
          </Badge>
          <Badge className={room.isActive ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-gray-100 text-gray-800 hover:bg-gray-100'}>
            {room.isActive ? '✓ Active' : '✗ Inactive'}
          </Badge>
          {room.allowsShortStay && (
            <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
              ⏱ Short-Stay Available
            </Badge>
          )}
        </div>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-gray-500">
                Room Number
              </Label>
              <p className="text-gray-900">{room.roomNumber}</p>
            </div>

            <div>
              <Label className="text-gray-500">
                Room Type
              </Label>
              <p className="text-gray-900">{RoomTypeLabels[room.type]}</p>
            </div>

            <div>
              <Label className="text-gray-500">
                Floor
              </Label>
              <p className="text-gray-900">{room.floor}</p>
            </div>

            <div>
              <Label className="text-gray-500">
                Capacity
              </Label>
              <p className="text-gray-900">{room.capacity} guest{room.capacity !== 1 ? 's' : ''}</p>
            </div>

            {room.areaSqM && (
              <div>
                <Label className="text-gray-500">
                  Area
                </Label>
                <p className="text-gray-900">{room.areaSqM} sq m</p>
              </div>
            )}

            {room.description && (
              <div className="md:col-span-2">
                <Label className="text-gray-500">
                  Description
                </Label>
                <p className="text-gray-900">{room.description}</p>
              </div>
            )}
          </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
          </CardHeader>
          <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-gray-500">
                Price per Night
              </Label>
              <p className="text-2xl font-bold text-gray-900">${room.pricePerNight}</p>
            </div>

            {room.allowsShortStay && room.shortStayHourlyRate && (
              <>
                <div>
                  <Label className="text-gray-500">
                    Hourly Rate
                  </Label>
                  <p className="text-2xl font-bold text-gray-900">${room.shortStayHourlyRate}/hour</p>
                </div>

                {room.minimumShortStayHours && (
                  <div>
                    <Label className="text-gray-500">
                      Minimum Short-Stay
                    </Label>
                    <p className="text-gray-900">{room.minimumShortStayHours} hour{room.minimumShortStayHours !== 1 ? 's' : ''}</p>
                  </div>
                )}

                {room.maximumShortStayHours && (
                  <div>
                    <Label className="text-gray-500">
                      Maximum Short-Stay
                    </Label>
                    <p className="text-gray-900">{room.maximumShortStayHours} hour{room.maximumShortStayHours !== 1 ? 's' : ''}</p>
                  </div>
                )}
              </>
            )}
          </div>
          </CardContent>
        </Card>

        {/* Room Features */}
        <Card>
          <CardHeader>
            <CardTitle>Room Features</CardTitle>
          </CardHeader>
          <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {room.bedType && (
              <div>
                <Label className="text-gray-500">
                  Bed Type
                </Label>
                <p className="text-gray-900">{room.bedType}</p>
              </div>
            )}

            {room.viewType && (
              <div>
                <Label className="text-gray-500">
                  View
                </Label>
                <p className="text-gray-900">{room.viewType}</p>
              </div>
            )}

            {room.amenities && (
              <div className="md:col-span-2">
                <Label className="text-gray-500">
                  Amenities
                </Label>
                <p className="text-gray-900">{room.amenities}</p>
              </div>
            )}

            <div className="md:col-span-2">
              <Label className="text-gray-500 mb-2">
                Features
              </Label>
              <div className="flex flex-wrap gap-2">
                {room.hasBathtub && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    🛁 Bathtub
                  </span>
                )}
                {room.hasBalcony && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    🏞️ Balcony
                  </span>
                )}
                {room.isSmokingAllowed ? (
                  <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                    🚬 Smoking Allowed
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                    🚭 Non-Smoking
                  </span>
                )}
              </div>
            </div>
          </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-600">Total Reservations</p>
              <p className="mt-1 text-2xl font-bold text-blue-900">
                {room.totalReservations || 0}
              </p>
            </div>

            {room.lastCleaned && (
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm font-medium text-green-600">Last Cleaned</p>
                <p className="mt-1 text-sm font-semibold text-green-900">
                  {formatDate(room.lastCleaned)}
                </p>
              </div>
            )}

            {room.lastMaintenance && (
              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-sm font-medium text-yellow-600">Last Maintenance</p>
                <p className="mt-1 text-sm font-semibold text-yellow-900">
                  {formatDate(room.lastMaintenance)}
                </p>
              </div>
            )}
          </div>
          </CardContent>
        </Card>

        {/* Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
          </CardHeader>
          <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-gray-500">
                Created At
              </Label>
              <p className="text-gray-900">{formatDate(room.createdAt)}</p>
            </div>

            {room.updatedAt && (
              <div>
                <Label className="text-gray-500">
                  Last Updated
                </Label>
                <p className="text-gray-900">{formatDate(room.updatedAt)}</p>
              </div>
            )}

            {room.notes && (
              <div className="md:col-span-2">
                <Label className="text-gray-500">
                  Internal Notes
                </Label>
                <p className="text-gray-900">{room.notes}</p>
              </div>
            )}
          </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
