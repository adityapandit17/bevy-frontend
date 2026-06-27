'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthContext } from './auth.context';
import { isCompanyAccessible } from './subscription.utils';

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

const ALLOWED_PATHS = ['/billing', '/settings', '/user-settings'];

export function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const { company, isLoading, isAuthenticated } = useAuthContext();
  const pathname = usePathname();
  const router = useRouter();

  const isAllowed = ALLOWED_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const accessible = isCompanyAccessible(company);

  useEffect(() => {
    if (isLoading || !isAuthenticated || isAllowed) return;
    if (!accessible) {
      router.replace('/billing');
    }
  }, [accessible, isAllowed, isAuthenticated, isLoading, router]);

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

  if (!isAllowed && !accessible) {
    return null;
  }

  return <>{children}</>;
}
