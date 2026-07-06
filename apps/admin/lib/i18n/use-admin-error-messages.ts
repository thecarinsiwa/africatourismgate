'use client';

import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { getActivitiesErrorMessage } from '../activities-errors';
import { getAboutErrorMessage } from '../about-errors';
import { getBlogErrorMessage } from '../blog-errors';
import { getBookingsErrorMessage } from '../bookings-errors';
import { getCroisieresErrorMessage } from '../croisieres-errors';
import { getDashboardKpiErrorMessage } from '../dashboard-api-errors';
import { getDestinationsErrorMessage } from '../destinations-errors';
import { getEmployeesErrorMessage } from '../employees-errors';
import { getHebergementsErrorMessage } from '../hebergements-errors';
import { getLocationsErrorMessage } from '../locations-errors';
import { getLoyaltyAccountsErrorMessage } from '../loyalty-accounts-errors';
import { getOrganizationSettingsErrorMessage } from '../organization-settings-errors';
import { getOrganizationsErrorMessage } from '../organizations-errors';
import { getPackagesErrorMessage } from '../packages-errors';
import { getPaymentsErrorMessage } from '../payments-errors';
import { getPromoCodesErrorMessage } from '../promo-codes-errors';
import { getPromotionsErrorMessage } from '../promotions-errors';
import { getRbacErrorMessage } from '../rbac-errors';
import { getReviewsErrorMessage } from '../reviews-errors';
import { getSupportTicketsErrorMessage } from '../support-tickets-errors';
import { getTourGuidesErrorMessage } from '../tour-guides-errors';
import { getUsersErrorMessage } from '../users-errors';
import { getVolsErrorMessage } from '../vols-errors';
import { buildModuleErrorMessages } from './admin-error-messages';

export function useAdminErrorMessages() {
  const tCommon = useTranslations('common.errors');
  const tUsers = useTranslations('errors.users');
  const tBookings = useTranslations('errors.bookings');
  const tHebergements = useTranslations('errors.hebergements');
  const tOrganizations = useTranslations('errors.organizations');
  const tDestinations = useTranslations('errors.destinations');
  const tTourGuides = useTranslations('errors.tourGuides');
  const tEmployees = useTranslations('errors.employees');
  const tRbac = useTranslations('errors.rbac');
  const tVols = useTranslations('errors.vols');
  const tCroisieres = useTranslations('errors.croisieres');
  const tReviews = useTranslations('errors.reviews');
  const tSupportTickets = useTranslations('errors.supportTickets');
  const tPromoCodes = useTranslations('errors.promoCodes');
  const tPromotions = useTranslations('errors.promotions');
  const tBlog = useTranslations('errors.blog');
  const tAbout = useTranslations('errors.about');
  const tLoyaltyAccounts = useTranslations('errors.loyaltyAccounts');
  const tDashboard = useTranslations('errors.dashboard');

  const messages = useMemo(
    () =>
      buildModuleErrorMessages({
        common: (key, values) => tCommon(key, values),
        users: (key) => tUsers(key),
        bookings: (key) => tBookings(key),
        hebergements: (key) => tHebergements(key),
        organizations: (key) => tOrganizations(key),
        destinations: (key) => tDestinations(key),
        tourGuides: (key) => tTourGuides(key),
        employees: (key) => tEmployees(key),
        rbac: (key) => tRbac(key),
        vols: (key) => tVols(key),
        croisieres: (key) => tCroisieres(key),
        reviews: (key) => tReviews(key),
        supportTickets: (key) => tSupportTickets(key),
        promoCodes: (key) => tPromoCodes(key),
        promotions: (key) => tPromotions(key),
        blog: (key) => tBlog(key),
        about: (key) => tAbout(key),
        loyaltyAccounts: (key) => tLoyaltyAccounts(key),
        dashboard: (key) => tDashboard(key),
      }),
    [
      tCommon,
      tUsers,
      tBookings,
      tHebergements,
      tOrganizations,
      tDestinations,
      tTourGuides,
      tEmployees,
      tRbac,
      tVols,
      tCroisieres,
      tReviews,
      tSupportTickets,
      tPromoCodes,
      tPromotions,
      tBlog,
      tAbout,
      tLoyaltyAccounts,
      tDashboard,
    ],
  );

  return useMemo(
    () => ({
      users: (error: unknown) => getUsersErrorMessage(error, messages.users),
      bookings: (error: unknown) => getBookingsErrorMessage(error, messages.bookings),
      hebergements: (error: unknown) => getHebergementsErrorMessage(error, messages.hebergements),
      activities: (error: unknown) => getActivitiesErrorMessage(error, messages.activities),
      locations: (error: unknown) => getLocationsErrorMessage(error, messages.locations),
      packages: (error: unknown) => getPackagesErrorMessage(error, messages.packages),
      organizations: (error: unknown) => getOrganizationsErrorMessage(error, messages.organizations),
      destinations: (error: unknown) => getDestinationsErrorMessage(error, messages.destinations),
      tourGuides: (error: unknown) => getTourGuidesErrorMessage(error, messages.tourGuides),
      employees: (error: unknown) => getEmployeesErrorMessage(error, messages.employees),
      rbac: (error: unknown) => getRbacErrorMessage(error, messages.rbac),
      vols: (error: unknown) => getVolsErrorMessage(error, messages.vols),
      croisieres: (error: unknown) => getCroisieresErrorMessage(error, messages.croisieres),
      reviews: (error: unknown) => getReviewsErrorMessage(error, messages.reviews),
      supportTickets: (error: unknown) =>
        getSupportTicketsErrorMessage(error, messages.supportTickets),
      promoCodes: (error: unknown) => getPromoCodesErrorMessage(error, messages.promoCodes),
      promotions: (error: unknown) => getPromotionsErrorMessage(error, messages.promotions),
      blog: (error: unknown) => getBlogErrorMessage(error, messages.blog),
      about: (error: unknown) => getAboutErrorMessage(error, messages.about),
      loyaltyAccounts: (error: unknown) =>
        getLoyaltyAccountsErrorMessage(error, messages.loyaltyAccounts),
      payments: (error: unknown) => getPaymentsErrorMessage(error, messages.payments),
      organizationSettings: (error: unknown) =>
        getOrganizationSettingsErrorMessage(error, messages.organizationSettings),
      dashboardKpi: (error: unknown) => getDashboardKpiErrorMessage(error, messages.dashboardKpi),
    }),
    [messages],
  );
}
