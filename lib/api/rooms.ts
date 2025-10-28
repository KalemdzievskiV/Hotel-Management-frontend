import apiClient from './client';
import { Room, CreateRoomDto, UpdateRoomDto, RoomStatus } from '@/types';

export const roomsApi = {
  // GET /api/Rooms
  getAll: async (): Promise<Room[]> => {
    const response = await apiClient.get<Room[]>('/Rooms');
    return response.data;
  },

  // GET /api/Rooms/{id}
  getById: async (id: number): Promise<Room> => {
    const response = await apiClient.get<Room>(`/Rooms/${id}`);
    return response.data;
  },

  // POST /api/Rooms
  create: async (data: CreateRoomDto): Promise<Room> => {
    const response = await apiClient.post<Room>('/Rooms', data);
    return response.data;
  },

  // PUT /api/Rooms/{id}
  update: async (id: number, data: UpdateRoomDto): Promise<Room> => {
    const response = await apiClient.put<Room>(`/Rooms/${id}`, data);
    return response.data;
  },

  // DELETE /api/Rooms/{id}
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/Rooms/${id}`);
  },

  // GET /api/Rooms/hotel/{hotelId}
  getByHotel: async (hotelId: number): Promise<Room[]> => {
    const response = await apiClient.get<Room[]>(`/Rooms/hotel/${hotelId}`);
    return response.data;
  },

  // GET /api/Rooms/hotel/{hotelId}/available
  getAvailable: async (hotelId: number): Promise<Room[]> => {
    const response = await apiClient.get<Room[]>(`/Rooms/hotel/${hotelId}/available`);
    return response.data;
  },

  // GET /api/Rooms/hotel/{hotelId}/short-stay
  getShortStay: async (hotelId: number): Promise<Room[]> => {
    const response = await apiClient.get<Room[]>(`/Rooms/hotel/${hotelId}/short-stay`);
    return response.data;
  },

  // PATCH /api/Rooms/{id}/status
  updateStatus: async (id: number, status: RoomStatus): Promise<Room> => {
    const response = await apiClient.patch<Room>(`/Rooms/${id}/status`, { status });
    return response.data;
  },

  // POST /api/Rooms/{id}/clean
  markCleaned: async (id: number): Promise<Room> => {
    const response = await apiClient.post<Room>(`/Rooms/${id}/clean`);
    return response.data;
  },

  // POST /api/Rooms/{id}/maintenance
  recordMaintenance: async (id: number): Promise<Room> => {
    const response = await apiClient.post<Room>(`/Rooms/${id}/maintenance`);
    return response.data;
  },

  // GET /api/Rooms/stats/count
  getCount: async (): Promise<number> => {
    const response = await apiClient.get<number>('/Rooms/stats/count');
    return response.data;
  },
};
