import apiClient from './client';
import { Room, Reservation } from '@/types';

export interface QuickGuestDto {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    identificationNumber?: string;
    identificationType?: string;
    nationality?: string;
}

export interface QuickCheckInDto {
    hotelId: number;
    roomId: number;
    existingGuestId?: number;
    newGuest?: QuickGuestDto;
    checkInDate: string;
    checkOutDate: string;
    bookingType?: number;
    durationInHours?: number;
    numberOfGuests: number;
    overridePrice?: number;
    discountAmount?: number;
    discountReason?: string;
    depositAmount?: number;
    paymentMethod?: number;
    specialRequests?: string;
}

export interface ExpressCheckOutDto {
    extraCharges?: number;
    extraChargesNotes?: string;
    finalPayment?: number;
    paymentMethod?: number;
}

export interface GuestStaySummaryDto {
    reservationId: number;
    roomNumber: string;
    roomType: string;
    checkInDate: string;
    checkOutDate: string;
    totalAmount: number;
    paymentStatus: string;
    status: string;
}

export interface GuestIntelligenceDto {
    guestId: number;
    fullName: string;
    email: string;
    phoneNumber: string;
    isVIP: boolean;
    isBlacklisted: boolean;
    blacklistReason?: string;
    preferences?: string;
    specialRequests?: string;
    notes?: string;
    totalStays: number;
    totalSpent: number;
    lastStayDate?: string;
    mostUsedRoomType?: string;
    hasOutstandingPayments: boolean;
    recentStays: GuestStaySummaryDto[];
}

export interface UpdateGuestFlagsDto {
    isVIP?: boolean;
    isBlacklisted?: boolean;
    blacklistReason?: string;
    notes?: string;
}

export const walkInApi = {
    getAvailableRoomsTonight: (hotelId: number) =>
        apiClient.get<Room[]>(`/walkin/available-rooms/${hotelId}`).then(r => r.data),

    getGuestIntelligence: (guestId: number) =>
        apiClient.get<GuestIntelligenceDto>(`/walkin/guest-intelligence/${guestId}`).then(r => r.data),

    quickCheckIn: (dto: QuickCheckInDto) =>
        apiClient.post<Reservation>('/walkin/quick-checkin', dto).then(r => r.data),

    expressCheckOut: (reservationId: number, dto: ExpressCheckOutDto) =>
        apiClient.post<Reservation>(`/walkin/express-checkout/${reservationId}`, dto).then(r => r.data),

    updateGuestFlags: (guestId: number, dto: UpdateGuestFlagsDto) =>
        apiClient.patch(`/walkin/guest-flags/${guestId}`, dto).then(r => r.data),
};
