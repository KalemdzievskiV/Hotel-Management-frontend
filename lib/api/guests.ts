import apiClient from './client';
import { Guest, CreateGuestDto, UpdateGuestDto } from '@/types';

export const guestsApi = {
  // GET /api/Guests
  getAll: async (): Promise<Guest[]> => {
    const response = await apiClient.get<Guest[]>('/Guests');
    return response.data;
  },

  // GET /api/Guests/{id}
  getById: async (id: number): Promise<Guest> => {
    const response = await apiClient.get<Guest>(`/Guests/${id}`);
    return response.data;
  },

  // POST /api/Guests
  create: async (data: CreateGuestDto): Promise<Guest> => {
    const response = await apiClient.post<Guest>('/Guests', data);
    return response.data;
  },

  // PUT /api/Guests/{id}
  update: async (id: number, data: UpdateGuestDto): Promise<Guest> => {
    const response = await apiClient.put<Guest>(`/Guests/${id}`, data);
    return response.data;
  },

  // DELETE /api/Guests/{id}
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/Guests/${id}`);
  },

  // GET /api/Guests/my-guests
  getMyGuests: async (): Promise<Guest[]> => {
    const response = await apiClient.get<Guest[]>('/Guests/my-guests');
    return response.data;
  },

  // GET /api/Guests/hotel/{hotelId}
  getByHotel: async (hotelId: number): Promise<Guest[]> => {
    const response = await apiClient.get<Guest[]>(`/Guests/hotel/${hotelId}`);
    return response.data;
  },

  // GET /api/Guests/all-unfiltered
  getAllUnfiltered: async (): Promise<Guest[]> => {
    const response = await apiClient.get<Guest[]>('/Guests/all-unfiltered');
    return response.data;
  },

  // PATCH /api/Guests/{id}/vip
  toggleVIP: async (id: number): Promise<Guest> => {
    const response = await apiClient.patch<Guest>(`/Guests/${id}/vip`);
    return response.data;
  },

  // POST /api/Guests/{id}/blacklist
  blacklist: async (id: number, reason: string): Promise<Guest> => {
    const response = await apiClient.post<Guest>(`/Guests/${id}/blacklist`, { reason });
    return response.data;
  },

  // POST /api/Guests/{id}/unblacklist
  unblacklist: async (id: number): Promise<Guest> => {
    const response = await apiClient.post<Guest>(`/Guests/${id}/unblacklist`);
    return response.data;
  },

  // GET /api/Guests/search?query={query}
  search: async (query: string): Promise<Guest[]> => {
    const response = await apiClient.get<Guest[]>('/Guests/search', {
      params: { query },
    });
    return response.data;
  },

  // GET /api/Guests/stats/count
  getCount: async (): Promise<number> => {
    const response = await apiClient.get<number>('/Guests/stats/count');
    return response.data;
  },
};
