'use client';

import React, { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '../../lib/api';
import toast from 'react-hot-toast';

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    const verify = async () => {
      if (!token) {
        if (active) {
          setStatus('error');
          setMessage('Invalid or missing verification token.');
        }
        return;
      }
      try {
        const data = await api.verifyEmail(token);
        if (active) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully.');
          toast.success('Email verified!');
        }
      } catch (error) {
        if (active) {
          setStatus('error');
          setMessage(error.message || 'Verification failed.');
        }
      }
    };
    verify();
    return () => {
      active = false;
    };
  }, [token]);

  return (
    <div className="min-h-screen bg-white flex">
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm text-center">
          <Link href="/" className="flex items-center gap-2 mb-12 justify-center">
            <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-display text-xl font-bold text-neutral-900">SAVANT</span>
          </Link>

          {status === 'loading' && (
            <>
              <div className="w-16 h-16 border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin mx-auto mb-6" />
              <h2 className="text-xl font-bold text-neutral-900 mb-2">Verifying your email…</h2>
              <p className="text-sm text-neutral-500">Please wait a moment.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-neutral-900 mb-2">Email Verified!</h2>
              <p className="text-sm text-neutral-500 mb-6">{message}</p>
              <button
                onClick={() => router.push('/login')}
                className="w-full py-3 bg-neutral-900 text-white rounded-lg font-semibold text-sm hover:bg-neutral-800 transition-colors"
              >
                Sign In
              </button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-neutral-900 mb-2">Verification Failed</h2>
              <p className="text-sm text-neutral-500 mb-6">{message}</p>
              <Link
                href="/login"
                className="w-full py-3 bg-neutral-900 text-white rounded-lg font-semibold text-sm hover:bg-neutral-800 transition-colors inline-block"
              >
                Back to Sign In
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-neutral-900 items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-8">
            <span className="text-neutral-900 font-bold text-3xl">S</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Premium Leather Craftsmanship
          </h2>
          <p className="text-neutral-400">
            Discover our curated collection of handcrafted leather bags, designed for those who appreciate quality and timeless style.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900" /></div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}
