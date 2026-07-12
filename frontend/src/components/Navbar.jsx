'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, Heart, User, Menu, X, ChevronDown } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const navCategories = [
  {
    label: 'Men',
    slug: 'men',
    subsections: [
      { label: 'Wallets', slug: 'wallets' },
      { label: 'Belts', slug: 'belts' },
      { label: 'Bags', slug: 'bags' },
      { label: 'Accessories', slug: 'accessories' },
    ],
  },
  {
    label: 'Women',
    slug: 'women',
    subsections: [
      { label: 'Handbags', slug: 'handbags' },
      { label: 'Clutches', slug: 'clutches' },
      { label: 'Wallets', slug: 'wallets' },
      { label: 'Accessories', slug: 'accessories' },
    ],
  },
  {
    label: 'Fragrances',
    slug: 'fragrances',
    subsections: [
      { label: "Men's", slug: 'men' },
      { label: "Women's", slug: 'women' },
      { label: 'Unisex', slug: 'unisex' },
    ],
  },
  {
    label: 'Backpacks',
    slug: 'backpacks',
    subsections: [
      { label: 'Laptop Bags', slug: 'laptop' },
      { label: 'Travel', slug: 'travel' },
      { label: 'Casual', slug: 'casual' },
    ],
  },
];

const Navbar = () => {
  const router = useRouter();
  const { itemCount } = useCart();
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileSubmenu, setMobileSubmenu] = useState(null);
  const dropdownRef = useRef(null);
  const dropdownTimeout = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDropdownEnter = (label) => {
    clearTimeout(dropdownTimeout.current);
    setOpenDropdown(label);
  };

  const handleDropdownLeave = () => {
    dropdownTimeout.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 150);
  };

  const navigateCategory = (category, subsection) => {
    const params = subsection
      ? `category=${category}&sub=${subsection}`
      : `category=${category}`;
    router.push(`/?${params}`);
    setOpenDropdown(null);
    setIsMenuOpen(false);
    setMobileSubmenu(null);
  };

  return (
    <nav className="sticky top-0 z-50 bg-primary-900 border-b border-primary-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              className="lg:hidden mr-3 p-2 rounded-lg hover:bg-primary-800 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 text-white" />
              ) : (
                <Menu className="w-5 h-5 text-white" />
              )}
            </button>
            <button onClick={() => router.push('/')} className="flex items-center">
              <div className="bg-white rounded-xl px-3 py-1.5 flex items-center">
                <img
                  src="/savant-logo.png"
                  alt="SAVANT"
                  className="h-11 w-auto object-contain"
                />
              </div>
            </button>
          </div>

          {/* Desktop Menu with Dropdowns */}
          <div className="hidden lg:flex items-center gap-1" ref={dropdownRef}>
            {navCategories.map((cat) => (
              <div
                key={cat.label}
                className="relative"
                onMouseEnter={() => handleDropdownEnter(cat.label)}
                onMouseLeave={handleDropdownLeave}
              >
                <button
                  onClick={() => navigateCategory(cat.slug)}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    openDropdown === cat.label
                      ? 'bg-primary-800 text-white'
                      : 'text-primary-200 hover:text-white hover:bg-primary-800/50'
                  }`}
                >
                  {cat.label}
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${
                      openDropdown === cat.label ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown */}
                {openDropdown === cat.label && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-neutral-100 py-2 animate-in fade-in slide-down">
                    <button
                      onClick={() => navigateCategory(cat.slug)}
                      className="w-full text-left px-4 py-2.5 text-sm font-semibold text-neutral-900 hover:bg-neutral-50 transition-colors"
                    >
                      All {cat.label}
                    </button>
                    <div className="mx-3 my-1 border-t border-neutral-100" />
                    {cat.subsections.map((sub) => (
                      <button
                        key={sub.slug}
                        onClick={() => navigateCategory(cat.slug, sub.slug)}
                        className="w-full text-left px-4 py-2.5 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-colors"
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <button
              onClick={() => router.push('/?filter=sale')}
              className="px-4 py-2 rounded-lg text-sm font-medium text-red-300 hover:text-red-200 hover:bg-primary-800/50 transition-colors"
            >
              Sale
            </button>

            <button
              onClick={() => router.push('/?filter=new')}
              className="px-4 py-2 rounded-lg text-sm font-medium text-primary-200 hover:text-white hover:bg-primary-800/50 transition-colors"
            >
              New Arrivals
            </button>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-1">
            {/* Search */}
            <div className="hidden md:block relative">
              <input
                type="text"
                placeholder="Search..."
                className="pl-9 pr-4 py-2 bg-primary-800 border border-primary-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent w-44 text-sm text-white placeholder-primary-400 transition-all duration-200 focus:w-56"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-400 w-4 h-4" />
            </div>

            <button className="p-2 rounded-lg hover:bg-primary-800 transition-colors">
              <Heart className="w-5 h-5 text-primary-200" />
            </button>

            <button
              onClick={() => router.push('/cart')}
              className="relative p-2 rounded-lg hover:bg-primary-800 transition-colors"
            >
              <ShoppingCart className="w-5 h-5 text-primary-200" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-white text-primary-900 text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>

            <button
              onClick={() => router.push(user ? '/account' : '/login')}
              className="p-2 rounded-lg hover:bg-primary-800 transition-colors"
            >
              <User className="w-5 h-5 text-primary-200" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-primary-900 border-t border-primary-800 py-4 max-h-[80vh] overflow-y-auto">
            {/* Mobile Search */}
            <div className="px-4 mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-9 pr-4 py-2.5 bg-primary-800 border border-primary-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent text-sm text-white placeholder-primary-400"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-400 w-4 h-4" />
              </div>
            </div>

            {/* Mobile Nav Categories */}
            <div className="space-y-1 px-2">
              {navCategories.map((cat) => (
                <div key={cat.label}>
                  <button
                    onClick={() =>
                      setMobileSubmenu(mobileSubmenu === cat.label ? null : cat.label)
                    }
                    className="flex items-center justify-between w-full px-4 py-2.5 rounded-lg text-sm font-medium text-primary-100 hover:bg-primary-800 transition-colors"
                  >
                    {cat.label}
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-200 ${
                        mobileSubmenu === cat.label ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {mobileSubmenu === cat.label && (
                    <div className="ml-4 space-y-1 mt-1">
                      <button
                        onClick={() => navigateCategory(cat.slug)}
                        className="block w-full text-left px-4 py-2 rounded-lg text-sm font-medium text-primary-200 hover:bg-primary-800 transition-colors"
                      >
                        All {cat.label}
                      </button>
                      {cat.subsections.map((sub) => (
                        <button
                          key={sub.slug}
                          onClick={() => navigateCategory(cat.slug, sub.slug)}
                          className="block w-full text-left px-4 py-2 rounded-lg text-sm text-primary-300 hover:text-primary-100 hover:bg-primary-800 transition-colors"
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <button
                onClick={() => {
                  router.push('/?filter=sale');
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-red-300 hover:bg-primary-800 transition-colors"
              >
                Sale
              </button>

              <button
                onClick={() => {
                  router.push('/?filter=new');
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-primary-100 hover:bg-primary-800 transition-colors"
              >
                New Arrivals
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
