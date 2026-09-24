import { Clock } from 'lucide-react';
import { BookingType, Reservation } from '@/types';
import {
  DAY_NAMES, ShortStayIcon, formatStayTime, isSameDay, reservationsOnDate, statusColor,
} from './calendarUtils';

interface WeekViewProps {
  weekDays: Date[];
  reservations: Reservation[];
  onCreate: (date: Date) => void;
  onSelect: (reservation: Reservation) => void;
}

export default function WeekView({ weekDays, reservations, onCreate, onSelect }: WeekViewProps) {
  const today = new Date();

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {weekDays.map((date, index) => {
          const dayReservations = reservationsOnDate(reservations, date);
          const isToday = isSameDay(date, today);

          return (
            <div key={index} className="bg-white">
              <div
                className={`p-3 text-center border-b cursor-pointer hover:bg-blue-100 transition-colors ${isToday ? 'bg-blue-50' : 'bg-gray-50'}`}
                onClick={() => onCreate(date)}
                title="Click to create reservation"
              >
                <div className="text-xs text-gray-600">{DAY_NAMES[index]}</div>
                <div className={`text-lg font-bold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>{date.getDate()}</div>
              </div>
              <div
                className="p-2 space-y-2 min-h-[400px] cursor-pointer hover:bg-gray-50"
                onClick={(e) => {
                  if (e.target === e.currentTarget) onCreate(date);
                }}
              >
                {dayReservations.map(res => (
                  <div
                    key={res.id}
                    onClick={() => onSelect(res)}
                    className={`text-xs p-2 rounded border cursor-pointer hover:shadow-md transition-shadow ${statusColor(res.status)}`}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <ShortStayIcon bookingType={res.bookingType} />
                      <span className="font-bold">Room {res.roomNumber}</span>
                    </div>
                    <div className="font-medium">{res.guestName}</div>
                    {res.bookingType === BookingType.ShortStay && (
                      <div className="text-xs opacity-70 flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" />
                        {formatStayTime(res.checkInDate)} - {formatStayTime(res.checkOutDate)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
