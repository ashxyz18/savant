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
import Footer from './components/Footer';
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
      
      <Footer />

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
