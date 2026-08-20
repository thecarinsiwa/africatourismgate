import type { CommonErrorMessages } from '../common-api-errors';

export type ErrorTranslator = (
  key: string,
  values?: Record<string, string | number>,
) => string;

export function buildCommonErrorMessages(t: ErrorTranslator): CommonErrorMessages {
  return {
    network: t('network'),
    forbidden: t('forbidden'),
    generic: t('generic'),
    apiStatus: (status) => t('apiStatus', { status }),
    sessionExpired: t('sessionExpired'),
    sessionExpiredContinue: t('sessionExpiredContinue'),
    accessDenied: t('accessDenied'),
  };
}

export type UsersErrorMessages = CommonErrorMessages & {
  emailConflict: string;
};

export function buildUsersErrorMessages(
  tCommon: ErrorTranslator,
  t: ErrorTranslator,
): UsersErrorMessages {
  return {
    ...buildCommonErrorMessages(tCommon),
    emailConflict: t('emailConflict'),
  };
}

export type BookingsErrorMessages = CommonErrorMessages & {
  forbiddenRead: string;
};

export function buildBookingsErrorMessages(
  tCommon: ErrorTranslator,
  t: ErrorTranslator,
): BookingsErrorMessages {
  return {
    ...buildCommonErrorMessages(tCommon),
    forbiddenRead: t('forbidden'),
  };
}

export type HebergementsErrorMessages = CommonErrorMessages & {
  slugConflict: string;
  codeConflict: string;
  availabilityConflict: string;
  resourceConflict: string;
};

export function buildHebergementsErrorMessages(
  tCommon: ErrorTranslator,
  t: ErrorTranslator,
): HebergementsErrorMessages {
  return {
    ...buildCommonErrorMessages(tCommon),
    slugConflict: t('slugConflict'),
    codeConflict: t('codeConflict'),
    availabilityConflict: t('availabilityConflict'),
    resourceConflict: tCommon('conflict'),
  };
}

export type OrganizationsErrorMessages = CommonErrorMessages & {
  slugConflict: string;
};

export function buildOrganizationsErrorMessages(
  tCommon: ErrorTranslator,
  t: ErrorTranslator,
): OrganizationsErrorMessages {
  return {
    ...buildCommonErrorMessages(tCommon),
    slugConflict: t('slugConflict'),
  };
}

export type DestinationsErrorMessages = CommonErrorMessages & {
  slugConflict: string;
};

export function buildDestinationsErrorMessages(
  tCommon: ErrorTranslator,
  t: ErrorTranslator,
): DestinationsErrorMessages {
  return {
    ...buildCommonErrorMessages(tCommon),
    slugConflict: t('slugConflict'),
  };
}

export type TourGuidesErrorMessages = CommonErrorMessages & {
  userConflict: string;
};

export function buildTourGuidesErrorMessages(
  tCommon: ErrorTranslator,
  t: ErrorTranslator,
): TourGuidesErrorMessages {
  return {
    ...buildCommonErrorMessages(tCommon),
    userConflict: t('userConflict'),
  };
}

export type EmployeesErrorMessages = CommonErrorMessages & {
  profileConflict: string;
};

export function buildEmployeesErrorMessages(
  tCommon: ErrorTranslator,
  t: ErrorTranslator,
): EmployeesErrorMessages {
  return {
    ...buildCommonErrorMessages(tCommon),
    profileConflict: t('profileConflict'),
  };
}

export type RbacErrorMessages = CommonErrorMessages & {
  forbiddenDetail: string;
  assignmentConflict: string;
};

export function buildRbacErrorMessages(
  tCommon: ErrorTranslator,
  t: ErrorTranslator,
): RbacErrorMessages {
  return {
    ...buildCommonErrorMessages(tCommon),
    forbiddenDetail: t('forbidden'),
    assignmentConflict: t('assignmentConflict'),
  };
}

export type VolsErrorMessages = CommonErrorMessages & {
  resourceConflict: string;
};

export function buildVolsErrorMessages(
  tCommon: ErrorTranslator,
  t: ErrorTranslator,
): VolsErrorMessages {
  return {
    ...buildCommonErrorMessages(tCommon),
    resourceConflict: t('conflict'),
  };
}

export type CroisieresErrorMessages = CommonErrorMessages & {
  resourceConflict: string;
};

export function buildCroisieresErrorMessages(
  tCommon: ErrorTranslator,
  t: ErrorTranslator,
): CroisieresErrorMessages {
  return {
    ...buildCommonErrorMessages(tCommon),
    resourceConflict: t('conflict'),
  };
}

export type ReviewsErrorMessages = CommonErrorMessages & {
  forbiddenDetail: string;
  notFound: string;
};

export function buildReviewsErrorMessages(
  tCommon: ErrorTranslator,
  t: ErrorTranslator,
): ReviewsErrorMessages {
  return {
    ...buildCommonErrorMessages(tCommon),
    forbiddenDetail: t('forbidden'),
    notFound: t('notFound'),
  };
}

export type SupportTicketsErrorMessages = CommonErrorMessages & {
  forbiddenDetail: string;
  notFound: string;
};

export function buildSupportTicketsErrorMessages(
  tCommon: ErrorTranslator,
  t: ErrorTranslator,
): SupportTicketsErrorMessages {
  return {
    ...buildCommonErrorMessages(tCommon),
    forbiddenDetail: t('forbidden'),
    notFound: t('notFound'),
  };
}

export type PromoCodesErrorMessages = CommonErrorMessages & {
  forbiddenDetail: string;
  codeConflict: string;
};

export function buildPromoCodesErrorMessages(
  tCommon: ErrorTranslator,
  t: ErrorTranslator,
): PromoCodesErrorMessages {
  return {
    ...buildCommonErrorMessages(tCommon),
    forbiddenDetail: t('forbidden'),
    codeConflict: t('codeConflict'),
  };
}

export type PromotionsErrorMessages = CommonErrorMessages & {
  forbiddenDetail: string;
};

export function buildPromotionsErrorMessages(
  tCommon: ErrorTranslator,
  t: ErrorTranslator,
): PromotionsErrorMessages {
  return {
    ...buildCommonErrorMessages(tCommon),
    forbiddenDetail: t('forbidden'),
  };
}

export type BlogErrorMessages = CommonErrorMessages & {
  forbiddenDetail: string;
  slugConflict: string;
};

export function buildBlogErrorMessages(
  tCommon: ErrorTranslator,
  t: ErrorTranslator,
): BlogErrorMessages {
  return {
    ...buildCommonErrorMessages(tCommon),
    forbiddenDetail: t('forbidden'),
    slugConflict: t('slugConflict'),
  };
}

export type AboutErrorMessages = CommonErrorMessages & {
  forbiddenDetail: string;
  sectionLocaleConflict: string;
};

export function buildAboutErrorMessages(
  tCommon: ErrorTranslator,
  t: ErrorTranslator,
): AboutErrorMessages {
  return {
    ...buildCommonErrorMessages(tCommon),
    forbiddenDetail: t('forbidden'),
    sectionLocaleConflict: t('sectionLocaleConflict'),
  };
}

export type GapErrorMessages = CommonErrorMessages & {
  forbiddenDetail: string;
  sectionLocaleConflict: string;
};

export function buildGapErrorMessages(
  tCommon: ErrorTranslator,
  t: ErrorTranslator,
): GapErrorMessages {
  return {
    ...buildCommonErrorMessages(tCommon),
    forbiddenDetail: t('forbidden'),
    sectionLocaleConflict: t('sectionLocaleConflict'),
  };
}

export type LoyaltyAccountsErrorMessages = CommonErrorMessages & {
  forbiddenDetail: string;
  notFound: string;
};

export function buildLoyaltyAccountsErrorMessages(
  tCommon: ErrorTranslator,
  t: ErrorTranslator,
): LoyaltyAccountsErrorMessages {
  return {
    ...buildCommonErrorMessages(tCommon),
    forbiddenDetail: t('forbidden'),
    notFound: t('notFound'),
  };
}

export type DashboardKpiErrorMessages = CommonErrorMessages & {
  forbiddenDetail: string;
  loadFailed: string;
};

export function buildDashboardKpiErrorMessages(
  tCommon: ErrorTranslator,
  t: ErrorTranslator,
): DashboardKpiErrorMessages {
  return {
    ...buildCommonErrorMessages(tCommon),
    forbiddenDetail: t('forbidden'),
    loadFailed: t('loadFailed'),
  };
}

export type ModuleErrorMessages = {
  users: UsersErrorMessages;
  bookings: BookingsErrorMessages;
  hebergements: HebergementsErrorMessages;
  organizations: OrganizationsErrorMessages;
  destinations: DestinationsErrorMessages;
  tourGuides: TourGuidesErrorMessages;
  employees: EmployeesErrorMessages;
  departments: CommonErrorMessages;
  rbac: RbacErrorMessages;
  vols: VolsErrorMessages;
  croisieres: CroisieresErrorMessages;
  reviews: ReviewsErrorMessages;
  supportTickets: SupportTicketsErrorMessages;
  promoCodes: PromoCodesErrorMessages;
  promotions: PromotionsErrorMessages;
  blog: BlogErrorMessages;
  about: AboutErrorMessages;
  gap: GapErrorMessages;
  loyaltyAccounts: LoyaltyAccountsErrorMessages;
  dashboardKpi: DashboardKpiErrorMessages;
  activities: CommonErrorMessages;
  locations: CommonErrorMessages;
  packages: CommonErrorMessages;
  payments: CommonErrorMessages;
  organizationSettings: CommonErrorMessages;
};

export function buildModuleErrorMessages(translators: {
  common: ErrorTranslator;
  users: ErrorTranslator;
  bookings: ErrorTranslator;
  hebergements: ErrorTranslator;
  organizations: ErrorTranslator;
  destinations: ErrorTranslator;
  tourGuides: ErrorTranslator;
  employees: ErrorTranslator;
  rbac: ErrorTranslator;
  vols: ErrorTranslator;
  croisieres: ErrorTranslator;
  reviews: ErrorTranslator;
  supportTickets: ErrorTranslator;
  promoCodes: ErrorTranslator;
  promotions: ErrorTranslator;
  blog: ErrorTranslator;
  about: ErrorTranslator;
  gap: ErrorTranslator;
  loyaltyAccounts: ErrorTranslator;
  dashboard: ErrorTranslator;
}): ModuleErrorMessages {
  const { common: tCommon } = translators;

  return {
    users: buildUsersErrorMessages(tCommon, translators.users),
    bookings: buildBookingsErrorMessages(tCommon, translators.bookings),
    hebergements: buildHebergementsErrorMessages(tCommon, translators.hebergements),
    organizations: buildOrganizationsErrorMessages(tCommon, translators.organizations),
    destinations: buildDestinationsErrorMessages(tCommon, translators.destinations),
    tourGuides: buildTourGuidesErrorMessages(tCommon, translators.tourGuides),
    employees: buildEmployeesErrorMessages(tCommon, translators.employees),
    departments: buildCommonErrorMessages(tCommon),
    rbac: buildRbacErrorMessages(tCommon, translators.rbac),
    vols: buildVolsErrorMessages(tCommon, translators.vols),
    croisieres: buildCroisieresErrorMessages(tCommon, translators.croisieres),
    reviews: buildReviewsErrorMessages(tCommon, translators.reviews),
    supportTickets: buildSupportTicketsErrorMessages(tCommon, translators.supportTickets),
    promoCodes: buildPromoCodesErrorMessages(tCommon, translators.promoCodes),
    promotions: buildPromotionsErrorMessages(tCommon, translators.promotions),
    blog: buildBlogErrorMessages(tCommon, translators.blog),
    about: buildAboutErrorMessages(tCommon, translators.about),
    gap: buildGapErrorMessages(tCommon, translators.gap),
    loyaltyAccounts: buildLoyaltyAccountsErrorMessages(tCommon, translators.loyaltyAccounts),
    dashboardKpi: buildDashboardKpiErrorMessages(tCommon, translators.dashboard),
    activities: buildCommonErrorMessages(tCommon),
    locations: buildCommonErrorMessages(tCommon),
    packages: buildCommonErrorMessages(tCommon),
    payments: buildCommonErrorMessages(tCommon),
    organizationSettings: buildCommonErrorMessages(tCommon),
  };
}
