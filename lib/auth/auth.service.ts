/**
 * Authentication Service
 * Handles all API calls related to authentication
 */

import { LoginCredentials, AuthData, User } from '@/types/auth.types';
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
    options: RequestInit = {}
  ): Promise<T> {
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const token = this.getToken();
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
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

  public async login(credentials: LoginCredentials): Promise<AuthData> {
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
      }>(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      if (!response.success) {
        // Handle specific error messages from backend
        const errorMessage = response.error || response.message || 'Login failed. Please check your credentials.';
        throw new AuthServiceError(errorMessage, 401);
      }

      if (!response.data) {
        throw new AuthServiceError('Invalid response from server');
      }

      return {
        user: response.data.user,
        token: response.data.token,
        roles: response.data.roles || [],
        permissions: response.data.permissions || [],
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

  public async getCurrentUser(): Promise<User> {
    const response = await this.makeRequest<{
      success: boolean;
      data: User;
    }>(API_ENDPOINTS.ME);

    if (!response.success) {
      throw new AuthServiceError('Failed to get user data');
    }

    return response.data;
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
    } catch (error) {
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
  }

  public clearAuthData(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(AUTH_CONFIG.tokenKey);
    localStorage.removeItem(AUTH_CONFIG.userKey);
  }
}