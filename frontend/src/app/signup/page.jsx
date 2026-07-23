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
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const validateBDPhone = (phone) => {
    const cleaned = phone.replace(/[\s-]/g, '');
    return /^01[3-9]\d{8}$/.test(cleaned);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.password) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (!validateBDPhone(form.phone)) {
      toast.error('Please enter a valid Bangladeshi mobile number (01XXXXXXXXX)');
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
      const fullPhone = '+880' + form.phone.replace(/^0/, '');
      await register({
        name: form.name,
        email: form.email,
        phone: fullPhone,
        password: form.password,
      });
      toast.success('Account created successfully!');
      router.push('/');
    } catch (error) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left side - Visual branding banner */}
      <div className="hidden lg:flex flex-1 bg-[#7B1E3B] items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-20 -left-20 w-72 h-72 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-white/5 rounded-full blur-2xl" />

        <div className="max-w-md text-center relative z-10">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-black/20">
            <span className="text-[#7B1E3B] font-bold text-3xl font-display">S</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">
            Join the SAVANT Family
          </h2>
          <p className="text-white/80 leading-relaxed text-sm">
            Create your account to experience handcrafted luxury, seamless order tracking, and exclusive rewards.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
              <div className="text-xl font-bold text-white">Handcrafted</div>
              <div className="text-xs text-white/70 mt-1">Artisan Quality</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
              <div className="text-xl font-bold text-white">Nationwide</div>
              <div className="text-xs text-white/70 mt-1">Fast Shipping</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
              <div className="text-xl font-bold text-white">2 Years</div>
              <div className="text-xs text-white/70 mt-1">Warranty</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="w-9 h-9 bg-[#7B1E3B] rounded-xl flex items-center justify-center shadow-md shadow-[#7B1E3B]/20">
              <span className="text-white font-bold text-base">S</span>
            </div>
            <span className="font-display text-2xl font-extrabold tracking-tight text-[#7B1E3B]">SAVANT</span>
          </Link>

          <h1 className="text-2xl font-bold text-[#7B1E3B] mb-2">Create Account</h1>
          <p className="text-sm text-neutral-500 mb-8">
            Enter your details to register instantly without verification.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-[#7B1E3B] focus:ring-2 focus:ring-[#7B1E3B]/10 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-[#7B1E3B] focus:ring-2 focus:ring-[#7B1E3B]/10 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Mobile Number <span className="text-neutral-400 font-normal">(Bangladeshi 🇧🇩)</span>
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3.5 rounded-l-xl border border-r-0 border-neutral-200 bg-neutral-50 text-sm text-neutral-600 font-semibold">
                  +880
                </span>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 11);
                    setForm({ ...form, phone: val });
                  }}
                  placeholder="01XXXXXXXXX"
                  className="w-full px-4 py-3 rounded-r-xl border border-neutral-200 text-sm focus:outline-none focus:border-[#7B1E3B] focus:ring-2 focus:ring-[#7B1E3B]/10 transition-all font-mono"
                  required
                  maxLength={11}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="At least 6 characters"
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-[#7B1E3B] focus:ring-2 focus:ring-[#7B1E3B]/10 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Confirm Password</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder="Repeat password"
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-[#7B1E3B] focus:ring-2 focus:ring-[#7B1E3B]/10 transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#7B1E3B] text-white rounded-xl font-semibold text-sm hover:bg-[#651828] disabled:bg-neutral-300 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-[#7B1E3B]/25 active:scale-[0.98] mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating Account...
                </span>
              ) : 'Sign Up Instantly'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-neutral-500">
            Already have an account?{' '}
            <Link href="/login" className="text-[#7B1E3B] font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
