import type { EmailBrandingValue } from '@africatourismgate/types';
import { button, escapeHtml, layout, webBase } from './email.templates';
import type {
  ActivityBookingRequestAdminEmailPayload,
  ActivityBookingRequestCustomerEmailPayload,
} from './email.types';

function requestRef(requestId: string): string {
  return escapeHtml(requestId.slice(0, 8));
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
