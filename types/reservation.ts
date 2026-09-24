import { BookingType, ReservationStatus, PaymentStatus, PaymentMethod } from './enums';

// Reservation types matching backend

export interface Reservation {
  id: number;
  hotelId: number;
  roomId: number;
  guestId: number;
  createdByUserId: string;
  
  // Booking Details
  bookingType: BookingType;
  checkInDate: Date | string;
  checkOutDate: Date | string;
  durationInHours?: number;
  numberOfGuests: number;
  
  // Status
  status: ReservationStatus;
  
  // Financial
  totalAmount: number;
  depositAmount: number;
  remainingAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  
  // Notes
  specialRequests?: string;
  notes?: string;
  
  // Timestamps
  createdAt: Date | string;
  updatedAt?: Date | string;
  confirmedAt?: Date | string;
  checkedInAt?: Date | string;
  checkedOutAt?: Date | string;
  cancelledAt?: Date | string;
  cancellationReason?: string;
  
  // Computed
  totalNights?: number;
  isActive?: boolean;
  canCheckIn?: boolean;
  canCheckOut?: boolean;
  canCancel?: boolean;
  
  // Computed from relations
  hotelName?: string;
  roomNumber?: string;
  guestName?: string;
  createdByUserName?: string;
}

export interface CreateReservationDto {
  hotelId: number;
  roomId: number;
  guestId: number;
  bookingType: BookingType;
  checkInDate: string;
  checkOutDate: string;
  durationInHours?: number;
  numberOfGuests: number;
  depositAmount?: number;
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  specialRequests?: string;
  notes?: string;
}

export interface UpdateReservationDto {
  checkInDate?: string;
  checkOutDate?: string;
  numberOfGuests?: number;
  specialRequests?: string;
  notes?: string;
}

// One entry of a reservation's payment ledger (type 1 = payment, 2 = refund)
export interface ReservationPayment {
  id: number;
  reservationId: number;
  type: 1 | 2;
  amount: number;
  method?: PaymentMethod;
  reference?: string;
  notes?: string;
  createdAt: string;
  createdByName?: string;
}

export interface RecordPaymentDto {
  amount: number;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
}

export interface CancelReservationDto {
  reason: string;
}
