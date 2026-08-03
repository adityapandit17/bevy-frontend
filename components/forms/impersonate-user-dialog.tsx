'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuthContext } from '@/lib/auth';
import { apiRequest, getApiUrl } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DirectoryUser {
  id: number;
  name: string;
  email: string;
}

interface ImpersonateUserDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ImpersonateUserDialog({ open, onClose }: ImpersonateUserDialogProps) {
  const { startImpersonation, user, refreshSession } = useAuthContext();
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<DirectoryUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [startingId, setStartingId] = useState<number | null>(null);

  useEffect(() => {
    if (!open) {
      setSearch('');
      setUsers([]);
      setStartingId(null);
      return;
    }

    // Refresh company flags so impersonation enablement from Bevy Admin is reflected
    refreshSession().catch(() => {
      /* non-fatal — dialog still works if flags already known */
    });
  }, [open, refreshSession]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search.trim()) params.set('search', search.trim());
        const url = `${getApiUrl('api/v1/users/directory')}${params.toString() ? `?${params}` : ''}`;
        const res = await apiRequest<{ success: boolean; users: DirectoryUser[] }>(url, {
          suppressToast: true,
        });
        if (!cancelled) setUsers(res?.users ?? []);
      } catch (error) {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : 'Failed to load users');
          setUsers([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const timer = setTimeout(fetchUsers, 200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [open, search]);

  const handleImpersonate = async (targetId: number) => {
    if (targetId === user?.id) {
      toast.error('Cannot impersonate yourself');
      return;
    }

    setStartingId(targetId);
    try {
      await startImpersonation(targetId);
      toast.success('Now impersonating user');
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to impersonate');
      setStartingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Impersonate user</DialogTitle>
          <DialogDescription>
            Act as another user in your company. Your actions will use their permissions.
          </DialogDescription>
        </DialogHeader>

        <Input
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />

        <div className="max-h-72 overflow-y-auto border rounded-md divide-y">
          {loading && <p className="p-3 text-sm text-muted-foreground">Loading…</p>}
          {!loading && users.length === 0 && (
            <p className="p-3 text-sm text-muted-foreground">No users found</p>
          )}
          {!loading &&
            users.map((u) => (
              <div key={u.id} className="flex items-center justify-between gap-3 p-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{u.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={startingId === u.id || u.id === user?.id}
                  onClick={() => handleImpersonate(u.id)}
                >
                  {startingId === u.id ? 'Starting…' : 'Impersonate'}
                </Button>
              </div>
            ))}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
