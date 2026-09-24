import { Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Reservation } from '@/types';
import {
  DAY_HOURS, DAY_NAMES, ShortStayIcon, formatHourLabel, formatStayTime, isSameDay, parseStayDate, statusColor,
} from './calendarUtils';

interface DayViewProps {
  currentDate: Date;
  reservations: Reservation[];
  onCreate: (date: Date) => void;
  onSelect: (reservation: Reservation) => void;
}

/**
 * Reservations shown in an hour row: same-day stays in every hour they overlap,
 * multi-day stays only in the hour they start
 */
function reservationsInHour(reservations: Reservation[], currentDate: Date, hourStart: Date, hourEnd: Date) {
  return reservations.filter(res => {
    const checkIn = parseStayDate(res.checkInDate);
    const checkOut = parseStayDate(res.checkOutDate);
    const sameDayStay = isSameDay(checkIn, checkOut) && isSameDay(checkIn, currentDate);

    return sameDayStay
      ? checkIn < hourEnd && checkOut > hourStart
      : checkIn >= hourStart && checkIn < hourEnd;
  });
}

export default function DayView({ currentDate, reservations, onCreate, onSelect }: DayViewProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="p-4 bg-gray-50 border-b text-center">
        <div className="text-sm text-gray-600">{DAY_NAMES[currentDate.getDay()]}</div>
        <div className="text-2xl font-bold text-gray-900">{currentDate.getDate()}</div>
      </div>
      <div className="max-h-[600px] overflow-y-auto">
        {DAY_HOURS.map(hour => {
          const hourStart = new Date(currentDate);
          hourStart.setHours(hour, 0, 0, 0);
          const hourEnd = new Date(currentDate);
          hourEnd.setHours(hour + 1, 0, 0, 0);
          const hourReservations = reservationsInHour(reservations, currentDate, hourStart, hourEnd);

          return (
            <div key={hour} className="grid grid-cols-[80px_1fr] border-b hover:bg-gray-50">
              <div className="py-2 px-2 text-right text-xs text-gray-600 border-r bg-gray-50">
                {formatHourLabel(hour)}
              </div>
              <div
                className={`p-1 min-h-[40px] cursor-pointer ${hourReservations.length > 0 ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1' : 'hover:bg-blue-50'}`}
                onClick={(e) => {
                  if (e.target === e.currentTarget) onCreate(hourStart);
                }}
                title="Click empty space to create reservation"
              >
                {hourReservations.map(res => {
                  const checkIn = parseStayDate(res.checkInDate);
                  const checkOut = parseStayDate(res.checkOutDate);
                  const isMultiDay = !isSameDay(checkIn, checkOut);
                  const startsInThisHour = checkIn >= hourStart && checkIn < hourEnd;

                  return (
                    <div
                      key={res.id}
                      onClick={() => onSelect(res)}
                      className={`text-xs p-2 rounded border cursor-pointer hover:shadow-md transition-shadow ${statusColor(res.status)} ${!startsInThisHour ? 'opacity-60' : ''}`}
                    >
                      <div className="flex items-center gap-1">
                        <ShortStayIcon bookingType={res.bookingType} />
                        <span className="font-bold truncate">Room {res.roomNumber}</span>
                      </div>
                      <div className="font-medium truncate text-[11px]">{res.guestName}</div>
                      <div className="text-[10px] opacity-70 flex items-center gap-1 mt-0.5">
                        <Clock className="h-2.5 w-2.5" />
                        <span className="truncate">{formatStayTime(res.checkInDate)} - {formatStayTime(res.checkOutDate)}</span>
                      </div>
                      {isMultiDay && (
                        <Badge variant="secondary" className="mt-0.5 text-[9px] px-1 py-0">Multi-day</Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
