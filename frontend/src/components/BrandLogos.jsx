'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { getImageUrl, getLogoUrl } from '../lib/image';
import api from '../lib/api';

const BrandLogos = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    loadBrands();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2 }
    );

    const el = sectionRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [brands]);

  const loadBrands = async () => {
    try {
      const data = await api.getBrands({ isActive: 'true' });
      setBrands(data);
    } catch (error) {
      console.error('Failed to load brands:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || brands.length === 0) return null;

  const marqueeBrands = [...brands, ...brands];

  return (
    <section
      ref={sectionRef}
      className={`py-6 border-b border-neutral-100 bg-neutral-50/50 transition-opacity duration-700 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="marquee-container">
        <div className="marquee-track">
          {marqueeBrands.map((brand, index) => (
            <div
              key={`${brand._id}-${index}`}
              className="flex-shrink-0 mx-6 md:mx-10 group"
            >
              <div className="w-24 h-24 bg-white rounded-xl border border-neutral-200 flex flex-col items-center justify-center group-hover:border-primary-300 group-hover:shadow-md transition-all duration-300 overflow-hidden group-hover:scale-105">
                {brand.logo ? (
                  <Image
                    src={getLogoUrl(brand.logo)}
                    alt={brand.name}
                    width={96}
                    height={96}
                    className="w-full h-full object-contain p-3 group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <span className="text-neutral-900 font-bold text-lg group-hover:text-primary-900 transition-colors duration-300">
                    {brand.name.charAt(0)}
                  </span>
                )}
              </div>
              <span className="block text-center text-xs font-medium text-neutral-400 group-hover:text-primary-900 mt-2 transition-colors duration-300">
                {brand.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandLogos;
