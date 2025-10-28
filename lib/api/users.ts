import apiClient from './client';
import { User, CreateUserDto, UpdateUserDto } from '@/types';

export const usersApi = {
  // GET /api/Users
  getAll: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/Users');
    return response.data;
  },

  // GET /api/Users/{id}
  getById: async (id: string): Promise<User> => {
    const response = await apiClient.get<User>(`/Users/${id}`);
    return response.data;
  },

  // POST /api/Users (SuperAdmin only)
  create: async (data: CreateUserDto): Promise<User> => {
    const response = await apiClient.post<User>('/Users', data);
    return response.data;
  },

  // PUT /api/Users/{id}
  update: async (id: string, data: UpdateUserDto): Promise<User> => {
    const response = await apiClient.put<User>(`/Users/${id}`, data);
    return response.data;
  },

  // DELETE /api/Users/{id}
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/Users/${id}`);
  },

  // GET /api/Users/role/{role}
  getByRole: async (role: string): Promise<User[]> => {
    const response = await apiClient.get<User[]>(`/Users/role/${role}`);
    return response.data;
  },

  // GET /api/Users/hotel/{hotelId}
  getByHotel: async (hotelId: number): Promise<User[]> => {
    const response = await apiClient.get<User[]>(`/Users/hotel/${hotelId}`);
    return response.data;
  },

  // GET /api/Users/search?searchTerm={searchTerm}
  search: async (searchTerm: string): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/Users/search', {
      params: { searchTerm },
    });
    return response.data;
  },

  // POST /api/Users/{id}/activate
  activate: async (id: string): Promise<User> => {
    const response = await apiClient.post<User>(`/Users/${id}/activate`);
    return response.data;
  },

  // POST /api/Users/{id}/deactivate
  deactivate: async (id: string): Promise<User> => {
    const response = await apiClient.post<User>(`/Users/${id}/deactivate`);
    return response.data;
  },

  // PATCH /api/Users/{id}/hotel
  assignToHotel: async (id: string, hotelId: number): Promise<User> => {
    const response = await apiClient.patch<User>(`/Users/${id}/hotel`, { hotelId });
    return response.data;
  },

  // PATCH /api/Users/{id}/role
  updateRole: async (id: string, role: string): Promise<User> => {
    const response = await apiClient.patch<User>(`/Users/${id}/role`, { role });
    return response.data;
  },

  // POST /api/Users/{id}/roles
  addRole: async (id: string, role: string): Promise<User> => {
    const response = await apiClient.post<User>(`/Users/${id}/roles`, { role });
    return response.data;
  },

  // DELETE /api/Users/{id}/roles/{role}
  removeRole: async (id: string, role: string): Promise<User> => {
    const response = await apiClient.delete<User>(`/Users/${id}/roles/${role}`);
    return response.data;
  },

  // GET /api/Users/stats/count
  getCount: async (): Promise<number> => {
    const response = await apiClient.get<number>('/Users/stats/count');
    return response.data;
  },

  // GET /api/Users/stats/by-role
  getCountByRole: async (): Promise<Record<string, number>> => {
    const response = await apiClient.get<Record<string, number>>('/Users/stats/by-role');
    return response.data;
  },
};
