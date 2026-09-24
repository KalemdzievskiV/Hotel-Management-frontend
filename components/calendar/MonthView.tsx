import { Clock, Plus } from 'lucide-react';
import { BookingType, Reservation } from '@/types';
import {
  DAY_NAMES, ShortStayIcon, formatStayTime, isSameDay, reservationsOnDate, statusColor,
} from './calendarUtils';

interface MonthViewProps {
  currentDate: Date;
  reservations: Reservation[];
  onCreate: (date: Date) => void;
  onSelect: (reservation: Reservation) => void;
}

function getMonthCells(currentDate: Date): (Date | null)[] {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const leadingBlanks = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];
}

export default function MonthView({ currentDate, reservations, onCreate, onSelect }: MonthViewProps) {
  const today = new Date();

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="grid grid-cols-7 bg-gray-50">
        {DAY_NAMES.map(day => (
          <div key={day} className="p-3 text-center text-sm font-semibold text-gray-700 border-b">
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{day.slice(0, 1)}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {getMonthCells(currentDate).map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="min-h-20 sm:min-h-32 p-1 sm:p-2 border-b border-r bg-gray-50" />;
          }

          const dayReservations = reservationsOnDate(reservations, date);
          const isToday = isSameDay(date, today);

          return (
            <div
              key={index}
              className={`min-h-20 sm:min-h-32 p-1 sm:p-2 border-b border-r relative cursor-pointer group hover:bg-blue-50 transition-colors ${
                isToday ? 'bg-blue-50' : 'bg-white'
              }`}
              onClick={(e) => {
                if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('empty-space')) {
                  onCreate(date);
                }
              }}
            >
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <div className={`text-xs sm:text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                  {date.getDate()}
                </div>
                <Plus className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block" />
              </div>
              <div className="space-y-0.5 sm:space-y-1">
                {dayReservations.slice(0, 3).map(res => (
                  <div
                    key={res.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(res);
                    }}
                    className={`text-[10px] sm:text-xs p-0.5 sm:p-1 rounded border cursor-pointer hover:shadow-sm transition-shadow ${statusColor(res.status)}`}
                    title={`${res.guestName} - Room ${res.roomNumber}\n${res.bookingType === BookingType.ShortStay ? `${formatStayTime(res.checkInDate)} - ${formatStayTime(res.checkOutDate)}` : 'Overnight'}`}
                  >
                    <div className="flex items-center gap-0.5 sm:gap-1">
                      <span className="hidden sm:inline"><ShortStayIcon bookingType={res.bookingType} /></span>
                      <span className="font-medium truncate text-[10px] sm:text-xs">{res.roomNumber}</span>
                    </div>
                    <div className="truncate text-[9px] sm:text-xs opacity-75 hidden sm:block">{res.guestName}</div>
                    {res.bookingType === BookingType.ShortStay && (
                      <div className="text-xs opacity-60 items-center gap-1 mt-0.5 hidden sm:flex">
                        <Clock className="h-2.5 w-2.5" />
                        {formatStayTime(res.checkInDate)} - {formatStayTime(res.checkOutDate)}
                      </div>
                    )}
                  </div>
                ))}
                {dayReservations.length > 3 && (
                  <div className="text-xs text-gray-500 pl-1">+{dayReservations.length - 3} more</div>
                )}
                {dayReservations.length === 0 && <div className="empty-space h-full"></div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
