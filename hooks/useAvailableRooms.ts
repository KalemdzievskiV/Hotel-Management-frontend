import { useQuery } from '@tanstack/react-query';
import { reservationsApi, AvailableRoomsParams } from '@/lib/api/reservations';
import { BookingType } from '@/types';

export const useAvailableRooms = (
  params: AvailableRoomsParams,
  options?: {
    enabled?: boolean;
  }
) => {
  return useQuery({
    queryKey: ['available-rooms', params],
    queryFn: () => reservationsApi.getAvailableRooms(params),
    enabled: options?.enabled !== false && !!params.hotelId && !!params.checkIn && !!params.checkOut,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useAvailableRoomsForHotel = (
  hotelId: number,
  checkIn: string,
  checkOut: string,
  filters?: {
    bookingType?: BookingType;
    minCapacity?: number;
    roomType?: string;
  }
) => {
  return useAvailableRooms({
    hotelId,
    checkIn,
    checkOut,
    bookingType: filters?.bookingType,
    minCapacity: filters?.minCapacity,
    roomType: filters?.roomType,
  });
};
