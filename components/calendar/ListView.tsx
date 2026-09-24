import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { BookingType, Reservation, Room, RoomType } from '@/types';
import {
  ShortStayIcon, StatusBadge, formatStayTime, parseStayDate, roomReservationsTouching, statusColor,
} from './calendarUtils';

interface ListViewProps {
  currentDate: Date;
  rooms: Room[];
  reservations: Reservation[];
  onCreate: (date: Date, roomId?: number) => void;
  onSelect: (reservation: Reservation) => void;
}

export default function ListView({ currentDate, rooms, reservations, onCreate, onSelect }: ListViewProps) {
  if (rooms.length === 0) {
    return <div className="p-8 text-center text-gray-500">No rooms available. Please add rooms or adjust filters.</div>;
  }

  return (
    <div className="space-y-3">
      {rooms.map(room => {
        const roomReservations = roomReservationsTouching(reservations, room.id, currentDate);

        return (
          <Card key={room.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div
                className="p-4 bg-gray-50 border-b flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => onCreate(currentDate, room.id)}
              >
                <div>
                  <div className="font-bold text-lg">Room {room.roomNumber}</div>
                  <div className="text-sm text-gray-600">{RoomType[room.type]} • Capacity: {room.capacity}</div>
                </div>
                <div className="flex items-center gap-2">
                  {roomReservations.length > 0 ? (
                    <Badge variant="secondary">
                      {roomReservations.length} booking{roomReservations.length > 1 ? 's' : ''}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-green-600">Available</Badge>
                  )}
                  <Plus className="h-5 w-5 text-gray-400" />
                </div>
              </div>

              {roomReservations.length > 0 ? (
                <div className="divide-y">
                  {roomReservations.map(res => (
                    <div
                      key={res.id}
                      onClick={() => onSelect(res)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${statusColor(res.status)}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <ShortStayIcon bookingType={res.bookingType} />
                            <StatusBadge status={res.status} />
                          </div>
                          <div className="font-semibold text-gray-900 mb-1">{res.guestName}</div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="h-4 w-4" />
                              <span>
                                {res.bookingType === BookingType.ShortStay
                                  ? `${formatStayTime(res.checkInDate)} - ${formatStayTime(res.checkOutDate)}`
                                  : `${parseStayDate(res.checkInDate).toLocaleDateString()} - ${parseStayDate(res.checkOutDate).toLocaleDateString()}`}
                              </span>
                            </div>
                            {res.numberOfGuests > 0 && (
                              <div className="flex items-center gap-2">
                                <span>{res.numberOfGuests} guest{res.numberOfGuests > 1 ? 's' : ''}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg text-green-600">${res.totalAmount || 0}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500 text-sm">
                  No reservations for this date. Click the room header to create one.
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
