import type { Users } from '../../../entities/generated';
import type {
  PosReceiptEmailLineItem,
  PosReceiptEmailPayload,
} from '../../email/email.types';
import type { BookingAdminDetailDto } from './dto/booking-admin-detail.dto';

export type PosReceiptContext = {
  organizationId: string;
  firstName: string;
  bookingId: string;
  /** ISO 8601 issue date (typically booking.createdAt). */
  issuedAt: string;
  organizationName: string;
  employeeName: string;
  clientName: string;
  clientEmail: string;
  paymentMethodLabel: string;
  items: PosReceiptEmailLineItem[];
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  currency: string;
  webUrl?: string;
};

function formatPersonName(
  firstName: string,
  lastName: string,
  fallback: string,
): string {
  const name = `${firstName} ${lastName}`.trim();
  return name || fallback;
}

export function toIsoReceiptDate(
  value: Date | string | null | undefined,
): string {
  if (!value) {
    return new Date().toISOString();
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  return value;
}

export function buildPosReceiptLineItems(
  detail: BookingAdminDetailDto,
): PosReceiptEmailLineItem[] {
  return detail.items.map((item) => ({
    title: item.titleSnapshot?.trim() || 'Prestation',
    quantity: item.quantity,
    unitPriceCents: item.unitPriceCents,
    lineTotalCents: item.unitPriceCents * item.quantity,
  }));
}

export function resolvePosReceiptPaymentMethodLabel(
  detail: BookingAdminDetailDto,
): string {
  const succeeded = detail.payments.find(
    (payment) => payment.status === 'succeeded',
  );
  if (succeeded?.provider === 'cash') {
    return 'Espèces';
  }
  if (succeeded?.provider === 'stripe') {
    return 'Carte bancaire';
  }
  if (detail.booking.preferredPaymentMethod === 'cash') {
    return 'Espèces';
  }
  if (detail.booking.preferredPaymentMethod === 'stripe') {
    return 'Carte bancaire';
  }
  return '—';
}

export function buildPosReceiptContext(
  detail: BookingAdminDetailDto,
  actor: Pick<Users, 'firstName' | 'lastName'>,
  organizationName: string,
  organizationId: string,
): PosReceiptContext {
  const lineItems = buildPosReceiptLineItems(detail);
  const subtotalCents = lineItems.reduce(
    (sum, item) => sum + item.lineTotalCents,
    0,
  );
  const discountCents = Math.max(0, subtotalCents - detail.totalCents);

  return {
    organizationId,
    firstName: detail.client.firstName.trim() || 'Client',
    bookingId: detail.booking.id,
    issuedAt: toIsoReceiptDate(detail.booking.createdAt),
    organizationName,
    employeeName: formatPersonName(actor.firstName, actor.lastName, '—'),
    clientName: formatPersonName(
      detail.client.firstName,
      detail.client.lastName,
      'Client',
    ),
    clientEmail: detail.client.email?.trim() || '',
    paymentMethodLabel: resolvePosReceiptPaymentMethodLabel(detail),
    items: lineItems,
    subtotalCents,
    discountCents,
    totalCents: detail.totalCents,
    currency: detail.currency,
    webUrl: process.env.NEXT_PUBLIC_WEB_URL,
  };
}

export function toPosReceiptEmailPayload(
  context: PosReceiptContext,
  to: string,
): PosReceiptEmailPayload {
  return {
    to: to.trim(),
    firstName: context.firstName,
    bookingId: context.bookingId,
    issuedAt: context.issuedAt,
    organizationName: context.organizationName,
    employeeName: context.employeeName,
    clientName: context.clientName,
    paymentMethodLabel: context.paymentMethodLabel,
    items: context.items,
    subtotalCents: context.subtotalCents,
    discountCents: context.discountCents,
    totalCents: context.totalCents,
    currency: context.currency,
    webUrl: context.webUrl,
  };
}

export function posReceiptPdfFilename(bookingId: string): string {
  return `recu-${bookingId.slice(0, 8).toLowerCase()}.pdf`;
}
