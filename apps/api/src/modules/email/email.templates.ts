import type { EmailBrandingValue } from '@africatourismgate/types';
import { DEFAULT_EMAIL_BRANDING } from './email-branding.constants';
import type {
  BookingConfirmationEmailPayload,
  PasswordResetEmailPayload,
  WelcomeEmailPayload,
} from './email.types';

const BRAND = {
  primary: '#0b6e4f',
  primaryDark: '#095a40',
  secondary: '#199a45',
  accent: '#d97706',
  accentLight: '#fef3c7',
  surface: '#f4f8f6',
  surfaceAlt: '#e8f5ef',
  border: '#d4e5de',
  text: '#0f1a16',
  muted: '#5c6d66',
  white: '#ffffff',
} as const;

const DEFAULT_WEB_URL = 'https://africatourismgate.org';
const LOGO_SIZE = 44;

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function primaryColor(branding: EmailBrandingValue): string {
  return branding.primaryColor ?? DEFAULT_EMAIL_BRANDING.primaryColor ?? '#0d9488';
}

function footerText(branding: EmailBrandingValue): string {
  return branding.footerText ?? DEFAULT_EMAIL_BRANDING.footerText ?? '';
}

function applySubjectTemplate(
  template: string,
  vars: { displayName: string; ref?: string },
): string {
  return template
    .replace(/\{displayName\}/g, vars.displayName)
    .replace(/\{ref\}/g, vars.ref ?? '');
}

function renderHeader(branding: EmailBrandingValue): string {
  const color = escapeHtml(primaryColor(branding));
  const name = escapeHtml(branding.displayName);

  if (branding.logoUrl?.trim()) {
    const logoUrl = escapeHtml(branding.logoUrl.trim());
    return `<p style="margin:0 0 24px;">
  <img src="${logoUrl}" alt="${name}" style="max-height:40px;max-width:200px;display:block;" />
</p>`;
  }

  return `<p style="margin:0 0 24px;font-size:13px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:${color};">${name}</p>`;
}

export function webBase(url?: string): string {
  return (url?.trim() || DEFAULT_WEB_URL).replace(/\/$/, '');
}

export function layout(
  title: string,
  bodyHtml: string,
  branding: EmailBrandingValue,
  options?: { footerNote?: string; webUrl?: string },
): string {
  const footer = escapeHtml(footerText(branding));
  const year = new Date().getFullYear();
  const base = webBase(options?.webUrl);
  const footerNoteBlock = options?.footerNote
    ? `<p style="margin:0 0 12px;font-size:13px;line-height:1.55;color:${BRAND.muted};">${escapeHtml(options.footerNote)}</p>`
    : '';
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${escapeHtml(title)}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td { font-family: Arial, Helvetica, sans-serif !important; }
  </style>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background:${BRAND.surface};font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${BRAND.text};-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(title)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.surface};padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:${BRAND.white};border-radius:20px;overflow:hidden;box-shadow:0 8px 32px rgba(11,110,79,0.14);border:1px solid ${BRAND.border};">
          <!-- En-tête minimal : logo + nom -->
          <tr>
            <td>
              ${renderHeader(branding)}
              ${bodyHtml}
            </td>
          </tr>
          <!-- Trust bar -->
          <tr>
            <td style="padding:0 36px 8px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.surface};border-radius:12px;border:1px solid ${BRAND.border};">
                <tr>
                  <td style="padding:14px 10px;text-align:center;font-size:11px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:${BRAND.muted};width:33%;">🔒 Paiement sécurisé</td>
                  <td style="padding:14px 10px;text-align:center;font-size:11px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:${BRAND.muted};width:34%;border-left:1px solid ${BRAND.border};border-right:1px solid ${BRAND.border};">🌍 Destinations vérifiées</td>
                  <td style="padding:14px 10px;text-align:center;font-size:11px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:${BRAND.muted};width:33%;">💬 Support dédié</td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 36px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${BRAND.border};padding-top:24px;">
                <tr>
                  <td style="text-align:center;">
                    ${footerNoteBlock}
                    <p style="margin:0 0 10px;font-size:13px;color:${BRAND.muted};">
                      <a href="${escapeHtml(base)}" style="color:${BRAND.primary};text-decoration:none;font-weight:600;">Site web</a>
                      &nbsp;·&nbsp;
                      <a href="mailto:service@africatourismgate.org" style="color:${BRAND.primary};text-decoration:none;font-weight:600;">service@africatourismgate.org</a>
                      &nbsp;·&nbsp;
                      <a href="mailto:support@africatourismgate.org" style="color:${BRAND.primary};text-decoration:none;font-weight:600;">Support</a>
                    </p>
                    <p style="margin:0;font-size:12px;color:${BRAND.muted};">© ${year} Africa Tourism Gate. Tous droits réservés.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0;font-size:12px;color:#71717a;">${footer}</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function button(href: string, label: string, branding: EmailBrandingValue): string {
  const safeHref = escapeHtml(href);
  const bg = escapeHtml(primaryColor(branding));
  return `<p style="margin:24px 0;">
  <a href="${safeHref}" style="display:inline-block;padding:12px 24px;background:${bg};color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;">${escapeHtml(label)}</a>
</p>
<p style="margin:0;font-size:13px;color:#71717a;word-break:break-all;">${safeHref}</p>`;
}

export function formatMoney(cents: number, currency: string): string {
  try {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency}`;
  }
}

function formatDateFr(iso?: string): string {
  const date = iso ? new Date(iso) : new Date();
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(date);
  } catch {
    return iso ?? '';
  }
}

export function renderPasswordResetEmail(
  payload: PasswordResetEmailPayload,
  branding: EmailBrandingValue,
): { subject: string; html: string; text: string } {
  const name = escapeHtml(payload.firstName.trim() || 'Client');
  const subject = 'Réinitialisation de votre mot de passe';
  const html = layout(
    subject,
    `<h1 style="margin:0 0 16px;font-size:22px;">Réinitialisation du mot de passe</h1>
<p style="margin:0 0 16px;line-height:1.6;">Bonjour ${name},</p>
<p style="margin:0 0 16px;line-height:1.6;">Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous (lien valide 1 heure) :</p>
${button(payload.resetUrl, 'Réinitialiser mon mot de passe', branding)}
<p style="margin:16px 0 0;font-size:13px;color:#71717a;line-height:1.5;">Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.</p>`,
    branding,
  );
  const text = `Bonjour ${payload.firstName},\n\nRéinitialisez votre mot de passe : ${payload.resetUrl}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.`;
  return { subject, html, text };
}

export function renderWelcomeEmail(
  payload: WelcomeEmailPayload,
  branding: EmailBrandingValue,
): { subject: string; html: string; text: string } {
  const name = escapeHtml(payload.firstName.trim() || 'Client');
  const subject = applySubjectTemplate(
    branding.welcomeSubject ?? 'Bienvenue sur {displayName}',
    { displayName: branding.displayName },
  );
  const html = layout(
    subject,
    `<h1 style="margin:0 0 16px;font-size:22px;">Bienvenue !</h1>
<p style="margin:0 0 16px;line-height:1.6;">Bonjour ${name},</p>
<p style="margin:0 0 16px;line-height:1.6;">Votre compte a été créé avec succès. Vous pouvez dès maintenant vous connecter et réserver vos expériences de voyage en Afrique.</p>
<p style="margin:0;line-height:1.6;">Merci de nous faire confiance.</p>`,
    branding,
  );
  const text = `Bonjour ${payload.firstName},\n\nBienvenue sur ${branding.displayName}. Votre compte a été créé avec succès.`;
  return { subject, html, text };
}

export function renderBookingConfirmationEmail(
  payload: BookingConfirmationEmailPayload,
  branding: EmailBrandingValue,
): { subject: string; html: string; text: string } {
  const name = escapeHtml(payload.firstName.trim() || 'Client');
  const total = escapeHtml(formatMoney(payload.totalCents, payload.currency));
  const ref = escapeHtml(payload.bookingId);
  const refShort = payload.bookingId.slice(0, 8);
  const items =
    payload.itemTitles.length > 0
      ? `<ul style="margin:8px 0 16px;padding-left:20px;line-height:1.6;">${payload.itemTitles
          .map((t) => `<li>${escapeHtml(t)}</li>`)
          .join('')}</ul>`
      : '';
  const subject = applySubjectTemplate(
    branding.bookingSubject ?? 'Confirmation de réservation — {ref}',
    { displayName: branding.displayName, ref: refShort },
  );
  const html = layout(
    subject,
    `<h1 style="margin:0 0 16px;font-size:22px;">Réservation confirmée</h1>
<p style="margin:0 0 16px;line-height:1.6;">Bonjour ${name},</p>
<p style="margin:0 0 8px;line-height:1.6;">Votre réservation <strong>${ref}</strong> est confirmée.</p>
<p style="margin:0 0 8px;line-height:1.6;"><strong>Total :</strong> ${total}</p>
${items}
<p style="margin:16px 0 0;line-height:1.6;">Conservez cet e-mail pour vos archives.</p>`,
    branding,
  );
  const itemsText =
    payload.itemTitles.length > 0
      ? payload.itemTitles.map((t, i) => `  ${i + 1}. ${t}`).join('\n')
      : '';
  const reservationsUrl = `${webBase(payload.webUrl)}/account/reservations`;
  const text = `Bonjour ${payload.firstName},\n\nRéservation ${payload.bookingId} confirmée le ${formatDateFr(payload.confirmedAt)}.\n\n${itemsText}\n\nTotal : ${formatMoney(payload.totalCents, payload.currency)}\n\nVoir : ${reservationsUrl}`;
  return { subject, html, text };
}
