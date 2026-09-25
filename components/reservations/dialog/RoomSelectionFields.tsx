import { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateReservationDto, Hotel, Room } from '@/types';
import { AvailabilityCalendar } from '../AvailabilityCalendar';
import { FieldError, ReservationFormErrors } from './types';

interface RoomSelectionFieldsProps {
  formData: CreateReservationDto;
  hotels: Hotel[];
  rooms: Room[];
  selectedRoom: Room | null;
  errors: ReservationFormErrors;
  /** Availability search only makes sense when creating */
  allowAvailabilitySearch: boolean;
  disabled: boolean;
  onHotelChange: (hotelId: number) => void;
  onRoomChange: (room: Room) => void;
  onClearErrors: () => void;
}

export default function RoomSelectionFields({
  formData, hotels, rooms, selectedRoom, errors, allowAvailabilitySearch, disabled,
  onHotelChange, onRoomChange, onClearErrors,
}: RoomSelectionFieldsProps) {
  const [searchAvailability, setSearchAvailability] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Room Selection</Label>
        {allowAvailabilitySearch && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchAvailability(!searchAvailability);
              onClearErrors();
            }}
            className="text-xs h-7"
          >
            <Search className="h-3 w-3 mr-1" />
            {searchAvailability ? 'Manual Selection' : 'Search Available'}
          </Button>
        )}
      </div>

      <div>
        <Label htmlFor="hotel">Hotel *</Label>
        <Select value={formData.hotelId ? formData.hotelId.toString() : ''} onValueChange={(value) => onHotelChange(parseInt(value))} disabled={disabled}>
          <SelectTrigger className={`w-full ${errors.hotelId ? 'border-red-500' : ''}`}>
            <SelectValue placeholder="Select hotel" />
          </SelectTrigger>
          <SelectContent position="popper" sideOffset={5}>
            {hotels.map(hotel => (
              <SelectItem key={hotel.id} value={hotel.id.toString()}>{hotel.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError message={errors.hotelId} />
      </div>

      {searchAvailability ? (
        formData.hotelId ? (
          <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
            <AvailabilityCalendar
              hotelId={formData.hotelId}
              defaultCheckIn={formData.checkInDate}
              defaultCheckOut={formData.checkOutDate}
              defaultBookingType={formData.bookingType}
              onRoomSelect={(room) => {
                onRoomChange(room);
                setSearchAvailability(false);
              }}
              selectedRoomId={formData.roomId || undefined}
              compact
            />
          </div>
        ) : (
          <div className="border rounded-lg p-8 bg-gray-50 text-center">
            <p className="text-gray-500">Please select a hotel first to search available rooms</p>
          </div>
        )
      ) : (
        <div>
          <Label htmlFor="room">Room *</Label>
          <Select
            value={formData.roomId ? formData.roomId.toString() : ''}
            onValueChange={(value) => {
              const room = rooms.find(r => r.id === parseInt(value));
              if (room) onRoomChange(room);
            }}
            disabled={!formData.hotelId || disabled}
          >
            <SelectTrigger className={`w-full ${errors.roomId ? 'border-red-500' : ''}`}>
              <SelectValue placeholder="Select room" />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={5}>
              {rooms.map(room => (
                <SelectItem key={room.id} value={room.id.toString()}>
                  Room {room.roomNumber} (${room.pricePerNight}/night, Cap: {room.capacity})
                  {room.allowsShortStay && ' ⏰'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedRoom && (
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
              <span>Capacity: {selectedRoom.capacity} guests</span>
              {selectedRoom.allowsShortStay && <span className="text-purple-600">• Short-stay available</span>}
            </div>
          )}
          <FieldError message={errors.roomId} />
        </div>
      )}
    </div>
  );
}
