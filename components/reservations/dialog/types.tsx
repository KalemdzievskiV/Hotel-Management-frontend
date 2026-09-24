import { CreateGuestDto, CreateReservationDto } from '@/types';

export type ReservationDialogMode = 'create' | 'edit' | 'view';

export type ReservationFormErrors = Partial<Record<keyof CreateReservationDto | keyof CreateGuestDto, string>>;

export function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-xs text-red-500 mt-1">{message}</p> : null;
}
