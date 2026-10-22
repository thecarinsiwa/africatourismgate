'use client';

import { createContext, useContext, type ReactNode } from 'react';
import {
  DEFAULT_PUBLIC_ANNOUNCEMENT_BANNER,
  type PublicAnnouncementBanner,
} from '@africatourismgate/types/organization-settings';

const AnnouncementBannerContext = createContext<PublicAnnouncementBanner>(
  DEFAULT_PUBLIC_ANNOUNCEMENT_BANNER,
);

export function AnnouncementBannerProvider({
  banner,
  children,
}: {
  banner: PublicAnnouncementBanner;
  children: ReactNode;
}) {
  return (
    <AnnouncementBannerContext.Provider value={banner}>
      {children}
    </AnnouncementBannerContext.Provider>
  );
}

export function useAnnouncementBanner(): PublicAnnouncementBanner {
  return useContext(AnnouncementBannerContext);
}
