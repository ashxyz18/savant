'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }
    try {
      setLoading(true);
      const data = await login(form.email, form.password);
      toast.success('Welcome back!');
      if (data.user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (error) {
      toast.error(error.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error('Please enter your email');
      return;
    }
    try {
      setForgotLoading(true);
      await api.forgotPassword(forgotEmail);
      setForgotSent(true);
      toast.success('Reset link sent if account exists');
    } catch (error) {
      toast.error(error.message || 'Failed to send reset email');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!forgotEmail) {
      toast.error('Please enter your email');
      return;
    }
    try {
      setForgotLoading(true);
      await api.resendVerification(forgotEmail);
      toast.success('Verification link sent if account exists');
    } catch (error) {
      toast.error(error.message || 'Failed to send verification email');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="flex items-center gap-2 mb-12">
            <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="font-display text-xl font-bold text-neutral-900">SAVANT</span>
          </Link>

          {!showForgot ? (
            <>
              <h1 className="text-2xl font-bold text-neutral-900 mb-2">Sign in</h1>
              <p className="text-sm text-neutral-500 mb-8">
                Welcome back. Enter your credentials to access your account.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
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
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-neutral-900 transition-colors"
                    required
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-neutral-600">
                    <input type="checkbox" className="rounded border-neutral-300" />
                    Remember me
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgot(true)}
                    className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-neutral-900 text-white rounded-lg font-semibold text-sm hover:bg-neutral-800 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </form>

              <p className="mt-8 text-center text-sm text-neutral-500">
                Don't have an account?{' '}
                <Link href="/signup" className="text-neutral-900 font-semibold hover:underline">
                  Create account
                </Link>
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-neutral-900 mb-2">Forgot Password</h1>
              <p className="text-sm text-neutral-500 mb-8">
                Enter your email and we&apos;ll send you a reset link.
              </p>

              {forgotSent ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">Check your email</h3>
                  <p className="text-sm text-neutral-500 mb-6">
                    If an account with <span className="font-medium text-neutral-700">{forgotEmail}</span> exists, you&apos;ll receive a password reset link.
                  </p>
                  <button
                    onClick={() => { setShowForgot(false); setForgotSent(false); }}
                    className="text-sm text-neutral-900 font-semibold hover:underline"
                  >
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">Email</label>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-neutral-900 transition-colors"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full py-3 bg-neutral-900 text-white rounded-lg font-semibold text-sm hover:bg-neutral-800 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowForgot(false)}
                    className="w-full py-3 text-neutral-600 text-sm font-medium hover:text-neutral-900 transition-colors"
                  >
                    Back to Sign In
                  </button>

                  <div className="mt-4 text-center">
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={forgotLoading}
                      className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
                    >
                      Need to verify your email? Resend verification link
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:flex flex-1 bg-neutral-900 items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-8">
            <span className="text-neutral-900 font-bold text-3xl">R</span>
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
