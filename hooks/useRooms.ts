import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roomsApi } from '@/lib/api';
import { Room, CreateRoomDto, UpdateRoomDto } from '@/types';

// Query Keys
export const roomKeys = {
  all: ['rooms'] as const,
  lists: () => [...roomKeys.all, 'list'] as const,
  list: (filters?: any) => [...roomKeys.lists(), filters] as const,
  details: () => [...roomKeys.all, 'detail'] as const,
  detail: (id: number) => [...roomKeys.details(), id] as const,
  byHotel: (hotelId: number) => [...roomKeys.all, 'hotel', hotelId] as const,
  available: (hotelId: number) => [...roomKeys.byHotel(hotelId), 'available'] as const,
  stats: () => [...roomKeys.all, 'stats'] as const,
};

// Get all rooms
export function useRooms() {
  return useQuery({
    queryKey: roomKeys.lists(),
    queryFn: () => roomsApi.getAll(),
  });
}

// Get single room by ID
export function useRoom(id: number | undefined) {
  return useQuery({
    queryKey: roomKeys.detail(id!),
    queryFn: () => roomsApi.getById(id!),
    enabled: !!id,
  });
}

// Get rooms by hotel ID
export function useRoomsByHotel(hotelId: number | undefined) {
  return useQuery({
    queryKey: roomKeys.byHotel(hotelId!),
    queryFn: () => roomsApi.getByHotel(hotelId!),
    enabled: !!hotelId,
  });
}

// Get available rooms by hotel ID
export function useAvailableRoomsByHotel(hotelId: number | undefined) {
  return useQuery({
    queryKey: roomKeys.available(hotelId!),
    queryFn: () => roomsApi.getAvailable(hotelId!),
    enabled: !!hotelId,
  });
}

// Get rooms count
export function useRoomsCount() {
  return useQuery({
    queryKey: [...roomKeys.stats(), 'count'],
    queryFn: () => roomsApi.getCount(),
  });
}

// Create room mutation
export function useCreateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRoomDto) => roomsApi.create(data),
    onSuccess: (newRoom) => {
      queryClient.invalidateQueries({ queryKey: roomKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roomKeys.byHotel(newRoom.hotelId) });
      queryClient.invalidateQueries({ queryKey: roomKeys.stats() });
    },
  });
}

// Update room mutation
export function useUpdateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateRoomDto }) =>
      roomsApi.update(id, data),
    onSuccess: (updatedRoom, variables) => {
      queryClient.invalidateQueries({ queryKey: roomKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roomKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: roomKeys.byHotel(updatedRoom.hotelId) });
    },
  });
}

// Delete room mutation
export function useDeleteRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => roomsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roomKeys.stats() });
      // Note: We can't invalidate specific hotel queries without knowing the hotelId
      // The list invalidation will refresh the data anyway
    },
  });
}

// Update room status mutation
export function useUpdateRoomStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: any }) =>
      roomsApi.updateStatus(id, status),
    onSuccess: (updatedRoom: Room, variables) => {
      queryClient.invalidateQueries({ queryKey: roomKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roomKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: roomKeys.byHotel(updatedRoom.hotelId) });
    },
  });
}

// Mark room as cleaned mutation
export function useMarkRoomCleaned() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => roomsApi.markCleaned(id),
    onSuccess: (updatedRoom: Room, id) => {
      queryClient.invalidateQueries({ queryKey: roomKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roomKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: roomKeys.byHotel(updatedRoom.hotelId) });
    },
  });
}

// Mark room for maintenance mutation
export function useMarkRoomMaintenance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => roomsApi.recordMaintenance(id),
    onSuccess: (updatedRoom: Room, id) => {
      queryClient.invalidateQueries({ queryKey: roomKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roomKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: roomKeys.byHotel(updatedRoom.hotelId) });
    },
  });
}
