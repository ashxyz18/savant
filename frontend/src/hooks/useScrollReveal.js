'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook for scroll-triggered reveal animations.
 * Uses IntersectionObserver to add 'revealed' class when element enters viewport.
 *
 * @param {Object} options
 * @param {number} options.threshold - Visibility percentage to trigger (0-1)
 * @param {string} options.rootMargin - Margin around root element
 * @param {boolean} options.triggerOnce - Only trigger animation once
 * @returns {[React.RefObject, boolean]} - [ref to attach, isRevealed state]
 */
export function useScrollReveal(options = {}) {
  const {
    threshold = 0.15,
    rootMargin = '0px 0px -50px 0px',
    triggerOnce = true,
  } = options;

  const ref = useRef(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);
          element.classList.add('revealed');
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsRevealed(false);
          element.classList.remove('revealed');
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, triggerOnce]);

  return [ref, isRevealed];
}

/**
 * Hook to animate a number counting up when element is revealed.
 *
 * @param {number} end - Target number
 * @param {number} duration - Animation duration in ms
 * @param {boolean} isActive - Whether to start counting
 * @returns {number} - Current animated value
 */
export function useCountUp(end, duration = 1500, isActive = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    let startTime = null;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [end, duration, isActive]);

  return count;
}

/**
 * Hook to detect if user has scrolled past a threshold.
 *
 * @param {number} threshold - Scroll position in px
 * @returns {boolean} - Whether scrolled past threshold
 */
export function useScrollPosition(threshold = 300) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > threshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return scrolled;
}
