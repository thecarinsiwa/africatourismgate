/** Shared layout for modular admin i18n messages (apps/admin/messages/{locale}/). */

export const ADMIN_LOCALES = ['fr', 'en', 'es'];

/** Top-level namespaces stored as {locale}/{name}.json */
export const ADMIN_SHELL_NAMESPACES = [
  'common',
  'language',
  'theme',
  'auth',
  'dashboard',
  'nav',
  'errors',
  'placeholderSections',
];

/** Sub-namespaces under modules.* → {locale}/modules/{name}.json */
export const ADMIN_MODULE_NAMES = [
  'common',
  'users',
  'organizations',
  'bookings',
  'payments',
  'properties',
  'flights',
  'locations',
  'cruises',
  'activities',
  'destinations',
  'packages',
  'rbac',
  'reviews',
  'support',
  'loyalty',
  'promotions',
  'promoCodes',
  'settings',
];
