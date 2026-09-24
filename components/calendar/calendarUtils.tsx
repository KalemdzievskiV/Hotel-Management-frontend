import { Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { BookingType, Reservation, ReservationStatus } from '@/types';

export type ViewMode = 'month' | 'week' | 'day' | 'timeline' | 'list';

export const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const DAY_HOURS = Array.from({ length: 24 }, (_, hour) => hour);

// One definition of how each status looks, shared by cards, badges and the legend
export const STATUS_STYLES: Record<ReservationStatus, { label: string; className: string }> = {
  [ReservationStatus.Pending]: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  [ReservationStatus.Confirmed]: { label: 'Confirmed', className: 'bg-blue-100 text-blue-800 border-blue-300' },
  [ReservationStatus.CheckedIn]: { label: 'Checked In', className: 'bg-green-100 text-green-800 border-green-300' },
  [ReservationStatus.CheckedOut]: { label: 'Checked Out', className: 'bg-gray-100 text-gray-800 border-gray-300' },
  [ReservationStatus.Cancelled]: { label: 'Cancelled', className: 'bg-red-100 text-red-800 border-red-300' },
  [ReservationStatus.NoShow]: { label: 'No Show', className: 'bg-orange-100 text-orange-800 border-orange-300' },
};

export function statusColor(status: ReservationStatus): string {
  return STATUS_STYLES[status]?.className ?? 'bg-gray-100 text-gray-800';
}

export function StatusBadge({ status }: { status: ReservationStatus }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES[ReservationStatus.Pending];
  return <Badge className={`${style.className} text-xs`}>{style.label}</Badge>;
}

export function ShortStayIcon({ bookingType }: { bookingType: BookingType }) {
  if (bookingType !== BookingType.ShortStay) return null;
  return (
    <span title="Short-Stay" className="inline-flex">
      <Clock className="h-3 w-3 text-purple-600" />
    </span>
  );
}

/**
 * Stay dates are hotel wall-clock values, so read the date/time digits as-is instead of letting
 * the browser shift them into its own time zone (which moved stays to the wrong day or hour).
 */
export function parseStayDate(value: string | Date): Date {
  if (value instanceof Date) return value;
  const [datePart, timePart = '00:00'] = value.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes] = timePart.split(':').map(Number);
  return new Date(year, month - 1, day, hours || 0, minutes || 0);
}

export function formatStayTime(value: string | Date): string {
  return parseStayDate(value).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isSameDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

export function formatHourLabel(hour: number, short = false): string {
  const suffix = hour < 12 ? (short ? 'A' : ' AM') : (short ? 'P' : ' PM');
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}${suffix}`;
}

/**
 * Reservations that occupy the room on this calendar day: overnight stays from the check-in
 * day up to (not including) the check-out day; same-day short stays on their day.
 */
export function reservationsOnDate(reservations: Reservation[], date: Date): Reservation[] {
  const day = startOfDay(date).getTime();
  return reservations.filter(res => {
    const checkIn = startOfDay(parseStayDate(res.checkInDate)).getTime();
    const checkOut = startOfDay(parseStayDate(res.checkOutDate)).getTime();
    return checkIn === checkOut ? day === checkIn : day >= checkIn && day < checkOut;
  });
}

/**
 * Reservations of a room that touch this day, including the check-out day
 * (the room is still in use until check-out time)
 */
export function roomReservationsTouching(reservations: Reservation[], roomId: number, date: Date): Reservation[] {
  const day = startOfDay(date).getTime();
  return reservations.filter(res => {
    if (res.roomId !== roomId) return false;
    const checkIn = startOfDay(parseStayDate(res.checkInDate)).getTime();
    const checkOut = startOfDay(parseStayDate(res.checkOutDate)).getTime();
    return checkIn <= day && checkOut >= day;
  });
}
