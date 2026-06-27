'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CreditCard, ExternalLink, Loader2, Receipt } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiRequest, getApiUrl } from '@/lib/api';
import { useAuthContext } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';

interface PricingPlanOption {
  id: number;
  slug: string;
  name: string;
  description: string;
  monthly_price: number;
  annual_price: number;
  per_seat_price: number;
  max_employees: number;
  popular?: boolean;
}

interface TenantInvoice {
  id: number;
  invoice_number: string;
  amount: number;
  status: string;
  plan?: string;
  paid_at?: string;
  receipt_url?: string;
  created_at: string;
}

interface BillingSummary {
  company?: Record<string, unknown>;
  plans?: PricingPlanOption[];
  invoices?: TenantInvoice[];
  gateway?: { name: string; configured: boolean; publishable_key?: string };
  billable_seats?: number;
  can_checkout?: boolean;
  can_change_plan?: boolean;
}

function unwrapApiData<T>(response: T | { success?: boolean; data?: T }): T {
  if (response && typeof response === 'object' && 'data' in response && (response as { data?: T }).data != null) {
    return (response as { data: T }).data;
  }
  return response as T;
}

function normalizeSummary(
  raw: BillingSummary,
  fallbackCompany?: { plan?: string; status?: string; billing_cycle?: string } | null
): Required<BillingSummary> {
  return {
    company: { ...(fallbackCompany ?? {}), ...(raw.company ?? {}) },
    plans: raw.plans ?? [],
    invoices: raw.invoices ?? [],
    gateway: raw.gateway ?? { name: 'stripe', configured: false },
    billable_seats: raw.billable_seats ?? 0,
    can_checkout: raw.can_checkout ?? false,
    can_change_plan: raw.can_change_plan ?? false,
  };
}

function formatInr(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

export function BillingTab() {
  const { company, refreshSession } = useAuthContext();
  const searchParams = useSearchParams();
  const [summary, setSummary] = useState<Required<BillingSummary> | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiRequest<BillingSummary | { success?: boolean; data?: BillingSummary }>(
        getApiUrl('/api/v1/billing/summary')
      );
      const data = normalizeSummary(unwrapApiData(response), company);
      setSummary(data);
      if (!selectedPlan && data.plans.length > 0) {
        const current = data.plans.find((p) => p.slug === (company?.plan || data.company?.plan));
        setSelectedPlan(current?.slug || data.plans[0].slug);
      }
    } catch (err) {
      toast({ title: 'Failed to load billing', description: err instanceof Error ? err.message : 'Unknown error', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [company?.plan, selectedPlan]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (searchParams.get('checkout') === 'success') {
      toast({ title: 'Payment successful', description: 'Your subscription is being activated.' });
      refreshSession?.();
      load();
    }
  }, [searchParams, refreshSession, load]);

  const handleCheckout = async () => {
    if (!selectedPlan) return;
    setCheckoutLoading(true);
    try {
      const response = await apiRequest<{ url: string } | { success?: boolean; data?: { url: string } }>(
        getApiUrl('/api/v1/billing/checkout'),
        {
          method: 'POST',
          body: JSON.stringify({ plan: selectedPlan, billing_cycle: billingCycle }),
        }
      );
      const result = unwrapApiData(response);
      if (result.url) window.location.href = result.url;
    } catch (err) {
      toast({ title: 'Checkout failed', description: err instanceof Error ? err.message : 'Unknown error', variant: 'destructive' });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleChangePlan = async () => {
    if (!selectedPlan) return;
    setCheckoutLoading(true);
    try {
      await apiRequest(getApiUrl('/api/v1/billing/change_plan'), {
        method: 'POST',
        body: JSON.stringify({ plan: selectedPlan, billing_cycle: billingCycle }),
      });
      toast({ title: 'Plan updated', description: 'Your subscription has been changed with proration.' });
      refreshSession?.();
      load();
    } catch (err) {
      toast({ title: 'Plan change failed', description: err instanceof Error ? err.message : 'Unknown error', variant: 'destructive' });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handlePortal = async () => {
    try {
      const response = await apiRequest<{ url: string } | { success?: boolean; data?: { url: string } }>(
        getApiUrl('/api/v1/billing/portal'),
        { method: 'POST', body: '{}' }
      );
      const result = unwrapApiData(response);
      if (result.url) window.location.href = result.url;
    } catch (err) {
      toast({ title: 'Could not open billing portal', description: err instanceof Error ? err.message : 'Unknown error', variant: 'destructive' });
    }
  };

  if (loading || !summary) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Loading subscription details…
      </div>
    );
  }

  const billingCompany = summary.company ?? {};
  const status = String(billingCompany.status ?? company?.status ?? 'unknown');
  const isTrial = status === 'trial';
  const isActive = status === 'active';
  const planName = String(billingCompany.plan ?? company?.plan ?? '—');
  const billingCycleLabel = String(billingCompany.billing_cycle ?? company?.billing_cycle ?? 'monthly');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            BevyHR subscription
          </CardTitle>
          <CardDescription>Your organization&apos;s plan, billing cycle, and seat usage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Status</p>
              <Badge variant={isActive ? 'default' : isTrial ? 'secondary' : 'destructive'} className="mt-1 capitalize">{status}</Badge>
            </div>
            <div>
              <p className="text-muted-foreground">Plan</p>
              <p className="font-medium capitalize">{planName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Billing cycle</p>
              <p className="font-medium capitalize">{billingCycleLabel}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Billable seats</p>
              <p className="font-medium">{summary.billable_seats}</p>
            </div>
          </div>

          {isTrial && company?.trial_ends_at && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Your free trial ends on {new Date(company.trial_ends_at).toLocaleDateString()}.
              Subscribe below to keep access after your trial.
            </div>
          )}

          {!summary.gateway.configured && (
            <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              Online payments are not configured yet. Contact your BevyHR administrator to activate billing.
            </div>
          )}
        </CardContent>
      </Card>

      {(summary.can_checkout || summary.can_change_plan) && summary.gateway.configured && (
        <Card>
          <CardHeader>
            <CardTitle>{summary.can_change_plan ? 'Change plan' : 'Subscribe to BevyHR'}</CardTitle>
            <CardDescription>
              {summary.can_change_plan
                ? 'Switch plans anytime — your current subscription is cancelled and a new one starts with Stripe proration.'
                : 'Choose a plan and complete checkout via Stripe. Billing is based on plan tier and active employee seats.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Plan</Label>
                <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                  <SelectTrigger><SelectValue placeholder="Select plan" /></SelectTrigger>
                  <SelectContent>
                    {summary.plans.map((plan) => (
                      <SelectItem key={plan.slug} value={plan.slug}>
                        {plan.name} — up to {plan.max_employees} employees
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Billing cycle</Label>
                <Select value={billingCycle} onValueChange={(v) => setBillingCycle(v as 'monthly' | 'annual')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="annual">Annual (save ~15%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedPlan && (
              <p className="text-sm text-muted-foreground">
                Estimated for {summary.billable_seats} seat{summary.billable_seats === 1 ? '' : 's'}:{' '}
                {(() => {
                  const plan = summary.plans.find((p) => p.slug === selectedPlan);
                  if (!plan) return '—';
                  const perSeat = plan.per_seat_price || Math.ceil(plan.monthly_price / plan.max_employees);
                  const total = perSeat * summary.billable_seats;
                  const annual = billingCycle === 'annual' ? total * 12 * 0.85 : total;
                  return formatInr(Math.round(annual)) + (billingCycle === 'annual' ? '/yr' : '/mo');
                })()}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              {summary.can_checkout && (
                <Button onClick={handleCheckout} disabled={checkoutLoading || !selectedPlan} className="bg-green-600 hover:bg-green-700">
                  {checkoutLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {isTrial ? 'Purchase subscription' : 'Subscribe now'}
                </Button>
              )}
              {summary.can_change_plan && (
                <Button onClick={handleChangePlan} disabled={checkoutLoading || !selectedPlan} variant="outline">
                  Change plan
                </Button>
              )}
              {isActive && (
                <Button variant="outline" onClick={handlePortal}>
                  Manage payment method
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Invoices & receipts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {summary.invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground">No invoices yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell>{inv.invoice_number}</TableCell>
                    <TableCell>{formatInr(inv.amount)}</TableCell>
                    <TableCell className="capitalize">{inv.status}</TableCell>
                    <TableCell>{new Date(inv.paid_at || inv.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {inv.receipt_url && (
                        <a href={inv.receipt_url} target="_blank" rel="noopener noreferrer" className="text-green-700 hover:underline inline-flex items-center gap-1 text-sm">
                          Receipt <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
