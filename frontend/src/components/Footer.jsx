'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

const Footer = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    setSubscribed(true);
    toast.success('Thank you for subscribing to SAVANT updates');
    setEmail('');
  };

  const navTo = (path) => {
    router.push(path);
  };

  return (
    <footer className="bg-primary-950 text-white border-t border-primary-900/60 pt-16 pb-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Brand Hallmarks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 mb-12 border-b border-white/10">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="w-10 h-10 rounded-lg bg-primary-900/80 flex items-center justify-center text-[#d9c3a0] shrink-0">
              <Truck className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-white">Nationwide Delivery</h4>
              <p className="text-xs text-white/60 mt-0.5">Dhaka ৳80 · Outside Dhaka ৳120</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="w-10 h-10 rounded-lg bg-primary-900/80 flex items-center justify-center text-[#d9c3a0] shrink-0">
              <ShieldCheck className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-white">Crafted to Last</h4>
              <p className="text-xs text-white/60 mt-0.5">Premium materials & tested durability</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="w-10 h-10 rounded-lg bg-primary-900/80 flex items-center justify-center text-[#d9c3a0] shrink-0">
              <RotateCcw className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-white">3-Day Return Policy</h4>
              <p className="text-xs text-white/60 mt-0.5">Easy exchanges on unused pieces</p>
            </div>
          </div>
        </div>

        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-white/10">
          
          {/* Brand Column (2 cols on lg) */}
          <div className="lg:col-span-2">
            <button
              onClick={() => navTo('/')}
              className="inline-block bg-white rounded-xl px-3.5 py-2 mb-5 hover:opacity-95 transition-opacity"
            >
              <img
                src="/savant-logo.png"
                alt="SAVANT"
                className="h-9 w-auto object-contain"
              />
            </button>
            <p className="text-sm text-white/70 max-w-sm font-light leading-relaxed mb-6">
              Thoughtfully engineered backpacks and leather goods crafted for everyday utility, understated elegance, and lifelong durability.
            </p>
            
            {/* Direct Social Links */}
            <div className="flex items-center gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-all"
              >
                <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-all"
              >
                <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://wa.me"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-all"
              >
                <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Collections */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.25em] font-bold text-white mb-4">
              Collections
            </h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: 'Backpacks', query: 'category=backpacks' },
                { label: "Men's Collection", query: 'category=men' },
                { label: "Women's Collection", query: 'category=women' },
                { label: 'Fragrances', query: 'category=fragrances' },
                { label: 'New Arrivals', query: 'filter=new' },
                { label: 'Sale Archive', query: 'filter=sale' },
              ].map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => navTo(`/?${item.query}`)}
                    className="text-white/60 hover:text-white hover:translate-x-1 transition-all text-xs tracking-wide"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Assistance */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.25em] font-bold text-white mb-4">
              Assistance
            </h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: 'My Account', path: '/account' },
                { label: 'Shopping Cart', path: '/cart' },
                { label: 'Checkout', path: '/checkout' },
                { label: 'Delivery & Returns', path: '/products/view' },
              ].map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => navTo(item.path)}
                    className="text-white/60 hover:text-white hover:translate-x-1 transition-all text-xs tracking-wide"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Private Updates */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.25em] font-bold text-white mb-4">
              Private Access
            </h4>
            <p className="text-xs text-white/60 font-light leading-relaxed mb-4">
              Receive notifications on seasonal drops, limited runs, and private member releases.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2.5">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-lg text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#d9c3a0] transition-colors"
              />
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-[#f4ece0] hover:bg-white text-primary-950 rounded-lg text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2"
              >
                {subscribed ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Subscribed
                  </>
                ) : (
                  <>
                    Subscribe
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p className="tracking-wide">
            &copy; {new Date().getFullYear()} SAVANT. Handcrafted in Bangladesh.
          </p>
          <div className="flex items-center gap-6">
            <span>Cash on Delivery Available</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>Dhaka &amp; Nationwide</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
