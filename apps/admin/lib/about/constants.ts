import type { AboutPageSectionKey, AboutResourceType } from '@africatourismgate/types';

export const ABOUT_PAGE_SECTION_KEYS = [
  'who-we-are',
  'how-we-work',
  'governance',
  'responsibility',
] as const satisfies readonly AboutPageSectionKey[];

export const ABOUT_RESOURCE_TYPES = [
  'financial',
  'media',
] as const satisfies readonly AboutResourceType[];
