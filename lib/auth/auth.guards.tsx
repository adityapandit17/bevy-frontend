/**
 * Authentication Guards
 * Components for protecting routes based on authentication status
 */

'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from './auth.context';
import { toast } from '@/hooks/use-toast';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface GuestGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ResourceGuardProps {
  children: React.ReactNode;
  resourceKeys: string[];
  requiredRoles?: string[];
  fallback?: React.ReactNode;
  pageName?: string;
}

/**
 * AuthGuard - Protects routes that require authentication
 */
export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback || null;
  }

  return <>{children}</>;
}

/**
 * GuestGuard - Protects routes that should only be accessible to non-authenticated users
 */
export function GuestGuard({ children, fallback }: GuestGuardProps) {
  const { isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return fallback || null;
  }

  return <>{children}</>;
}

/**
 * ResourceGuard - Protects routes based on user permissions and roles
 */
export function ResourceGuard({ children, resourceKeys, requiredRoles, fallback, pageName }: ResourceGuardProps) {
  const { isAuthenticated, isLoading, permissions, roles } = useAuthContext();
  const router = useRouter();

  const isSuperAdmin = roles.some(role => role.name === "Super Admin");
  
  // Check if user has required permissions or roles
  const hasRequiredPermission = resourceKeys.some(resource => 
    permissions.some(p => {
      const permissionName = typeof p === 'string' ? p : p.name;
      return permissionName.startsWith(resource + ':') || permissionName.startsWith(resource + '.');
    })
  );
  
  const hasRequiredRole = requiredRoles?.some(role => 
    roles.some(r => r.name === role)
  ) || false;

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isSuperAdmin) return; // Super Admin bypasses all checks

    if (!hasRequiredPermission && !hasRequiredRole) {
      console.log('🚫 ResourceGuard - Access denied, showing toast and redirecting');
      const pageTitle = pageName || 'this page';
      toast({
        title: "Access Denied",
        description: `You don't have permission to access ${pageTitle}. You've been redirected to the dashboard.`,
        variant: "destructive",
      });
      router.push('/dashboard'); // Redirect to dashboard if no permission
    }
  }, [isAuthenticated, isLoading, router, hasRequiredPermission, hasRequiredRole, isSuperAdmin]);

  if (isLoading || (!isAuthenticated && !fallback)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || (!isSuperAdmin && !hasRequiredPermission && !hasRequiredRole)) {
    return null; // Don't render anything, just redirect
  }

  return <>{children}</>;
}