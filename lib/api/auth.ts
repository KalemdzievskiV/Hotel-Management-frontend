import apiClient from './client';
import { LoginDto, RegisterDto, AuthResponse } from '@/types';

export const authApi = {
  // POST /api/Auth/login
  login: async (credentials: LoginDto): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/Auth/login', credentials);
    return response.data;
  },

  // POST /api/Auth/register
  register: async (data: RegisterDto): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/Auth/register', {
      ...data,
      role: 'Guest', // Public registration is always Guest
    });
    return response.data;
  },
};
