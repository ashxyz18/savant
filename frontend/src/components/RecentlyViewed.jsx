'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Clock, ArrowRight, X } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { getImageUrl } from '../lib/image';
import api from '../lib/api';

const RecentlyViewed = () => {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [ref, isRevealed] = useScrollReveal({ threshold: 0.1 });

  useEffect(() => {
    loadRecentlyViewed();
  }, []);

  const loadRecentlyViewed = async () => {
    try {
      const stored = localStorage.getItem('recentlyViewed');
      if (!stored) return;

      const ids = JSON.parse(stored);
      if (!ids || ids.length === 0) return;

      const idsToFetch = ids.slice(0, 6);
      try {
        const data = await api.getProducts({ ids: idsToFetch.join(','), limit: 6 });
        const fetched = data.products || [];
        const ordered = idsToFetch
          .map((id) => fetched.find((p) => p._id === id))
          .filter(Boolean);
        setProducts(ordered);
      } catch {
        const fetched = [];
        for (const id of idsToFetch) {
          try {
            const product = await api.getProduct(id);
            fetched.push(product);
          } catch {
            // Skip invalid products
          }
        }
        setProducts(fetched);
      }
    } catch {
      // Invalid localStorage data
    }
  };

  const clearRecentlyViewed = () => {
    localStorage.removeItem('recentlyViewed');
    setProducts([]);
  };

  if (products.length === 0) return null;

  return (
    <section className="py-12 bg-neutral-50 border-t border-neutral-100" ref={ref}>
      <div className="container">
        <div
          className={`flex items-center justify-between mb-6 transition-all duration-700 ${
            isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-neutral-400" />
            <h3 className="font-display text-lg font-bold text-neutral-900">Recently Viewed</h3>
            <span className="text-xs text-neutral-400">({products.length} items)</span>
          </div>
          <button
            onClick={clearRecentlyViewed}
            className="text-xs text-neutral-400 hover:text-red-500 transition-colors duration-200 flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {products.map((product, index) => (
            <div
              key={product._id}
              className={`group cursor-pointer transition-all duration-500 ${
                isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: `${index * 80}ms` }}
              onClick={() => router.push(`/products/${product._id}`)}
            >
              <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 hover:border-neutral-300 transition-all duration-400">
                <div className="aspect-square bg-neutral-50 overflow-hidden relative">
                  {product.images && product.images[0] ? (
                    <Image
                      src={getImageUrl(product.images[0])}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 16vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-neutral-200">{product.name?.charAt(0) || 'R'}</span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h4 className="text-xs font-medium text-neutral-900 line-clamp-1 group-hover:text-primary-900 transition-colors">
                    {product.name}
                  </h4>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-sm font-bold text-neutral-900">${product.price?.toFixed(2)}</span>
                    {product.originalPrice && (
                      <span className="text-[10px] text-neutral-400 line-through">${product.originalPrice.toFixed(2)}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewed;
