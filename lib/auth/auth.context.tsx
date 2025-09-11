/**
 * Authentication Context
 * Provides authentication state and methods to the entire app
 */

'use client';

import React, { createContext, useContext } from 'react';
import { AuthContextType } from '@/types/auth.types';
import { useAuth } from './auth.hooks';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth();

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(() => auth, [auth]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}