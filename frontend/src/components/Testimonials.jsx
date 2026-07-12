'use client';

import React, { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

const testimonials = [
  {
    name: 'Sarah Mitchell',
    role: 'Fashion Blogger',
    avatar: 'SM',
    rating: 5,
    text: 'The quality of SAVANT leather bags is absolutely unmatched. I\'ve been using my tote daily for over a year and it still looks brand new. The craftsmanship is evident in every stitch.',
    product: 'Classic Tote Bag',
  },
  {
    name: 'James Rodriguez',
    role: 'Business Executive',
    avatar: 'JR',
    rating: 5,
    text: 'I purchased the executive briefcase for my daily commute and it\'s been a game changer. The laptop compartment is perfectly padded and the leather has developed a beautiful patina.',
    product: 'Executive Briefcase',
  },
  {
    name: 'Emily Chen',
    role: 'Interior Designer',
    avatar: 'EC',
    rating: 5,
    text: 'SAVANT\'s attention to detail is remarkable. From the packaging to the product itself, everything screams luxury. The crossbody bag is my go-to for every occasion.',
    product: 'Leather Crossbody',
  },
  {
    name: 'Michael Thompson',
    role: 'Photographer',
    avatar: 'MT',
    rating: 4,
    text: 'The camera bag from SAVANT is both functional and stylish. It fits all my gear while looking professional. The leather quality is top-notch and the compartments are well thought out.',
    product: 'Camera Bag',
  },
  {
    name: 'Olivia Parker',
    role: 'Entrepreneur',
    avatar: 'OP',
    rating: 5,
    text: 'I bought the wallet as a gift for my husband and he absolutely loves it. The RFID protection gives us peace of mind and the leather feels incredibly premium.',
    product: 'RFID Wallet',
  },
  {
    name: 'David Kim',
    role: 'Software Engineer',
    avatar: 'DK',
    rating: 5,
    text: 'The backpack is perfect for my daily commute. It fits my 15" laptop, has great organization, and looks professional enough for client meetings. Worth every penny.',
    product: 'Laptop Backpack',
  },
];

const TestimonialCard = ({ testimonial, isActive }) => {
  return (
    <div
      className={`transition-all duration-500 ${
        isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95 absolute inset-0'
      }`}
    >
      <div className="bg-white rounded-2xl border border-neutral-200 p-8 md:p-10 relative overflow-hidden">
        {/* Quote decoration */}
        <div className="absolute top-6 right-8 text-primary-100">
          <Quote className="w-16 h-16" />
        </div>

        <div className="relative">
          {/* Stars */}
          <div className="flex items-center gap-0.5 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < testimonial.rating ? 'text-amber-400 fill-amber-400' : 'text-neutral-200'
                }`}
              />
            ))}
          </div>

          {/* Review text */}
          <p className="text-neutral-700 leading-relaxed text-base md:text-lg mb-8 max-w-2xl">
            &ldquo;{testimonial.text}&rdquo;
          </p>

          {/* Reviewer info */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary-900 text-white flex items-center justify-center font-bold text-sm">
              {testimonial.avatar}
            </div>
            <div>
              <div className="font-semibold text-neutral-900">{testimonial.name}</div>
              <div className="text-sm text-neutral-500">{testimonial.role}</div>
            </div>
            <div className="ml-auto hidden sm:block">
              <span className="text-xs text-primary-900 bg-primary-50 px-3 py-1.5 rounded-full font-medium">
                {testimonial.product}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Testimonials = () => {
  const [current, setCurrent] = useState(0);
  const [ref, isRevealed] = useScrollReveal({ threshold: 0.2 });

  // Auto-advance
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const goTo = (index) => setCurrent(index);
  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);
  const next = () => setCurrent((c) => (c + 1) % testimonials.length);

  return (
    <section className="py-20 bg-neutral-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-primary-50/50 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-100/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div
        ref={ref}
        className={`container relative reveal ${isRevealed ? 'revealed' : ''}`}
      >
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-900 rounded-full text-xs font-semibold tracking-widest uppercase mb-4">
            <Star className="w-3.5 h-3.5 fill-primary-900" />
            Customer Reviews
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            What Our Customers <span className="text-gradient-primary">Say</span>
          </h2>
          <p className="text-neutral-500">
            Real stories from real customers who love their SAVANT products.
          </p>
        </div>

        {/* Testimonial carousel */}
        <div className="max-w-4xl mx-auto">
          <div className="relative min-h-[280px]">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={index}
                testimonial={testimonial}
                isActive={index === current}
              />
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-400 hover:text-primary-900 hover:border-primary-900 transition-all duration-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`transition-all duration-300 rounded-full ${
                    i === current
                      ? 'w-8 h-2 bg-primary-900'
                      : 'w-2 h-2 bg-neutral-300 hover:bg-neutral-400'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="w-10 h-10 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-400 hover:text-primary-900 hover:border-primary-900 transition-all duration-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-8 mt-16 pt-12 border-t border-neutral-200">
          {[
            { value: '4.9/5', label: 'Average Rating', sub: 'from 2,400+ reviews' },
            { value: '98%', label: 'Would Recommend', sub: 'to a friend' },
            { value: '15K+', label: 'Happy Customers', sub: 'worldwide' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl font-bold text-neutral-900">{stat.value}</div>
              <div className="text-sm font-medium text-neutral-700">{stat.label}</div>
              <div className="text-xs text-neutral-400">{stat.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
