import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@/lib/api';
import { LoginDto, RegisterDto, AuthResponse } from '@/types';

interface AuthUser {
  email: string;
  fullName: string;
  roles: string[];
}

interface AuthStore {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  _hasHydrated: boolean;
  
  // Actions
  login: (credentials: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => void;
  setError: (error: string | null) => void;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      _hasHydrated: false,

      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
      },

      login: async (credentials: LoginDto) => {
        set({ isLoading: true, error: null });
        try {
          const response: AuthResponse = await authApi.login(credentials);
          
          const user: AuthUser = {
            email: response.email,
            fullName: response.fullName,
            roles: response.roles,
          };

          // Store token and user
          set({
            token: response.token,
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Also store in localStorage for API client
          if (typeof window !== 'undefined') {
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(user));
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Login failed';
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
            token: null,
            user: null,
          });
          throw error;
        }
      },

      register: async (data: RegisterDto) => {
        set({ isLoading: true, error: null });
        try {
          const response: AuthResponse = await authApi.register(data);
          
          const user: AuthUser = {
            email: response.email,
            fullName: response.fullName,
            roles: response.roles,
          };

          set({
            token: response.token,
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Store in localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(user));
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Registration failed';
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
            token: null,
            user: null,
          });
          throw error;
        }
      },

      logout: () => {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          error: null,
        });

        // Clear localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      },

      setError: (error: string | null) => {
        set({ error });
      },

      hasRole: (role: string) => {
        const { user } = get();
        return user?.roles.includes(role) || false;
      },

      hasAnyRole: (roles: string[]) => {
        const { user } = get();
        return roles.some(role => user?.roles.includes(role)) || false;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
