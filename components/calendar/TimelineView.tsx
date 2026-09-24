import { Reservation, Room, RoomType } from '@/types';
import {
  DAY_HOURS, ShortStayIcon, formatHourLabel, formatStayTime, isSameDay, parseStayDate,
  roomReservationsTouching, statusColor,
} from './calendarUtils';

interface TimelineViewProps {
  currentDate: Date;
  rooms: Room[];
  reservations: Reservation[];
  onCreate: (date: Date, roomId?: number) => void;
  onSelect: (reservation: Reservation) => void;
}

/**
 * Horizontal position of a stay within the day, in percent: stays that start or end on
 * other days run to the edge of the timeline
 */
function barPosition(res: Reservation, currentDate: Date) {
  const checkIn = parseStayDate(res.checkInDate);
  const checkOut = parseStayDate(res.checkOutDate);

  const startHour = isSameDay(checkIn, currentDate) ? checkIn.getHours() + checkIn.getMinutes() / 60 : 0;
  const endHour = isSameDay(checkOut, currentDate) ? checkOut.getHours() + checkOut.getMinutes() / 60 : 24;

  return { left: (startHour / 24) * 100, width: ((endHour - startHour) / 24) * 100 };
}

export default function TimelineView({ currentDate, rooms, reservations, onCreate, onSelect }: TimelineViewProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-50 border-b">
        <div className="grid grid-cols-[150px_1fr]">
          <div className="p-3 border-r font-semibold text-sm">Rooms</div>
          <div className="grid grid-cols-24 text-xs">
            {DAY_HOURS.map(hour => (
              <div key={hour} className="p-2 text-center border-r border-gray-200">
                {formatHourLabel(hour, true)}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-h-[600px] overflow-y-auto">
        {rooms.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No rooms available. Please add rooms or adjust filters.</div>
        ) : (
          rooms.map(room => (
            <div key={room.id} className="border-b hover:bg-gray-50">
              <div className="grid grid-cols-[150px_1fr] min-h-[60px]">
                <div className="p-3 border-r bg-gray-50 flex flex-col justify-center">
                  <div className="font-bold text-sm">Room {room.roomNumber}</div>
                  <div className="text-xs text-gray-600">{RoomType[room.type]}</div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 grid grid-cols-24 pointer-events-none">
                    {DAY_HOURS.map(hour => <div key={hour} className="border-r border-gray-100" />)}
                  </div>

                  <div
                    className="absolute inset-0 cursor-pointer hover:bg-blue-50 transition-colors"
                    onClick={() => onCreate(currentDate, room.id)}
                    title={`Click to create reservation for Room ${room.roomNumber}`}
                  />

                  <div className="relative p-2 space-y-1 min-h-[60px] pointer-events-none">
                    {roomReservationsTouching(reservations, room.id, currentDate).map(res => {
                      const { left, width } = barPosition(res, currentDate);
                      return (
                        <div
                          key={res.id}
                          onClick={() => onSelect(res)}
                          className={`absolute h-8 rounded cursor-pointer hover:shadow-lg transition-all border-2 pointer-events-auto ${statusColor(res.status)} flex items-center px-2 overflow-hidden`}
                          style={{ left: `${left}%`, width: `${width}%`, zIndex: 10 }}
                          title={`${res.guestName} - ${formatStayTime(res.checkInDate)} to ${formatStayTime(res.checkOutDate)}`}
                        >
                          <div className="flex items-center gap-1 truncate">
                            <ShortStayIcon bookingType={res.bookingType} />
                            <span className="text-xs font-bold truncate">{res.guestName}</span>
                            <span className="text-xs opacity-70">
                              {formatStayTime(res.checkInDate)} - {formatStayTime(res.checkOutDate)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
