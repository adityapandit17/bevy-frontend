'use client';

import Link from 'next/link';
import { Clock, Sparkles } from 'lucide-react';
import { useAuthContext } from '@/lib/auth';
import { getTrialDaysRemaining, isOnActiveTrial, isTrialEndingSoon } from '@/lib/auth/subscription.utils';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TrialBannerProps {
  className?: string;
}

export function TrialBanner({ className }: TrialBannerProps) {
  const { company, checkRole } = useAuthContext();
  const isCompanyAdmin = checkRole('Super Admin');

  if (!isCompanyAdmin || !isOnActiveTrial(company)) {
    return null;
  }

  const daysRemaining = getTrialDaysRemaining(company);
  const urgent = isTrialEndingSoon(company);

  return (
    <div
      className={cn(
        'shrink-0 border-b',
        urgent
          ? 'bg-amber-50 border-amber-200 text-amber-900'
          : 'bg-green-50 border-green-200 text-green-900',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
        <div className="flex items-center gap-2 min-w-0">
          {urgent ? <Clock className="h-4 w-4 shrink-0" /> : <Sparkles className="h-4 w-4 shrink-0" />}
          <span className="truncate sm:whitespace-normal">
            <strong>Free trial</strong>
            {daysRemaining !== null ? (
              <> — {daysRemaining} day{daysRemaining === 1 ? '' : 's'} remaining</>
            ) : (
              <> — explore all BevyHR features</>
            )}
            {company?.trial_ends_at && (
              <span className="hidden md:inline text-current/70">
                {' '}(ends {new Date(company.trial_ends_at).toLocaleDateString()})
              </span>
            )}
          </span>
        </div>
        <Button
          asChild
          size="sm"
          variant={urgent ? 'default' : 'outline'}
          className={cn(
            'shrink-0',
            urgent ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'border-green-600 text-green-800 hover:bg-green-100'
          )}
        >
          <Link href="/settings?tab=billing">Upgrade now</Link>
        </Button>
      </div>
    </div>
  );
}
