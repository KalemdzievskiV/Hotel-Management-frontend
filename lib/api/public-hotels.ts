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
};
