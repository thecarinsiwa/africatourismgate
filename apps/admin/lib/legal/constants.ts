import type { LegalPageSectionKey } from '@africatourismgate/types';

export const LEGAL_PAGE_SECTION_KEYS = [
  'terms-of-use',
  'privacy-policy',
] as const satisfies readonly LegalPageSectionKey[];
