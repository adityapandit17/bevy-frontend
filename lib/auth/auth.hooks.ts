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
  AcceptInvitationCredentials,
  ResetPasswordCredentials,
  User,
  Role,
  Permission,
  DashboardLayout
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
    company: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    lastActivity: 0,
    dashboardLayout: 'top_nav',
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
          const storedUser = JSON.parse(userData);

          // Transform roles from strings to objects if needed
          const transformedRolesFromStorage = (storedUser.roles || []).map((r: any) =>
            typeof r === 'string' ? { id: 0, name: r, description: '' } : r
          );

          const storedCompany = authService.current.getStoredCompany();

          setState(prev => ({
            ...prev,
            user: storedUser,
            roles: transformedRolesFromStorage,
            permissions: storedUser.permissions || [],
            token,
            company: storedCompany,
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
          const { user: currentUser, dashboardLayout, company } = await authService.current.getCurrentUser();

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
            company,
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
            company,
            isAuthenticated: true,
            isLoading: false,
            lastActivity: Date.now(),
            dashboardLayout,
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
              dashboardLayout: 'top_nav',
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

      const handleUserUpdated = () => {
        const userData = localStorage.getItem(AUTH_CONFIG.userKey);
        if (!userData) return;
        try {
          const user = JSON.parse(userData);
          const transformedRoles = (user.roles || []).map((r: any) =>
            typeof r === 'string' ? { id: 0, name: r, description: '' } : r
          );
          setState(prev => ({
            ...prev,
            user,
            roles: transformedRoles,
            permissions: user.permissions || [],
          }));
        } catch (error) {
          console.error('Error parsing updated user data:', error);
        }
      };

      window.addEventListener('hrms:user-updated', handleUserUpdated);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('hrms:user-updated', handleUserUpdated);
      };
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
        },
        company: authData.company ?? null,
      };
      authService.current.storeAuthData(authDataToStore);
      
      setState(prev => ({
        ...prev,
        user: authData.user,
        roles: transformedRoles,
        permissions: transformedPermissions,
        token: authData.token,
        company: authData.company ?? null,
        isAuthenticated: true,
        isLoading: false,
        lastActivity: Date.now(),
        dashboardLayout: authData.dashboardLayout,
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

  const acceptInvitation = useCallback(async (payload: AcceptInvitationCredentials) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const authData = await authService.current.acceptInvitation(payload);

      const transformedPermissions =
        authData.user.permissions?.map(p =>
          typeof p === 'string' ? { id: 0, name: p, display_name: p } : p
        ) || [];

      const transformedRoles = (authData.user.roles || []).map((r: any) =>
        typeof r === 'string' ? { id: 0, name: r, description: '' } : r
      );

      const authDataToStore = {
        ...authData,
        user: {
          ...authData.user,
          permissions: transformedPermissions,
          roles: transformedRoles,
        },
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

      router.push('/dashboard');
    } catch (error) {
      let errorMessage = 'Account setup failed. Please try again.';

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  }, [router]);

  const resetPassword = useCallback(async (payload: ResetPasswordCredentials) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const authData = await authService.current.resetPassword(payload);

      const transformedPermissions =
        authData.user.permissions?.map(p =>
          typeof p === 'string' ? { id: 0, name: p, display_name: p } : p
        ) || [];

      const transformedRoles = (authData.user.roles || []).map((r: any) =>
        typeof r === 'string' ? { id: 0, name: r, description: '' } : r
      );

      const authDataToStore = {
        ...authData,
        user: {
          ...authData.user,
          permissions: transformedPermissions,
          roles: transformedRoles,
        },
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

      router.push('/dashboard');
    } catch (error) {
      let errorMessage = 'Password reset failed. Please try again.';

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
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
      dashboardLayout: 'top_nav',
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

  const setDashboardLayout = useCallback((layout: DashboardLayout) => {
    setState(prev => ({ ...prev, dashboardLayout: layout }));
  }, []);

  const refreshSession = useCallback(async () => {
    const token = localStorage.getItem(AUTH_CONFIG.tokenKey);
    if (!token) return;

    const { user: currentUser, dashboardLayout, company } = await authService.current.getCurrentUser();
    const transformedRoles = (currentUser.roles || []).map((r: any) =>
      typeof r === 'string' ? { id: 0, name: r, description: '' } : r
    );
    const transformedPermissions =
      currentUser.permissions?.map((p: any) =>
        typeof p === 'string' ? { id: 0, name: p, display_name: p } : p
      ) || [];

    setState(prev => ({
      ...prev,
      user: { ...currentUser, roles: transformedRoles, permissions: transformedPermissions },
      roles: transformedRoles,
      permissions: transformedPermissions,
      company,
      dashboardLayout,
      lastActivity: Date.now(),
    }));
  }, []);

  return {
    ...state,
    login,
    acceptInvitation,
    resetPassword,
    logout,
    clearError,
    checkPermission,
    checkRole,
    setDashboardLayout,
    refreshSession,
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