'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { AvailabilityCalendar } from '@/components/reservations/AvailabilityCalendar';
import { usePublicHotels } from '@/hooks/usePublicHotels';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ui/Toast';
import { Room } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Building2, CheckCircle2, Search } from 'lucide-react';

export default function AvailabilityPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { user } = useAuthStore();
  const { data: hotels, isLoading: loadingHotels } = usePublicHotels();
  
  const [selectedHotelId, setSelectedHotelId] = useState<number | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  
  const isGuest = user?.roles.includes('Guest');

  const handleRoomSelect = (room: Room) => {
    setSelectedRoom(room);
    showToast(`Selected Room ${room.roomNumber}`, 'success');
  };

  const handleCreateReservation = () => {
    if (!selectedRoom) {
      showToast('Please select a room first', 'error');
      return;
    }
    
    // Navigate to calendar with pre-filled data
    router.push(`/dashboard/calendar?roomId=${selectedRoom.id}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isGuest ? 'Find Available Rooms' : 'Room Availability'}
          </h1>
          <p className="mt-1 text-gray-600">
            {isGuest 
              ? 'Browse hotels and find the perfect room for your stay'
              : 'Search and view available rooms across all hotels'
            }
          </p>
        </div>

        {/* Hotel Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              {isGuest ? 'Choose Your Hotel' : 'Select Hotel'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="hotel">Hotel</Label>
                {!loadingHotels && hotels && hotels.length > 0 && (
                  <span className="text-sm text-gray-500">
                    {hotels.length} {hotels.length === 1 ? 'hotel' : 'hotels'} available
                  </span>
                )}
              </div>
              {loadingHotels ? (
                <div className="flex items-center gap-2 text-sm text-gray-500 p-3 bg-gray-50 rounded-lg">
                  <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading hotels...
                </div>
              ) : hotels && hotels.length === 0 ? (
                <div className="text-sm text-amber-600 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  No hotels available at the moment.
                </div>
              ) : (
                <Select
                  value={selectedHotelId?.toString() || ''}
                  onValueChange={(value) => setSelectedHotelId(parseInt(value))}
                >
                  <SelectTrigger id="hotel">
                    <SelectValue placeholder="Select a hotel to view rooms" />
                  </SelectTrigger>
                  <SelectContent>
                    {hotels?.map((hotel) => (
                      <SelectItem key={hotel.id} value={hotel.id.toString()}>
                        {hotel.name} {hotel.city ? `• ${hotel.city}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Selected Room Info */}
        {selectedRoom && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-semibold text-green-900">
                      Room {selectedRoom.roomNumber} Selected
                    </div>
                    <div className="text-sm text-green-700">
                      {selectedRoom.capacity} guests • ${selectedRoom.pricePerNight}/night
                    </div>
                  </div>
                </div>
                <Button onClick={handleCreateReservation}>
                  Create Reservation
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Availability Calendar */}
        {selectedHotelId ? (
          <AvailabilityCalendar
            hotelId={selectedHotelId}
            onRoomSelect={handleRoomSelect}
            selectedRoomId={selectedRoom?.id}
          />
        ) : (
          <Card>
            <CardContent className="p-12">
              <div className="text-center text-gray-500">
                <Building2 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold mb-2">Select a Hotel</h3>
                <p>Choose a hotel from the dropdown above to view available rooms</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
