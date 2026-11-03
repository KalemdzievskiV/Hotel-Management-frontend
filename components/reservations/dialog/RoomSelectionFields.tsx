import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookingType, CreateReservationDto, Hotel, Room } from '@/types';
import { FieldError, ReservationFormErrors } from './types';

/** Which rooms are free for the picked stay; absent until the stay is complete */
export interface RoomAvailability {
  loading: boolean;
  availableRoomIds: Set<number> | null;
}

interface RoomSelectionFieldsProps {
  formData: CreateReservationDto;
  hotels: Hotel[];
  rooms: Room[];
  selectedRoom: Room | null;
  errors: ReservationFormErrors;
  disabled: boolean;
  /** Filters the room list when creating; omitted when editing */
  availability?: RoomAvailability;
  onHotelChange: (hotelId: number) => void;
  onRoomChange: (room: Room) => void;
  /** Rendered between the hotel and the room, e.g. the stay picker */
  children?: React.ReactNode;
}

function roomLabel(room: Room, bookingType: BookingType) {
  const price = bookingType === BookingType.ShortStay
    ? `$${room.shortStayPrice ?? 0} short stay`
    : `$${room.pricePerNight}/night`;
  return `Room ${room.roomNumber} (${price}, Cap: ${room.capacity})`;
}

export default function RoomSelectionFields({
  formData, hotels, rooms, selectedRoom, errors, disabled, availability, onHotelChange, onRoomChange, children,
}: RoomSelectionFieldsProps) {
  const singleHotel = hotels.length === 1;
  const availableIds = availability?.availableRoomIds ?? null;
  const shortStay = formData.bookingType === BookingType.ShortStay;

  // Once the stay is known only free rooms are offered; the selected room stays listed so the
  // field can show it, marked as taken
  const listedRooms = availableIds
    ? rooms.filter(r => availableIds.has(r.id) || r.id === formData.roomId)
    : shortStay ? rooms.filter(r => r.allowsShortStay || r.id === formData.roomId) : rooms;
  const selectedTaken = !!availableIds && !!formData.roomId && !availableIds.has(formData.roomId);

  let roomHint: string | null = null;
  if (availability && formData.hotelId) {
    if (availability.loading) roomHint = 'Checking which rooms are free…';
    else if (availableIds) roomHint = `${availableIds.size} of ${rooms.length} rooms free for this stay`;
    else roomHint = 'Pick the stay to see which rooms are free';
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="hotel">Hotel *</Label>
        <Select
          value={formData.hotelId ? formData.hotelId.toString() : ''}
          onValueChange={(value) => onHotelChange(parseInt(value))}
          disabled={disabled || singleHotel}
        >
          <SelectTrigger id="hotel" className={`w-full ${errors.hotelId ? 'border-red-500' : ''}`}>
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

      {children}

      <div>
        <Label htmlFor="room">Room *</Label>
        <Select
          value={formData.roomId ? formData.roomId.toString() : ''}
          onValueChange={(value) => {
            const room = rooms.find(r => r.id === parseInt(value));
            if (room) onRoomChange(room);
          }}
          disabled={!formData.hotelId || disabled || availability?.loading}
        >
          <SelectTrigger id="room" className={`w-full ${errors.roomId || selectedTaken ? 'border-red-500' : ''}`}>
            <SelectValue placeholder={availableIds && availableIds.size === 0 ? 'No rooms free for this stay' : 'Select room'} />
          </SelectTrigger>
          <SelectContent position="popper" sideOffset={5}>
            {listedRooms.map(room => (
              <SelectItem key={room.id} value={room.id.toString()}>
                {roomLabel(room, formData.bookingType)}
                {availableIds && !availableIds.has(room.id) && ' — not free'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {roomHint && <p className="text-xs text-gray-500 mt-1">{roomHint}</p>}
        {selectedTaken && selectedRoom && (
          <p className="text-xs text-red-500 mt-1">Room {selectedRoom.roomNumber} is not free for this stay. Pick another room.</p>
        )}
        {selectedRoom && (
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
            <span>Capacity: {selectedRoom.capacity} guests</span>
            {selectedRoom.allowsShortStay && (
              <span className="text-purple-600">• Short stay: {selectedRoom.shortStayHours ?? 4}h for ${selectedRoom.shortStayPrice ?? 0}</span>
            )}
          </div>
        )}
        <FieldError message={errors.roomId} />
      </div>
    </div>
  );
}
