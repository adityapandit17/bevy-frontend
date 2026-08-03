'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuthContext } from '@/lib/auth';

export default function ImpersonationAcceptPage() {
  const { applyImpersonationToken } = useAuthContext();
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const hash = typeof window !== 'undefined' ? window.location.hash.replace(/^#/, '') : '';
    const params = new URLSearchParams(hash);
    const token = params.get('token');

    if (!token) {
      setError('Missing impersonation token. Open this page from Bevy Admin.');
      return;
    }

    // Clear token from the URL hash before applying so it isn't left in history
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', '/impersonation/accept');
    }

    applyImpersonationToken(token).catch((err) => {
      setError(err instanceof Error ? err.message : 'Failed to accept impersonation session');
    });
  }, [applyImpersonationToken]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        {error ? (
          <>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Impersonation failed</h1>
            <p className="text-sm text-muted-foreground">{error}</p>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto" />
            <p className="mt-3 text-gray-600">Starting company admin session…</p>
          </>
        )}
      </div>
    </div>
  );
}
