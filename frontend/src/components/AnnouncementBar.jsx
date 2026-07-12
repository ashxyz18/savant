'use client';

import React, { useState, useEffect } from 'react';
import { X, Truck, Gift, Percent } from 'lucide-react';

const announcements = [
  { icon: <Truck className="w-3.5 h-3.5" />, text: 'Free Shipping on Orders Over $100', highlight: 'Shop Now' },
  { icon: <Gift className="w-3.5 h-3.5" />, text: 'New Members Get 15% Off First Order', highlight: 'Sign Up' },
  { icon: <Percent className="w-3.5 h-3.5" />, text: 'Spring Sale — Up to 40% Off Select Items', highlight: 'View Deals' },
];

const AnnouncementBar = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (isDismissed) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isDismissed]);

  if (isDismissed) return null;

  const current = announcements[currentIndex];

  return (
    <div className="bg-primary-900 text-white relative overflow-hidden">
      <div className="container">
        <div className="flex items-center justify-center py-2.5 gap-3">
          <div className="flex items-center gap-2 text-primary-200">
            {current.icon}
          </div>
          <p className="text-xs sm:text-sm font-medium tracking-wide">
            {current.text}
          </p>
          <a
            href="#"
            className="text-xs font-semibold underline underline-offset-2 hover:text-primary-200 transition-colors duration-200"
          >
            {current.highlight}
          </a>

          {/* Dot indicators */}
          <div className="hidden sm:flex items-center gap-1.5 ml-3">
            {announcements.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  i === currentIndex ? 'bg-white w-4' : 'bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>

          {/* Dismiss */}
          <button
            onClick={() => setIsDismissed(true)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/50 hover:text-white transition-colors duration-200"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBar;
