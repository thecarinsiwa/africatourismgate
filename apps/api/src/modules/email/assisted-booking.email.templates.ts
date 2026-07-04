import type { EmailBrandingValue } from '@africatourismgate/types';
import { formatMoney, escapeHtml, layout, button, webBase } from './email.templates';
import type {
  BookingApprovedChatEmailPayload,
  BookingPaymentInviteEmailPayload,
  BookingPaymentReminderEmailPayload,
  BookingRejectedEmailPayload,
  BookingRequestReceivedEmailPayload,
  BookingStaffMessageEmailPayload,
} from './email.types';

function bookingRef(bookingId: string): string {
  return escapeHtml(bookingId.slice(0, 8));
}

function itemListHtml(titles: string[]): string {
  if (titles.length === 0) {
    return '';
  }
  return `<ul style="margin:8px 0 16px;padding-left:20px;line-height:1.6;">${titles
    .map((t) => `<li>${escapeHtml(t)}</li>`)
    .join('')}</ul>`;
}

function itemListText(titles: string[]): string {
  if (titles.length === 0) {
    return '';
  }
  return titles.map((t, i) => `  ${i + 1}. ${t}`).join('\n');
}

function bookingSummaryBlock(
  payload: BookingRequestReceivedEmailPayload,
): string {
  const total = escapeHtml(formatMoney(payload.totalCents, payload.currency));
  return `<p style="margin:0 0 8px;line-height:1.6;"><strong>Référence :</strong> ${bookingRef(payload.bookingId)}</p>
<p style="margin:0 0 8px;line-height:1.6;"><strong>Montant estimé :</strong> ${total}</p>
${itemListHtml(payload.itemTitles)}`;
}

export function renderBookingRequestReceivedEmail(
  payload: BookingRequestReceivedEmailPayload,
  branding: EmailBrandingValue,
): { subject: string; html: string; text: string } {
  const name = escapeHtml(payload.firstName.trim() || 'Client');
  const subject = `Demande de réservation reçue — ${payload.bookingId.slice(0, 8)}`;
  const accountUrl = `${webBase(payload.webUrl)}/account/reservations`;
  const html = layout(
    subject,
    `<h1 style="margin:0 0 16px;font-size:22px;">Demande enregistrée</h1>
<p style="margin:0 0 16px;line-height:1.6;">Bonjour ${name},</p>
<p style="margin:0 0 16px;line-height:1.6;">Nous avons bien reçu votre demande de réservation. Notre équipe l'examine et vous recontactera sous <strong>24 à 48 h</strong>.</p>
${bookingSummaryBlock(payload)}
<p style="margin:0 0 16px;line-height:1.6;font-size:14px;color:#5c6d66;">Aucun paiement n'a été effectué pour le moment.</p>
${button(accountUrl, 'Suivre ma demande', branding)}`,
    branding,
    { webUrl: payload.webUrl },
  );
  const text = `Bonjour ${payload.firstName},\n\nVotre demande de réservation (${payload.bookingId.slice(0, 8)}) a été enregistrée. Notre équipe vous recontactera sous 24 à 48 h.\n\n${itemListText(payload.itemTitles)}\n\nTotal estimé : ${formatMoney(payload.totalCents, payload.currency)}\n\nSuivre : ${accountUrl}`;
  return { subject, html, text };
}

export function renderBookingApprovedChatEmail(
  payload: BookingApprovedChatEmailPayload,
  branding: EmailBrandingValue,
): { subject: string; html: string; text: string } {
  const name = escapeHtml(payload.firstName.trim() || 'Client');
  const subject = `Réservation approuvée — échangez avec notre équipe`;
  const total = escapeHtml(formatMoney(payload.totalCents, payload.currency));
  const html = layout(
    subject,
    `<h1 style="margin:0 0 16px;font-size:22px;">Demande approuvée</h1>
<p style="margin:0 0 16px;line-height:1.6;">Bonjour ${name},</p>
<p style="margin:0 0 16px;line-height:1.6;">Bonne nouvelle : votre demande de réservation <strong>${bookingRef(payload.bookingId)}</strong> a été validée par notre équipe.</p>
<p style="margin:0 0 8px;line-height:1.6;"><strong>Montant :</strong> ${total}</p>
${itemListHtml(payload.itemTitles)}
<p style="margin:0 0 16px;line-height:1.6;">Vous pouvez échanger avec un conseiller via la messagerie dédiée, puis procéder au paiement lorsque vous serez prêt.</p>
${button(payload.chatUrl, 'Ouvrir la conversation', branding)}`,
    branding,
    { webUrl: payload.webUrl },
  );
  const text = `Bonjour ${payload.firstName},\n\nVotre demande ${payload.bookingId.slice(0, 8)} est approuvée. Montant : ${formatMoney(payload.totalCents, payload.currency)}.\n\nConversation : ${payload.chatUrl}`;
  return { subject, html, text };
}

export function renderBookingRejectedEmail(
  payload: BookingRejectedEmailPayload,
  branding: EmailBrandingValue,
): { subject: string; html: string; text: string } {
  const name = escapeHtml(payload.firstName.trim() || 'Client');
  const subject = `Mise à jour de votre demande de réservation`;
  const reasonBlock = payload.reason?.trim()
    ? `<p style="margin:16px 0;padding:12px 16px;background:#fef2f2;border-radius:8px;border-left:4px solid #dc2626;line-height:1.6;"><strong>Motif :</strong> ${escapeHtml(payload.reason.trim())}</p>`
    : '';
  const html = layout(
    subject,
    `<h1 style="margin:0 0 16px;font-size:22px;">Demande non retenue</h1>
<p style="margin:0 0 16px;line-height:1.6;">Bonjour ${name},</p>
<p style="margin:0 0 16px;line-height:1.6;">Nous ne pouvons pas donner suite à votre demande de réservation <strong>${bookingRef(payload.bookingId)}</strong> pour le moment.</p>
${reasonBlock}
<p style="margin:0 0 16px;line-height:1.6;">N'hésitez pas à nous contacter ou à soumettre une nouvelle demande avec d'autres dates.</p>
${button(`${webBase(payload.webUrl)}/account/reservations`, 'Voir mon compte', branding)}`,
    branding,
    { webUrl: payload.webUrl },
  );
  const reasonText = payload.reason?.trim()
    ? `\nMotif : ${payload.reason.trim()}\n`
    : '';
  const text = `Bonjour ${payload.firstName},\n\nVotre demande ${payload.bookingId.slice(0, 8)} n'a pas été retenue.${reasonText}`;
  return { subject, html, text };
}

export function renderBookingPaymentInviteEmail(
  payload: BookingPaymentInviteEmailPayload,
  branding: EmailBrandingValue,
): { subject: string; html: string; text: string } {
  const name = escapeHtml(payload.firstName.trim() || 'Client');
  const subject = `Paiement de votre réservation — lien sécurisé`;
  const total = escapeHtml(formatMoney(payload.totalCents, payload.currency));
  const html = layout(
    subject,
    `<h1 style="margin:0 0 16px;font-size:22px;">Finalisez votre réservation</h1>
<p style="margin:0 0 16px;line-height:1.6;">Bonjour ${name},</p>
<p style="margin:0 0 16px;line-height:1.6;">Votre réservation <strong>${bookingRef(payload.bookingId)}</strong> est prête. Cliquez ci-dessous pour régler <strong>${total}</strong> en toute sécurité via notre partenaire de paiement.</p>
${itemListHtml(payload.itemTitles)}
${button(payload.paymentUrl, 'Payer maintenant', branding)}
<p style="margin:16px 0 0;font-size:13px;color:#71717a;line-height:1.5;">Ce lien est personnel. Si vous avez déjà payé, ignorez cet e-mail.</p>`,
    branding,
    { webUrl: payload.webUrl },
  );
  const text = `Bonjour ${payload.firstName},\n\nRéglez votre réservation ${payload.bookingId.slice(0, 8)} (${formatMoney(payload.totalCents, payload.currency)}) : ${payload.paymentUrl}`;
  return { subject, html, text };
}

export function renderBookingStaffMessageEmail(
  payload: BookingStaffMessageEmailPayload,
  branding: EmailBrandingValue,
): { subject: string; html: string; text: string } {
  const name = escapeHtml(payload.firstName.trim() || 'Client');
  const preview = escapeHtml(payload.messagePreview.trim());
  const subject = `Nouveau message de notre équipe — réservation ${payload.bookingId.slice(0, 8)}`;
  const html = layout(
    subject,
    `<h1 style="margin:0 0 16px;font-size:22px;">Nouveau message</h1>
<p style="margin:0 0 16px;line-height:1.6;">Bonjour ${name},</p>
<p style="margin:0 0 16px;line-height:1.6;">Notre équipe vous a répondu au sujet de votre réservation <strong>${bookingRef(payload.bookingId)}</strong>.</p>
<p style="margin:0 0 16px;padding:12px 16px;background:#f4f6f5;border-radius:8px;border-left:4px solid #0d9488;line-height:1.6;">${preview}</p>
<p style="margin:0 0 16px;line-height:1.6;">Connectez-vous à votre espace client pour nous répondre et poursuivre la conversation.</p>
${button(payload.chatUrl, 'Répondre à la conversation', branding)}`,
    branding,
    { webUrl: payload.webUrl },
  );
  const text = `Bonjour ${payload.firstName},\n\nNotre équipe vous a répondu sur votre réservation ${payload.bookingId.slice(0, 8)} :\n\n${payload.messagePreview.trim()}\n\nConnectez-vous à votre espace client pour nous répondre : ${payload.chatUrl}`;
  return { subject, html, text };
}

export function renderBookingPaymentReminderEmail(
  payload: BookingPaymentReminderEmailPayload,
  branding: EmailBrandingValue,
): { subject: string; html: string; text: string } {
  const name = escapeHtml(payload.firstName.trim() || 'Client');
  const subject = `Rappel — finalisez le paiement de votre réservation`;
  const total = escapeHtml(formatMoney(payload.totalCents, payload.currency));
  const html = layout(
    subject,
    `<h1 style="margin:0 0 16px;font-size:22px;">Rappel de paiement</h1>
<p style="margin:0 0 16px;line-height:1.6;">Bonjour ${name},</p>
<p style="margin:0 0 16px;line-height:1.6;">Votre réservation <strong>${bookingRef(payload.bookingId)}</strong> est toujours en attente de règlement (<strong>${total}</strong>).</p>
${itemListHtml(payload.itemTitles)}
${button(payload.paymentUrl, 'Payer maintenant', branding)}
<p style="margin:16px 0 0;font-size:13px;color:#71717a;line-height:1.5;">Si vous avez déjà payé, ignorez cet e-mail.</p>`,
    branding,
    { webUrl: payload.webUrl },
  );
  const text = `Bonjour ${payload.firstName},\n\nRappel : votre réservation ${payload.bookingId.slice(0, 8)} (${formatMoney(payload.totalCents, payload.currency)}) attend toujours le paiement.\n\n${payload.paymentUrl}`;
  return { subject, html, text };
}
