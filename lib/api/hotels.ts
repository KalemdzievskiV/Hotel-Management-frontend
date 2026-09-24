import apiClient from './client';
import { Hotel, CreateHotelDto, UpdateHotelDto, User } from '@/types';

export const hotelsApi = {
  // GET /api/Hotels/public - guests get every hotel; staff get the hotels they work at
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

  // GET /api/Hotels/{id}/staff - staff assigned to the hotel
  getStaff: async (id: number): Promise<User[]> => {
    const response = await apiClient.get<User[]>(`/Hotels/${id}/staff`);
    return response.data;
  },

  // DELETE /api/Hotels/{id}
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/Hotels/${id}`);
  },
};
