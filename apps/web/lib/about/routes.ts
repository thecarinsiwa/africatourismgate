import type { AboutPageSectionKey, AboutResourceType } from '@africatourismgate/types';

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
  { href: '/a-propos/qui-nous-sommes', labelKey: 'whoWeAre', sectionKey: 'who-we-are' },
  { href: '/a-propos/notre-histoire', labelKey: 'history' },
  { href: '/a-propos/equipe', labelKey: 'team' },
  {
    href: '/a-propos/comment-nous-travaillons',
    labelKey: 'howWeWork',
    sectionKey: 'how-we-work',
  },
  { href: '/a-propos/gouvernance', labelKey: 'governance', sectionKey: 'governance' },
  {
    href: '/a-propos/rapports-finances',
    labelKey: 'reports',
    resourceType: 'financial',
  },
  {
    href: '/a-propos/responsabilite',
    labelKey: 'responsibility',
    sectionKey: 'responsibility',
  },
  { href: '/a-propos/medias-ressources', labelKey: 'media', resourceType: 'media' },
  { href: '/a-propos/contact', labelKey: 'contact' },
];

export function findAboutNavItem(pathname: string): AboutNavItem | undefined {
  return ABOUT_NAV_ITEMS.find((item) => pathname === item.href);
}
