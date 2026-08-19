'use client';

import type {
  ActivityDifficultyLevel,
  BookingItemType,
  BookingGuideRole,
  BookingStatus,
  EmployeeStatus,
  FlightClassName,
  LoyaltyTier,
  OrganizationStatus,
  PackageItemType,
  PaymentStatus,
  PromoCodeDiscountType,
  PropertyType,
  ReviewStatus,
  SupportTicketPriority,
  SupportTicketStatus,
  TourGuideStatus,
  TourGuideType,
  UserStatus,
  VehicleAvailabilityStatus,
} from '@africatourismgate/types';
import { useFormatter, useTranslations } from 'next-intl';
import { useCallback, useMemo } from 'react';
import { BOOKING_STATUSES } from '../booking-status';
import { FLIGHT_CLASS_NAMES } from '../flight-class-labels';
import { VEHICLE_AVAILABILITY_STATUSES } from '../vehicle-status-labels';
import { ACTIVITY_DIFFICULTY_LEVELS } from '../activity-difficulty';
import { PACKAGE_ITEM_TYPES } from '../package-item-type';
import type { RbacScopeDisplayLabels } from '../rbac-display';
import { REVIEW_STATUSES } from '../review-display';
import {
  SUPPORT_TICKET_PRIORITIES,
  SUPPORT_TICKET_STATUSES,
} from '../support-ticket-display';
import { LOYALTY_TIER_ORDER } from '../loyalty-tier-utils';
import { type PromoDiscountLabels, type PromoValidityLabels } from '../promo-validity';

export function useAccountStatusLabels() {
  const t = useTranslations('modules.common.accountStatus');
  return useMemo(
    (): Record<UserStatus | OrganizationStatus, string> => ({
      active: t('active'),
      suspended: t('suspended'),
      deleted: t('deleted'),
    }),
    [t],
  );
}

export function useEmployeeStatusLabels() {
  const t = useTranslations('modules.employees.status');
  return useMemo(
    (): Record<EmployeeStatus, string> => ({
      active: t('active'),
      on_leave: t('on_leave'),
      terminated: t('terminated'),
    }),
    [t],
  );
}

export function useBookingStatusLabels() {
  const t = useTranslations('modules.bookings.status');
  return useMemo(
    (): Record<BookingStatus, string> => ({
      draft: t('draft'),
      pending_approval: t('pending_approval'),
      pending_payment: t('pending_payment'),
      confirmed: t('confirmed'),
      cancelled: t('cancelled'),
      refunded: t('refunded'),
    }),
    [t],
  );
}

export function useBookingStatusFilterOptions() {
  const tAll = useTranslations('modules.common.filters');
  const statusLabels = useBookingStatusLabels();
  return useMemo(
    () => [
      { value: '', label: tAll('all') },
      ...BOOKING_STATUSES.map((status) => ({
        value: status,
        label: statusLabels[status],
      })),
    ],
    [statusLabels, tAll],
  );
}

export function useTourGuideTypeLabels() {
  const t = useTranslations('modules.tourGuides.type');
  return useMemo(
    (): Record<TourGuideType, string> => ({
      internal: t('internal'),
      external: t('external'),
    }),
    [t],
  );
}

export function useTourGuideStatusLabels() {
  const t = useTranslations('modules.tourGuides.status');
  return useMemo(
    (): Record<TourGuideStatus, string> => ({
      active: t('active'),
      inactive: t('inactive'),
    }),
    [t],
  );
}

export function useTourGuideTypeFilterOptions() {
  const tAll = useTranslations('modules.tourGuides.filters');
  const typeLabels = useTourGuideTypeLabels();
  return useMemo(
    () => [
      { value: '', label: tAll('all') },
      { value: 'internal', label: typeLabels.internal },
      { value: 'external', label: typeLabels.external },
    ],
    [typeLabels, tAll],
  );
}

export function useTourGuideStatusFilterOptions() {
  const tAll = useTranslations('modules.tourGuides.filters');
  const statusLabels = useTourGuideStatusLabels();
  return useMemo(
    () => [
      { value: '', label: tAll('all') },
      { value: 'active', label: statusLabels.active },
      { value: 'inactive', label: statusLabels.inactive },
    ],
    [statusLabels, tAll],
  );
}

export function useBookingGuideRoleLabels() {
  const t = useTranslations('modules.tourGuides.role');
  return useMemo(
    (): Record<BookingGuideRole, string> => ({
      primary: t('primary'),
      secondary: t('secondary'),
    }),
    [t],
  );
}

export function usePaymentStatusLabels() {
  const t = useTranslations('modules.payments.status');
  return useMemo(
    (): Record<PaymentStatus, string> => ({
      pending: t('pending'),
      succeeded: t('succeeded'),
      failed: t('failed'),
      refunded: t('refunded'),
    }),
    [t],
  );
}

export function useBookingItemTypeLabels() {
  const t = useTranslations('modules.bookings.itemTypes');
  return useMemo(
    (): Record<BookingItemType, string> => ({
      room: t('room'),
      flight_class: t('flight_class'),
      vehicle: t('vehicle'),
      cabin: t('cabin'),
      activity_schedule: t('activity_schedule'),
      package: t('package'),
    }),
    [t],
  );
}

export function useBookingItemTypeOptions() {
  const labels = useBookingItemTypeLabels();
  return useMemo(
    () =>
      (Object.entries(labels) as [BookingItemType, string][]).map(([value, label]) => ({
        value,
        label,
      })),
    [labels],
  );
}

export function useOrganizationLegalFormOptions() {
  const t = useTranslations('modules.organizations.legalForm');
  return useMemo(
    () => [
      { value: '', label: t('unspecified') },
      { value: 'SARL', label: t('SARL') },
      { value: 'SA', label: t('SA') },
      { value: 'SAS', label: t('SAS') },
      { value: 'Ets', label: t('Ets') },
      { value: 'SNC', label: t('SNC') },
      { value: 'ASBL', label: t('ASBL') },
    ],
    [t],
  );
}

export function usePaymentProviderLabels() {
  const t = useTranslations('modules.payments.providers');
  return useMemo(
    () => ({
      stripe: t('stripe'),
      cash: t('cash'),
    }),
    [t],
  );
}

export function useRefundTypeLabels() {
  const t = useTranslations('modules.payments.refundLabels');
  return useMemo(
    () => ({
      partial: t('partial'),
      full: t('full'),
      generic: t('generic'),
    }),
    [t],
  );
}

export function usePropertyTypeLabels() {
  const t = useTranslations('modules.properties.status.propertyType');
  return useMemo(
    (): Record<PropertyType, string> => ({
      hotel: t('hotel'),
      resort: t('resort'),
      apartment: t('apartment'),
      villa: t('villa'),
      hostel: t('hostel'),
      other: t('other'),
    }),
    [t],
  );
}

export function usePropertyTypeOptions() {
  const labels = usePropertyTypeLabels();
  return useMemo(
    () =>
      (Object.entries(labels) as [PropertyType, string][]).map(([value, label]) => ({
        value,
        label,
      })),
    [labels],
  );
}

export function useFlightClassLabels() {
  const t = useTranslations('modules.common.flightClass');
  return useMemo(
    (): Record<FlightClassName, string> => ({
      economy: t('economy'),
      premium_economy: t('premium_economy'),
      business: t('business'),
      first: t('first'),
    }),
    [t],
  );
}

export function useFlightClassOptions() {
  const labels = useFlightClassLabels();
  return useMemo(
    () => FLIGHT_CLASS_NAMES.map((value) => ({ value, label: labels[value] })),
    [labels],
  );
}

export function useVehicleAvailabilityStatusLabels() {
  const t = useTranslations('modules.common.vehicleAvailabilityStatus');
  return useMemo(
    (): Record<VehicleAvailabilityStatus, string> => ({
      available: t('available'),
      maintenance: t('maintenance'),
      rented: t('rented'),
    }),
    [t],
  );
}

export function useVehicleAvailabilityStatusOptions() {
  const labels = useVehicleAvailabilityStatusLabels();
  return useMemo(
    () =>
      VEHICLE_AVAILABILITY_STATUSES.map((value) => ({ value, label: labels[value] })),
    [labels],
  );
}

export function useActivityDifficultyLabels() {
  const t = useTranslations('modules.common.activityDifficulty');
  return useMemo(
    (): Record<ActivityDifficultyLevel, string> => ({
      easy: t('easy'),
      moderate: t('moderate'),
      hard: t('hard'),
      expert: t('expert'),
    }),
    [t],
  );
}

export function useActivityDifficultyOptions() {
  const t = useTranslations('modules.common.activityDifficulty');
  const labels = useActivityDifficultyLabels();
  return useMemo(
    () => [
      { value: '', label: t('unspecified') },
      ...ACTIVITY_DIFFICULTY_LEVELS.map((value) => ({ value, label: labels[value] })),
    ],
    [labels, t],
  );
}

export function usePackageItemTypeLabels() {
  const t = useTranslations('modules.common.packageItemType');
  return useMemo(
    (): Record<PackageItemType, string> => ({
      property: t('property'),
      flight: t('flight'),
      vehicle: t('vehicle'),
      cruise: t('cruise'),
      activity: t('activity'),
    }),
    [t],
  );
}

export function usePackageItemTypeOptions() {
  const labels = usePackageItemTypeLabels();
  return useMemo(
    () => PACKAGE_ITEM_TYPES.map((value) => ({ value, label: labels[value] })),
    [labels],
  );
}

export function usePackageStatusLabels() {
  const t = useTranslations('modules.common.packageStatus');
  return useMemo(
    () => ({
      active: t('active'),
      inactive: t('inactive'),
    }),
    [t],
  );
}

export function useVehicleSpecLabels() {
  const t = useTranslations('modules.common.vehicleSpecs');
  return useMemo(
    () => ({
      seats: t('seats'),
      transmission: t('transmission'),
      fuel: t('fuel'),
      transmissionManual: t('transmissionManual'),
      transmissionAutomatic: t('transmissionAutomatic'),
      fuelPetrol: t('fuelPetrol'),
      fuelDiesel: t('fuelDiesel'),
      fuelHybrid: t('fuelHybrid'),
    }),
    [t],
  );
}

export function useRbacScopeTypeLabels() {
  const t = useTranslations('modules.common.rbacScope.scopeTypes');
  return useMemo(
    () => ({
      global: t('global'),
      property: t('property'),
      agency: t('agency'),
      support_queue: t('support_queue'),
    }),
    [t],
  );
}

export function useRbacScopeDisplayLabels(): RbacScopeDisplayLabels {
  const t = useTranslations('modules.common.rbacScope');
  return useMemo(
    () => ({
      global: t('global'),
      property: t('property'),
      agency: t('agency'),
      support_queue: t('support_queue'),
      withId: t('withId'),
    }),
    [t],
  );
}

export function useRbacPermissionDomainLabels() {
  const t = useTranslations('modules.rbac.permissionDomains');
  return useMemo(
    () => ({
      amenities: t('amenities'),
      bookings: t('bookings'),
      cruises: t('cruises'),
      destinations: t('destinations'),
      employees: t('employees'),
      flights: t('flights'),
      loyalty: t('loyalty'),
      organizations: t('organizations'),
      payments: t('payments'),
      permissions: t('permissions'),
      promo_codes: t('promo_codes'),
      properties: t('properties'),
      promotions: t('promotions'),
      reviews: t('reviews'),
      roles: t('roles'),
      support: t('support'),
      users: t('users'),
      vehicles: t('vehicles'),
      activities: t('activities'),
      packages: t('packages'),
    }),
    [t],
  );
}

export function useRbacPermissionActionLabels() {
  const t = useTranslations('modules.rbac.permissionActions');
  return useMemo(
    () => ({
      read: t('read'),
      write: t('write'),
      delete: t('delete'),
      manage: t('manage'),
      approve: t('approve'),
    }),
    [t],
  );
}

export function useReviewStatusLabels() {
  const t = useTranslations('modules.reviews.status');
  return useMemo(
    (): Record<ReviewStatus, string> => ({
      pending: t('pending'),
      approved: t('approved'),
      hidden: t('hidden'),
    }),
    [t],
  );
}

export function useReviewStatusFilterOptions() {
  const tAll = useTranslations('modules.common.filters');
  const statusLabels = useReviewStatusLabels();
  return useMemo(
    () => [
      { value: '', label: tAll('all') },
      ...REVIEW_STATUSES.map((status) => ({
        value: status,
        label: statusLabels[status],
      })),
    ],
    [statusLabels, tAll],
  );
}

export function useSupportTicketStatusLabels() {
  const t = useTranslations('modules.support.status');
  return useMemo(
    (): Record<SupportTicketStatus, string> => ({
      open: t('open'),
      pending: t('pending'),
      resolved: t('resolved'),
      closed: t('closed'),
    }),
    [t],
  );
}

export function useSupportTicketStatusFilterOptions() {
  const tAll = useTranslations('modules.common.filters');
  const statusLabels = useSupportTicketStatusLabels();
  return useMemo(
    () => [
      { value: '', label: tAll('all') },
      ...SUPPORT_TICKET_STATUSES.map((status) => ({
        value: status,
        label: statusLabels[status],
      })),
    ],
    [statusLabels, tAll],
  );
}

export function useSupportTicketPriorityLabels() {
  const t = useTranslations('modules.support.priority');
  return useMemo(
    (): Record<SupportTicketPriority, string> => ({
      low: t('low'),
      normal: t('normal'),
      high: t('high'),
      urgent: t('urgent'),
    }),
    [t],
  );
}

export function useSupportTicketPriorityFilterOptions() {
  const tAll = useTranslations('modules.common.filters');
  const priorityLabels = useSupportTicketPriorityLabels();
  return useMemo(
    () => [
      { value: '', label: tAll('allFeminine') },
      ...SUPPORT_TICKET_PRIORITIES.map((priority) => ({
        value: priority,
        label: priorityLabels[priority],
      })),
    ],
    [priorityLabels, tAll],
  );
}

export function useLoyaltyTierLabels() {
  const t = useTranslations('modules.loyalty.tiers');
  return useMemo(
    (): Record<LoyaltyTier, string> => ({
      member: t('member'),
      silver: t('silver'),
      gold: t('gold'),
      platinum: t('platinum'),
    }),
    [t],
  );
}

export function usePromoValidityLabels() {
  const t = useTranslations('modules.promotions.validity');
  return useMemo(
    (): PromoValidityLabels => ({
      active: t('active'),
      upcoming: t('upcoming'),
      expired: t('expired'),
    }),
    [t],
  );
}

export function usePromoDiscountLabels(): PromoDiscountLabels {
  const t = useTranslations('modules.promotions');
  return useMemo(
    () => ({
      informative: t('discount.informative'),
      pending: t('discount.pending'),
      percentFormat: t('discount.percentFormat'),
      fixedFormat: t('discount.fixedFormat'),
      noDateLimit: t('validity.noDateLimit'),
      fromDate: t('validity.fromDate'),
      untilDate: t('validity.untilDate'),
      range: t('validity.range'),
    }),
    [t],
  );
}

export function usePromoDiscountTypeLabels() {
  const t = useTranslations('modules.promoCodes.form.fields');
  return useMemo(
    (): Record<PromoCodeDiscountType, string> => ({
      percent: t('discountTypePercent'),
      fixed_amount: t('discountTypeFixed'),
    }),
    [t],
  );
}

export function useLoyaltyTierOptions() {
  const labels = useLoyaltyTierLabels();
  return useMemo(
    () => LOYALTY_TIER_ORDER.map((tier) => ({ value: tier, label: labels[tier] })),
    [labels],
  );
}

/** Locale-aware number formatting (SSR-safe via next-intl). */
export function useFormatPoints() {
  const format = useFormatter();
  return useCallback((value: number) => format.number(value), [format]);
}

/** Locale-aware count formatting (SSR-safe via next-intl). */
export function useFormatCount() {
  const format = useFormatter();
  return useCallback((value: number) => format.number(value), [format]);
}

type DateTimeStyle = 'short' | 'long' | 'mediumTime';

/** Locale-aware date/time formatting (SSR-safe via next-intl). */
export function useFormatDateTime(style: DateTimeStyle = 'short') {
  const format = useFormatter();
  return useCallback(
    (iso: string) => {
      try {
        const date = new Date(iso);
        if (style === 'long') {
          return format.dateTime(date, { dateStyle: 'long', timeStyle: 'short' });
        }
        if (style === 'mediumTime') {
          return format.dateTime(date, { dateStyle: 'short', timeStyle: 'medium' });
        }
        return format.dateTime(date, { dateStyle: 'short', timeStyle: 'short' });
      } catch {
        return iso;
      }
    },
    [format, style],
  );
}

/** Locale-aware chart axis date (month + day). */
export function useFormatChartAxisDate() {
  const format = useFormatter();
  return useCallback(
    (isoDate: string) => {
      const date = new Date(`${isoDate}T12:00:00.000Z`);
      return format.dateTime(date, { day: 'numeric', month: 'short' });
    },
    [format],
  );
}
