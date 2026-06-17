/**
 * Authentication Types
 * TypeScript interfaces and types for authentication system
 */

export type DashboardLayout = 'top_nav' | 'sidebar';

export interface User {
  id: number;
  email: string;
  name: string;
  roles: Role[];
  permissions: Permission[];
  employee_id: number;
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

export interface AcceptInvitationCredentials {
  invitation_token: string;
  password: string;
  password_confirmation: string;
  first_name?: string;
  last_name?: string;
}

export interface ResetPasswordCredentials {
  reset_password_token: string;
  password: string;
  password_confirmation: string;
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
  dashboardLayout: DashboardLayout;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  acceptInvitation: (payload: AcceptInvitationCredentials) => Promise<void>;
  resetPassword: (payload: ResetPasswordCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  checkPermission: (permission: string) => boolean;
  checkRole: (role: string) => boolean;
  setDashboardLayout: (layout: DashboardLayout) => void;
  refreshSession: () => Promise<void>;
}