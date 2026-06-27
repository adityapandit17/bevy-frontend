/**
 * Authentication Module Exports
 * Centralized exports for authentication functionality
 */

export { useAuth, usePermission, useRole } from './auth.hooks';
export { AuthProvider, useAuthContext } from './auth.context';
export { AuthGuard, GuestGuard } from './auth.guards';
export { SubscriptionGuard } from './subscription.guard';
export { isCompanyAccessible, subscriptionLockReason, getTrialDaysRemaining, isOnActiveTrial, isTrialEndingSoon } from './subscription.utils';
export { AuthService, AuthServiceError } from './auth.service';
export * from '@/types/auth.types';
export * from '@/config/auth.config';