'use client';

import { useCallback, useRef } from 'react';

const SWIPE_THRESHOLD_PX = 40;

type UseTouchSwipeOptions = {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  enabled?: boolean;
};

/** M2 — détection swipe horizontal sur éléments tactiles. */
export function useTouchSwipe({
  onSwipeLeft,
  onSwipeRight,
  enabled = true,
}: UseTouchSwipeOptions) {
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const didSwipeRef = useRef(false);

  const onTouchStart = useCallback(
    (event: React.TouchEvent) => {
      if (!enabled) return;
      const touch = event.changedTouches[0];
      if (!touch) return;
      startRef.current = { x: touch.clientX, y: touch.clientY };
      didSwipeRef.current = false;
    },
    [enabled],
  );

  const onTouchEnd = useCallback(
    (event: React.TouchEvent) => {
      if (!enabled || !startRef.current) return;
      const touch = event.changedTouches[0];
      if (!touch) return;

      const deltaX = touch.clientX - startRef.current.x;
      const deltaY = touch.clientY - startRef.current.y;
      startRef.current = null;

      if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX || Math.abs(deltaX) < Math.abs(deltaY)) {
        return;
      }

      didSwipeRef.current = true;
      if (deltaX < 0) {
        onSwipeLeft?.();
      } else {
        onSwipeRight?.();
      }
    },
    [enabled, onSwipeLeft, onSwipeRight],
  );

  const consumeSwipe = useCallback(() => {
    const swiped = didSwipeRef.current;
    didSwipeRef.current = false;
    return swiped;
  }, []);

  return { onTouchStart, onTouchEnd, consumeSwipe };
}
