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
  employees: EmployeesErrorMessages;
  rbac: RbacErrorMessages;
  vols: VolsErrorMessages;
  croisieres: CroisieresErrorMessages;
  reviews: ReviewsErrorMessages;
  supportTickets: SupportTicketsErrorMessages;
  promoCodes: PromoCodesErrorMessages;
  promotions: PromotionsErrorMessages;
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
  employees: ErrorTranslator;
  rbac: ErrorTranslator;
  vols: ErrorTranslator;
  croisieres: ErrorTranslator;
  reviews: ErrorTranslator;
  supportTickets: ErrorTranslator;
  promoCodes: ErrorTranslator;
  promotions: ErrorTranslator;
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
    employees: buildEmployeesErrorMessages(tCommon, translators.employees),
    rbac: buildRbacErrorMessages(tCommon, translators.rbac),
    vols: buildVolsErrorMessages(tCommon, translators.vols),
    croisieres: buildCroisieresErrorMessages(tCommon, translators.croisieres),
    reviews: buildReviewsErrorMessages(tCommon, translators.reviews),
    supportTickets: buildSupportTicketsErrorMessages(tCommon, translators.supportTickets),
    promoCodes: buildPromoCodesErrorMessages(tCommon, translators.promoCodes),
    promotions: buildPromotionsErrorMessages(tCommon, translators.promotions),
    loyaltyAccounts: buildLoyaltyAccountsErrorMessages(tCommon, translators.loyaltyAccounts),
    dashboardKpi: buildDashboardKpiErrorMessages(tCommon, translators.dashboard),
    activities: buildCommonErrorMessages(tCommon),
    locations: buildCommonErrorMessages(tCommon),
    packages: buildCommonErrorMessages(tCommon),
    payments: buildCommonErrorMessages(tCommon),
    organizationSettings: buildCommonErrorMessages(tCommon),
  };
}
