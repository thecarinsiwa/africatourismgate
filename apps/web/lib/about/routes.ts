import type { AboutPageSectionKey, AboutResourceType } from '@africatourismgate/types';

export const ABOUT_BASE_PATH = '/about';

export const ABOUT_PATHS = {
  whoWeAre: '/about/who-we-are',
  history: '/about/our-history',
  team: '/about/team',
  howWeWork: '/about/how-we-work',
  governance: '/about/governance',
  reports: '/about/reports',
  responsibility: '/about/responsibility',
  media: '/about/media-resources',
  contact: '/about/contact',
} as const;

export type AboutNavLabelKey =
  | 'whoWeAre'
  | 'history'
  | 'team'
  | 'howWeWork'
  | 'governance'
  | 'reports'
  | 'responsibility'
  | 'media'
  | 'contact';

export type AboutNavItem = {
  href: string;
  labelKey: AboutNavLabelKey;
  sectionKey?: AboutPageSectionKey;
  resourceType?: AboutResourceType;
};

export const ABOUT_NAV_ITEMS: AboutNavItem[] = [
  { href: ABOUT_PATHS.whoWeAre, labelKey: 'whoWeAre', sectionKey: 'who-we-are' },
  { href: ABOUT_PATHS.history, labelKey: 'history' },
  { href: ABOUT_PATHS.team, labelKey: 'team' },
  { href: ABOUT_PATHS.howWeWork, labelKey: 'howWeWork', sectionKey: 'how-we-work' },
  { href: ABOUT_PATHS.governance, labelKey: 'governance', sectionKey: 'governance' },
  { href: ABOUT_PATHS.reports, labelKey: 'reports', resourceType: 'financial' },
  {
    href: ABOUT_PATHS.responsibility,
    labelKey: 'responsibility',
    sectionKey: 'responsibility',
  },
  { href: ABOUT_PATHS.media, labelKey: 'media', resourceType: 'media' },
  { href: ABOUT_PATHS.contact, labelKey: 'contact' },
];

export function normalizeAboutPathname(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export function findAboutNavItem(pathname: string): AboutNavItem | undefined {
  const normalized = normalizeAboutPathname(pathname);
  return ABOUT_NAV_ITEMS.find((item) => item.href === normalized);
}
