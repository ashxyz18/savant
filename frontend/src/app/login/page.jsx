'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
const FACEBOOK_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '';

// Redirect-based social login. We send the browser (top-level) to the provider;
// the provider redirects back to /login#id_token=... (or #access_token=...),
// which we read on mount. This avoids cross-origin popup/COOP issues.

export default function LoginPage() {
  const router = useRouter();
  const { login, socialLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState('');
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

  // Complete social login if we were redirected back with a token in the hash.
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (!hash) return;
    const params = new URLSearchParams(hash);
    const idToken = params.get('id_token') || params.get('access_token');
    const error = params.get('error');
    if (error) {
      toast.error('Social login failed: ' + error);
      window.history.replaceState(null, '', window.location.pathname);
      return;
    }
    if (!idToken) return;
    // Clear the hash so a refresh doesn't re-trigger.
    window.history.replaceState(null, '', window.location.pathname);
    (async () => {
      try {
        setSocialLoading('google');
        const provider = params.get('id_token') ? 'google' : 'facebook';
        const data = await socialLogin(provider, idToken, router);
        toast.success('Welcome!');
        router.push(data.user.role === 'admin' ? '/admin' : '/');
      } catch (err) {
        toast.error(err.message || 'Social login failed');
      } finally {
        setSocialLoading('');
      }
    })();
  }, []);

  const handleSocial = (provider) => {
    const redirectUri = `${window.location.origin}/login`;
    if (provider === 'google') {
      window.location.href =
        `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=id_token&scope=email%20profile&nonce=${Date.now()}`;
    } else {
      window.location.href =
        `https://www.facebook.com/v18.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=email%20public_profile`;
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
            <div className="w-8 h-8 bg-[#7B1E3B] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="font-display text-xl font-bold text-[#7B1E3B]">SAVANT</span>
          </Link>

          {!showForgot ? (
            <>
              <h1 className="text-2xl font-bold text-[#7B1E3B] mb-2">Sign in</h1>
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
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-[#7B1E3B] transition-colors"
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
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-[#7B1E3B] transition-colors"
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
                    className="text-sm text-neutral-500 hover:text-[#7B1E3B] transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#7B1E3B] text-white rounded-lg font-semibold text-sm hover:bg-[#651828] disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-neutral-200" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-3 text-neutral-400">or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSocial('google')}
                    disabled={socialLoading === 'google'}
                    className="flex items-center justify-center gap-2 py-3 border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
                    </svg>
                    Google
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSocial('facebook')}
                    disabled={socialLoading === 'facebook'}
                    className="flex items-center justify-center gap-2 py-3 border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1877F2">
                      <path d="M24 12a12 12 0 1 0-13.88 11.85v-8.38H7.08V12h3.04V9.36c0-3 1.79-4.67 4.53-4.67 1.31 0 2.68.24 2.68.24v2.95h-1.51c-1.49 0-1.95.92-1.95 1.87V12h3.32l-.53 3.47h-2.79v8.38A12 12 0 0 0 24 12z"/>
                    </svg>
                    Facebook
                  </button>
                </div>
              </form>

              <p className="mt-8 text-center text-sm text-neutral-500">
                Don't have an account?{' '}
                <Link href="/signup" className="text-[#7B1E3B] font-semibold hover:underline">
                  Create account
                </Link>
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-[#7B1E3B] mb-2">Forgot Password</h1>
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
                  <h3 className="text-lg font-semibold text-[#7B1E3B] mb-2">Check your email</h3>
                  <p className="text-sm text-neutral-500 mb-6">
                    If an account with <span className="font-medium text-neutral-700">{forgotEmail}</span> exists, you&apos;ll receive a password reset link.
                  </p>
                  <button
                    onClick={() => { setShowForgot(false); setForgotSent(false); }}
                    className="text-sm text-[#7B1E3B] font-semibold hover:underline"
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
                      className="w-full px-4 py-3 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-[#7B1E3B] transition-colors"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full py-3 bg-[#7B1E3B] text-white rounded-lg font-semibold text-sm hover:bg-[#651828] disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowForgot(false)}
                    className="w-full py-3 text-neutral-600 text-sm font-medium hover:text-[#7B1E3B] transition-colors"
                  >
                    Back to Sign In
                  </button>

                  <div className="mt-4 text-center">
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={forgotLoading}
                      className="text-sm text-neutral-500 hover:text-[#7B1E3B] transition-colors"
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
      <div className="hidden lg:flex flex-1 bg-[#7B1E3B] items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-8">
            <span className="text-[#7B1E3B] font-bold text-3xl">R</span>
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
