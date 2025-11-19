import apiClient from './client';
import { Hotel } from '@/types';

/**
 * Public Hotels API
 * Used for guest-facing pages like availability/booking
 * Returns all hotels without ownership filtering
 */
export const publicHotelsApi = {
  // GET /api/Hotels/public - Get all hotels for booking (no ownership filter)
  getAll: async (): Promise<Hotel[]> => {
    const response = await apiClient.get<Hotel[]>('/Hotels/public');
    return response.data;
  },

  // GET /api/Hotels/{id}
  getById: async (id: number): Promise<Hotel> => {
    const response = await apiClient.get<Hotel>(`/Hotels/${id}`);
    return response.data;
  },

  // Search hotels by name - public endpoint
  search: async (name: string): Promise<Hotel[]> => {
    const response = await apiClient.get<Hotel[]>('/Hotels/search', {
      params: { name },
    });
    return response.data;
  },

  // Search hotels by location
  searchByLocation: async (city?: string, country?: string): Promise<Hotel[]> => {
    const response = await apiClient.get<Hotel[]>('/Hotels/search', {
      params: { city, country },
    });
    return response.data;
  },
};
