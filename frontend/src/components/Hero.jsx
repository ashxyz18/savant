'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ArrowRight, Shield, Truck, RotateCcw, ImageIcon, Loader2, ChevronDown } from 'lucide-react';
import { getImageUrl } from '../lib/image';
import api from '../lib/api';

const Hero = () => {
  const [heroBanner, setHeroBanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

  useEffect(() => {
    // Trigger entrance animation after mount
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const loadHeroBanner = async () => {
      try {
        const banners = await api.getBanners({ position: 'hero', isActive: 'true' });
        if (banners && banners.length > 0) {
          setHeroBanner(banners[0]);
        }
      } catch (error) {
        console.error('Failed to load hero banner:', error);
      } finally {
        setLoading(false);
      }
    };
    loadHeroBanner();
  }, []);

  // Subtle parallax on mouse move
  const handleMouseMove = (e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleStartShopping = () => {
    const section = document.getElementById('product-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollDown = () => {
    const section = document.getElementById('product-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const features = [
    { icon: <Shield className="w-4 h-4" />, text: 'Warranty Guaranteed' },
    { icon: <Truck className="w-4 h-4" />, text: 'Dhaka ৳80 | Outside ৳120' },
    { icon: <RotateCcw className="w-4 h-4" />, text: '3-Day Returns' },
  ];

  const heroTitle = heroBanner?.title || 'Crafted for';
  const heroSubtitle = heroBanner?.subtitle || 'Timeless Elegance';
  const heroDescription = heroBanner?.description || 'Discover our premium leather collection where craftsmanship meets contemporary design. Each piece is meticulously crafted using sustainable materials.';

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      className="relative overflow-hidden bg-neutral-900 min-h-[100svh] sm:min-h-[85vh]"
    >
      {/* Background video (object-contain on mobile to prevent cropping, object-cover on sm+) */}
      <div className="absolute inset-0 z-0 h-full w-full bg-[#2C0A14] flex items-center justify-center">
        <video
          className="h-full w-full object-contain sm:object-cover object-center"
          src="/hero-video.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
      </div>

      {/* Maroon overlay for readability */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-primary-950/40 via-primary-900/35 to-primary-950/60" />

      {/* Animated background decoration with parallax */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        <div
          className="absolute -top-40 -right-40 w-80 h-80 bg-primary-100/30 rounded-full blur-3xl animate-float"
          style={{
            transform: `translate(${mousePos.x * 20}px, ${mousePos.y * 20}px)`,
            transition: 'transform 0.3s ease-out',
          }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-50/30 rounded-full blur-3xl animate-float"
          style={{
            animationDelay: '2s',
            transform: `translate(${mousePos.x * -15}px, ${mousePos.y * -15}px)`,
            transition: 'transform 0.3s ease-out',
          }}
        />
      </div>

      <div className="container relative z-20">
        <div className="flex min-h-[100svh] sm:min-h-[85vh] flex-col items-start justify-end py-24 text-left">
          <div className={`max-w-3xl transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm text-white rounded-full text-xs font-medium mb-6 tracking-wider uppercase transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              <span className="w-1.5 h-1.5 bg-success-400 rounded-full animate-pulse" />
              {heroBanner?.buttonText || 'New Collection 2025'}
            </div>

            <h1 className={`font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6 transition-all duration-700 delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}>
              {heroTitle}
              <span className="block text-gradient-primary">{heroSubtitle}</span>
            </h1>

            <p className={`text-base text-white/80 mb-8 max-w-xl mx-auto leading-relaxed transition-all duration-700 delay-[400ms] ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}>
              {heroDescription}
            </p>

            {/* Features */}
            <div className={`flex flex-wrap gap-3 mb-10 justify-start transition-all duration-700 delay-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}>
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:border-white/40 transition-all duration-300 cursor-default group/feature"
                >
                  <div className="text-white group-hover/feature:scale-110 transition-transform duration-200">{feature.icon}</div>
                  <span className="text-xs font-medium text-white/90">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className={`flex flex-col sm:flex-row gap-3 justify-start transition-all duration-700 delay-[600ms] ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}>
              <button
                onClick={handleStartShopping}
                className="btn-primary group flex items-center justify-center gap-2 hover:shadow-glow-primary"
              >
                Start Shopping
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </button>
            </div>

            {/* Stats */}
            <div className={`mt-8 flex items-center gap-8 justify-start transition-all duration-700 delay-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}>
              {[
                { value: '500+', label: 'Happy Customers' },
                { value: '4.9', label: 'Average Rating' },
              ].map((stat, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <div className="w-px h-10 bg-white/20" />}
                  <div className="group cursor-default">
                    <div className="text-2xl font-bold text-white group-hover:text-primary-200 transition-colors duration-300">{stat.value}</div>
                    <div className="text-xs text-white/70 font-medium">{stat.label}</div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className={`absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer transition-all duration-700 delay-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
        onClick={handleScrollDown}
      >
        <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-medium">Scroll</span>
        <ChevronDown className="w-4 h-4 text-neutral-400 animate-bounce" />
      </div>
    </section>
  );
};

export default Hero;
