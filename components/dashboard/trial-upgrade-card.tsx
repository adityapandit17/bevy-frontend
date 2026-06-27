'use client';

import Link from 'next/link';
import { ArrowRight, Clock, Sparkles } from 'lucide-react';
import { useAuthContext } from '@/lib/auth';
import { getTrialDaysRemaining, isOnActiveTrial, isTrialEndingSoon } from '@/lib/auth/subscription.utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function TrialUpgradeCard() {
  const { company, checkRole } = useAuthContext();
  const isCompanyAdmin = checkRole('Super Admin');

  if (!isCompanyAdmin || !isOnActiveTrial(company)) {
    return null;
  }

  const daysRemaining = getTrialDaysRemaining(company);
  const urgent = isTrialEndingSoon(company);

  return (
    <Card
      className={cn(
        'border shadow-sm overflow-hidden',
        urgent ? 'border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50' : 'border-green-200 bg-gradient-to-r from-green-50 to-emerald-50'
      )}
    >
      <CardContent className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'rounded-full p-2.5 shrink-0',
              urgent ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
            )}
          >
            {urgent ? <Clock className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">
              {urgent ? 'Your trial is ending soon' : 'You\'re on a free trial'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {daysRemaining !== null ? (
                <>
                  <strong>{daysRemaining} day{daysRemaining === 1 ? '' : 's'}</strong> left on your BevyHR trial
                  {company?.trial_ends_at && (
                    <> — ends {new Date(company.trial_ends_at).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</>
                  )}
                  . Subscribe to keep your team on BevyHR without interruption.
                </>
              ) : (
                <>Upgrade anytime to unlock uninterrupted access for your organization.</>
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <Button
            asChild
            className={cn(urgent ? 'bg-amber-600 hover:bg-amber-700' : 'bg-green-600 hover:bg-green-700')}
          >
            <Link href="/settings?tab=billing">
              Upgrade now
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/settings?tab=billing">View plans</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
