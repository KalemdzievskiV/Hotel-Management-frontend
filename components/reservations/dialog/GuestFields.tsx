import { AlertCircle, User, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateGuestDto, Guest } from '@/types';
import { FieldError, ReservationFormErrors } from './types';

interface GuestFieldsProps {
  /** Guests book for themselves; staff pick a guest or register a walk-in */
  bookingForSelf: boolean;
  selfName: string;
  selfEmail: string;
  guests: Guest[];
  guestId: number;
  onGuestChange: (guestId: number) => void;
  walkIn: boolean;
  /** Walk-ins can only be registered while creating a reservation */
  allowWalkIn: boolean;
  onWalkInChange: (walkIn: boolean) => void;
  walkInGuest: CreateGuestDto;
  onWalkInGuestChange: (guest: CreateGuestDto) => void;
  errors: ReservationFormErrors;
  disabled: boolean;
}

export default function GuestFields({
  bookingForSelf, selfName, selfEmail, guests, guestId, onGuestChange, walkIn, allowWalkIn,
  onWalkInChange, walkInGuest, onWalkInGuestChange, errors, disabled,
}: GuestFieldsProps) {
  if (bookingForSelf) {
    return (
      <div className="space-y-2">
        <Label>Booking As</Label>
        <div className="p-3 bg-green-50 border border-green-200 rounded-md flex items-start gap-2">
          <User className="h-4 w-4 text-green-600 mt-0.5" />
          <div className="text-sm text-green-800">
            <p className="font-semibold">{selfName}</p>
            <p className="text-xs">{selfEmail}</p>
          </div>
        </div>
      </div>
    );
  }

  const walkInInput = (field: keyof CreateGuestDto, label: string, placeholder: string, type = 'text') => (
    <div>
      <Label htmlFor={`walkIn-${field}`} className="text-xs">{label} *</Label>
      <Input
        id={`walkIn-${field}`}
        type={type}
        value={(walkInGuest[field] as string) ?? ''}
        onChange={(e) => onWalkInGuestChange({ ...walkInGuest, [field]: e.target.value })}
        placeholder={placeholder}
        className={errors[field] ? 'border-red-500' : ''}
      />
      <FieldError message={errors[field]} />
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label htmlFor="guest">Guest *</Label>
        {allowWalkIn && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onWalkInChange(!walkIn)} className="text-xs h-7">
            <UserPlus className="h-3 w-3 mr-1" />
            {walkIn ? 'Select Existing' : 'Walk-in Guest'}
          </Button>
        )}
      </div>

      {walkIn ? (
        <div className="space-y-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-xs text-blue-800">
              <p className="font-semibold">Quick Walk-in Guest</p>
              <p>Enter required info. You can add more details later from the Guests page.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {walkInInput('firstName', 'First Name', 'John')}
            {walkInInput('lastName', 'Last Name', 'Doe')}
            {walkInInput('email', 'Email', 'john.doe@email.com', 'email')}
            {walkInInput('phoneNumber', 'Phone Number', '+1234567890', 'tel')}
          </div>
        </div>
      ) : (
        <>
          <Select value={guestId ? guestId.toString() : ''} onValueChange={(value) => onGuestChange(parseInt(value))} disabled={disabled}>
            <SelectTrigger className={`w-full ${errors.guestId ? 'border-red-500' : ''}`}>
              <SelectValue placeholder="Select guest" />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={5}>
              {guests.map(guest => (
                <SelectItem key={guest.id} value={guest.id.toString()}>
                  {guest.firstName} {guest.lastName} - {guest.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError message={errors.guestId} />
        </>
      )}
    </div>
  );
}
