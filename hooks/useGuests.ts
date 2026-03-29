import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { guestsApi } from '@/lib/api';
import { Guest, CreateGuestDto, UpdateGuestDto } from '@/types';

// Query Keys
export const guestKeys = {
  all: ['guests'] as const,
  lists: () => [...guestKeys.all, 'list'] as const,
  list: (filters?: any) => [...guestKeys.lists(), filters] as const,
  details: () => [...guestKeys.all, 'detail'] as const,
  detail: (id: number) => [...guestKeys.details(), id] as const,
  byHotel: (hotelId: number) => [...guestKeys.all, 'hotel', hotelId] as const,
  myGuests: () => [...guestKeys.all, 'my-guests'] as const,
  myProfile: () => [...guestKeys.all, 'my-profile'] as const,
  stats: () => [...guestKeys.all, 'stats'] as const,
};

// Get all guests (filtered by user permissions)
export function useGuests() {
  return useQuery({
    queryKey: guestKeys.lists(),
    queryFn: () => guestsApi.getAll(),
  });
}

// Get single guest by ID
export function useGuest(id: number | undefined) {
  return useQuery({
    queryKey: guestKeys.detail(id!),
    queryFn: () => guestsApi.getById(id!),
    enabled: !!id,
  });
}

// Get guests by hotel ID
export function useGuestsByHotel(hotelId: number | undefined) {
  return useQuery({
    queryKey: guestKeys.byHotel(hotelId!),
    queryFn: () => guestsApi.getByHotel(hotelId!),
    enabled: !!hotelId,
  });
}

// Get my guests (walk-in guests created by me)
export function useMyGuests() {
  return useQuery({
    queryKey: guestKeys.myGuests(),
    queryFn: () => guestsApi.getMyGuests(),
  });
}

// Get or create guest profile for current logged-in user
export function useMyGuestProfile(enabled = false) {
  return useQuery({
    queryKey: guestKeys.myProfile(),
    queryFn: () => guestsApi.getMyProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes - profile data doesn't change often
    enabled,
  });
}

// Get guests count
export function useGuestsCount() {
  return useQuery({
    queryKey: [...guestKeys.stats(), 'count'],
    queryFn: () => guestsApi.getCount(),
  });
}

// Search guests
export function useSearchGuests(searchTerm: string) {
  return useQuery({
    queryKey: [...guestKeys.lists(), 'search', searchTerm],
    queryFn: () => guestsApi.search(searchTerm),
    enabled: searchTerm.length >= 2, // Only search if at least 2 characters
  });
}

// Create guest mutation
export function useCreateGuest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGuestDto) => guestsApi.create(data),
    onSuccess: (newGuest) => {
      queryClient.invalidateQueries({ queryKey: guestKeys.lists() });
      queryClient.invalidateQueries({ queryKey: guestKeys.myGuests() });
      queryClient.invalidateQueries({ queryKey: guestKeys.stats() });
      if (newGuest.hotelId) {
        queryClient.invalidateQueries({ queryKey: guestKeys.byHotel(newGuest.hotelId) });
      }
    },
  });
}

// Update guest mutation
export function useUpdateGuest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateGuestDto }) =>
      guestsApi.update(id, data),
    onSuccess: (updatedGuest, variables) => {
      queryClient.invalidateQueries({ queryKey: guestKeys.lists() });
      queryClient.invalidateQueries({ queryKey: guestKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: guestKeys.myGuests() });
      if (updatedGuest.hotelId) {
        queryClient.invalidateQueries({ queryKey: guestKeys.byHotel(updatedGuest.hotelId) });
      }
    },
  });
}

// Delete guest mutation
export function useDeleteGuest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => guestsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: guestKeys.lists() });
      queryClient.invalidateQueries({ queryKey: guestKeys.myGuests() });
      queryClient.invalidateQueries({ queryKey: guestKeys.stats() });
    },
  });
}

// Blacklist guest mutation
export function useBlacklistGuest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      guestsApi.blacklist(id, reason),
    onSuccess: (updatedGuest, variables) => {
      queryClient.invalidateQueries({ queryKey: guestKeys.lists() });
      queryClient.invalidateQueries({ queryKey: guestKeys.detail(variables.id) });
    },
  });
}

// Remove from blacklist mutation
export function useRemoveFromBlacklist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => guestsApi.unblacklist(id),
    onSuccess: (updatedGuest, id) => {
      queryClient.invalidateQueries({ queryKey: guestKeys.lists() });
      queryClient.invalidateQueries({ queryKey: guestKeys.detail(id) });
    },
  });
}
