/**
 * Authentication Hooks
 * Custom React hooks for authentication functionality
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  AuthState, 
  LoginCredentials, 
  User, 
  Role, 
  Permission 
} from '@/types/auth.types';
import { AuthService, AuthServiceError } from './auth.service';
import { AUTH_CONFIG } from '@/config/auth.config';

/**
 * Main authentication hook
 */
export function useAuth() {
  const [state, setState] = useState<AuthState>(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(AUTH_CONFIG.tokenKey);
      const userData = localStorage.getItem(AUTH_CONFIG.userKey);
      
      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          return {
            user,
            roles: user.roles || [],
            permissions: user.permissions || [],
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            lastActivity: Date.now(),
          };
        } catch (error) {
          // Clear invalid data
          localStorage.removeItem(AUTH_CONFIG.tokenKey);
          localStorage.removeItem(AUTH_CONFIG.userKey);
        }
      }
    }
    
    return {
      user: null,
      roles: [],
      permissions: [],
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      lastActivity: 0,
    };
  });

  const authService = useRef(AuthService.getInstance());
  const router = useRouter();

  // Cross-tab synchronization
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === AUTH_CONFIG.tokenKey) {
        if (e.newValue === null) {
          // Token was removed, logout
          setState(prev => ({
            ...prev,
            user: null,
            roles: [],
            permissions: [],
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            lastActivity: 0,
          }));
        } else if (e.newValue !== e.oldValue) {
          // Token was updated, reinitialize auth
          const userData = localStorage.getItem(AUTH_CONFIG.userKey);
          if (userData) {
            try {
              const user = JSON.parse(userData);
              setState(prev => ({
                ...prev,
                user,
                roles: user.roles || [],
                permissions: user.permissions || [],
                token: e.newValue,
                isAuthenticated: true,
                isLoading: false,
                lastActivity: Date.now(),
              }));
            } catch (error) {
              console.error('Error parsing user data:', error);
            }
          }
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const authData = await authService.current.login(credentials);
      
      // Store in localStorage
      authService.current.storeAuthData(authData);
      
      setState(prev => ({
        ...prev,
        user: authData.user,
        roles: authData.roles,
        permissions: authData.permissions,
        token: authData.token,
        isAuthenticated: true,
        isLoading: false,
        lastActivity: Date.now(),
      }));
      
      router.push('/dashboard');
    } catch (error) {
      let errorMessage = 'Login failed. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage
      }));
    }
  }, [router]);

  const logout = useCallback(async () => {
    // Clear localStorage
    authService.current.clearAuthData();
    
    setState({
      user: null,
      roles: [],
      permissions: [],
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      lastActivity: 0,
    });
    
    router.push('/home');
  }, [router]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const checkPermission = useCallback((permission: string): boolean => {
    return state.permissions.some(p => p.name === permission);
  }, [state.permissions]);

  const checkRole = useCallback((role: string): boolean => {
    return state.roles.some(r => r.name === role);
  }, [state.roles]);

  return {
    ...state,
    login,
    logout,
    clearError,
    checkPermission,
    checkRole,
  };
}

/**
 * Hook for checking specific permissions
 */
export function usePermission(permission: string) {
  const { checkPermission } = useAuth();
  return checkPermission(permission);
}

/**
 * Hook for checking specific roles
 */
export function useRole(role: string) {
  const { checkRole } = useAuth();
  return checkRole(role);
}