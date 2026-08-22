import type { EmailBrandingValue } from '@africatourismgate/types';
import { formatMoney, escapeHtml, layout, button, webBase } from './email.templates';
import type { BookingDetailPdfLocale } from './booking-detail-pdf.labels';
import type {
  BookingApprovedChatEmailPayload,
  BookingPaymentInviteEmailPayload,
  BookingPaymentReminderEmailPayload,
  BookingRejectedEmailPayload,
  BookingRequestReceivedEmailPayload,
  BookingStaffMessageEmailPayload,
  BookingIdentityDocumentUploadRequestEmailPayload,
  BookingGuideAssignmentEmailPayload,
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

function travelerPricingHtml(
  travelers: Array<{ fullName: string; priceCents: number }>,
  currency: string,
): string {
  if (travelers.length === 0) {
    return '';
  }
  const rows = travelers
    .map(
      (traveler) =>
        `<tr><td style="padding:8px 12px;border-bottom:1px solid #e4e4e7;">${escapeHtml(traveler.fullName)}</td><td style="padding:8px 12px;border-bottom:1px solid #e4e4e7;text-align:right;">${escapeHtml(formatMoney(traveler.priceCents, currency))}</td></tr>`,
    )
    .join('');
  return `<table style="width:100%;margin:0 0 16px;border-collapse:collapse;font-size:14px;"><thead><tr><th style="padding:8px 12px;text-align:left;border-bottom:2px solid #d4d4d8;">Voyageur</th><th style="padding:8px 12px;text-align:right;border-bottom:2px solid #d4d4d8;">Montant</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function travelerPricingText(
  travelers: Array<{ fullName: string; priceCents: number }>,
  currency: string,
): string {
  if (travelers.length === 0) {
    return '';
  }
  return `\nDétail par voyageur :\n${travelers
    .map((traveler) => `  - ${traveler.fullName}: ${formatMoney(traveler.priceCents, currency)}`)
    .join('\n')}\n`;
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

const APPROVED_EMAIL_COPY: Record<
  BookingDetailPdfLocale,
  {
    subject: string;
    headline: string;
    greeting: string;
    intro: string;
    amountLabel: string;
    body: string;
    cta: string;
    pdfNote: string;
    pdfNoteText: string;
  }
> = {
  fr: {
    subject: 'Réservation approuvée — échangez avec notre équipe',
    headline: 'Demande approuvée',
    greeting: 'Bonjour',
    intro: 'a été validée par notre équipe.',
    amountLabel: 'Montant',
    body: 'Vous pouvez échanger avec un conseiller via la messagerie dédiée, puis procéder au paiement lorsque vous serez prêt.',
    cta: 'Ouvrir la conversation',
    pdfNote:
      'Un récapitulatif détaillé de votre réservation est joint à ce message au format PDF.',
    pdfNoteText:
      '\nUn récapitulatif PDF détaillé de votre réservation est joint à ce message.',
  },
  en: {
    subject: 'Booking approved — chat with our team',
    headline: 'Request approved',
    greeting: 'Hello',
    intro: 'has been approved by our team.',
    amountLabel: 'Amount',
    body: 'You can chat with an advisor via our dedicated messaging, then complete payment when you are ready.',
    cta: 'Open conversation',
    pdfNote: 'A detailed PDF summary of your booking is attached to this email.',
    pdfNoteText: '\nA detailed PDF summary of your booking is attached to this email.',
  },
  es: {
    subject: 'Reserva aprobada — converse con nuestro equipo',
    headline: 'Solicitud aprobada',
    greeting: 'Hola',
    intro: 'ha sido aprobada por nuestro equipo.',
    amountLabel: 'Importe',
    body: 'Puede intercambiar con un asesor a través de la mensajería dedicada y pagar cuando esté listo.',
    cta: 'Abrir conversación',
    pdfNote:
      'Se adjunta a este mensaje un resumen detallado de su reserva en formato PDF.',
    pdfNoteText:
      '\nSe adjunta un resumen PDF detallado de su reserva a este mensaje.',
  },
};

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
  const locale = payload.locale ?? 'fr';
  const copy = APPROVED_EMAIL_COPY[locale];
  const name = escapeHtml(payload.firstName.trim() || 'Client');
  const subject = copy.subject;
  const total = escapeHtml(formatMoney(payload.totalCents, payload.currency));
  const pdfBlock = payload.hasPdfAttachment
    ? `<p style="margin:0 0 16px;line-height:1.6;font-size:14px;color:#5c6d66;">${escapeHtml(copy.pdfNote)}</p>`
    : '';
  const html = layout(
    subject,
    `<h1 style="margin:0 0 16px;font-size:22px;">${escapeHtml(copy.headline)}</h1>
<p style="margin:0 0 16px;line-height:1.6;">${escapeHtml(copy.greeting)} ${name},</p>
<p style="margin:0 0 16px;line-height:1.6;">${locale === 'fr' ? 'Bonne nouvelle : votre demande de réservation' : locale === 'en' ? 'Good news: your booking request' : 'Buenas noticias: su solicitud de reserva'} <strong>${bookingRef(payload.bookingId)}</strong> ${escapeHtml(copy.intro)}</p>
<p style="margin:0 0 8px;line-height:1.6;"><strong>${escapeHtml(copy.amountLabel)} :</strong> ${total}</p>
${itemListHtml(payload.itemTitles)}
${pdfBlock}
<p style="margin:0 0 16px;line-height:1.6;">${escapeHtml(copy.body)}</p>
${button(payload.chatUrl, copy.cta, branding)}`,
    branding,
    { webUrl: payload.webUrl },
  );
  const pdfText = payload.hasPdfAttachment ? copy.pdfNoteText : '';
  const text = `${copy.greeting} ${payload.firstName},\n\n${locale === 'fr' ? 'Votre demande' : locale === 'en' ? 'Your request' : 'Su solicitud'} ${payload.bookingId.slice(0, 8)} ${copy.intro} ${copy.amountLabel}: ${formatMoney(payload.totalCents, payload.currency)}.${pdfText}\n\n${copy.cta}: ${payload.chatUrl}`;
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
  const travelerBlock = payload.travelerPricing?.length
    ? travelerPricingHtml(payload.travelerPricing, payload.currency)
    : '';
  const html = layout(
    subject,
    `<h1 style="margin:0 0 16px;font-size:22px;">Finalisez votre réservation</h1>
<p style="margin:0 0 16px;line-height:1.6;">Bonjour ${name},</p>
<p style="margin:0 0 16px;line-height:1.6;">Votre réservation <strong>${bookingRef(payload.bookingId)}</strong> est prête. Cliquez ci-dessous pour régler <strong>${total}</strong> en toute sécurité via notre partenaire de paiement.</p>
${travelerBlock}
${itemListHtml(payload.itemTitles)}
${button(payload.paymentUrl, 'Payer maintenant', branding)}
<p style="margin:16px 0 0;font-size:13px;color:#71717a;line-height:1.5;">Ce lien est personnel. Si vous avez déjà payé, ignorez cet e-mail.</p>`,
    branding,
    { webUrl: payload.webUrl },
  );
  const text = `Bonjour ${payload.firstName},\n\nRéglez votre réservation ${payload.bookingId.slice(0, 8)} (${formatMoney(payload.totalCents, payload.currency)}) : ${payload.paymentUrl}${travelerPricingText(payload.travelerPricing ?? [], payload.currency)}`;
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

const IDENTITY_UPLOAD_EMAIL_COPY: Record<
  BookingDetailPdfLocale,
  {
    subject: string;
    headline: string;
    greeting: string;
    intro: string;
    travelerLabel: string;
    noteLabel: string;
    body: string;
    cta: string;
  }
> = {
  fr: {
    subject: 'Pièce d’identité requise pour votre réservation',
    headline: 'Document à déposer',
    greeting: 'Bonjour',
    intro:
      'Pour finaliser le traitement de votre réservation, nous avons besoin d’une pièce d’identité pour le voyageur suivant :',
    travelerLabel: 'Voyageur concerné',
    noteLabel: 'Instructions de notre équipe',
    body: 'Connectez-vous à votre espace client pour déposer une photo ou un scan lisible (passeport, carte d’identité ou autre pièce acceptée).',
    cta: 'Déposer ma pièce d’identité',
  },
  en: {
    subject: 'Identity document required for your booking',
    headline: 'Document to upload',
    greeting: 'Hello',
    intro:
      'To continue processing your booking, we need an identity document for the following traveler:',
    travelerLabel: 'Traveler',
    noteLabel: 'Instructions from our team',
    body: 'Sign in to your account to upload a clear photo or scan (passport, national ID, or other accepted document).',
    cta: 'Upload identity document',
  },
  es: {
    subject: 'Documento de identidad requerido para su reserva',
    headline: 'Documento a subir',
    greeting: 'Hola',
    intro:
      'Para continuar con el tratamiento de su reserva, necesitamos un documento de identidad para el siguiente viajero:',
    travelerLabel: 'Viajero',
    noteLabel: 'Instrucciones de nuestro equipo',
    body: 'Acceda a su cuenta para subir una foto o escaneo legible (pasaporte, documento de identidad u otro documento aceptado).',
    cta: 'Subir documento de identidad',
  },
};

export function renderBookingIdentityDocumentUploadRequestEmail(
  payload: BookingIdentityDocumentUploadRequestEmailPayload,
  branding: EmailBrandingValue,
): { subject: string; html: string; text: string } {
  const locale = payload.locale ?? 'fr';
  const copy = IDENTITY_UPLOAD_EMAIL_COPY[locale];
  const name = escapeHtml(payload.firstName.trim() || 'Client');
  const traveler = escapeHtml(payload.travelerName.trim());
  const subject = `${copy.subject} — ${payload.bookingId.slice(0, 8)}`;
  const noteBlock = payload.staffNote?.trim()
    ? `<p style="margin:16px 0;padding:12px 16px;background:#f4f6f5;border-radius:8px;border-left:4px solid #0d9488;line-height:1.6;"><strong>${escapeHtml(copy.noteLabel)} :</strong> ${escapeHtml(payload.staffNote.trim())}</p>`
    : '';
  const html = layout(
    subject,
    `<h1 style="margin:0 0 16px;font-size:22px;">${escapeHtml(copy.headline)}</h1>
<p style="margin:0 0 16px;line-height:1.6;">${escapeHtml(copy.greeting)} ${name},</p>
<p style="margin:0 0 16px;line-height:1.6;">${escapeHtml(copy.intro)}</p>
<p style="margin:0 0 8px;line-height:1.6;"><strong>${escapeHtml(copy.travelerLabel)} :</strong> ${traveler}</p>
<p style="margin:0 0 8px;line-height:1.6;"><strong>Réf. :</strong> ${bookingRef(payload.bookingId)}</p>
${noteBlock}
<p style="margin:0 0 16px;line-height:1.6;">${escapeHtml(copy.body)}</p>
${button(payload.uploadUrl, copy.cta, branding)}`,
    branding,
    { webUrl: payload.webUrl },
  );
  const noteText = payload.staffNote?.trim()
    ? `\n${copy.noteLabel} : ${payload.staffNote.trim()}\n`
    : '';
  const text = `${copy.greeting} ${payload.firstName},\n\n${copy.intro}\n${copy.travelerLabel} : ${payload.travelerName.trim()}\nRéf. : ${payload.bookingId.slice(0, 8)}${noteText}\n${copy.body}\n\n${payload.uploadUrl}`;
  return { subject, html, text };
}

const GUIDE_ASSIGNMENT_EMAIL_COPY: Record<
  BookingDetailPdfLocale,
  {
    subject: string;
    headline: string;
    greeting: string;
    intro: string;
    roleLabel: string;
    rolePrimary: string;
    roleSecondary: string;
    datesLabel: string;
    body: string;
    cta: string;
    pdfNote: string;
    pdfNoteText: string;
  }
> = {
  fr: {
    subject: 'Nouvelle mission — réservation assignée',
    headline: 'Mission assignée',
    greeting: 'Bonjour',
    intro: 'Vous avez été assigné(e) comme guide sur la réservation suivante :',
    roleLabel: 'Votre rôle',
    rolePrimary: 'Guide principal',
    roleSecondary: 'Guide secondaire',
    datesLabel: 'Dates de visite',
    body: 'Consultez le détail de la réservation dans l’espace d’administration pour préparer l’accompagnement.',
    cta: 'Voir la réservation',
    pdfNote:
      'Un récapitulatif détaillé de la réservation est joint à ce message au format PDF.',
    pdfNoteText:
      '\nUn récapitulatif PDF détaillé de la réservation est joint à ce message.',
  },
  en: {
    subject: 'New assignment — booking assigned to you',
    headline: 'Assignment confirmed',
    greeting: 'Hello',
    intro: 'You have been assigned as a guide on the following booking:',
    roleLabel: 'Your role',
    rolePrimary: 'Lead guide',
    roleSecondary: 'Secondary guide',
    datesLabel: 'Visit dates',
    body: 'Review the booking details in the admin area to prepare for the trip.',
    cta: 'View booking',
    pdfNote: 'A detailed PDF summary of the booking is attached to this email.',
    pdfNoteText: '\nA detailed PDF summary of the booking is attached to this email.',
  },
  es: {
    subject: 'Nueva misión — reserva asignada',
    headline: 'Misión asignada',
    greeting: 'Hola',
    intro: 'Ha sido asignado/a como guía en la siguiente reserva:',
    roleLabel: 'Su rol',
    rolePrimary: 'Guía principal',
    roleSecondary: 'Guía secundario',
    datesLabel: 'Fechas de visita',
    body: 'Consulte el detalle de la reserva en el espacio de administración para preparar el acompañamiento.',
    cta: 'Ver reserva',
    pdfNote:
      'Se adjunta a este mensaje un resumen detallado de la reserva en formato PDF.',
    pdfNoteText:
      '\nSe adjunta un resumen PDF detallado de la reserva a este mensaje.',
  },
};

function formatVisitDate(iso: string, locale: BookingDetailPdfLocale): string {
  const parts = iso.slice(0, 10).split('-').map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) {
    return iso;
  }
  const [year, month, day] = parts;
  const date = new Date(year, month - 1, day);
  const tag = locale === 'en' ? 'en-GB' : locale === 'es' ? 'es-ES' : 'fr-FR';
  return date.toLocaleDateString(tag, { day: 'numeric', month: 'long', year: 'numeric' });
}

function visitPeriodText(
  start: string | null | undefined,
  end: string | null | undefined,
  locale: BookingDetailPdfLocale,
): string | null {
  if (!start?.trim()) {
    return null;
  }
  const startLabel = formatVisitDate(start, locale);
  if (end?.trim() && end !== start) {
    return `${startLabel} – ${formatVisitDate(end, locale)}`;
  }
  return startLabel;
}

export function renderBookingGuideAssignmentEmail(
  payload: BookingGuideAssignmentEmailPayload,
  branding: EmailBrandingValue,
): { subject: string; html: string; text: string } {
  const locale = payload.locale ?? 'fr';
  const copy = GUIDE_ASSIGNMENT_EMAIL_COPY[locale];
  const name = escapeHtml(payload.guideName.trim() || 'Guide');
  const roleLabel =
    payload.role === 'primary' ? copy.rolePrimary : copy.roleSecondary;
  const visitPeriod = visitPeriodText(
    payload.visitStartDate,
    payload.visitEndDate,
    locale,
  );
  const subject = `${copy.subject} — ${payload.bookingId.slice(0, 8)}`;
  const datesBlock = visitPeriod
    ? `<p style="margin:0 0 8px;line-height:1.6;"><strong>${escapeHtml(copy.datesLabel)} :</strong> ${escapeHtml(visitPeriod)}</p>`
    : '';
  const ctaBlock = payload.adminUrl
    ? button(payload.adminUrl, copy.cta, branding)
    : '';
  const pdfBlock = payload.hasPdfAttachment
    ? `<p style="margin:0 0 16px;line-height:1.6;font-size:14px;color:#5c6d66;">${escapeHtml(copy.pdfNote)}</p>`
    : '';
  const html = layout(
    subject,
    `<h1 style="margin:0 0 16px;font-size:22px;">${escapeHtml(copy.headline)}</h1>
<p style="margin:0 0 16px;line-height:1.6;">${escapeHtml(copy.greeting)} ${name},</p>
<p style="margin:0 0 16px;line-height:1.6;">${escapeHtml(copy.intro)}</p>
<p style="margin:0 0 8px;line-height:1.6;"><strong>Réf. :</strong> ${bookingRef(payload.bookingId)}</p>
<p style="margin:0 0 8px;line-height:1.6;"><strong>${escapeHtml(copy.roleLabel)} :</strong> ${escapeHtml(roleLabel)}</p>
${datesBlock}
${itemListHtml(payload.itemTitles)}
${pdfBlock}
<p style="margin:0 0 16px;line-height:1.6;">${escapeHtml(copy.body)}</p>
${ctaBlock}`,
    branding,
    { webUrl: payload.webUrl },
  );
  const datesText = visitPeriod ? `\n${copy.datesLabel} : ${visitPeriod}` : '';
  const pdfText = payload.hasPdfAttachment ? copy.pdfNoteText : '';
  const text = `${copy.greeting} ${payload.guideName},\n\n${copy.intro}\nRéf. : ${payload.bookingId.slice(0, 8)}\n${copy.roleLabel} : ${roleLabel}${datesText}\n\n${itemListText(payload.itemTitles)}${pdfText}\n\n${copy.body}${payload.adminUrl ? `\n\n${payload.adminUrl}` : ''}`;
  return { subject, html, text };
}
