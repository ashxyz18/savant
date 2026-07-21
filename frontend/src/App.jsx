'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ArrowUp } from 'lucide-react';
import Navbar from './components/Navbar';
import AnnouncementBar from './components/AnnouncementBar';
import Hero from './components/Hero';
import FilterTabs from './components/FilterTabs';
import ProductGrid from './components/ProductGrid';
import { useScrollPosition } from './hooks/useScrollReveal';

const Features = dynamic(() => import('./components/Features'), {
  loading: () => <div className="py-20 bg-white" />,
});

const RecentlyViewed = dynamic(() => import('./components/RecentlyViewed'), {
  loading: () => null,
});

const QuickViewModal = dynamic(() => import('./components/QuickViewModal'), {
  ssr: false,
  loading: () => null,
});

function App() {
  const searchParams = useSearchParams();
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeSubcategory, setActiveSubcategory] = useState('');
  const [quickViewProductId, setQuickViewProductId] = useState(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const scrolled = useScrollPosition(400);

  const VALID_CATEGORIES = ['men', 'women', 'fragrances', 'backpacks', 'new', 'popular', 'sale', 'featured'];

  useEffect(() => {
    const category = searchParams.get('category');
    const sub = searchParams.get('sub');
    const filter = searchParams.get('filter');

    if (category && VALID_CATEGORIES.includes(category)) {
      setActiveFilter(category);
      setActiveSubcategory(sub || '');
    } else if (filter && VALID_CATEGORIES.includes(filter)) {
      setActiveFilter(filter);
      setActiveSubcategory('');
    } else {
      setActiveFilter('all');
      setActiveSubcategory('');
    }
  }, [searchParams]);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setActiveSubcategory('');
  };

  const openQuickView = (productId) => {
    setQuickViewProductId(productId);
    setQuickViewOpen(true);
  };

  const closeQuickView = () => {
    setQuickViewOpen(false);
    setTimeout(() => setQuickViewProductId(null), 300);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      <AnnouncementBar />
      <Navbar />
      <Hero />
      <FilterTabs
        activeFilter={activeFilter}
        setActiveFilter={handleFilterChange}
      />
      <ProductGrid activeFilter={activeFilter} activeSubcategory={activeSubcategory} onQuickView={openQuickView} />
      <Features />
      <RecentlyViewed />
      
      {/* Footer */}
      <footer className="bg-neutral-950 text-white pt-16 pb-8">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pb-12 border-b border-neutral-800">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-neutral-900 font-bold text-lg">S</span>
                </div>
                <span className="font-display text-2xl font-bold">SAVANT</span>
              </div>
              <p className="text-neutral-400 max-w-md mb-8">
                Crafting premium leather bags that blend timeless elegance with modern functionality.
                Each piece tells a story of craftsmanship and attention to detail.
              </p>
              <div className="flex items-center gap-3">
                {[
                  { label: 'f', color: 'hover:bg-blue-600' },
                  { label: 'ig', color: 'hover:bg-pink-600' },
                  { label: 'X', color: 'hover:bg-neutral-600' },
                  { label: 'P', color: 'hover:bg-red-600' },
                ].map((social, i) => (
                  <a
                    key={social.label}
                    href="#"
                    className={`w-9 h-9 bg-neutral-800 rounded-full flex items-center justify-center ${social.color} transition-all duration-300 hover:scale-110 hover:shadow-lg`}
                  >
                    <span className="text-xs text-neutral-300">{social.label}</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h4 className="text-sm font-semibold mb-5 text-white uppercase tracking-wider">Shop</h4>
                <ul className="space-y-3">
                  {['Men\'s Collection', 'Women\'s Collection', 'New Arrivals', 'Best Sellers', 'Limited Edition', 'Gift Cards'].map((item) => (
                    <li key={item}>
                      <a href="#" className="text-sm text-neutral-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-200">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-5 text-white uppercase tracking-wider">Company</h4>
                <ul className="space-y-3">
                  {['About Us', 'Our Story', 'Sustainability', 'Careers', 'Press', 'Wholesale'].map((item) => (
                    <li key={item}>
                      <a href="#" className="text-sm text-neutral-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-200">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-5 text-white uppercase tracking-wider">Support</h4>
                <ul className="space-y-3">
                  {['Contact Us', 'FAQs', 'Shipping Policy', 'Returns & Exchanges', 'Warranty', 'Repair Services'].map((item) => (
                    <li key={item}>
                      <a href="#" className="text-sm text-neutral-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-200">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="py-12">
            <div className="max-w-lg mx-auto text-center">
              <h3 className="text-xl font-bold mb-3">Stay Updated</h3>
              <p className="text-neutral-400 text-sm mb-6">
                Subscribe for exclusive offers, new arrivals, and style inspiration.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-1 px-4 py-3 rounded-lg bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm transition-all duration-200"
                />
                <button className="px-6 py-3 bg-white text-neutral-900 rounded-lg font-semibold text-sm hover:bg-primary-900 hover:text-white transition-all duration-300 whitespace-nowrap active:scale-95">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-neutral-800">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <p className="text-neutral-500 text-sm">
                &copy; 2025 SAVANT Leather Bags. All rights reserved.
              </p>

              <div className="flex flex-wrap gap-6 text-sm">
                {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
                  <a key={item} href="#" className="text-neutral-500 hover:text-white transition-colors duration-200">
                    {item}
                  </a>
                ))}
              </div>

              <div className="flex items-center gap-5 text-sm text-neutral-500">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Secure Payment
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 012 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Global Shipping
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Quick View Modal */}
      <QuickViewModal
        productId={quickViewProductId}
        isOpen={quickViewOpen}
        onClose={closeQuickView}
      />

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 z-50 w-12 h-12 bg-primary-900 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:bg-primary-800 hover:shadow-xl hover:scale-110 active:scale-95 ${
          scrolled
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </div>
  );
}

export default App;
