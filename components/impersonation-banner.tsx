'use client';

import { useState } from 'react';
import { UserRoundCog } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthContext } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImpersonationBannerProps {
  className?: string;
}

export function ImpersonationBanner({ className }: ImpersonationBannerProps) {
  const { user, impersonation, stopImpersonation } = useAuthContext();
  const [stopping, setStopping] = useState(false);

  if (!impersonation?.active) return null;

  const handleStop = async () => {
    setStopping(true);
    try {
      await stopImpersonation();
      toast.success(impersonation.platform ? 'Left company session' : 'Returned to your account');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to stop impersonation');
    } finally {
      setStopping(false);
    }
  };

  return (
    <div
      className={cn(
        'shrink-0 border-b bg-amber-50 border-amber-200 text-amber-950',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
        <div className="flex items-center gap-2 min-w-0">
          <UserRoundCog className="h-4 w-4 shrink-0" />
          <span className="truncate sm:whitespace-normal">
            <strong>Impersonating</strong> {user?.name || 'user'}
            {impersonation.platform ? (
              <span className="text-current/70"> · started from Bevy Admin</span>
            ) : impersonation.impersonator?.name ? (
              <span className="text-current/70"> · by {impersonation.impersonator.name}</span>
            ) : null}
          </span>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="shrink-0 border-amber-600 text-amber-900 hover:bg-amber-100"
          onClick={handleStop}
          disabled={stopping}
        >
          {stopping ? 'Stopping…' : impersonation.platform ? 'End session' : 'Return to my account'}
        </Button>
      </div>
    </div>
  );
}
