/**
 * Authentication Service
 * Handles all API calls related to authentication
 */

import { LoginCredentials, AuthData, User, AcceptInvitationCredentials, ResetPasswordCredentials, DashboardLayout, TenantCompany, ImpersonationInfo } from '@/types/auth.types';
import { API_ENDPOINTS, AUTH_CONFIG } from '@/config/auth.config';

export class AuthServiceError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'AuthServiceError';
  }
}

export class AuthService {
  private static instance: AuthService;

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private async makeRequest<T>(
    url: string,
    options: RequestInit = {},
    skipToken: boolean = false
  ): Promise<T> {
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Only add token if skipToken is false (for login requests, skipToken should be true)
    if (!skipToken) {
      const token = this.getToken();
      if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // If we can't parse JSON, use status-based messages
          switch (response.status) {
            case 401:
              errorMessage = 'Invalid email or password. Please check your credentials.';
              break;
            case 403:
              errorMessage = 'Access denied. Your account may not have permission to log in.';
              break;
            case 404:
              errorMessage = 'Login service not found. Please contact support.';
              break;
            case 422:
              errorMessage = 'Invalid input. Please check your email and password format.';
              break;
            case 500:
              errorMessage = 'Server error. Please try again later.';
              break;
            default:
              errorMessage = `Request failed with status ${response.status}`;
          }
        }
        
        throw new AuthServiceError(errorMessage, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof AuthServiceError) {
        throw error;
      }
      
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new AuthServiceError('Unable to connect to server. Please check your internet connection.');
      }
      
      throw new AuthServiceError('An unexpected error occurred. Please try again.');
    }
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(AUTH_CONFIG.tokenKey);
  }

  private parseCompany(data: any): TenantCompany | null {
    const company = data?.company;
    if (!company || typeof company !== 'object') return null;
    return company as TenantCompany;
  }

  private parseDashboardLayout(data: any): DashboardLayout {
    const layout = data?.company?.dashboard_layout;
    return layout === 'sidebar' ? 'sidebar' : 'top_nav';
  }

  public async login(credentials: LoginCredentials): Promise<AuthData & { dashboardLayout: DashboardLayout }> {
    try {
      // Login request should NOT send token (skipToken = true)
      const response = await this.makeRequest<{
        success: boolean;
        data?: {
          user: User;
          token: string;
          roles: any[];
          permissions: any[];
        };
        error?: string;
        message?: string;
      }>(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        body: JSON.stringify(credentials),
      }, true); // skipToken = true for login

      if (!response.success) {
        // Handle specific error messages from backend
        const errorMessage = response.error || response.message || 'Login failed. Please check your credentials.';
        throw new AuthServiceError(errorMessage, 401);
      }

      if (!response.data) {
        throw new AuthServiceError('Invalid response from server');
      }

      // Transform roles from strings to objects if needed
      const userRoles = response.data.user?.roles || response.data.roles || [];
      const transformedRoles = userRoles.map((r: any) => 
        typeof r === 'string' ? { id: 0, name: r, description: '' } : r
      );
      
      // Transform permissions from strings to objects if needed
      const userPermissions = response.data.user?.permissions || response.data.permissions || [];
      const transformedPermissions = userPermissions.map((p: any) => 
        typeof p === 'string' ? { id: 0, name: p, display_name: p } : p
      );

      return {
        user: {
          ...response.data.user,
          roles: transformedRoles,
          permissions: transformedPermissions
        },
        token: response.data.token,
        roles: transformedRoles,
        permissions: transformedPermissions,
        company: this.parseCompany(response.data),
        dashboardLayout: this.parseDashboardLayout(response.data),
      };
    } catch (error) {
      if (error instanceof AuthServiceError) {
        throw error;
      }
      
      // Handle network or other errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new AuthServiceError('Unable to connect to server. Please check your internet connection.');
      }
      
      throw new AuthServiceError('Login failed. Please try again.');
    }
  }

  public async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const response = await this.makeRequest<{
        success: boolean;
        data?: { message: string };
        error?: string;
        message?: string;
      }>(
        API_ENDPOINTS.FORGOT_PASSWORD,
        {
          method: 'POST',
          body: JSON.stringify({ email }),
        },
        true
      );

      if (!response.success) {
        const errorMessage =
          response.error || response.message || 'Could not send reset instructions.';
        throw new AuthServiceError(errorMessage, 422);
      }

      return {
        message:
          response.data?.message ||
          'If an account exists for that email, you will receive password reset instructions shortly.',
      };
    } catch (error) {
      if (error instanceof AuthServiceError) {
        throw error;
      }

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new AuthServiceError('Unable to connect to server. Please check your internet connection.');
      }

      throw new AuthServiceError('Could not send reset instructions. Please try again.');
    }
  }

  public async resetPassword(payload: ResetPasswordCredentials): Promise<AuthData> {
    try {
      const response = await this.makeRequest<{
        success: boolean;
        data?: {
          user: User;
          token: string;
          roles: any[];
          permissions: any[];
          message?: string;
        };
        error?: string;
        message?: string;
      }>(
        API_ENDPOINTS.RESET_PASSWORD,
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
        true
      );

      if (!response.success) {
        const errorMessage =
          response.error || response.message || 'Could not reset password.';
        throw new AuthServiceError(errorMessage, 422);
      }

      if (!response.data) {
        throw new AuthServiceError('Invalid response from server');
      }

      const userRoles = response.data.user?.roles || response.data.roles || [];
      const transformedRoles = userRoles.map((r: any) =>
        typeof r === 'string' ? { id: 0, name: r, description: '' } : r
      );

      const userPermissions = response.data.user?.permissions || response.data.permissions || [];
      const transformedPermissions = userPermissions.map((p: any) =>
        typeof p === 'string' ? { id: 0, name: p, display_name: p } : p
      );

      return {
        user: {
          ...response.data.user,
          roles: transformedRoles,
          permissions: transformedPermissions,
        },
        token: response.data.token,
        roles: transformedRoles,
        permissions: transformedPermissions,
      };
    } catch (error) {
      if (error instanceof AuthServiceError) {
        throw error;
      }

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new AuthServiceError('Unable to connect to server. Please check your internet connection.');
      }

      throw new AuthServiceError('Password reset failed. Please try again.');
    }
  }

  public async acceptInvitation(payload: AcceptInvitationCredentials): Promise<AuthData> {
    try {
      const response = await this.makeRequest<{
        success: boolean;
        data?: {
          user: User;
          token: string;
          roles: any[];
          permissions: any[];
        };
        error?: string;
        message?: string;
      }>(
        API_ENDPOINTS.ACCEPT_INVITATION,
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
        true
      );

      if (!response.success) {
        const errorMessage =
          response.error || response.message || 'Could not complete account setup.';
        throw new AuthServiceError(errorMessage, 422);
      }

      if (!response.data) {
        throw new AuthServiceError('Invalid response from server');
      }

      const userRoles = response.data.user?.roles || response.data.roles || [];
      const transformedRoles = userRoles.map((r: any) =>
        typeof r === 'string' ? { id: 0, name: r, description: '' } : r
      );

      const userPermissions = response.data.user?.permissions || response.data.permissions || [];
      const transformedPermissions = userPermissions.map((p: any) =>
        typeof p === 'string' ? { id: 0, name: p, display_name: p } : p
      );

      return {
        user: {
          ...response.data.user,
          roles: transformedRoles,
          permissions: transformedPermissions,
        },
        token: response.data.token,
        roles: transformedRoles,
        permissions: transformedPermissions,
      };
    } catch (error) {
      if (error instanceof AuthServiceError) {
        throw error;
      }

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new AuthServiceError('Unable to connect to server. Please check your internet connection.');
      }

      throw new AuthServiceError('Account setup failed. Please try again.');
    }
  }

  public async logout(): Promise<void> {
    try {
      await this.makeRequest(API_ENDPOINTS.LOGOUT, {
        method: 'DELETE',
      });
    } catch (error) {
      // Ignore logout errors, still clear local storage
      console.warn('Logout API call failed:', error);
    }
  }

  public async getCurrentUser(): Promise<{
    user: User;
    dashboardLayout: DashboardLayout;
    company: TenantCompany | null;
    impersonation: ImpersonationInfo | null;
  }> {
    const response = await this.makeRequest<{
      success: boolean;
      data: { user: User; company?: TenantCompany; impersonation?: ImpersonationInfo } | User;
    }>(API_ENDPOINTS.ME);

    if (!response || !response.success) {
      throw new AuthServiceError('Failed to get user data');
    }

    const data: any = response.data;
    const user: User | undefined =
      (data && (data as any).user) ? (data as any).user : (data as User | undefined);

    if (!user) {
      throw new AuthServiceError('Invalid user data in response');
    }

    return {
      user,
      company: this.parseCompany(data),
      dashboardLayout: this.parseDashboardLayout(data),
      impersonation: this.parseImpersonation(data),
    };
  }

  public async startImpersonation(userId: number): Promise<AuthData & { dashboardLayout: DashboardLayout; impersonation: ImpersonationInfo }> {
    const response = await this.makeRequest<{
      success: boolean;
      data?: {
        token: string;
        user: User;
        company?: TenantCompany;
        impersonation?: ImpersonationInfo;
      };
      error?: string;
    }>(API_ENDPOINTS.IMPERSONATE, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });

    if (!response.success || !response.data?.token) {
      throw new AuthServiceError(response.error || 'Failed to start impersonation');
    }

    const userRoles = response.data.user?.roles || [];
    const transformedRoles = userRoles.map((r: any) =>
      typeof r === 'string' ? { id: 0, name: r, description: '' } : r
    );
    const userPermissions = response.data.user?.permissions || [];
    const transformedPermissions = userPermissions.map((p: any) =>
      typeof p === 'string' ? { id: 0, name: p, display_name: p } : p
    );

    return {
      user: {
        ...response.data.user,
        roles: transformedRoles,
        permissions: transformedPermissions,
      },
      token: response.data.token,
      roles: transformedRoles,
      permissions: transformedPermissions,
      company: this.parseCompany(response.data),
      dashboardLayout: this.parseDashboardLayout(response.data),
      impersonation: response.data.impersonation || { active: true },
    };
  }

  public async stopImpersonation(): Promise<
    | { platform: true; message: string }
    | (AuthData & { dashboardLayout: DashboardLayout; impersonation: ImpersonationInfo })
  > {
    const response = await this.makeRequest<{
      success: boolean;
      data?: {
        platform?: boolean;
        message?: string;
        token?: string;
        user?: User;
        company?: TenantCompany;
        impersonation?: ImpersonationInfo;
      };
      error?: string;
    }>(API_ENDPOINTS.STOP_IMPERSONATION, {
      method: 'POST',
    });

    if (!response.success || !response.data) {
      throw new AuthServiceError(response.error || 'Failed to stop impersonation');
    }

    if (response.data.platform) {
      return { platform: true, message: response.data.message || 'Impersonation ended' };
    }

    if (!response.data.token || !response.data.user) {
      throw new AuthServiceError('Invalid stop impersonation response');
    }

    const userRoles = response.data.user.roles || [];
    const transformedRoles = userRoles.map((r: any) =>
      typeof r === 'string' ? { id: 0, name: r, description: '' } : r
    );
    const userPermissions = response.data.user.permissions || [];
    const transformedPermissions = userPermissions.map((p: any) =>
      typeof p === 'string' ? { id: 0, name: p, display_name: p } : p
    );

    return {
      user: {
        ...response.data.user,
        roles: transformedRoles,
        permissions: transformedPermissions,
      },
      token: response.data.token,
      roles: transformedRoles,
      permissions: transformedPermissions,
      company: this.parseCompany(response.data),
      dashboardLayout: this.parseDashboardLayout(response.data),
      impersonation: response.data.impersonation || { active: false },
    };
  }

  private parseImpersonation(data: any): ImpersonationInfo | null {
    const info = data?.impersonation;
    if (!info || typeof info !== 'object') return null;
    return info as ImpersonationInfo;
  }

  public async verifyToken(): Promise<boolean> {
    try {
      const response = await this.makeRequest<{
        success: boolean;
        data: {
          valid: boolean;
          user: User;
        };
      }>(API_ENDPOINTS.VERIFY_TOKEN, {
        method: 'POST',
      });
      return response.success && response.data.valid;
    } catch {
      return false;
    }
  }

  public isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Check if token is expired
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      return payload.exp > now;
    } catch {
      return false;
    }
  }

  public getStoredUser(): User | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const userData = localStorage.getItem(AUTH_CONFIG.userKey);
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  public storeAuthData(authData: AuthData): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(AUTH_CONFIG.tokenKey, authData.token);
    localStorage.setItem(AUTH_CONFIG.userKey, JSON.stringify(authData.user));
    if (authData.company) {
      localStorage.setItem(AUTH_CONFIG.companyKey, JSON.stringify(authData.company));
    }
    if (authData.impersonation?.active) {
      localStorage.setItem(AUTH_CONFIG.impersonationKey, JSON.stringify(authData.impersonation));
    } else {
      localStorage.removeItem(AUTH_CONFIG.impersonationKey);
    }
  }

  public getStoredCompany(): TenantCompany | null {
    if (typeof window === 'undefined') return null;

    try {
      const companyData = localStorage.getItem(AUTH_CONFIG.companyKey);
      return companyData ? JSON.parse(companyData) : null;
    } catch {
      return null;
    }
  }

  public getStoredImpersonation(): ImpersonationInfo | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(AUTH_CONFIG.impersonationKey);
      return raw ? (JSON.parse(raw) as ImpersonationInfo) : null;
    } catch {
      return null;
    }
  }

  public clearAuthData(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(AUTH_CONFIG.tokenKey);
    localStorage.removeItem(AUTH_CONFIG.userKey);
    localStorage.removeItem(AUTH_CONFIG.companyKey);
    localStorage.removeItem(AUTH_CONFIG.impersonationKey);
  }
}