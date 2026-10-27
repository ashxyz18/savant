'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import api from '../lib/api';

// Words that cycle (italic serif) under the main headline line
const DEFAULT_WORDS = ['daily commute.', 'long weekend.', 'boardroom.', 'open road.'];
const WORD_INTERVAL_MS = 3500;

const PERKS = [
  { icon: ShieldCheck, title: 'Warranty', text: 'Guaranteed on every piece' },
  { icon: Truck, title: 'Delivery', text: 'Dhaka ৳80 · Outside ৳120' },
  { icon: RotateCcw, title: 'Returns', text: '3-day easy returns' },
];

const Hero = () => {
  const router = useRouter();
  const [heroBanner, setHeroBanner] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const loadHeroBanner = async () => {
      try {
        const banners = await api.getBanners({ position: 'hero', isActive: 'true' });
        if (banners && banners.length > 0) setHeroBanner(banners[0]);
      } catch (error) {
        console.error('Failed to load hero banner:', error);
      }
    };
    loadHeroBanner();
  }, []);

  // Admin banner subtitle (if set) leads the rotating words
  const words = heroBanner?.subtitle ? [heroBanner.subtitle, ...DEFAULT_WORDS] : DEFAULT_WORDS;

  useEffect(() => {
    const id = setInterval(() => setWordIndex((i) => (i + 1) % words.length), WORD_INTERVAL_MS);
    return () => clearInterval(id);
  }, [words.length]);

  const scrollToProducts = () => {
    document.getElementById('product-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleShopBackpacks = () => {
    router.push('/?category=backpacks', { scroll: false });
    setTimeout(scrollToProducts, 150);
  };

  const heroTitle = heroBanner?.title || 'Built for the';
  const heroDescription =
    heroBanner?.description ||
    'Considered backpacks and leather goods, designed to move with you — refined in form, uncompromising in function.';

  const reveal = (delay) =>
    `transition-all duration-1000 ease-out ${delay} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`;

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <section className="relative overflow-hidden bg-primary-950 min-h-[78vh] sm:min-h-[90vh] flex flex-col">
      {/* Background video with slow settle-in zoom */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          className="hero-video h-full w-full object-cover object-center"
          src="/hero-video.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
      </div>

      {/* Cinematic overlays */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-primary-950/90 via-primary-950/55 to-primary-950/10" />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-primary-950 via-primary-950/30 to-transparent" />
      <div className="absolute inset-0 z-10 pointer-events-none [background:radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.35))]" />

      {/* Main content */}
      <div className="container relative z-20 flex-1 flex items-end">
        <div className="w-full pt-16 pb-10 sm:pb-16">
          <div className="max-w-2xl">
            {/* Eyebrow */}
            <div className={`flex items-center gap-4 mb-6 sm:mb-8 ${reveal('delay-150')}`}>
              <span className="hero-line block h-px w-10 sm:w-14 bg-[#d9c3a0]" />
              <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.32em] text-white/75">
                {heroBanner?.buttonText || 'The 2025 Collection'}
              </span>
            </div>

            {/* Headline */}
            <h1 className={`font-serif font-light text-white leading-[0.95] tracking-tight text-[2.9rem] sm:text-6xl lg:text-[5.5rem] mb-6 sm:mb-8 ${reveal('delay-300')}`}>
              <span className="block">{heroTitle}</span>
              <span className="block h-[1.1em] overflow-hidden">
                <span key={wordIndex} className="hero-word italic text-champagne">
                  {words[wordIndex]}
                </span>
              </span>
            </h1>

            <p className={`text-sm sm:text-base text-white/70 font-light leading-relaxed max-w-md mb-8 sm:mb-10 ${reveal('delay-500')}`}>
              {heroDescription}
            </p>

            {/* CTAs */}
            <div className={`flex flex-wrap items-center gap-x-8 gap-y-4 ${reveal('delay-700')}`}>
              <button
                onClick={scrollToProducts}
                className="group inline-flex items-center gap-3 bg-[#f4ece0] text-primary-950 px-7 py-3.5 text-[11px] font-semibold uppercase tracking-[0.22em] hover:bg-white transition-colors duration-300"
              >
                Shop the Collection
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.5} />
              </button>
              <button
                onClick={handleShopBackpacks}
                className="group relative text-[11px] font-semibold uppercase tracking-[0.22em] text-white py-2"
              >
                Explore Backpacks
                <span className="absolute left-0 bottom-0 h-px w-full bg-white/40" />
                <span className="absolute left-0 bottom-0 h-px w-full bg-[#d9c3a0] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              </button>
            </div>

            {/* Word index + progress */}
            <div className={`mt-10 sm:mt-14 flex items-center gap-4 text-[11px] tracking-[0.2em] text-white/60 font-medium ${reveal('delay-1000')}`}>
              <span className="text-white tabular-nums">{pad(wordIndex + 1)}</span>
              <span className="relative block h-px w-20 sm:w-28 bg-white/20 overflow-hidden">
                <span
                  key={wordIndex}
                  className="hero-progress absolute inset-0 bg-[#d9c3a0]"
                  style={{ '--hero-interval': `${WORD_INTERVAL_MS}ms` }}
                />
              </span>
              <span className="tabular-nums">{pad(words.length)}</span>
            </div>
          </div>
        </div>

        {/* Scroll cue (desktop) */}
        <button
          type="button"
          onClick={scrollToProducts}
          aria-label="Scroll to products"
          className={`hidden lg:flex absolute right-8 bottom-16 flex-col items-center gap-4 transition-opacity duration-1000 delay-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        >
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/60 [writing-mode:vertical-rl]">Scroll</span>
          <span className="relative block w-px h-16 bg-white/15 overflow-hidden">
            <span className="hero-scroll-cue absolute inset-x-0 top-0 h-1/2 bg-white/80" />
          </span>
        </button>
      </div>

      {/* Perks bar */}
      <div className={`relative z-20 border-t border-white/10 bg-primary-950/40 backdrop-blur-md transition-opacity duration-1000 delay-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="container">
          <div className="grid grid-cols-3 divide-x divide-white/10">
            {PERKS.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex flex-col sm:flex-row items-center sm:items-center gap-1.5 sm:gap-4 py-4 sm:py-5 px-2 sm:px-6 first:sm:pl-0 text-center sm:text-left">
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#d9c3a0] shrink-0" strokeWidth={1.25} />
                <div>
                  <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-white font-medium">{title}</div>
                  <div className="hidden sm:block text-xs text-white/55 font-light mt-0.5">{text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
