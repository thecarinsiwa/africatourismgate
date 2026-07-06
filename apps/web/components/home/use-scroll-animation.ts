'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Hook that triggers an animation class when element scrolls into view.
 * Uses IntersectionObserver for performant scroll-based animations.
 * Supports elements mounted after async data loads (callback ref).
 */
export function useScrollAnimation(threshold = 0.15) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const ref = useCallback((node: HTMLElement | null) => {
    setElement(node);
  }, []);

  useEffect(() => {
    observerRef.current?.disconnect();
    observerRef.current = null;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold },
    );

    observer.observe(element);
    observerRef.current = observer;

    return () => observer.disconnect();
  }, [element, threshold]);

  return { ref, isVisible };
}
