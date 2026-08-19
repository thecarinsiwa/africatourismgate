import type {
  AdminReviewListItem,
  AdminSupportTicketListItem,
  BookingListItem,
  BookingStatus,
  ReviewStatus,
  SupportTicketStatus,
} from '@africatourismgate/types';
import { formatReviewPreview } from './review-display';
import { getApiClient } from './auth/api';
import { isApiForbidden } from './auth/is-api-forbidden';

const ACTIVITY_FETCH_LIMIT = 3;
const ACTIVITY_DISPLAY_LIMIT = 3;

export type DashboardActivityBookingItem = {
  type: 'booking';
  id: string;
  createdAt: string;
  href: string;
  clientLabel: string;
  status: BookingStatus;
  amountCents: number;
  currency: string;
};

export type DashboardActivityReviewItem = {
  type: 'review';
  id: string;
  createdAt: string;
  href: string;
  authorLabel: string;
  rating: number;
  status: ReviewStatus;
  preview: string | null;
};

export type DashboardActivityTicketItem = {
  type: 'support_ticket';
  id: string;
  createdAt: string;
  href: string;
  subject: string;
  customerLabel: string;
  status: SupportTicketStatus;
};

export type DashboardActivityItem =
  | DashboardActivityBookingItem
  | DashboardActivityReviewItem
  | DashboardActivityTicketItem;

export type DashboardActivityAccess = {
  canReadBookings: boolean;
  canReadReviews: boolean;
  canReadSupportTickets: boolean;
};

function formatClientLabel(booking: BookingListItem): string {
  const name = `${booking.clientFirstName ?? ''} ${booking.clientLastName ?? ''}`.trim();
  return name || booking.clientEmail || booking.id.slice(0, 8);
}

function formatReviewAuthor(review: AdminReviewListItem): string {
  return review.authorFirstName?.trim() || review.authorEmail || review.id.slice(0, 8);
}

function formatTicketCustomer(ticket: AdminSupportTicketListItem): string {
  const name = ticket.customerFirstName?.trim();
  if (name && ticket.customerEmail) {
    return `${name} · ${ticket.customerEmail}`;
  }
  return name || ticket.customerEmail || '—';
}

function mapBooking(booking: BookingListItem): DashboardActivityBookingItem {
  return {
    type: 'booking',
    id: booking.id,
    createdAt: booking.createdAt,
    href: `/dashboard/bookings/${booking.id}`,
    clientLabel: formatClientLabel(booking),
    status: booking.status,
    amountCents: booking.totalCents,
    currency: booking.currency,
  };
}

function mapReview(review: AdminReviewListItem): DashboardActivityReviewItem {
  return {
    type: 'review',
    id: review.id,
    createdAt: review.createdAt,
    href: `/contenu/avis/${review.id}`,
    authorLabel: formatReviewAuthor(review),
    rating: review.rating,
    status: review.status,
    preview: formatReviewPreview(review, 80),
  };
}

function mapTicket(ticket: AdminSupportTicketListItem): DashboardActivityTicketItem {
  return {
    type: 'support_ticket',
    id: ticket.id,
    createdAt: ticket.createdAt,
    href: `/contenu/tickets/${ticket.id}`,
    subject: ticket.subject,
    customerLabel: formatTicketCustomer(ticket),
    status: ticket.status,
  };
}

async function fetchBookingsActivity(): Promise<DashboardActivityBookingItem[]> {
  const client = getApiClient();
  const result = await client.listBookings({
    page: 1,
    limit: ACTIVITY_FETCH_LIMIT,
    sortOrder: 'desc',
  });
  return result.data.map(mapBooking);
}

async function fetchReviewsActivity(): Promise<DashboardActivityReviewItem[]> {
  const client = getApiClient();
  const result = await client.listReviews({ page: 1, limit: ACTIVITY_FETCH_LIMIT });
  return result.data.map(mapReview);
}

async function fetchTicketsActivity(): Promise<DashboardActivityTicketItem[]> {
  const client = getApiClient();
  const result = await client.listSupportTickets({ page: 1, limit: ACTIVITY_FETCH_LIMIT });
  return result.data.map(mapTicket);
}

async function fetchActivitySource<T>(
  fetch: () => Promise<T[]>,
): Promise<T[]> {
  try {
    return await fetch();
  } catch (error) {
    if (isApiForbidden(error)) {
      return [];
    }
    throw error;
  }
}

export async function fetchDashboardRecentActivity(
  access: DashboardActivityAccess,
): Promise<DashboardActivityItem[]> {
  const tasks: Promise<DashboardActivityItem[]>[] = [];

  if (access.canReadBookings) {
    tasks.push(fetchActivitySource(fetchBookingsActivity));
  }
  if (access.canReadReviews) {
    tasks.push(fetchActivitySource(fetchReviewsActivity));
  }
  if (access.canReadSupportTickets) {
    tasks.push(fetchActivitySource(fetchTicketsActivity));
  }

  if (tasks.length === 0) {
    return [];
  }

  const groups = await Promise.all(tasks);
  return groups
    .flat()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, ACTIVITY_DISPLAY_LIMIT);
}

export function hasDashboardActivityAccess(access: DashboardActivityAccess): boolean {
  return access.canReadBookings || access.canReadReviews || access.canReadSupportTickets;
}
