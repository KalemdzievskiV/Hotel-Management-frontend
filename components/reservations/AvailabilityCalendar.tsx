'use client';

import { useState, useMemo } from 'react';
import { useAvailableRoomsForHotel } from '@/hooks/useAvailableRooms';
import { RoomCard } from '@/components/rooms/RoomCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BookingType, BookingTypeLabels, Room, RoomType, RoomTypeLabels } from '@/types';
import { 
  Calendar, 
  Users, 
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';

interface AvailabilityCalendarProps {
  hotelId: number;
  defaultCheckIn?: string;
  defaultCheckOut?: string;
  defaultBookingType?: BookingType;
  onRoomSelect?: (room: Room) => void;
  selectedRoomId?: number;
  compact?: boolean; // Compact mode for dialogs
}

export function AvailabilityCalendar({
  hotelId,
  defaultCheckIn,
  defaultCheckOut,
  defaultBookingType = BookingType.Daily,
  onRoomSelect,
  selectedRoomId,
  compact = false,
}: AvailabilityCalendarProps) {
  // Form state
  const [checkIn, setCheckIn] = useState(defaultCheckIn || '');
  const [checkOut, setCheckOut] = useState(defaultCheckOut || '');
  const [bookingType, setBookingType] = useState<BookingType>(defaultBookingType);
  
  // Filters
  const [minCapacity, setMinCapacity] = useState<number | undefined>();
  const [roomType, setRoomType] = useState<string | undefined>();
  const [showFilters, setShowFilters] = useState(false);

  // Fetch available rooms
  const { 
    data: availabilityData, 
    isLoading, 
    error,
    refetch 
  } = useAvailableRoomsForHotel(
    hotelId,
    checkIn,
    checkOut,
    {
      bookingType,
      minCapacity,
      roomType,
    }
  );

  // Calculate nights/hours
  const duration = useMemo(() => {
    if (!checkIn || !checkOut) return { nights: 1, hours: 1 };
    
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    return {
      nights: Math.max(1, diffDays),
      hours: Math.max(1, diffHours),
    };
  }, [checkIn, checkOut]);

  const hasSearchParams = checkIn && checkOut;

  return (
    <div className={compact ? "space-y-3" : "space-y-6"}>
      {/* Search Section */}
      <Card>
        {!compact && (
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Search Available Rooms
              </CardTitle>
              {hasSearchParams && availabilityData && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {availabilityData.totalAvailable} available
                </Badge>
              )}
            </div>
          </CardHeader>
        )}
        <CardContent className={compact ? "p-3" : ""}>
          {compact && hasSearchParams && availabilityData && (
            <div className="flex items-center justify-between mb-3 pb-2 border-b">
              <span className="text-sm font-medium">Available Rooms</span>
              <Badge variant="outline" className="text-green-600 border-green-600">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {availabilityData.totalAvailable} available
              </Badge>
            </div>
          )}
          <div className={compact ? "space-y-2" : "space-y-4"}>
            {/* Date & Booking Type */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="checkIn">Check-in Date</Label>
                <Input
                  id="checkIn"
                  type="datetime-local"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkOut">Check-out Date</Label>
                <Input
                  id="checkOut"
                  type="datetime-local"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bookingType">Booking Type</Label>
                <Select
                  value={bookingType.toString()}
                  onValueChange={(value) => setBookingType(parseInt(value) as BookingType)}
                >
                  <SelectTrigger id="bookingType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={BookingType.Daily.toString()}>
                      {BookingTypeLabels[BookingType.Daily]}
                    </SelectItem>
                    <SelectItem value={BookingType.ShortStay.toString()}>
                      {BookingTypeLabels[BookingType.ShortStay]}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Duration Info */}
            {hasSearchParams && (
              <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg text-sm">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-blue-900">
                  {bookingType === BookingType.ShortStay
                    ? `${duration.hours} hour${duration.hours > 1 ? 's' : ''}`
                    : `${duration.nights} night${duration.nights > 1 ? 's' : ''}`}
                </span>
              </div>
            )}

            {/* Filters Toggle */}
            <div className="flex items-center justify-between border-t pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                {showFilters ? 'Hide' : 'Show'} Filters
              </Button>

              {hasSearchParams && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              )}
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="minCapacity">Minimum Capacity</Label>
                  <Input
                    id="minCapacity"
                    type="number"
                    min="1"
                    placeholder="Any"
                    value={minCapacity || ''}
                    onChange={(e) => setMinCapacity(e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                  <p className="text-xs text-gray-500">Minimum number of guests</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="roomType">Room Type</Label>
                  <Select
                    value={roomType || 'any'}
                    onValueChange={(value) => setRoomType(value === 'any' ? undefined : value)}
                  >
                    <SelectTrigger id="roomType">
                      <SelectValue placeholder="Any Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Type</SelectItem>
                      {Object.entries(RoomTypeLabels).map(([key, label]) => (
                        <SelectItem key={key} value={label}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {!hasSearchParams ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center text-gray-500">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">Search for Available Rooms</h3>
              <p>Enter check-in and check-out dates to see available rooms</p>
            </div>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-blue-600" />
              <p className="text-gray-600">Searching available rooms...</p>
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center text-red-600">
              <AlertCircle className="h-16 w-16 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Rooms</h3>
              <p className="text-gray-600">
                {error instanceof Error ? error.message : 'An error occurred'}
              </p>
              <Button onClick={() => refetch()} className="mt-4">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : availabilityData?.rooms && availabilityData.rooms.length > 0 ? (
        <>
          {/* Results Header - Only show in full mode */}
          {!compact && (
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Available Rooms
                </h2>
                <p className="text-gray-600 mt-1">
                  {availabilityData.totalAvailable} room{availabilityData.totalAvailable !== 1 ? 's' : ''} available for your dates
                </p>
              </div>
            </div>
          )}

          {/* Room Cards Grid */}
          <div className={compact ? "space-y-2" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}>
            {availabilityData.rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                bookingType={bookingType}
                nights={duration.nights}
                hours={duration.hours}
                onSelect={onRoomSelect}
                selected={selectedRoomId === room.id}
                compact={compact}
              />
            ))}
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="p-12">
            <div className="text-center text-gray-500">
              <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">No Rooms Available</h3>
              <p>No rooms match your search criteria. Try adjusting your dates or filters.</p>
              <Button
                variant="outline"
                onClick={() => {
                  setMinCapacity(undefined);
                  setRoomType(undefined);
                }}
                className="mt-4"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
