'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      setLoading(true);
      await register({ name: form.name, email: form.email, password: form.password });
      setRegistered(true);
    } catch (error) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (registered) {
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

            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.66l7-4.5a2 2 0 012.22 0l7 4.5A2 2 0 0121 10.07V19" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6h6v6" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-neutral-900 mb-2">Check your email</h2>
            <p className="text-sm text-neutral-500 mb-2">
              We&apos;ve sent a verification link to <span className="font-medium text-neutral-700">{form.email}</span>.
            </p>
            <p className="text-sm text-neutral-500 mb-2">
              Your WhatsApp number <span className="font-medium text-neutral-700">{form.phone}</span> is verified.
            </p>
            <p className="text-sm text-neutral-500 mb-6">
              Click the link in the email to activate your account. You can continue browsing in the meantime.
            </p>
            <button
              onClick={() => router.push('/')}
              className="w-full py-3 bg-neutral-900 text-white rounded-lg font-semibold text-sm hover:bg-neutral-800 transition-colors"
            >
              Continue to Site
            </button>
            <p className="mt-6 text-center text-sm text-neutral-500">
              Didn&apos;t get the email?{' '}
              <Link href="/login" className="text-neutral-900 font-semibold hover:underline">
                Sign in to resend
              </Link>
            </p>
          </div>
        </div>

        <div className="hidden lg:flex flex-1 bg-neutral-900 items-center justify-center p-12">
          <div className="max-w-md text-center">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-8">
              <span className="text-neutral-900 font-bold text-3xl">S</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Join the SAVANT Family</h2>
            <p className="text-neutral-400">
              Create an account to enjoy exclusive member benefits, track your orders, and receive personalized recommendations.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left side - Visual */}
      <div className="hidden lg:flex flex-1 bg-neutral-900 items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-8">
              <span className="text-neutral-900 font-bold text-3xl">S</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Join the SAVANT Family
          </h2>
          <p className="text-neutral-400">
            Create an account to enjoy exclusive member benefits, track your orders, and receive personalized recommendations.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-white">10K+</div>
              <div className="text-xs text-neutral-500 mt-1">Customers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">50+</div>
              <div className="text-xs text-neutral-500 mt-1">Countries</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">4.9</div>
              <div className="text-xs text-neutral-500 mt-1">Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="flex items-center gap-2 mb-12">
            <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-display text-xl font-bold text-neutral-900">SAVANT</span>
          </Link>

          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Create account</h1>
          <p className="text-sm text-neutral-500 mb-8">
            Join us to start shopping premium leather goods.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="John Doe"
                className="w-full px-4 py-3 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-neutral-900 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-neutral-900 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="At least 6 characters"
                className="w-full px-4 py-3 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-neutral-900 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Confirm Password</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder="Repeat your password"
                className="w-full px-4 py-3 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-neutral-900 transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-neutral-900 text-white rounded-lg font-semibold text-sm hover:bg-neutral-800 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-neutral-500">
            Already have an account?{' '}
            <Link href="/login" className="text-neutral-900 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
