import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/api/errors';
import { LoginDto, RegisterDto, AuthResponse, RegisterOwnerDto } from '@/types';

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
  /** A hotel owner signs up and starts a free trial */
  registerOwner: (data: RegisterOwnerDto) => Promise<void>;
  logout: () => void;
  setError: (error: string | null) => void;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  isSuperAdmin: () => boolean;
  isAdmin: () => boolean;
  isManager: () => boolean;
  isGuest: () => boolean;
  setHasHydrated: (state: boolean) => void;
}

// Reads the JWT's exp claim; unreadable tokens count as expired
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return typeof payload.exp !== 'number' || payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
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

      registerOwner: async (data: RegisterOwnerDto) => {
        set({ isLoading: true, error: null });
        try {
          const response: AuthResponse = await authApi.registerOwner(data);
          set({
            token: response.token,
            user: { email: response.email, fullName: response.fullName, roles: response.roles },
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            error: getApiErrorMessage(error, 'Sign-up failed'),
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

      isSuperAdmin: () => {
        const { user } = get();
        return user?.roles.includes('SuperAdmin') || false;
      },

      isAdmin: () => {
        const { user } = get();
        return user?.roles.includes('Admin') || false;
      },

      isManager: () => {
        const { user } = get();
        return user?.roles.includes('Manager') || false;
      },

      isGuest: () => {
        const { user } = get();
        return user?.roles.includes('Guest') || false;
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
        // Drop a stored session whose token has already expired
        if (state?.token && isTokenExpired(state.token)) {
          state.logout();
        }
        state?.setHasHydrated(true);
      },
    }
  )
);
