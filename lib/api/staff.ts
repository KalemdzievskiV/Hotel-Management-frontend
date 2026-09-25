import apiClient from './client';
import { CreateStaffDto, User } from '@/types';

// A hotel owner's managers and housekeepers
export const staffApi = {
  getAll: () => apiClient.get<User[]>('/Staff').then(r => r.data),

  create: (dto: CreateStaffDto) => apiClient.post<User>('/Staff', dto).then(r => r.data),

  deactivate: (userId: string) => apiClient.post(`/Staff/${userId}/deactivate`),

  activate: (userId: string) => apiClient.post(`/Staff/${userId}/activate`),

  moveToHotel: (userId: string, hotelId: number) => apiClient.patch(`/Staff/${userId}/hotel`, { hotelId }),
};
