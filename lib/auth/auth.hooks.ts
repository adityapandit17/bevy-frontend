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
import { getTenantMode } from '@/lib/tenant';

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

    const bootstrapAuthState = async () => {
      try {
        const token = localStorage.getItem(AUTH_CONFIG.tokenKey);
        const userData = localStorage.getItem(AUTH_CONFIG.userKey);

        if (!token) {
          // No token → definitely logged out
          setState(prev => ({ ...prev, isLoading: false }));
          return;
        }

        if (userData) {
          // Start from whatever we have in localStorage so UI can render quickly
          const storedUser = JSON.parse(userData) as User;

          if (storedUser?.current_company_id != null && !localStorage.getItem(AUTH_CONFIG.companyIdKey)) {
            localStorage.setItem(AUTH_CONFIG.companyIdKey, String(storedUser.current_company_id));
          }

          // Transform roles from strings to objects if needed
          const transformedRolesFromStorage = (storedUser.roles || []).map((r: any) =>
            typeof r === 'string' ? { id: 0, name: r, description: '' } : r
          );

          setState(prev => ({
            ...prev,
            user: storedUser,
            roles: transformedRolesFromStorage,
            permissions: storedUser.permissions || [],
            token,
            isAuthenticated: true,
            isLoading: false,
            lastActivity: Date.now(),
          }));
        } else {
          // We have a token but no cached user – still mark as loading while we fetch
          setState(prev => ({ ...prev, isLoading: true, token }));
        }

        // Try to fetch the latest user data from the API so that
        // any role/permission changes made after login are respected.
        try {
          const currentUser = await authService.current.getCurrentUser();

          // Normalize roles & permissions from API
          const transformedRoles = (currentUser.roles || []).map((r: any) =>
            typeof r === 'string' ? { id: 0, name: r, description: '' } : r
          );

          const transformedPermissions =
            currentUser.permissions?.map((p: any) =>
              typeof p === 'string' ? { id: 0, name: p, display_name: p } : p
            ) || [];

          // Persist fresh user back to localStorage so subsequent loads are correct
          authService.current.storeAuthData({
            user: {
              ...currentUser,
              roles: transformedRoles,
              permissions: transformedPermissions,
            },
            token,
            roles: transformedRoles,
            permissions: transformedPermissions,
          });

          setState(prev => ({
            ...prev,
            user: {
              ...currentUser,
              roles: transformedRoles,
              permissions: transformedPermissions,
            },
            roles: transformedRoles,
            permissions: transformedPermissions,
            token,
            isAuthenticated: true,
            isLoading: false,
            lastActivity: Date.now(),
          }));
        } catch (fetchError: any) {
          // If token is invalid/expired, clear auth; otherwise just stop loading.
          console.error('Failed to refresh current user data:', fetchError);

          const status = (fetchError && fetchError.status) || (fetchError && fetchError.statusCode);
          if (status === 401) {
            localStorage.removeItem(AUTH_CONFIG.tokenKey);
            localStorage.removeItem(AUTH_CONFIG.userKey);
            setState(prev => ({
              ...prev,
              user: null,
              roles: [],
              permissions: [],
              token: null,
              isAuthenticated: false,
              isLoading: false,
              lastActivity: 0,
            }));
          } else {
            setState(prev => ({
              ...prev,
              isLoading: false,
            }));
          }
        }
      } catch (error) {
        // If parsing fails, clear and set to logged out state
        localStorage.removeItem(AUTH_CONFIG.tokenKey);
        localStorage.removeItem(AUTH_CONFIG.userKey);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    bootstrapAuthState().catch((err) => {
      console.error('Auth bootstrap failed:', err);
      localStorage.removeItem(AUTH_CONFIG.tokenKey);
      localStorage.removeItem(AUTH_CONFIG.userKey);
      setState(prev => ({
        ...prev,
        user: null,
        roles: [],
        permissions: [],
        token: null,
        isAuthenticated: false,
        isLoading: false,
        lastActivity: 0,
      }));
    });
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
              
              // Transform roles from strings to objects if needed
              const transformedRoles = (user.roles || []).map((r: any) => 
                typeof r === 'string' ? { id: 0, name: r, description: '' } : r
              );
              
              setState(prev => ({
                ...prev,
                user,
                roles: transformedRoles,
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
      
      // Transform roles from strings to objects if needed
      const transformedRoles = (authData.user.roles || []).map((r: any) => 
        typeof r === 'string' ? { id: 0, name: r, description: '' } : r
      );
      
      // Store in localStorage with transformed permissions and roles
      const authDataToStore = {
        ...authData,
        user: {
          ...authData.user,
          permissions: transformedPermissions,
          roles: transformedRoles
        }
      };
      authService.current.storeAuthData(authDataToStore);
      
      setState(prev => ({
        ...prev,
        user: authData.user,
        roles: transformedRoles,
        permissions: transformedPermissions,
        token: authData.token,
        isAuthenticated: true,
        isLoading: false,
        lastActivity: Date.now(),
      }));

      // Subdomain-based UX:
      // - admin.<domain> should land on workspace management
      // - company.<domain> should land on the normal app dashboard
      const mode = getTenantMode();
      router.push(mode.kind === 'admin' ? '/super-admin/workspaces' : '/dashboard');
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
    if (!permission) return false;

    // Normalize requested permission to dot format for comparison
    const requested = permission.replace(':', '.');

    const hasPermission = state.permissions.some((p: any) => {
      const name = typeof p === 'string' ? p : p?.name;
      if (!name) return false;

      // Support both "resource.action" and "resource:action" formats
      const normalized = name.replace(':', '.');
      return normalized === requested;
    });

    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      // Debug logging to trace permission checks in dev
      console.debug('[checkPermission]', {
        requested,
        permissions: state.permissions.map((p: any) =>
          typeof p === 'string' ? p : p?.name || ''
        ),
        result: hasPermission,
      });
    }

    return hasPermission;
  }, [state.permissions]);

  const checkRole = useCallback((role: string): boolean => {
    return state.roles.some(r => {
      // Handle both string and object formats
      if (typeof r === 'string') {
        return r === role;
      }
      return r.name === role;
    });
  }, [state.roles]);

  const switchWorkspace = useCallback((companyId: number) => {
    const companies = state.user?.companies || [];
    const sel = companies.find((c) => c.id === companyId);
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_CONFIG.companyIdKey, String(companyId));
      try {
        const raw = localStorage.getItem(AUTH_CONFIG.userKey);
        if (raw) {
          const u = JSON.parse(raw) as User;
          u.current_company_id = companyId;
          if (sel) {
            u.current_company = { id: sel.id, name: sel.name, code: sel.code };
          }
          localStorage.setItem(AUTH_CONFIG.userKey, JSON.stringify(u));
        }
      } catch {
        /* ignore */
      }
    }
    setState((prev) => ({
      ...prev,
      user: prev.user
        ? {
            ...prev.user,
            current_company_id: companyId,
            current_company: sel
              ? { id: sel.id, name: sel.name, code: sel.code }
              : prev.user.current_company ?? null,
          }
        : null,
    }));
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }, [state.user]);

  return {
    ...state,
    login,
    logout,
    clearError,
    checkPermission,
    checkRole,
    switchWorkspace,
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