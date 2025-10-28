// Authentication types

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  fullName: string;
  roles: string[];
  expiresAt: Date | string;
}

export interface AuthState {
  token: string | null;
  user: {
    email: string;
    fullName: string;
    roles: string[];
  } | null;
  isAuthenticated: boolean;
}
