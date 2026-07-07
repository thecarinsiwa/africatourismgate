import type {
  GapActivityIconKey,
  GapImpactStatColorKey,
  GapMediaItemType,
  GapPageSectionKey,
} from '@africatourismgate/types';

export const GAP_PAGE_SECTION_KEYS = [
  'about',
  'objectives',
  'unesco',
] as const satisfies readonly GapPageSectionKey[];

export const GAP_ACTIVITY_ICON_KEYS = [
  'school',
  'tree',
  'art',
  'park',
  'community',
] as const satisfies readonly GapActivityIconKey[];

export const GAP_COLOR_KEYS = [
  'primary',
  'secondary',
] as const satisfies readonly GapImpactStatColorKey[];

export const GAP_MEDIA_TYPES = [
  'image',
  'video',
] as const satisfies readonly GapMediaItemType[];
