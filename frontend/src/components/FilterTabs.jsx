'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

const FilterTabs = ({ activeFilter, setActiveFilter }) => {
  const router = useRouter();

  const tabs = [
    { id: 'all', label: 'All Products' },
    { id: 'men', label: 'Men' },
    { id: 'women', label: 'Women' },
    { id: 'fragrances', label: 'Fragrances' },
    { id: 'backpacks', label: 'Backpacks' },
    { id: 'new', label: 'New Arrivals' },
    { id: 'popular', label: 'Popular' },
    { id: 'sale', label: 'Sale' },
  ];

  const handleTabClick = (tabId) => {
    setActiveFilter(tabId);
    if (tabId === 'all') {
      router.push('/', { scroll: false });
    } else {
      router.push(`/?category=${tabId}`, { scroll: false });
    }
  };

  return (
    <section className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-100 shadow-sm">
      <div className="container">
        <div className="flex items-center gap-1 py-3 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`relative flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeFilter === tab.id
                  ? 'text-primary-900'
                  : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              {tab.label}
              {/* Active indicator */}
              {activeFilter === tab.id && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary-900 rounded-full animate-scale-in" />
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FilterTabs;
