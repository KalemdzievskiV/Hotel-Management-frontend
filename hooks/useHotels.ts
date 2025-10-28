import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hotelsApi } from '@/lib/api';
import { Hotel, CreateHotelDto, UpdateHotelDto } from '@/types';

// Query Keys
export const hotelKeys = {
  all: ['hotels'] as const,
  lists: () => [...hotelKeys.all, 'list'] as const,
  list: (filters?: any) => [...hotelKeys.lists(), filters] as const,
  details: () => [...hotelKeys.all, 'detail'] as const,
  detail: (id: number) => [...hotelKeys.details(), id] as const,
  stats: () => [...hotelKeys.all, 'stats'] as const,
};

// Get all hotels
export function useHotels() {
  return useQuery({
    queryKey: hotelKeys.lists(),
    queryFn: () => hotelsApi.getAll(),
  });
}

// Get single hotel by ID
export function useHotel(id: number | undefined) {
  return useQuery({
    queryKey: hotelKeys.detail(id!),
    queryFn: () => hotelsApi.getById(id!),
    enabled: !!id,
  });
}

// Get hotels count
export function useHotelsCount() {
  return useQuery({
    queryKey: [...hotelKeys.stats(), 'count'],
    queryFn: () => hotelsApi.getCount(),
  });
}

// Create hotel mutation
export function useCreateHotel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateHotelDto) => hotelsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hotelKeys.lists() });
      queryClient.invalidateQueries({ queryKey: hotelKeys.stats() });
    },
  });
}

// Update hotel mutation
export function useUpdateHotel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateHotelDto }) =>
      hotelsApi.update(id, data),
    onSuccess: (_data: Hotel, variables: { id: number; data: UpdateHotelDto }) => {
      queryClient.invalidateQueries({ queryKey: hotelKeys.lists() });
      queryClient.invalidateQueries({ queryKey: hotelKeys.detail(variables.id) });
    },
  });
}

// Delete hotel mutation
export function useDeleteHotel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => hotelsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hotelKeys.lists() });
      queryClient.invalidateQueries({ queryKey: hotelKeys.stats() });
    },
  });
}
