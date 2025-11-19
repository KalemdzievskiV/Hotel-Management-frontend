import apiClient from './client';
import { Hotel, CreateHotelDto, UpdateHotelDto } from '@/types';

export const hotelsApi = {
  // GET /api/Hotels/public - Returns all hotels for any authenticated user
  // Backend filters by ownership for staff, returns all for guests
  getAll: async (): Promise<Hotel[]> => {
    const response = await apiClient.get<Hotel[]>('/Hotels/public');
    return response.data;
  },

  // GET /api/Hotels/{id}
  getById: async (id: number): Promise<Hotel> => {
    const response = await apiClient.get<Hotel>(`/Hotels/${id}`);
    return response.data;
  },

  // POST /api/Hotels
  create: async (data: CreateHotelDto): Promise<Hotel> => {
    const response = await apiClient.post<Hotel>('/Hotels', data);
    return response.data;
  },

  // PUT /api/Hotels/{id}
  update: async (id: number, data: UpdateHotelDto): Promise<Hotel> => {
    const response = await apiClient.put<Hotel>(`/Hotels/${id}`, data);
    return response.data;
  },

  // DELETE /api/Hotels/{id}
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/Hotels/${id}`);
  },

  // GET /api/Hotels/search?name={name}
  search: async (name: string): Promise<Hotel[]> => {
    const response = await apiClient.get<Hotel[]>('/Hotels/search', {
      params: { name },
    });
    return response.data;
  },

  // GET /api/Hotels/stats/count
  getCount: async (): Promise<number> => {
    const response = await apiClient.get<number>('/Hotels/stats/count');
    return response.data;
  },
};
