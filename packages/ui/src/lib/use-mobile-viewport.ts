'use client';

import { useEffect, useState } from 'react';

export const MOBILE_VIEWPORT_QUERY = '(max-width: 767.98px)';

export function useMobileViewport(query = MOBILE_VIEWPORT_QUERY): boolean {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, [query]);

  return isMobile;
}
