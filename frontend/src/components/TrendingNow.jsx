'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { TrendingUp, ArrowRight, Flame, Clock, Star } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { getImageUrl } from '../lib/image';
import api from '../lib/api';

const TrendingNow = () => {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ref, isRevealed] = useScrollReveal({ threshold: 0.1 });
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const loadTrending = async () => {
      try {
        const data = await api.getProducts({ sort: 'featured', limit: 8 });
        setProducts(data.products || []);
      } catch (error) {
        console.error('Failed to load trending products:', error);
      } finally {
        setLoading(false);
      }
    };
    loadTrending();
  }, []);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (loading || products.length === 0) return null;

  return (
    <section className="py-8 bg-white relative overflow-hidden" ref={ref}>
      <div className="container relative">
        <div
          className={`flex items-end justify-between mb-8 transition-all duration-700 ${
            isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-full text-xs font-semibold tracking-widest uppercase mb-3">
              <Flame className="w-3.5 h-3.5" />
              Hot Right Now
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-neutral-900">
              Trending <span className="text-gradient-primary">Now</span>
            </h2>
            <p className="text-neutral-500 text-sm mt-1">Most popular picks this week</p>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-400 hover:text-primary-900 hover:border-primary-900 transition-all duration-300"
            >
              ←
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-400 hover:text-primary-900 hover:border-primary-900 transition-all duration-300"
            >
              →
            </button>
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((product, index) => (
            <div
              key={product._id}
              className={`flex-shrink-0 w-72 snap-start group cursor-pointer transition-all duration-500 ${
                isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
              onClick={() => router.push(`/products/${product._id}`)}
            >
              <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 hover:border-neutral-300 transition-all duration-500">
                <div className="relative aspect-[4/3] bg-neutral-50 overflow-hidden">
                  {product.images && product.images[0] ? (
                    <Image
                      src={getImageUrl(product.images[0])}
                      alt={product.name}
                      fill
                      sizes="288px"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl font-bold text-neutral-200">
                        {product.name?.charAt(0) || 'R'}
                      </span>
                    </div>
                  )}

                  <div className="absolute top-3 left-3 w-8 h-8 bg-primary-900 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md">
                    {index + 1}
                  </div>

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/products/${product._id}`);
                      }}
                      className="w-full py-2.5 bg-white text-neutral-900 rounded-lg text-xs font-semibold hover:bg-primary-900 hover:text-white transition-all duration-300"
                    >
                      View Details
                    </button>
                  </div>

                  {product.originalPrice && product.originalPrice > product.price && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-0.5 rounded text-[10px] font-bold">
                      -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-center gap-1 mb-1.5">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-xs text-neutral-500">{product.rating?.toFixed(1) || '4.8'}</span>
                    <span className="text-xs text-neutral-300 mx-1">·</span>
                    <Clock className="w-3 h-3 text-neutral-400" />
                    <span className="text-xs text-neutral-400">2-3 days</span>
                  </div>
                  <h3 className="text-sm font-semibold text-neutral-900 group-hover:text-primary-900 transition-colors duration-300 line-clamp-1 mb-1">
                    {product.name}
                  </h3>
                  <p className="text-xs text-neutral-400 mb-2">{product.material || 'Premium Leather'}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-bold text-neutral-900">${product.price?.toFixed(2)}</span>
                    {product.originalPrice && (
                      <span className="text-xs text-neutral-400 line-through">
                        ${product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          className={`text-center mt-8 transition-all duration-700 delay-500 ${
            isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <button
            onClick={() => {
              const section = document.getElementById('product-section');
              if (section) section.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary-900 hover:text-primary-700 transition-colors duration-200 group/link"
          >
            View All Products
            <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-200" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default TrendingNow;
