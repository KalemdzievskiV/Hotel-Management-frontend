import { Calendar, Clock, DollarSign, Home, User } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { parseStayDate } from '@/components/calendar/calendarUtils';
import { BookingType, Reservation } from '@/types';

function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs text-gray-500">{label}</Label>
      <div className="flex items-center gap-2 mt-1">
        {icon}
        {children}
      </div>
    </div>
  );
}

function formatStay(value: string | Date, bookingType: BookingType) {
  const date = parseStayDate(value);
  return bookingType === BookingType.ShortStay ? date.toLocaleString() : date.toLocaleDateString();
}

/**
 * Read-only view of a reservation
 */
export default function ReservationSummary({ reservation }: { reservation: Reservation }) {
  const isShortStay = reservation.bookingType === BookingType.ShortStay;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Guest" icon={<User className="h-4 w-4 text-gray-400" />}>
          <span className="font-medium">{reservation.guestName}</span>
        </Field>
        <Field label="Hotel" icon={<Home className="h-4 w-4 text-gray-400" />}>
          <span className="font-medium">{reservation.hotelName}</span>
        </Field>
        <Field label="Room">
          <span className="font-medium">Room {reservation.roomNumber}</span>
        </Field>
        <Field label="Booking Type" icon={isShortStay ? <Clock className="h-4 w-4 text-purple-600" /> : undefined}>
          <span className="font-medium">{isShortStay ? 'Short Stay' : 'Daily'}</span>
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Check-in" icon={<Calendar className="h-4 w-4 text-gray-400" />}>
          <span className="font-medium">{formatStay(reservation.checkInDate, reservation.bookingType)}</span>
        </Field>
        <Field label="Check-out" icon={<Calendar className="h-4 w-4 text-gray-400" />}>
          <span className="font-medium">{formatStay(reservation.checkOutDate, reservation.bookingType)}</span>
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Total Amount" icon={<DollarSign className="h-4 w-4 text-green-600" />}>
          <span className="font-bold text-lg">${reservation.totalAmount || 0}</span>
        </Field>
        <Field label="Number of Guests">
          <span className="font-medium">{reservation.numberOfGuests}</span>
        </Field>
      </div>

      {reservation.specialRequests && (
        <div>
          <Label className="text-xs text-gray-500">Special Requests</Label>
          <p className="mt-1 text-sm">{reservation.specialRequests}</p>
        </div>
      )}

      {reservation.notes && (
        <div>
          <Label className="text-xs text-gray-500">Notes</Label>
          <p className="mt-1 text-sm">{reservation.notes}</p>
        </div>
      )}
    </div>
  );
}
