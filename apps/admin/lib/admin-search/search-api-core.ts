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
};

const DEFAULT_LIMIT = 5;

/** Fetch plus large pour filtrer côté client (API tickets sans `search`). */
const SUPPORT_TICKETS_CLIENT_FILTER_LIMIT = 100;

function resolveLimit(options?: SearchApiCoreOptions): number {
  return options?.resultLimit ?? DEFAULT_LIMIT;
}

export async function searchAdminUsers(
  query: string,
  options?: SearchApiCoreOptions,
): Promise<AdminSearchResultItem[]> {
  const limit = resolveLimit(options);
  const result = await withApiClient((client: ApiClient) =>
    client.listUsers({ page: 1, limit, search: query.trim() || undefined }),
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
    client.listOrganizations({
      page: 1,
      limit,
      search: query.trim() || undefined,
    }),
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
    client.listBookings({
      page: 1,
      limit,
      search: query.trim() || undefined,
    }),
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
    client.listProperties({
      page: 1,
      limit,
      search: query.trim() || undefined,
    }),
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
    client.listPayments({
      page: 1,
      limit,
      search: query.trim() || undefined,
    }),
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
 * L’API support-tickets n’expose pas `search` : fetch paginé + filtre client
 * sur sujet / email / prénom / préfixe d’id.
 */
export async function searchAdminSupportTickets(
  query: string,
  options?: SearchApiCoreOptions,
): Promise<AdminSearchResultItem[]> {
  const limit = resolveLimit(options);
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return [];
  }

  const result = await withApiClient((client: ApiClient) =>
    client.listSupportTickets({
      page: 1,
      limit: SUPPORT_TICKETS_CLIENT_FILTER_LIMIT,
    }),
  );

  return result.data
    .filter((ticket) => {
      const haystacks = [
        ticket.subject,
        ticket.customerEmail ?? '',
        ticket.customerFirstName ?? '',
        ticket.id,
      ];
      return haystacks.some((value) =>
        value.toLowerCase().includes(normalized),
      );
    })
    .slice(0, limit)
    .map((ticket) => ({
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
