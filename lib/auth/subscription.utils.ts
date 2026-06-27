/**
 * Subscription access helpers for tenant app
 */

import type { TenantCompany } from '@/types/auth.types';

export function getTrialDaysRemaining(company?: TenantCompany | null): number | null {
  if (!company || company.status !== 'trial' || company.trial_expired || company.subscription_locked) {
    return null;
  }
  if (company.trial_days_remaining != null) return company.trial_days_remaining;
  if (!company.trial_ends_at) return null;
  const diff = new Date(company.trial_ends_at).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function isOnActiveTrial(company?: TenantCompany | null): boolean {
  if (!company || company.status !== 'trial' || company.trial_expired || company.subscription_locked) {
    return false;
  }
  if (company.trial_ends_at) {
    return new Date(company.trial_ends_at) > new Date();
  }
  return true;
}

export function isTrialEndingSoon(company?: TenantCompany | null, withinDays = 7): boolean {
  const days = getTrialDaysRemaining(company);
  return days !== null && days <= withinDays;
}

export function isCompanyAccessible(company?: TenantCompany | null): boolean {
  if (!company) return true;

  if (company.subscription_locked) return false;

  if (company.status === 'active') return true;

  if (company.status === 'trial') {
    if (company.trial_expired) return false;
    if (company.trial_ends_at) {
      return new Date(company.trial_ends_at) > new Date();
    }
    return true;
  }

  return false;
}

export function subscriptionLockReason(company?: TenantCompany | null): string {
  if (!company) return 'Subscription required';
  if (company.trial_expired || (company.status === 'trial' && company.trial_ends_at && new Date(company.trial_ends_at) <= new Date())) {
    return 'Your free trial has ended.';
  }
  if (company.status === 'past_due') return 'Your account has an overdue payment.';
  if (company.status === 'suspended') return 'Your account has been suspended.';
  if (company.status === 'cancelled') return 'Your subscription has been cancelled.';
  return 'An active subscription is required to access BevyHR.';
}
