import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reservationsApi } from '@/lib/api';
import { Reservation, CreateReservationDto, UpdateReservationDto, RecordPaymentDto, CancelReservationDto } from '@/types';

// Query Keys
export const reservationKeys = {
  all: ['reservations'] as const,
  lists: () => [...reservationKeys.all, 'list'] as const,
  list: (filters?: any) => [...reservationKeys.lists(), filters] as const,
  details: () => [...reservationKeys.all, 'detail'] as const,
  detail: (id: number) => [...reservationKeys.details(), id] as const,
  byHotel: (hotelId: number) => [...reservationKeys.all, 'hotel', hotelId] as const,
  byRoom: (roomId: number) => [...reservationKeys.all, 'room', roomId] as const,
  byGuest: (guestId: number) => [...reservationKeys.all, 'guest', guestId] as const,
  byStatus: (status: string) => [...reservationKeys.all, 'status', status] as const,
  myReservations: () => [...reservationKeys.all, 'my-reservations'] as const,
  stats: () => [...reservationKeys.all, 'stats'] as const,
};

// Get all reservations
export function useReservations() {
  return useQuery({
    queryKey: reservationKeys.lists(),
    queryFn: () => reservationsApi.getAll(),
  });
}

// Get single reservation by ID
export function useReservation(id: number | undefined) {
  return useQuery({
    queryKey: reservationKeys.detail(id!),
    queryFn: () => reservationsApi.getById(id!),
    enabled: !!id,
  });
}

// Get reservations by hotel
export function useReservationsByHotel(hotelId: number | undefined) {
  return useQuery({
    queryKey: reservationKeys.byHotel(hotelId!),
    queryFn: () => reservationsApi.getByHotel(hotelId!),
    enabled: !!hotelId,
  });
}

// Get reservations by room
export function useReservationsByRoom(roomId: number | undefined) {
  return useQuery({
    queryKey: reservationKeys.byRoom(roomId!),
    queryFn: () => reservationsApi.getByRoom(roomId!),
    enabled: !!roomId,
  });
}

// Get reservations by guest
export function useReservationsByGuest(guestId: number | undefined) {
  return useQuery({
    queryKey: reservationKeys.byGuest(guestId!),
    queryFn: () => reservationsApi.getByGuest(guestId!),
    enabled: !!guestId,
  });
}

// Get my reservations
export function useMyReservations() {
  return useQuery({
    queryKey: reservationKeys.myReservations(),
    queryFn: () => reservationsApi.getMyReservations(),
  });
}

// Get reservations count
export function useReservationsCount() {
  return useQuery({
    queryKey: [...reservationKeys.stats(), 'count'],
    queryFn: () => reservationsApi.getCount(),
  });
}

// Create reservation mutation
export function useCreateReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReservationDto) => reservationsApi.create(data),
    onSuccess: (newReservation) => {
      queryClient.invalidateQueries({ queryKey: reservationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reservationKeys.byHotel(newReservation.hotelId) });
      queryClient.invalidateQueries({ queryKey: reservationKeys.byRoom(newReservation.roomId) });
      queryClient.invalidateQueries({ queryKey: reservationKeys.byGuest(newReservation.guestId) });
      queryClient.invalidateQueries({ queryKey: reservationKeys.stats() });
    },
  });
}

// Update reservation mutation
export function useUpdateReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateReservationDto }) =>
      reservationsApi.update(id, data),
    onSuccess: (updatedReservation, variables) => {
      queryClient.invalidateQueries({ queryKey: reservationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reservationKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: reservationKeys.byHotel(updatedReservation.hotelId) });
      queryClient.invalidateQueries({ queryKey: reservationKeys.byRoom(updatedReservation.roomId) });
    },
  });
}

// Delete reservation mutation
export function useDeleteReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => reservationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reservationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reservationKeys.stats() });
    },
  });
}

// Confirm reservation mutation
export function useConfirmReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => reservationsApi.confirm(id),
    onSuccess: (updatedReservation, id) => {
      queryClient.invalidateQueries({ queryKey: reservationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reservationKeys.detail(id) });
    },
  });
}

// Check-in mutation
export function useCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => reservationsApi.checkIn(id),
    onSuccess: (updatedReservation, id) => {
      queryClient.invalidateQueries({ queryKey: reservationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reservationKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: reservationKeys.byRoom(updatedReservation.roomId) });
    },
  });
}

// Check-out mutation
export function useCheckOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => reservationsApi.checkOut(id),
    onSuccess: (updatedReservation, id) => {
      queryClient.invalidateQueries({ queryKey: reservationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reservationKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: reservationKeys.byRoom(updatedReservation.roomId) });
      queryClient.invalidateQueries({ queryKey: reservationKeys.stats() });
    },
  });
}

// Cancel reservation mutation
export function useCancelReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CancelReservationDto }) =>
      reservationsApi.cancel(id, data),
    onSuccess: (updatedReservation, variables) => {
      queryClient.invalidateQueries({ queryKey: reservationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reservationKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: reservationKeys.byRoom(updatedReservation.roomId) });
    },
  });
}

// Record payment mutation
export function useRecordPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RecordPaymentDto }) =>
      reservationsApi.recordPayment(id, data),
    onSuccess: (updatedReservation, variables) => {
      queryClient.invalidateQueries({ queryKey: reservationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reservationKeys.detail(variables.id) });
    },
  });
}

// Check room availability
export function useCheckAvailability(roomId: number | undefined, checkIn: string, checkOut: string) {
  return useQuery({
    queryKey: [...reservationKeys.byRoom(roomId!), 'availability', checkIn, checkOut],
    queryFn: () => reservationsApi.checkAvailability(roomId!, checkIn, checkOut),
    enabled: !!roomId && !!checkIn && !!checkOut,
  });
}
