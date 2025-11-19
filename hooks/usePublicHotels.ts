import { useQuery } from '@tanstack/react-query';
import { publicHotelsApi } from '@/lib/api';
import { Hotel } from '@/types';

/**
 * Public Hotels Hooks
 * Used for guest-facing pages (availability, booking, browsing)
 * These hooks fetch ALL hotels without ownership filtering
 */

// Query Keys
export const publicHotelKeys = {
  all: ['public-hotels'] as const,
  lists: () => [...publicHotelKeys.all, 'list'] as const,
  list: (filters?: any) => [...publicHotelKeys.lists(), filters] as const,
  details: () => [...publicHotelKeys.all, 'detail'] as const,
  detail: (id: number) => [...publicHotelKeys.details(), id] as const,
  search: (query: string) => [...publicHotelKeys.all, 'search', query] as const,
};

/**
 * Get all public hotels (for guests/booking)
 * Returns all hotels without ownership filtering
 */
export function usePublicHotels() {
  return useQuery({
    queryKey: publicHotelKeys.lists(),
    queryFn: () => publicHotelsApi.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes - public data can be cached longer
  });
}

/**
 * Get single hotel by ID (public view)
 */
export function usePublicHotel(id: number | undefined) {
  return useQuery({
    queryKey: publicHotelKeys.detail(id!),
    queryFn: () => publicHotelsApi.getById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Search hotels by name (public)
 */
export function usePublicHotelsSearch(searchQuery: string) {
  return useQuery({
    queryKey: publicHotelKeys.search(searchQuery),
    queryFn: () => publicHotelsApi.search(searchQuery),
    enabled: searchQuery.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
