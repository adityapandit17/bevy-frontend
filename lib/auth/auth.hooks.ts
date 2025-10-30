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
  const [state, setState] = useState<AuthState>({
    user: null,
    roles: [],
    permissions: [],
    token: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    lastActivity: 0,
  });

  const authService = useRef(AuthService.getInstance());
  const router = useRouter();

  // Hydrate from localStorage on client after mount (SSR-safe)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const token = localStorage.getItem(AUTH_CONFIG.tokenKey);
      const userData = localStorage.getItem(AUTH_CONFIG.userKey);

      if (token && userData) {
        const user = JSON.parse(userData);
        
        setState(prev => ({
          ...prev,
          user,
          roles: user.roles || [],
          permissions: user.permissions || [],
          token,
          isAuthenticated: true,
          isLoading: false,
          lastActivity: Date.now(),
        }));
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      // If parsing fails, clear and set to logged out state
      localStorage.removeItem(AUTH_CONFIG.tokenKey);
      localStorage.removeItem(AUTH_CONFIG.userKey);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

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
      
      
      // Transform permissions if they're strings to objects with name property
      const transformedPermissions = authData.user.permissions?.map(p => 
        typeof p === 'string' ? { id: 0, name: p, display_name: p } : p
      ) || [];
      
      // Store in localStorage with transformed permissions
      const authDataToStore = {
        ...authData,
        user: {
          ...authData.user,
          permissions: transformedPermissions
        }
      };
      authService.current.storeAuthData(authDataToStore);
      
      setState(prev => ({
        ...prev,
        user: authData.user,
        roles: authData.user.roles,
        permissions: transformedPermissions,
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