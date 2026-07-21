'use client';

import React from 'react';
import { CreditCard, RefreshCw, Shield, Headphones, Gift, ArrowRight, Sparkles } from 'lucide-react';
import { useScrollReveal, useCountUp } from '../hooks/useScrollReveal';

const FeatureCard = ({ feature, index }) => {
  const [ref, isRevealed] = useScrollReveal({ threshold: 0.2 });

  return (
    <div
      ref={ref}
      className={`reveal stagger-${index + 1} group p-8 rounded-xl border border-neutral-200 hover:border-primary-900 hover:shadow-glow transition-all duration-500 cursor-default ${
        isRevealed ? 'revealed' : ''
      }`}
    >
      <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-900 mb-6 group-hover:bg-primary-900 group-hover:text-white group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
        {feature.icon}
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 mb-2 group-hover:text-primary-900 transition-colors duration-300">
        {feature.title}
      </h3>
      <p className="text-sm text-neutral-500 leading-relaxed">{feature.description}</p>
      <div className="mt-4 flex items-center gap-1 text-xs font-medium text-primary-900 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
        Learn more <ArrowRight className="w-3 h-3" />
      </div>
    </div>
  );
};

const StatItem = ({ stat, index }) => {
  const [ref, isRevealed] = useScrollReveal({ threshold: 0.3 });

  // Parse numeric value for counter animation
  const numericValue = parseInt(stat.value.replace(/[^0-9]/g, ''));
  const suffix = stat.value.replace(/[0-9]/g, '');
  const count = useCountUp(numericValue, 2000, isRevealed);

  return (
    <div
      ref={ref}
      className={`reveal stagger-${index + 1} bg-white p-8 text-center group cursor-default transition-all duration-300 hover:bg-primary-50/50 ${
        isRevealed ? 'revealed' : ''
      }`}
    >
      <div className="text-3xl md:text-4xl font-bold text-neutral-900 mb-1 group-hover:text-primary-900 transition-colors duration-300">
        {isRevealed ? count : 0}{suffix}
      </div>
      <div className="text-sm text-neutral-500 group-hover:text-primary-700 transition-colors duration-300">{stat.label}</div>
    </div>
  );
};

const Features = () => {
  const [headerRef, headerRevealed] = useScrollReveal({ threshold: 0.2 });
  const [ctaRef, ctaRevealed] = useScrollReveal({ threshold: 0.2 });

  const features = [
    {
      icon: <CreditCard className="w-5 h-5" />,
      title: 'Flexible Payment',
      description: 'Split payment into 3 installments with 0% interest. No hidden fees.',
    },
    {
      icon: <RefreshCw className="w-5 h-5" />,
      title: 'Easy Returns',
      description: '30-day return policy. Easy returns and exchanges for any reason.',
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: 'Quality Guarantee',
      description: 'All products come with a 2-year warranty against manufacturing defects.',
    },
    {
      icon: <Headphones className="w-5 h-5" />,
      title: '24/7 Support',
      description: 'Our customer service team is available round the clock to assist you.',
    },
    {
      icon: <Gift className="w-5 h-5" />,
      title: 'Loyalty Rewards',
      description: 'Earn points on every purchase. Redeem for discounts and exclusive offers.',
    },
  ];

  const stats = [
    { value: '10K+', label: 'Happy Customers' },
    { value: '4.9', label: 'Average Rating' },
    { value: '50+', label: 'Countries Served' },
    { value: '24h', label: 'Support Response' },
  ];

  return (
    <section className="pt-20 pb-8 bg-white relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-100/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="container relative">
        {/* Header */}
        <div
          ref={headerRef}
          className={`reveal text-center max-w-2xl mx-auto mb-16 ${headerRevealed ? 'revealed' : ''}`}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-900 rounded-full text-xs font-semibold tracking-widest uppercase mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Premium Benefits
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            Why Choose <span className="text-gradient-primary">SAVANT</span>
          </h2>
          <p className="text-neutral-500">
            We're committed to providing the best shopping experience with premium quality,
            exceptional service, and customer-centric policies.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-neutral-200 rounded-xl overflow-hidden mb-16">
          {stats.map((stat, index) => (
            <StatItem key={index} stat={stat} index={index} />
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>

        {/* CTA Section */}
        <div
          ref={ctaRef}
          className={`reveal mt-20 rounded-2xl bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 p-12 md:p-16 text-center relative overflow-hidden ${
            ctaRevealed ? 'revealed' : ''
          }`}
        >
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white/5 rounded-full blur-xl animate-float" />
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/5 rounded-full blur-xl animate-float-slow" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/[0.02] rounded-full blur-2xl" />
          </div>

          <div className="relative">
            <h3 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
              Join Our Premium Membership
            </h3>
            <p className="text-primary-200 mb-10 max-w-xl mx-auto">
               Get exclusive access to early sales, member-only discounts, and personalized style recommendations.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="/signup"
                className="group px-8 py-4 bg-white text-primary-900 rounded-lg font-semibold hover:bg-primary-50 transition-all duration-300 hover:shadow-glow flex items-center gap-2"
              >
                Sign Up Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </a>
              <a
                href="#"
                className="px-8 py-4 border border-primary-400/30 text-white rounded-lg font-semibold hover:border-white hover:bg-white/10 transition-all duration-300"
              >
                Learn More
              </a>
            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-primary-300">
              <span className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-success-400 rounded-full" />
                No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-success-400 rounded-full" />
                Cancel anytime
              </span>
              <span className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-success-400 rounded-full" />
                First month free
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
