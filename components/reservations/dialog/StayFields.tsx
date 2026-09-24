import { AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { BookingType, CreateReservationDto, Room } from '@/types';
import { FieldError, ReservationFormErrors } from './types';

interface StayFieldsProps {
  formData: CreateReservationDto;
  onChange: (changes: Partial<CreateReservationDto>) => void;
  selectedRoom: Room | null;
  estimatedTotal: number;
  errors: ReservationFormErrors;
  /** Completed reservations keep their stay details; only notes can change */
  stayLocked: boolean;
  /** The booking type is fixed once a reservation exists */
  bookingTypeLocked: boolean;
  /** Internal notes are for staff only */
  showInternalNotes: boolean;
}

export default function StayFields({
  formData, onChange, selectedRoom, estimatedTotal, errors, stayLocked, bookingTypeLocked, showInternalNotes,
}: StayFieldsProps) {
  const isShortStay = formData.bookingType === BookingType.ShortStay;
  // Overnight stays are dates; short stays need a time too
  const inputType = isShortStay ? 'datetime-local' : 'date';

  return (
    <>
      <div>
        <Label htmlFor="bookingType">Booking Type *</Label>
        <Select
          value={formData.bookingType?.toString()}
          onValueChange={(value) => onChange({ bookingType: parseInt(value) })}
          disabled={bookingTypeLocked}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper" sideOffset={5}>
            <SelectItem value={BookingType.Daily.toString()}>Daily (Overnight)</SelectItem>
            <SelectItem value={BookingType.ShortStay.toString()}>Short-Stay (Hourly)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isShortStay && (
        <div className="bg-purple-50 border border-purple-200 rounded-md p-3 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-purple-600 mt-0.5" />
          <div className="text-xs text-purple-800">
            <p className="font-semibold">Short-Stay Booking</p>
            <p>Select both date and time for check-in and check-out. Same-day bookings are allowed.</p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="checkIn">Check-in *</Label>
          <Input
            id="checkIn"
            type={inputType}
            value={formData.checkInDate as string}
            onChange={(e) => onChange({ checkInDate: e.target.value })}
            className={errors.checkInDate ? 'border-red-500' : ''}
            disabled={stayLocked}
          />
          <FieldError message={errors.checkInDate} />
        </div>
        <div>
          <Label htmlFor="checkOut">Check-out *</Label>
          <Input
            id="checkOut"
            type={inputType}
            value={formData.checkOutDate as string}
            onChange={(e) => onChange({ checkOutDate: e.target.value })}
            className={errors.checkOutDate ? 'border-red-500' : ''}
            disabled={stayLocked}
          />
          <FieldError message={errors.checkOutDate} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="guests">Number of Guests *</Label>
          <Input
            id="guests"
            type="number"
            min="1"
            max={selectedRoom?.capacity}
            value={formData.numberOfGuests}
            onChange={(e) => onChange({ numberOfGuests: parseInt(e.target.value) })}
            className={errors.numberOfGuests ? 'border-red-500' : ''}
            disabled={stayLocked}
          />
          {selectedRoom && (
            <p className="text-xs text-gray-500 mt-1">
              Max capacity: {selectedRoom.capacity} {selectedRoom.capacity === 1 ? 'guest' : 'guests'}
            </p>
          )}
          <FieldError message={errors.numberOfGuests} />
        </div>

        {isShortStay && formData.durationInHours && (
          <div>
            <Label>Duration</Label>
            <Input type="text" value={`${formData.durationInHours} hours`} disabled className="bg-gray-50" />
            <p className="text-xs text-gray-500 mt-1">Auto-calculated</p>
          </div>
        )}
      </div>

      {estimatedTotal > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3">
          <Label className="text-xs text-green-800">Estimated Total</Label>
          <p className="text-2xl font-bold text-green-600">${estimatedTotal.toFixed(2)}</p>
        </div>
      )}

      <div>
        <Label htmlFor="specialRequests">Special Requests</Label>
        <Textarea
          id="specialRequests"
          value={formData.specialRequests}
          onChange={(e) => onChange({ specialRequests: e.target.value })}
          placeholder="Any special requirements..."
          rows={2}
        />
      </div>

      {showInternalNotes && (
        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => onChange({ notes: e.target.value })}
            placeholder="Internal notes..."
            rows={2}
          />
        </div>
      )}
    </>
  );
}
