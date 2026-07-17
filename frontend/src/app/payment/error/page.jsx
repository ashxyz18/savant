'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { XCircle } from 'lucide-react';

function PaymentErrorContent() {
  const router = useRouter();
  const params = useSearchParams();
  const reason = params.get('reason') || 'unknown';

  return (
    <div className="text-center max-w-md">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <XCircle size={40} className="text-red-600" />
      </div>
      <h2 className="text-3xl font-bold text-neutral-900 mb-2">Payment Failed</h2>
      <p className="text-neutral-500 mb-2">Your payment could not be processed.</p>
      <p className="text-xs text-neutral-400 mb-6">Reason: {reason}</p>
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => router.push('/checkout')}
          className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
        >
          Try Again
        </button>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-3 border border-neutral-300 text-neutral-700 font-semibold rounded-lg hover:bg-neutral-50 transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}

export default function PaymentError() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <Suspense fallback={<div className="text-center">Loading...</div>}>
        <PaymentErrorContent />
      </Suspense>
    </div>
  );
}
