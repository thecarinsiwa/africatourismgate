import type { EmailBrandingValue } from '@africatourismgate/types';
import { escapeHtml, formatMoney, layout } from './email.templates';
import type { PosReceiptEmailPayload } from './email.types';

const BRAND = {
  border: '#c8ddd4',
  text: '#0f1a16',
  muted: '#5c6d66',
  surfaceAlt: '#e8f5ef',
  white: '#ffffff',
} as const;

function formatDateFr(iso: string): string {
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function bookingRefShort(bookingId: string): string {
  return bookingId.slice(0, 8).toUpperCase();
}

function receiptLineItemsTable(
  payload: PosReceiptEmailPayload,
): string {
  if (payload.items.length === 0) {
    return `<p style="margin:0 0 16px;font-size:14px;color:${BRAND.muted};">—</p>`;
  }

  const rows = payload.items
    .map((item) => {
      const title = escapeHtml(item.title);
      const qty = escapeHtml(String(item.quantity));
      const unit = escapeHtml(formatMoney(item.unitPriceCents, payload.currency));
      const lineTotal = escapeHtml(formatMoney(item.lineTotalCents, payload.currency));
      return `<tr>
  <td style="padding:10px 12px;border-bottom:1px solid ${BRAND.border};font-size:14px;line-height:1.45;color:${BRAND.text};">${title}</td>
  <td style="padding:10px 8px;border-bottom:1px solid ${BRAND.border};font-size:14px;text-align:center;color:${BRAND.text};">${qty}</td>
  <td style="padding:10px 8px;border-bottom:1px solid ${BRAND.border};font-size:14px;text-align:right;white-space:nowrap;color:${BRAND.text};">${unit}</td>
  <td style="padding:10px 12px;border-bottom:1px solid ${BRAND.border};font-size:14px;font-weight:600;text-align:right;white-space:nowrap;color:${BRAND.text};">${lineTotal}</td>
</tr>`;
    })
    .join('');

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;border:1px solid ${BRAND.border};border-radius:10px;overflow:hidden;border-collapse:separate;">
  <thead>
    <tr style="background:${BRAND.surfaceAlt};">
      <th style="padding:10px 12px;font-size:11px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;text-align:left;color:${BRAND.muted};">Prestation</th>
      <th style="padding:10px 8px;font-size:11px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;text-align:center;color:${BRAND.muted};width:48px;">Qté</th>
      <th style="padding:10px 8px;font-size:11px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;text-align:right;color:${BRAND.muted};width:88px;">P.U.</th>
      <th style="padding:10px 12px;font-size:11px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;text-align:right;color:${BRAND.muted};width:96px;">Total</th>
    </tr>
  </thead>
  <tbody>${rows}</tbody>
</table>`;
}

function totalsBlock(payload: PosReceiptEmailPayload): string {
  const subtotal = escapeHtml(formatMoney(payload.subtotalCents, payload.currency));
  const total = escapeHtml(formatMoney(payload.totalCents, payload.currency));

  const discountRow =
    payload.discountCents > 0
      ? `<tr>
  <td style="padding:6px 0;font-size:14px;color:${BRAND.muted};">Remise</td>
  <td style="padding:6px 0;font-size:14px;font-weight:600;text-align:right;color:${BRAND.text};">−${escapeHtml(formatMoney(payload.discountCents, payload.currency))}</td>
</tr>`
      : '';

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
  <tr>
    <td style="padding:6px 0;font-size:14px;color:${BRAND.muted};">Sous-total</td>
    <td style="padding:6px 0;font-size:14px;font-weight:600;text-align:right;color:${BRAND.text};">${subtotal}</td>
  </tr>
  ${discountRow}
  <tr>
    <td style="padding:10px 0 4px;font-size:15px;font-weight:700;color:${BRAND.text};border-top:1px dashed ${BRAND.border};">Total TTC</td>
    <td style="padding:10px 0 4px;font-size:18px;font-weight:700;text-align:right;color:${BRAND.text};border-top:1px dashed ${BRAND.border};">${total}</td>
  </tr>
</table>
<p style="margin:0 0 20px;font-size:12px;line-height:1.5;color:${BRAND.muted};">Montants TTC — TVA incluse</p>`;
}

function metaRow(label: string, value: string): string {
  return `<tr>
  <td style="padding:5px 0;font-size:13px;color:${BRAND.muted};width:42%;vertical-align:top;">${escapeHtml(label)}</td>
  <td style="padding:5px 0;font-size:13px;font-weight:600;color:${BRAND.text};text-align:right;vertical-align:top;">${value}</td>
</tr>`;
}

export function renderPosReceiptEmail(
  payload: PosReceiptEmailPayload,
  branding: EmailBrandingValue,
): { subject: string; html: string; text: string } {
  const refShort = bookingRefShort(payload.bookingId);
  const refFull = escapeHtml(payload.bookingId);
  const issuedLabel = escapeHtml(formatDateFr(payload.issuedAt));
  const orgName = escapeHtml(payload.organizationName || branding.displayName);
  const employee = escapeHtml(payload.employeeName);
  const client = escapeHtml(payload.clientName);
  const payment = escapeHtml(payload.paymentMethodLabel);
  const name = escapeHtml(payload.firstName.trim() || 'Client');
  const totalLabel = formatMoney(payload.totalCents, payload.currency);

  const subject = `Reçu ${branding.displayName} — ${refShort}`;

  const html = layout(
    subject,
    `<h1 style="margin:0 0 8px;font-size:26px;font-weight:700;line-height:1.25;color:${BRAND.text};">Reçu de caisse</h1>
<p style="margin:0 0 6px;font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND.muted};">${orgName}</p>
<p style="margin:0 0 20px;font-size:16px;line-height:1.65;color:${BRAND.text};">Bonjour <strong>${name}</strong>,</p>
<p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:${BRAND.text};">Voici le reçu de votre achat. Conservez cet e-mail pour vos archives.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;padding:16px;border:1px solid ${BRAND.border};border-radius:10px;background:${BRAND.white};">
  ${metaRow('N° réservation', `<span style="font-family:Consolas,Monaco,monospace;font-size:12px;">${refFull}</span>`)}
  ${metaRow('Date', issuedLabel)}
  ${metaRow('Caissier', employee)}
  ${metaRow('Client', client)}
  ${metaRow('Paiement', payment)}
</table>
${receiptLineItemsTable(payload)}
${totalsBlock(payload)}
<p style="margin:0;font-size:15px;line-height:1.6;color:${BRAND.text};">Merci pour votre achat !</p>`,
    branding,
    {
      webUrl: payload.webUrl,
      preheader: `Reçu ${refShort} — total ${totalLabel}.`,
    },
  );

  const itemLines = payload.items.flatMap((item) => [
    item.title,
    `  ${item.quantity} × ${formatMoney(item.unitPriceCents, payload.currency)} = ${formatMoney(item.lineTotalCents, payload.currency)}`,
  ]);

  const discountText =
    payload.discountCents > 0
      ? `\nRemise : -${formatMoney(payload.discountCents, payload.currency)}`
      : '';

  const text = [
    `${branding.displayName}`,
    payload.organizationName,
    '—'.repeat(32),
    `Reçu n° ${payload.bookingId}`,
    `Date : ${formatDateFr(payload.issuedAt)}`,
    `Caissier : ${payload.employeeName}`,
    `Client : ${payload.clientName}`,
    `Paiement : ${payload.paymentMethodLabel}`,
    '—'.repeat(32),
    ...itemLines,
    '—'.repeat(32),
    `Sous-total : ${formatMoney(payload.subtotalCents, payload.currency)}`,
    discountText.trim(),
    `Total TTC : ${totalLabel}`,
    'Montants TTC — TVA incluse',
    '',
    'Merci pour votre achat !',
  ]
    .filter(Boolean)
    .join('\n');

  return { subject, html, text };
}
