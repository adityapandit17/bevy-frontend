/**
 * Authentication Types
 * TypeScript interfaces and types for authentication system
 */

export type DashboardLayout = 'top_nav' | 'sidebar';

export interface TenantCompany {
  id: number;
  name: string;
  code: string;
  plan?: string;
  status?: string;
  trial_ends_at?: string;
  trial_active?: boolean;
  trial_expired?: boolean;
  trial_days_remaining?: number;
  subscription_locked?: boolean;
  billing_cycle?: string;
  renews_at?: string;
  feature_flags?: Record<string, boolean>;
  dashboard_layout?: DashboardLayout;
  timezone?: string;
  currency?: string;
  country_code?: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  avatar_url?: string;
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
  company_code?: string;
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

export interface ImpersonationInfo {
  active: boolean;
  platform?: boolean;
  impersonator?: {
    id: number;
    name: string;
    email: string;
    type?: string;
  } | null;
}

export interface AuthData {
  user: User;
  token: string;
  roles: Role[];
  permissions: Permission[];
  company?: TenantCompany | null;
  impersonation?: ImpersonationInfo | null;
}

export interface AuthState {
  user: User | null;
  roles: Role[];
  permissions: Permission[];
  token: string | null;
  company: TenantCompany | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  lastActivity: number;
  dashboardLayout: DashboardLayout;
  impersonation: ImpersonationInfo | null;
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
  startImpersonation: (userId: number) => Promise<void>;
  stopImpersonation: () => Promise<void>;
  applyImpersonationToken: (token: string) => Promise<void>;
}