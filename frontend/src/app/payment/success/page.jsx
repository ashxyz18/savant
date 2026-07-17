'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '../../../context/CartContext';
import { CheckCircle } from 'lucide-react';

function PaymentSuccessContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { clearCart } = useCart();
  const order = params.get('order');

  React.useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="text-center max-w-md">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle size={40} className="text-green-600" />
      </div>
      <h2 className="text-3xl font-bold text-neutral-900 mb-2">Payment Successful!</h2>
      <p className="text-neutral-500 mb-2">Thank you for your purchase.</p>
      {order && (
        <p className="text-sm text-neutral-600 mb-6">
          Order Number: <span className="font-mono font-bold text-neutral-900">{order}</span>
        </p>
      )}
      <button
        onClick={() => router.push('/')}
        className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
      >
        Continue Shopping
      </button>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <Suspense fallback={<div className="text-center">Loading...</div>}>
        <PaymentSuccessContent />
      </Suspense>
    </div>
  );
}
