import type { AppLocale } from '../../i18n/routing';

/** Sub-namespaces merged into `messages.modules`. */
export const ADMIN_MODULE_NAMES = [
  'common',
  'users',
  'employees',
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
  'blog',
  'about',
  'support',
  'loyalty',
  'promotions',
  'promoCodes',
  'settings',
  'tourGuides',
  'gap',
  'heroSlides',
] as const;

export type AdminModuleName = (typeof ADMIN_MODULE_NAMES)[number];

export async function loadAdminMessages(locale: AppLocale) {
  const [
    common,
    language,
    theme,
    auth,
    dashboard,
    nav,
    errors,
    placeholderSections,
    pages,
    ...moduleImports
  ] = await Promise.all([
    import(`../../messages/${locale}/common.json`),
    import(`../../messages/${locale}/language.json`),
    import(`../../messages/${locale}/theme.json`),
    import(`../../messages/${locale}/auth.json`),
    import(`../../messages/${locale}/dashboard.json`),
    import(`../../messages/${locale}/nav.json`),
    import(`../../messages/${locale}/errors.json`),
    import(`../../messages/${locale}/placeholderSections.json`),
    import(`../../messages/${locale}/pages.json`),
    ...ADMIN_MODULE_NAMES.map((name) => import(`../../messages/${locale}/modules/${name}.json`)),
  ]);

  const modules = Object.fromEntries(
    ADMIN_MODULE_NAMES.map((name, index) => [name, moduleImports[index].default]),
  ) as Record<AdminModuleName, (typeof moduleImports)[number]['default']>;

  return {
    common: common.default,
    language: language.default,
    theme: theme.default,
    auth: auth.default,
    dashboard: dashboard.default,
    nav: nav.default,
    errors: errors.default,
    placeholderSections: placeholderSections.default,
    pages: pages.default,
    modules,
  };
}
