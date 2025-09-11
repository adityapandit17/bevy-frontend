/**
 * Authentication Types
 * TypeScript interfaces and types for authentication system
 */

export interface User {
  id: number;
  email: string;
  name: string;
  roles: Role[];
  permissions: Permission[];
}

export interface Role {
  id: number;
  name: string;
  display_name: string;
}

export interface Permission {
  id: number;
  name: string;
  display_name: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthData {
  user: User;
  token: string;
  roles: Role[];
  permissions: Permission[];
}

export interface AuthState {
  user: User | null;
  roles: Role[];
  permissions: Permission[];
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  lastActivity: number;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  checkPermission: (permission: string) => boolean;
  checkRole: (role: string) => boolean;
}