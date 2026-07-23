'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tags,
  Image,
  Award,
  MessageSquare,
  Mail,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Bell,
  Settings,
} from 'lucide-react';
import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  { label: 'Products', icon: Package, href: '/admin/products' },
  { label: 'Orders', icon: ShoppingCart, href: '/admin/orders' },
  { label: 'Categories', icon: Tags, href: '/admin/categories' },
  { label: 'Brands', icon: Award, href: '/admin/brands' },
  { label: 'Banners', icon: Image, href: '/admin/banners' },
  { label: 'Chats', icon: MessageSquare, href: '/admin/chats' },
  { label: 'Email', icon: Mail, href: '/admin/email' },
  { label: 'Settings', icon: Settings, href: '/admin/settings' },
];

export default function AdminLayout({ children }) {
  const { user, isAdmin, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!loading && !isLoginPage && (!user || !isAdmin)) {
      router.push('/admin/login');
    }
  }, [user, isAdmin, loading, isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
    toast.success('Logged out successfully');
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex">
      <Toaster position="top-right" />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-neutral-900 border-r border-neutral-800 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#7B1E3B] to-[#501224] rounded-xl flex items-center justify-center shadow-md shadow-[#7B1E3B]/30">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <div>
                <span className="font-display text-xl font-bold text-white tracking-wider">SAVANT</span>
                <p className="text-xs text-neutral-400 font-medium">Admin Control Center</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <button
                  key={item.href}
                  onClick={() => {
                    router.push(item.href);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[#7B1E3B] text-white shadow-lg shadow-[#7B1E3B]/25 font-semibold'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto opacity-70" />}
                </button>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-neutral-800">
            <div className="flex items-center gap-3 px-4 py-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                <p className="text-xs text-neutral-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-neutral-900/90 backdrop-blur-xl border-b border-neutral-800/80">
          <div className="flex items-center justify-between px-6 py-3.5">
            <div className="flex items-center gap-4 flex-1">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-white flex items-center gap-2">
                  {navItems.find((item) => pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href)))?.label || 'Dashboard'}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-neutral-300 bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700/60 transition-all shadow-sm"
              >
                <span>Live Store</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </a>

              <button
                onClick={() => toast('System Notifications: All systems running smoothly', { icon: '🔔' })}
                className="relative p-2.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-[#7B1E3B] rounded-full ring-2 ring-neutral-900" />
              </button>

              <button
                onClick={() => router.push('/admin/settings')}
                className="p-2.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all"
                title="Admin Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
