'use client';

import { Suspense } from 'react';
import { BillingTab } from '@/components/settings/billing-tab';
import { Loader2 } from 'lucide-react';

export default function BillingPage() {
  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <div className="max-w-4xl mx-auto p-4 lg:p-6 space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">BevyHR subscription</h1>
          <p className="text-gray-600">Manage your plan, payment, and invoices</p>
        </div>
        <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-green-600" /></div>}>
          <BillingTab />
        </Suspense>
      </div>
    </div>
  );
}
