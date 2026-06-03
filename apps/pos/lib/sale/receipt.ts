import type { BookingAdminDetail } from '@africatourismgate/types';
import type { PosStoredSession } from '../auth/session';
import { formatCents } from './format';

export type PosReceiptLine = {
  title: string;
  quantity: number;
  unitPriceLabel: string;
  lineTotalLabel: string;
};

export type PosReceiptData = {
  displayName: string;
  logoUrl: string | null;
  organizationName: string;
  employeeName: string;
  bookingId: string;
  issuedAtLabel: string;
  clientName: string;
  clientEmail: string;
  paymentMethodLabel: string;
  items: PosReceiptLine[];
  subtotalLabel: string;
  discountLabel: string | null;
  totalLabel: string;
  currency: string;
};

function formatEmployeeName(session: PosStoredSession | null): string {
  if (!session?.user) return '—';
  return `${session.user.firstName} ${session.user.lastName}`.trim() || '—';
}

function resolvePaymentMethodLabel(
  detail: BookingAdminDetail,
  fallback: 'cash' | 'card' | null,
): string {
  const succeeded = detail.payments.find((payment) => payment.status === 'succeeded');
  if (succeeded?.provider === 'cash') return 'Espèces';
  if (succeeded?.provider === 'stripe') return 'Carte bancaire';
  if (fallback === 'cash') return 'Espèces';
  if (fallback === 'card') return 'Carte bancaire';
  return '—';
}

export function buildReceiptData(
  detail: BookingAdminDetail,
  session: PosStoredSession | null,
  branding: PublicBrandingInput,
  paymentFallback: 'cash' | 'card' | null,
): PosReceiptData {
  const currency = detail.currency;
  const itemsSubtotalCents = detail.items.reduce(
    (sum, item) => sum + item.unitPriceCents * item.quantity,
    0,
  );
  const discountCents = Math.max(0, itemsSubtotalCents - detail.totalCents);

  const clientName =
    `${detail.client.firstName} ${detail.client.lastName}`.trim() || 'Client';

  return {
    displayName: branding.displayName,
    logoUrl: branding.logoUrl,
    organizationName: session?.selectedOrganizationName?.trim() || branding.displayName,
    employeeName: formatEmployeeName(session),
    bookingId: detail.booking.id,
    issuedAtLabel: new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(detail.booking.createdAt)),
    clientName,
    clientEmail: detail.client.email,
    paymentMethodLabel: resolvePaymentMethodLabel(detail, paymentFallback),
    items: detail.items.map((item) => ({
      title: item.titleSnapshot,
      quantity: item.quantity,
      unitPriceLabel: formatCents(item.unitPriceCents, currency),
      lineTotalLabel: formatCents(item.unitPriceCents * item.quantity, currency),
    })),
    subtotalLabel: formatCents(itemsSubtotalCents, currency),
    discountLabel:
      discountCents > 0 ? formatCents(discountCents, currency) : null,
    totalLabel: formatCents(detail.totalCents, currency),
    currency,
  };
}

type PublicBrandingInput = {
  displayName: string;
  logoUrl: string | null;
};

export function buildReceiptPlainText(data: PosReceiptData): string {
  const lines = [
    data.displayName,
    data.organizationName,
    '—'.repeat(32),
    `Reçu n° ${data.bookingId}`,
    `Date : ${data.issuedAtLabel}`,
    `Caissier : ${data.employeeName}`,
    `Client : ${data.clientName}`,
    `E-mail : ${data.clientEmail}`,
    '—'.repeat(32),
    ...data.items.flatMap((item) => [
      item.title,
      `  ${item.quantity} × ${item.unitPriceLabel} = ${item.lineTotalLabel}`,
    ]),
    '—'.repeat(32),
    `Sous-total : ${data.subtotalLabel}`,
  ];

  if (data.discountLabel) {
    lines.push(`Remise : -${data.discountLabel}`);
  }

  lines.push(
    `TOTAL : ${data.totalLabel}`,
    `Paiement : ${data.paymentMethodLabel}`,
    '—'.repeat(32),
    'Merci pour votre achat !',
  );

  return lines.join('\n');
}

export function buildReceiptMailtoUrl(email: string, data: PosReceiptData): string {
  const trimmed = email.trim();
  if (!trimmed) return '';

  const subject = encodeURIComponent(
    `Reçu ${data.displayName} — ${data.bookingId.slice(0, 8).toUpperCase()}`,
  );
  const body = encodeURIComponent(buildReceiptPlainText(data));
  return `mailto:${trimmed}?subject=${subject}&body=${body}`;
}
