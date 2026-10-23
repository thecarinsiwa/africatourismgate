import type { EmailBrandingValue } from '@africatourismgate/types';
import { button, escapeHtml, layout, webBase } from './email.templates';
import type {
  ActivityBookingRequestAdminEmailPayload,
  ActivityBookingRequestCustomerEmailPayload,
  ActivityBookingRequestStatusEmailPayload,
} from './email.types';

export type ActivityBookingRequestAvailability =
  | 'available'
  | 'unavailable'
  | 'in_progress'
  | 'pending_review';

function requestRef(requestId: string): string {
  return escapeHtml(requestId.slice(0, 8));
}

export function availabilityForBookingRequestStatus(
  status: ActivityBookingRequestStatusEmailPayload['status'],
): ActivityBookingRequestAvailability {
  switch (status) {
    case 'confirmed':
      return 'available';
    case 'cancelled':
      return 'unavailable';
    case 'contacted':
      return 'in_progress';
    case 'pending':
    default:
      return 'pending_review';
  }
}

function statusEmailCopy(
  status: ActivityBookingRequestStatusEmailPayload['status'],
): {
  subjectPrefix: string;
  heading: string;
  statusLabel: string;
  availabilityLabel: string;
  body: string;
} {
  switch (status) {
    case 'confirmed':
      return {
        subjectPrefix: 'Slot available',
        heading: 'Créneau rendu disponible',
        statusLabel: 'Confirmée',
        availabilityLabel: 'Créneau disponible',
        body: 'Bonne nouvelle : un créneau a été rendu disponible pour votre demande. Notre équipe vous recontactera pour finaliser la réservation (aucun paiement n’a encore été effectué).',
      };
    case 'cancelled':
      return {
        subjectPrefix: 'Still unavailable',
        heading: 'Toujours indisponible',
        statusLabel: 'Annulée',
        availabilityLabel: 'Toujours indisponible',
        body: 'Malheureusement, aucun créneau n’est disponible pour le moment pour votre demande. Vous pouvez nous écrire à nouveau plus tard ou consulter d’autres dates sur le site.',
      };
    case 'contacted':
      return {
        subjectPrefix: 'We contacted you',
        heading: 'Disponibilité en cours de vérification',
        statusLabel: 'Contactée',
        availabilityLabel: 'Disponibilité en cours de vérification',
        body: 'Notre équipe a pris en charge votre demande et vous contacte. La disponibilité d’un créneau n’est pas encore confirmée.',
      };
    case 'pending':
    default:
      return {
        subjectPrefix: 'Request under review',
        heading: 'Demande en cours d’examen',
        statusLabel: 'En attente',
        availabilityLabel: 'En attente de confirmation',
        body: 'Votre demande est actuellement en cours d’examen. Nous vous informerons dès qu’un créneau pourra être confirmé ou si l’activité reste indisponible.',
      };
  }
}

export function renderActivityBookingRequestStatusEmail(
  payload: ActivityBookingRequestStatusEmailPayload,
  branding: EmailBrandingValue,
): { subject: string; html: string; text: string } {
  const copy = statusEmailCopy(payload.status);
  const name = escapeHtml(payload.fullName.trim() || 'Client');
  const activityTitle = escapeHtml(payload.activityTitle);
  const subject = `${copy.subjectPrefix} – ${payload.activityTitle}`;
  const webUrl = webBase(payload.webUrl);
  const availability = availabilityForBookingRequestStatus(payload.status);
  const availabilityColor =
    availability === 'available'
      ? '#15803d'
      : availability === 'unavailable'
        ? '#b91c1c'
        : '#a16207';

  const html = layout(
    subject,
    `<h1 style="margin:0 0 16px;font-size:22px;">${escapeHtml(copy.heading)}</h1>
<p style="margin:0 0 16px;line-height:1.6;">Bonjour ${name},</p>
<p style="margin:0 0 16px;line-height:1.6;">${escapeHtml(copy.body)}</p>
<p style="margin:0 0 8px;line-height:1.6;"><strong>Activité :</strong> ${activityTitle}</p>
<p style="margin:0 0 8px;line-height:1.6;"><strong>Statut :</strong> ${escapeHtml(copy.statusLabel)}</p>
<p style="margin:0 0 16px;line-height:1.6;"><strong>Disponibilité :</strong> <span style="color:${availabilityColor};font-weight:600;">${escapeHtml(copy.availabilityLabel)}</span></p>
<p style="margin:0 0 8px;line-height:1.6;"><strong>Référence :</strong> ${requestRef(payload.requestId)}</p>
<p style="margin:0 0 8px;line-height:1.6;"><strong>Date souhaitée :</strong> ${escapeHtml(payload.preferredDate)}</p>
<p style="margin:0 0 16px;line-height:1.6;"><strong>Participants :</strong> ${payload.participants}</p>
${button(webUrl, 'Visiter le site', branding)}`,
    branding,
    { webUrl: payload.webUrl },
  );

  const text = `Bonjour ${payload.fullName},

${copy.body}

Activité : ${payload.activityTitle}
Statut : ${copy.statusLabel}
Disponibilité : ${copy.availabilityLabel}
Référence : ${payload.requestId.slice(0, 8)}
Date souhaitée : ${payload.preferredDate}
Participants : ${payload.participants}

${webUrl}`;

  return { subject, html, text };
}

export function renderActivityBookingRequestCustomerEmail(
  payload: ActivityBookingRequestCustomerEmailPayload,
  branding: EmailBrandingValue,
): { subject: string; html: string; text: string } {
  const name = escapeHtml(payload.fullName.trim() || 'Client');
  const activityTitle = escapeHtml(payload.activityTitle);
  const subject = `We've received your booking request – ${payload.activityTitle}`;
  const webUrl = webBase(payload.webUrl);

  const html = layout(
    subject,
    `<h1 style="margin:0 0 16px;font-size:22px;">Demande reçue</h1>
<p style="margin:0 0 16px;line-height:1.6;">Bonjour ${name},</p>
<p style="margin:0 0 16px;line-height:1.6;">Nous avons bien reçu votre demande de réservation pour <strong>${activityTitle}</strong>. Notre équipe vous recontactera rapidement pour confirmer la disponibilité.</p>
<p style="margin:0 0 8px;line-height:1.6;"><strong>Référence :</strong> ${requestRef(payload.requestId)}</p>
<p style="margin:0 0 8px;line-height:1.6;"><strong>Date souhaitée :</strong> ${escapeHtml(payload.preferredDate)}</p>
<p style="margin:0 0 16px;line-height:1.6;"><strong>Participants :</strong> ${payload.participants}</p>
<p style="margin:0 0 16px;line-height:1.6;font-size:14px;color:#5c6d66;"><strong>Important :</strong> cette demande n'est <em>pas encore une réservation confirmée</em>. Aucun paiement n'a été effectué.</p>
${button(webUrl, 'Visiter le site', branding)}`,
    branding,
    { webUrl: payload.webUrl },
  );

  const text = `Bonjour ${payload.fullName},

Nous avons reçu votre demande de réservation pour « ${payload.activityTitle} ».
Référence : ${payload.requestId.slice(0, 8)}
Date souhaitée : ${payload.preferredDate}
Participants : ${payload.participants}

Cette demande n'est pas encore une réservation confirmée. Notre équipe vous recontactera pour confirmer la disponibilité.

${webUrl}`;

  return { subject, html, text };
}

export function renderActivityBookingRequestAdminEmail(
  payload: ActivityBookingRequestAdminEmailPayload,
  branding: EmailBrandingValue,
): { subject: string; html: string; text: string } {
  const activityTitle = escapeHtml(payload.activityTitle);
  const subject = `Nouvelle demande de réservation — ${payload.activityTitle}`;
  const phoneRow = payload.phone?.trim()
    ? `<p style="margin:0 0 8px;line-height:1.6;"><strong>Téléphone :</strong> ${escapeHtml(payload.phone.trim())}</p>`
    : '';
  const messageRow = payload.message?.trim()
    ? `<p style="margin:0 0 16px;line-height:1.6;"><strong>Message :</strong><br/>${escapeHtml(payload.message.trim())}</p>`
    : '';
  const cta = payload.adminUrl
    ? button(payload.adminUrl, "Voir l'activité", branding)
    : '';

  const html = layout(
    subject,
    `<h1 style="margin:0 0 16px;font-size:22px;">Demande sans créneau</h1>
<p style="margin:0 0 16px;line-height:1.6;">Une demande de réservation a été soumise pour <strong>${activityTitle}</strong> (aucun créneau disponible).</p>
<p style="margin:0 0 8px;line-height:1.6;"><strong>Référence :</strong> ${requestRef(payload.requestId)}</p>
<p style="margin:0 0 8px;line-height:1.6;"><strong>Nom :</strong> ${escapeHtml(payload.fullName)}</p>
<p style="margin:0 0 8px;line-height:1.6;"><strong>E-mail :</strong> ${escapeHtml(payload.email)}</p>
${phoneRow}
<p style="margin:0 0 8px;line-height:1.6;"><strong>Date souhaitée :</strong> ${escapeHtml(payload.preferredDate)}</p>
<p style="margin:0 0 16px;line-height:1.6;"><strong>Participants :</strong> ${payload.participants}</p>
${messageRow}
${cta}`,
    branding,
    { webUrl: payload.webUrl },
  );

  const text = `Nouvelle demande de réservation (sans créneau)

Activité : ${payload.activityTitle}
Référence : ${payload.requestId.slice(0, 8)}
Nom : ${payload.fullName}
E-mail : ${payload.email}
${payload.phone?.trim() ? `Téléphone : ${payload.phone.trim()}\n` : ''}Date souhaitée : ${payload.preferredDate}
Participants : ${payload.participants}
${payload.message?.trim() ? `Message : ${payload.message.trim()}\n` : ''}${payload.adminUrl ? `\n${payload.adminUrl}` : ''}`;

  return { subject, html, text };
}
