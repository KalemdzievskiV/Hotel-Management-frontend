// All enums matching the backend

export enum RoomType {
  Single = 1,
  Double = 2,
  Twin = 3,
  Triple = 4,
  Suite = 5,
  Deluxe = 6,
  Presidential = 7,
  Studio = 8,
  Family = 9,
  Accessible = 10,
}

export enum RoomStatus {
  Available = 1,
  Occupied = 2,
  Cleaning = 3,
  Maintenance = 4,
  OutOfService = 5,
  Reserved = 6,
}

export enum BookingType {
  Daily = 0,
  ShortStay = 1,
}

export enum ReservationStatus {
  Pending = 0,
  Confirmed = 1,
  CheckedIn = 2,
  CheckedOut = 3,
  Cancelled = 4,
  NoShow = 5,
}

export enum PaymentStatus {
  Unpaid = 0,
  PartiallyPaid = 1,
  Paid = 2,
  Refunding = 3,
  Refunded = 4,
}

export enum PaymentMethod {
  Cash = 0,
  CreditCard = 1,
  DebitCard = 2,
  BankTransfer = 3,
  Online = 4,
  PayOnArrival = 5,
}

// Helper functions to get labels
export const RoomTypeLabels: Record<RoomType, string> = {
  [RoomType.Single]: 'Single',
  [RoomType.Double]: 'Double',
  [RoomType.Twin]: 'Twin',
  [RoomType.Triple]: 'Triple',
  [RoomType.Suite]: 'Suite',
  [RoomType.Deluxe]: 'Deluxe',
  [RoomType.Presidential]: 'Presidential',
  [RoomType.Studio]: 'Studio',
  [RoomType.Family]: 'Family',
  [RoomType.Accessible]: 'Accessible',
};

export const RoomStatusLabels: Record<RoomStatus, string> = {
  [RoomStatus.Available]: 'Available',
  [RoomStatus.Occupied]: 'Occupied',
  [RoomStatus.Cleaning]: 'Cleaning',
  [RoomStatus.Maintenance]: 'Maintenance',
  [RoomStatus.OutOfService]: 'Out of Service',
  [RoomStatus.Reserved]: 'Reserved',
};

export const ReservationStatusLabels: Record<ReservationStatus, string> = {
  [ReservationStatus.Pending]: 'Pending',
  [ReservationStatus.Confirmed]: 'Confirmed',
  [ReservationStatus.CheckedIn]: 'Checked In',
  [ReservationStatus.CheckedOut]: 'Checked Out',
  [ReservationStatus.Cancelled]: 'Cancelled',
  [ReservationStatus.NoShow]: 'No Show',
};

export const PaymentStatusLabels: Record<PaymentStatus, string> = {
  [PaymentStatus.Unpaid]: 'Unpaid',
  [PaymentStatus.PartiallyPaid]: 'Partially Paid',
  [PaymentStatus.Paid]: 'Paid',
  [PaymentStatus.Refunding]: 'Refunding',
  [PaymentStatus.Refunded]: 'Refunded',
};

export const PaymentMethodLabels: Record<PaymentMethod, string> = {
  [PaymentMethod.Cash]: 'Cash',
  [PaymentMethod.CreditCard]: 'Credit Card',
  [PaymentMethod.DebitCard]: 'Debit Card',
  [PaymentMethod.BankTransfer]: 'Bank Transfer',
  [PaymentMethod.Online]: 'Online',
  [PaymentMethod.PayOnArrival]: 'Pay on Arrival',
};

export const BookingTypeLabels: Record<BookingType, string> = {
  [BookingType.Daily]: 'Daily',
  [BookingType.ShortStay]: 'Short Stay',
};
