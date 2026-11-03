import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { BookingType } from '@/types';
import { FieldError, ReservationFormErrors } from './types';
import {
  MAX_SHORT_STAY_HOURS, MIN_SHORT_STAY_HOURS, SHORT_STAY_PRESETS,
  StayChoice, describeStayTime, nextDay, resolveStay,
} from './stay';

interface StayPickerProps {
  value: StayChoice;
  onChange: (value: StayChoice) => void;
  /** Staff can pick any short-stay length; guests get the room's standard length */
  canChangeShortStayHours: boolean;
  /** The standard short-stay length to offer guests (the selected room's, or the default) */
  standardShortStayHours: number;
  errors: ReservationFormErrors;
}

function LengthOption({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <Button
      type="button"
      size="sm"
      variant={active ? 'default' : 'outline'}
      onClick={onClick}
      aria-pressed={active}
      className="min-w-[4.5rem]"
    >
      {children}
    </Button>
  );
}

export default function StayPicker({
  value, onChange, canChangeShortStayHours, standardShortStayHours, errors,
}: StayPickerProps) {
  const set = (changes: Partial<StayChoice>) => onChange({ ...value, ...changes });
  const stay = resolveStay(value);
  const isShortStay = stay.bookingType === BookingType.ShortStay;
  const today = new Date().toISOString().slice(0, 10);

  const changeDay = (day: string) => {
    // Keep check-out after check-in
    const checkOutDay = !value.checkOutDay || value.checkOutDay <= day ? (day ? nextDay(day) : '') : value.checkOutDay;
    set({ day, checkOutDay });
  };

  const shortStayOptions = canChangeShortStayHours ? SHORT_STAY_PRESETS : [standardShortStayHours];

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <Label className="text-base font-semibold">Stay</Label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="checkInDay">Check-in date *</Label>
          <Input
            id="checkInDay"
            type="date"
            min={today}
            value={value.day}
            onChange={(e) => changeDay(e.target.value)}
            className={errors.checkInDate ? 'border-red-500' : ''}
          />
          <FieldError message={errors.checkInDate} />
        </div>
        <div>
          <Label htmlFor="checkInTime">Check-in time <span className="text-gray-400 font-normal">(optional)</span></Label>
          <div className="flex gap-2">
            <Input
              id="checkInTime"
              type="time"
              value={value.time}
              disabled={!value.day}
              onChange={(e) => set({ time: e.target.value })}
            />
            {value.time && (
              <Button type="button" variant="ghost" size="sm" onClick={() => set({ time: '', length: null })}>
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {value.time ? (
        <div className="space-y-3">
          <div>
            <Label>How long?</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {shortStayOptions.map((hours) => (
                <LengthOption
                  key={hours}
                  active={value.length === 'short' && value.hours === hours}
                  onClick={() => set({ length: 'short', hours })}
                >
                  {canChangeShortStayHours ? `${hours}h` : `Short stay · ${hours}h`}
                </LengthOption>
              ))}
              <LengthOption active={value.length === 'overnight'} onClick={() => set({ length: 'overnight' })}>
                Overnight
              </LengthOption>
              <LengthOption active={value.length === '24h'} onClick={() => set({ length: '24h' })}>
                24h
              </LengthOption>
            </div>
          </div>

          {value.length === 'short' && canChangeShortStayHours && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Hours:</span>
              <Button
                type="button" variant="outline" size="icon" className="h-8 w-8"
                aria-label="One hour less"
                disabled={value.hours <= MIN_SHORT_STAY_HOURS}
                onClick={() => set({ hours: value.hours - 1 })}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-10 text-center font-semibold">{value.hours}h</span>
              <Button
                type="button" variant="outline" size="icon" className="h-8 w-8"
                aria-label="One hour more"
                disabled={value.hours >= MAX_SHORT_STAY_HOURS}
                onClick={() => set({ hours: value.hours + 1 })}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}

          {value.length === 'overnight' && (
            <div className="sm:w-1/2">
              <Label htmlFor="checkOutDay">Check-out date *</Label>
              <Input
                id="checkOutDay"
                type="date"
                min={value.day ? nextDay(value.day) : today}
                value={value.checkOutDay}
                onChange={(e) => set({ checkOutDay: e.target.value })}
                className={errors.checkOutDate ? 'border-red-500' : ''}
              />
            </div>
          )}

          {(value.length === 'short' || value.length === '24h') && stay.checkOutDate && (
            <p className="text-sm text-gray-600">
              Check-out: <span className="font-medium text-gray-900">{describeStayTime(stay.checkOutDate)}</span>
            </p>
          )}

          {!value.length && <FieldError message={errors.checkOutDate && 'Choose how long the stay is'} />}
          {value.length && <FieldError message={errors.checkOutDate} />}
        </div>
      ) : (
        <div className="sm:w-1/2">
          <Label htmlFor="checkOutDay">Check-out date *</Label>
          <Input
            id="checkOutDay"
            type="date"
            min={value.day ? nextDay(value.day) : today}
            value={value.checkOutDay}
            disabled={!value.day}
            onChange={(e) => set({ checkOutDay: e.target.value })}
            className={errors.checkOutDate ? 'border-red-500' : ''}
          />
          <FieldError message={errors.checkOutDate} />
          <p className="text-xs text-gray-500 mt-1">Add a check-in time for short stays and 24-hour bookings.</p>
        </div>
      )}

      {value.day && (value.time ? value.length : true) && (
        <p className="text-xs text-gray-500">
          Booking type:{' '}
          <span className={cn('font-medium', isShortStay ? 'text-purple-700' : 'text-gray-800')}>
            {isShortStay ? 'Short stay' : 'Overnight'}
          </span>
        </p>
      )}
    </div>
  );
}
