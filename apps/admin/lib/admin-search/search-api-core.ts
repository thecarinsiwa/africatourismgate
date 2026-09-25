import type { ApiClient } from '@africatourismgate/api-client';
import { withApiClient } from '../auth/api';
import { formatMoney } from '../format-money';
import {
  adminSearchDeepLinks,
  formatAdminSearchIdPrefix,
  formatAdminSearchPersonName,
} from './deep-links';
import { buildAdminSearchResultId } from './sources';
import type { AdminSearchResultItem } from './types';

export type SearchApiCoreOptions = {
  resultLimit?: number;
  signal?: AbortSignal;
};

const DEFAULT_LIMIT = 5;

function resolveLimit(options?: SearchApiCoreOptions): number {
  return options?.resultLimit ?? DEFAULT_LIMIT;
}

function requestOptions(
  options?: SearchApiCoreOptions,
): { signal: AbortSignal } | undefined {
  return options?.signal ? { signal: options.signal } : undefined;
}

export async function searchAdminUsers(
  query: string,
  options?: SearchApiCoreOptions,
): Promise<AdminSearchResultItem[]> {
  const limit = resolveLimit(options);
  const result = await withApiClient((client: ApiClient) =>
    client.listUsers(
      { page: 1, limit, search: query.trim() || undefined },
      requestOptions(options),
    ),
  );

  return result.data.map((user) => {
    const fullName = formatAdminSearchPersonName(
      user.firstName,
      user.lastName,
      user.email,
    );
    return {
      id: buildAdminSearchResultId('users', user.id),
      sourceId: 'users' as const,
      group: 'users' as const,
      title: fullName,
      subtitle: fullName === user.email ? user.status : user.email,
      href: adminSearchDeepLinks.user(user.id),
    };
  });
}

export async function searchAdminOrganizations(
  query: string,
  options?: SearchApiCoreOptions,
): Promise<AdminSearchResultItem[]> {
  const limit = resolveLimit(options);
  const result = await withApiClient((client: ApiClient) =>
    client.listOrganizations(
      {
        page: 1,
        limit,
        search: query.trim() || undefined,
      },
      requestOptions(options),
    ),
  );

  return result.data.map((org) => ({
    id: buildAdminSearchResultId('organizations', org.id),
    sourceId: 'organizations' as const,
    group: 'organizations' as const,
    title: org.name,
    subtitle: org.slug,
    href: adminSearchDeepLinks.organization(org.id),
  }));
}

export async function searchAdminBookings(
  query: string,
  options?: SearchApiCoreOptions,
): Promise<AdminSearchResultItem[]> {
  const limit = resolveLimit(options);
  const result = await withApiClient((client: ApiClient) =>
    client.listBookings(
      {
        page: 1,
        limit,
        search: query.trim() || undefined,
      },
      requestOptions(options),
    ),
  );

  return result.data.map((booking) => {
    const clientLabel = formatAdminSearchPersonName(
      booking.clientFirstName,
      booking.clientLastName,
      booking.clientEmail,
    );
    return {
      id: buildAdminSearchResultId('bookings', booking.id),
      sourceId: 'bookings' as const,
      group: 'bookings' as const,
      title: clientLabel,
      subtitle: `${booking.status} · ${formatAdminSearchIdPrefix(booking.id)}`,
      href: adminSearchDeepLinks.booking(booking.id),
    };
  });
}

export async function searchAdminProperties(
  query: string,
  options?: SearchApiCoreOptions,
): Promise<AdminSearchResultItem[]> {
  const limit = resolveLimit(options);
  const result = await withApiClient((client: ApiClient) =>
    client.listProperties(
      {
        page: 1,
        limit,
        search: query.trim() || undefined,
      },
      requestOptions(options),
    ),
  );

  return result.data.map((property) => ({
    id: buildAdminSearchResultId('properties', property.id),
    sourceId: 'properties' as const,
    group: 'properties' as const,
    title: property.name,
    subtitle: property.addressLine?.trim() || property.propertyType,
    href: adminSearchDeepLinks.property(property.id),
  }));
}

export async function searchAdminPayments(
  query: string,
  options?: SearchApiCoreOptions,
): Promise<AdminSearchResultItem[]> {
  const limit = resolveLimit(options);
  const result = await withApiClient((client: ApiClient) =>
    client.listPayments(
      {
        page: 1,
        limit,
        search: query.trim() || undefined,
      },
      requestOptions(options),
    ),
  );

  return result.data.map((payment) => {
    const clientLabel = formatAdminSearchPersonName(
      payment.clientFirstName,
      payment.clientLastName,
      payment.clientEmail,
    );
    return {
      id: buildAdminSearchResultId('payments', payment.id),
      sourceId: 'payments' as const,
      group: 'payments' as const,
      title: clientLabel,
      subtitle: `${formatMoney(payment.amountCents, payment.currency)} · ${payment.status}`,
      href: adminSearchDeepLinks.paymentBooking(payment.bookingId),
    };
  });
}

/**
 * Tickets support via `search=` API (sujet, email, prénom, id).
 */
export async function searchAdminSupportTickets(
  query: string,
  options?: SearchApiCoreOptions,
): Promise<AdminSearchResultItem[]> {
  const limit = resolveLimit(options);
  const search = query.trim();
  if (!search) {
    return [];
  }

  const result = await withApiClient((client: ApiClient) =>
    client.listSupportTickets(
      {
        page: 1,
        limit,
        search,
      },
      requestOptions(options),
    ),
  );

  return result.data.map((ticket) => ({
    id: buildAdminSearchResultId('supportTickets', ticket.id),
    sourceId: 'supportTickets' as const,
    group: 'support' as const,
    title: ticket.subject,
    subtitle:
      ticket.customerEmail?.trim() ||
      ticket.customerFirstName?.trim() ||
      ticket.status,
    href: adminSearchDeepLinks.supportTicket(ticket.id),
  }));
}

export async function searchAdminPromotions(
  query: string,
  options?: SearchApiCoreOptions,
): Promise<AdminSearchResultItem[]> {
  const limit = resolveLimit(options);
  const result = await withApiClient((client: ApiClient) =>
    client.listPromotions(
      {
        page: 1,
        limit,
        search: query.trim() || undefined,
      },
      requestOptions(options),
    ),
  );

  return result.data.map((promotion) => ({
    id: buildAdminSearchResultId('promotions', promotion.id),
    sourceId: 'promotions' as const,
    group: 'payments' as const,
    title: promotion.name,
    subtitle: promotion.active === 1 ? 'active' : 'inactive',
    href: adminSearchDeepLinks.promotion(promotion.id),
  }));
}

export async function searchAdminPromoCodes(
  query: string,
  options?: SearchApiCoreOptions,
): Promise<AdminSearchResultItem[]> {
  const limit = resolveLimit(options);
  const result = await withApiClient((client: ApiClient) =>
    client.listPromoCodes(
      {
        page: 1,
        limit,
        search: query.trim() || undefined,
      },
      requestOptions(options),
    ),
  );

  return result.data.map((promo) => ({
    id: buildAdminSearchResultId('promoCodes', promo.id),
    sourceId: 'promoCodes' as const,
    group: 'payments' as const,
    title: promo.code,
    subtitle: `${promo.discountType} · ${promo.discountValue}`,
    href: adminSearchDeepLinks.promoCode(promo.id),
  }));
}

export async function searchAdminRoles(
  query: string,
  options?: SearchApiCoreOptions,
): Promise<AdminSearchResultItem[]> {
  const limit = resolveLimit(options);
  const result = await withApiClient((client: ApiClient) =>
    client.listRoles(
      {
        page: 1,
        limit,
        search: query.trim() || undefined,
      },
      requestOptions(options),
    ),
  );

  return result.data.map((role) => ({
    id: buildAdminSearchResultId('roles', role.id),
    sourceId: 'roles' as const,
    group: 'content' as const,
    title: role.name,
    subtitle: role.code,
    href: adminSearchDeepLinks.role(role.id),
  }));
}

export async function searchAdminEmployees(
  query: string,
  options?: SearchApiCoreOptions,
): Promise<AdminSearchResultItem[]> {
  const limit = resolveLimit(options);
  const result = await withApiClient((client: ApiClient) =>
    client.listEmployees(
      {
        page: 1,
        limit,
        search: query.trim() || undefined,
      },
      requestOptions(options),
    ),
  );

  return result.data.map((employee) => {
    const user = employee.user;
    const name = user
      ? formatAdminSearchPersonName(
          user.firstName,
          user.lastName,
          user.email,
        )
      : employee.employeeCode?.trim() ||
        formatAdminSearchIdPrefix(employee.id);
    return {
      id: buildAdminSearchResultId('employees', employee.id),
      sourceId: 'employees' as const,
      group: 'users' as const,
      title: name,
      subtitle:
        employee.jobTitle?.trim() ||
        employee.employeeCode?.trim() ||
        user?.email ||
        employee.status,
      href: adminSearchDeepLinks.employee(employee.id),
    };
  });
}
