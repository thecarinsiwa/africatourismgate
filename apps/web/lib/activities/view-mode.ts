export const ACTIVITIES_VIEW_MODES = ['grid', 'list', 'table'] as const;

export type ActivitiesViewMode = (typeof ACTIVITIES_VIEW_MODES)[number];

export const ACTIVITIES_VIEW_MODE_STORAGE_KEY = 'activities.viewMode';

/** Preserve the current horizontal-card experience. */
export const DEFAULT_ACTIVITIES_VIEW_MODE: ActivitiesViewMode = 'list';

export function isActivitiesViewMode(value: unknown): value is ActivitiesViewMode {
  return (
    typeof value === 'string' &&
    (ACTIVITIES_VIEW_MODES as readonly string[]).includes(value)
  );
}
