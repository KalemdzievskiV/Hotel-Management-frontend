import { BookingType, CreateGuestDto, CreateReservationDto, Room } from '@/types';
import { parseStayDate } from '@/components/calendar/calendarUtils';
import { ReservationFormErrors } from './types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Length of the stay as the price is calculated: nights for overnight stays (by calendar date),
 * started hours for short stays
 */
export function getStayLength(formData: CreateReservationDto): number {
  if (!formData.checkInDate || !formData.checkOutDate) return 0;
  const checkIn = parseStayDate(formData.checkInDate);
  const checkOut = parseStayDate(formData.checkOutDate);

  if (formData.bookingType === BookingType.ShortStay) {
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60));
  }
  const dayMs = 1000 * 60 * 60 * 24;
  const checkInDay = new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate()).getTime();
  const checkOutDay = new Date(checkOut.getFullYear(), checkOut.getMonth(), checkOut.getDate()).getTime();
  return Math.round((checkOutDay - checkInDay) / dayMs);
}

export function estimateTotal(formData: CreateReservationDto, room: Room | null): number {
  const length = getStayLength(formData);
  if (!room || length <= 0) return 0;
  return formData.bookingType === BookingType.ShortStay
    ? length * (room.shortStayHourlyRate || 0)
    : length * room.pricePerNight;
}

export function validateReservationForm(options: {
  formData: CreateReservationDto;
  room: Room | null;
  requireGuest: boolean;
  walkInGuest: CreateGuestDto | null;
}): ReservationFormErrors {
  const { formData, room, requireGuest, walkInGuest } = options;
  const errors: ReservationFormErrors = {};

  if (!formData.hotelId) errors.hotelId = 'Hotel is required';
  if (!formData.roomId) errors.roomId = 'Room is required';

  if (walkInGuest) {
    if (!walkInGuest.firstName?.trim()) errors.firstName = 'First name is required';
    if (!walkInGuest.lastName?.trim()) errors.lastName = 'Last name is required';
    if (!walkInGuest.email?.trim()) errors.email = 'Email is required';
    else if (!EMAIL_PATTERN.test(walkInGuest.email)) errors.email = 'Invalid email format';
    if (!walkInGuest.phoneNumber?.trim()) errors.phoneNumber = 'Phone number is required';
  } else if (requireGuest && !formData.guestId) {
    errors.guestId = 'Guest is required';
  }

  if (!formData.checkInDate) errors.checkInDate = 'Check-in date is required';
  if (!formData.checkOutDate) errors.checkOutDate = 'Check-out date is required';
  if (!formData.numberOfGuests || formData.numberOfGuests < 1) {
    errors.numberOfGuests = 'Number of guests must be at least 1';
  }

  if (formData.checkInDate && formData.checkOutDate && getStayLength(formData) <= 0) {
    errors.checkOutDate = formData.bookingType === BookingType.ShortStay
      ? 'Check-out time must be after check-in time'
      : 'Check-out date must be after check-in date for overnight stays';
  }

  if (formData.bookingType === BookingType.ShortStay && room && !room.allowsShortStay) {
    errors.roomId = 'Selected room does not allow short-stay bookings';
  }

  if (room && formData.numberOfGuests > room.capacity) {
    errors.numberOfGuests = `Room capacity is ${room.capacity} guests`;
  }

  return errors;
}
