'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import ProductCard from './ProductCard';
import api from '../lib/api';
import { Filter, Grid, List, ChevronDown, Loader2, Package, SlidersHorizontal } from 'lucide-react';

const ProductGrid = ({ activeFilter, activeSubcategory = '', onQuickView }) => {
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const gridRef = useRef(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 1,
  });

  // Observe when grid section enters viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    const el = gridRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sort: sortBy,
      };
      if (activeFilter && activeFilter !== 'all') {
        params.category = activeFilter;
      }
      if (activeSubcategory) {
        params.subcategory = activeSubcategory;
      }
      const data = await api.getProducts(params);
      setProducts(data.products || []);
      setPagination((prev) => ({
        ...prev,
        total: data.pagination?.total || 0,
        pages: data.pagination?.pages || 1,
      }));
    } catch (error) {
      console.error('Failed to load products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [activeFilter, activeSubcategory, sortBy, pagination.page, pagination.limit]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [activeFilter, activeSubcategory, sortBy]);

  const getCategoryTitle = () => {
    const subcategoryLabel = activeSubcategory ? ` — ${activeSubcategory}` : '';
    switch (activeFilter) {
      case 'all': return 'All Products';
      case 'men': return `Men's Collection${subcategoryLabel}`;
      case 'women': return `Women's Collection${subcategoryLabel}`;
      case 'fragrances': return `Fragrances${subcategoryLabel}`;
      case 'backpacks': return `Backpacks${subcategoryLabel}`;
      case 'new': return 'New Arrivals';
      case 'popular': return 'Popular Picks';
      case 'sale': return 'On Sale';
      default: return 'Our Collection';
    }
  };

  return (
    <section id="product-section" ref={gridRef} className="py-8 bg-white scroll-mt-20">
      <div className="container">
        {/* Grid Header */}
        <div className={`mb-10 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-neutral-900">
                {getCategoryTitle()}
              </h2>
              <p className="text-neutral-500 text-sm mt-1">
                {pagination.total} product{pagination.total !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-all duration-300 text-sm ${
                  showFilters
                    ? 'border-primary-900 bg-primary-50 text-primary-900'
                    : 'border-neutral-200 hover:border-neutral-400'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
              </button>

              <div className="hidden sm:flex items-center border border-neutral-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 transition-all duration-200 ${viewMode === 'grid' ? 'bg-neutral-900 text-white' : 'text-neutral-400 hover:bg-neutral-50'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 transition-all duration-200 ${viewMode === 'list' ? 'bg-neutral-900 text-white' : 'text-neutral-400 hover:bg-neutral-50'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm text-neutral-700 transition-all duration-200 cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Filter Panel */}
          <div className={`overflow-hidden transition-all duration-500 ${
            showFilters ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <h4 className="font-semibold text-neutral-900 text-sm mb-3">Price Range</h4>
                  <div className="space-y-2">
                    {['Under $150', '$150 - $300', '$300 - $500', 'Over $500'].map((range) => (
                      <label key={range} className="flex items-center gap-2 cursor-pointer text-sm group/checkbox">
                        <input type="checkbox" className="rounded border-neutral-300 text-primary-900 focus:ring-primary-500" />
                        <span className="text-neutral-600 group-hover/checkbox:text-neutral-900 transition-colors">{range}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-900 text-sm mb-3">Material</h4>
                  <div className="space-y-2">
                    {['Full-Grain Leather', 'Saffiano Leather', 'Suede', 'Vegetable-Tanned', 'Italian Leather'].map((material) => (
                      <label key={material} className="flex items-center gap-2 cursor-pointer text-sm group/checkbox">
                        <input type="checkbox" className="rounded border-neutral-300 text-primary-900 focus:ring-primary-500" />
                        <span className="text-neutral-600 group-hover/checkbox:text-neutral-900 transition-colors">{material}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-900 text-sm mb-3">Color</h4>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { hex: '#1a1a1a', name: 'Black' },
                      { hex: '#6B4226', name: 'Brown' },
                      { hex: '#9CA3AF', name: 'Gray' },
                      { hex: '#E97451', name: 'Orange' },
                      { hex: '#DC2626', name: 'Red' },
                      { hex: '#15803D', name: 'Green' },
                    ].map((color) => (
                      <button
                        key={color.hex}
                        className="w-8 h-8 rounded-full border-2 border-white shadow-sm hover:scale-125 hover:shadow-md transition-all duration-200 ring-1 ring-neutral-200"
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-900 text-sm mb-3">Features</h4>
                  <div className="space-y-2">
                    {['Fast Shipping', 'Water Resistant', 'RFID Protection', 'Laptop Sleeve', 'Multiple Compartments'].map((feature) => (
                      <label key={feature} className="flex items-center gap-2 cursor-pointer text-sm group/checkbox">
                        <input type="checkbox" className="rounded border-neutral-300 text-primary-900 focus:ring-primary-500" />
                        <span className="text-neutral-600 group-hover/checkbox:text-neutral-900 transition-colors">{feature}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-neutral-200">
                <button className="px-4 py-2 text-sm text-neutral-500 hover:text-neutral-900 font-medium transition-colors">
                  Clear All
                </button>
                <button className="px-5 py-2 bg-primary-900 text-white rounded-lg text-sm font-medium hover:bg-primary-800 transition-all duration-200 active:scale-95">
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                <div className="aspect-square bg-neutral-100 shimmer" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-neutral-100 rounded shimmer w-3/4" />
                  <div className="h-3 bg-neutral-100 rounded shimmer w-1/2" />
                  <div className="h-5 bg-neutral-100 rounded shimmer w-1/3" />
                  <div className="flex gap-2">
                    <div className="h-9 flex-1 bg-neutral-100 rounded-lg shimmer" />
                    <div className="h-9 flex-1 bg-neutral-100 rounded-lg shimmer" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
            {products.map((product, index) => (
              <div
                key={product._id}
                className="transition-all duration-500"
                style={{
                  transitionDelay: isVisible ? `${index * 80}ms` : '0ms',
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                }}
              >
                <ProductCard product={product} onQuickView={onQuickView} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-neutral-50 rounded-xl border border-neutral-200">
            <Package className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-neutral-900 mb-2">No products found</h3>
            <p className="text-neutral-500 text-sm max-w-md mx-auto mb-6">
              We couldn't find any products matching your filter. Try adjusting your filters or browse our full collection.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-primary-900 text-white rounded-lg text-sm font-medium hover:bg-primary-800 transition-all duration-200 active:scale-95"
            >
              Browse All Products
            </button>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <button
              onClick={() => setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page === 1}
              className="px-4 py-2 border border-neutral-200 rounded-lg hover:border-primary-300 hover:text-primary-900 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium transition-all duration-200"
            >
              Previous
            </button>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => setPagination((prev) => ({ ...prev, page: num }))}
                className={`w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 ${
                  num === pagination.page
                    ? 'bg-primary-900 text-white shadow-sm'
                    : 'border border-neutral-200 text-neutral-600 hover:border-primary-300 hover:text-primary-900'
                }`}
              >
                {num}
              </button>
            ))}
            <button
              onClick={() => setPagination((prev) => ({ ...prev, page: Math.min(pagination.pages, prev.page + 1) }))}
              disabled={pagination.page === pagination.pages}
              className="px-4 py-2 border border-neutral-200 rounded-lg hover:border-primary-300 hover:text-primary-900 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium transition-all duration-200"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductGrid;
