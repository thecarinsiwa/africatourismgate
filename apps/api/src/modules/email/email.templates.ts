import type { EmailBrandingValue } from '@africatourismgate/types';
import { resolveEmailLogoUrl } from './email-attachments';
import { DEFAULT_EMAIL_BRANDING } from './email-branding.constants';
import type {
  AbandonmentReminderEmailPayload,
  BookingConfirmationEmailPayload,
  LoginNotificationEmailPayload,
  OperationAlertEmailPayload,
  PasswordResetEmailPayload,
  WelcomeEmailPayload,
} from './email.types';

const BRAND = {
  primary: '#0b6e4f',
  primaryDark: '#064e3b',
  secondary: '#199a45',
  accent: '#d97706',
  accentLight: '#fef3c7',
  surface: '#eef4f1',
  surfaceAlt: '#e8f5ef',
  border: '#c8ddd4',
  text: '#0f1a16',
  muted: '#5c6d66',
  white: '#ffffff',
} as const;

const DEFAULT_WEB_URL = 'https://africatourismgate.org';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function primaryColor(branding: EmailBrandingValue): string {
  return branding.primaryColor ?? DEFAULT_EMAIL_BRANDING.primaryColor ?? BRAND.primary;
}

function secondaryColor(branding: EmailBrandingValue): string {
  return branding.secondaryColor ?? BRAND.secondary;
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

function webBase(url?: string): string {
  return (url?.trim() || DEFAULT_WEB_URL).replace(/\/$/, '');
}

function darkenHex(hex: string, amount = 0.15): string {
  const match = /^#?([0-9a-fA-F]{6})$/.exec(hex.trim());
  if (!match) return BRAND.primaryDark;
  const num = parseInt(match[1], 16);
  const r = Math.max(0, ((num >> 16) & 0xff) * (1 - amount)) | 0;
  const g = Math.max(0, ((num >> 8) & 0xff) * (1 - amount)) | 0;
  const b = Math.max(0, (num & 0xff) * (1 - amount)) | 0;
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

function resolveLogoUrl(branding: EmailBrandingValue): string | undefined {
  const fromBranding = branding.logoUrl?.trim();
  if (fromBranding) return fromBranding;
  try {
    return resolveEmailLogoUrl();
  } catch {
    return undefined;
  }
}

function renderHeroHeader(branding: EmailBrandingValue): string {
  const primary = escapeHtml(primaryColor(branding));
  const primaryDark = escapeHtml(darkenHex(primaryColor(branding), 0.22));
  const name = escapeHtml(branding.displayName);
  const logoUrl = resolveLogoUrl(branding);

  const logoBlock = logoUrl
    ? `<img src="${escapeHtml(logoUrl)}" alt="${name}" width="160" style="display:block;max-width:160px;max-height:52px;width:auto;height:auto;margin:0 auto;border:0;outline:none;" />`
    : `<p style="margin:0;font-size:18px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${BRAND.white};">${name}</p>`;

  return `<tr>
  <td style="padding:0;background:${primary};background-image:linear-gradient(135deg,${primary} 0%,${primaryDark} 100%);">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:36px 32px 28px;text-align:center;">
          ${logoBlock}
          <p style="margin:14px 0 0;font-size:13px;line-height:1.5;color:rgba(255,255,255,0.88);letter-spacing:0.02em;">Votre porte d'entrée vers l'Afrique authentique</p>
        </td>
      </tr>
      <tr>
        <td style="height:6px;background:${BRAND.accent};font-size:0;line-height:0;">&nbsp;</td>
      </tr>
    </table>
  </td>
</tr>`;
}

function renderTrustBar(branding: EmailBrandingValue): string {
  const primary = escapeHtml(primaryColor(branding));
  const secondary = escapeHtml(secondaryColor(branding));
  const accent = BRAND.accent;

  const pillar = (
    color: string,
    glyph: string,
    title: string,
    subtitle: string,
    borderLeft?: string,
  ) => `<td class="trust-col" style="padding:18px 14px;text-align:center;width:33.33%;vertical-align:top;${borderLeft ?? ''}">
  <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 10px;">
    <tr>
      <td align="center" style="width:44px;height:44px;border-radius:22px;background:${color};color:${BRAND.white};font-size:16px;font-weight:700;line-height:44px;text-align:center;">${glyph}</td>
    </tr>
  </table>
  <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${BRAND.text};">${title}</p>
  <p style="margin:0;font-size:12px;line-height:1.45;color:${BRAND.muted};">${subtitle}</p>
</td>`;

  return `<tr>
  <td style="padding:0 32px 8px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.surfaceAlt};border-radius:14px;border:1px solid ${BRAND.border};">
      <tr>
        ${pillar(primary, '&#10003;', 'Paiement sécurisé', 'Transactions chiffrées', '')}
        ${pillar(secondary, '&#9679;', 'Destinations vérifiées', 'Partenaires de confiance', `border-left:1px solid ${BRAND.border};`)}
        ${pillar(accent, '&#9993;', 'Support dédié', 'Équipe à votre écoute', `border-left:1px solid ${BRAND.border};`)}
      </tr>
    </table>
  </td>
</tr>`;
}

function ctaButton(
  href: string,
  label: string,
  branding: EmailBrandingValue,
): string {
  const safeHref = escapeHtml(href);
  const bg = escapeHtml(primaryColor(branding));
  const bgDark = escapeHtml(darkenHex(primaryColor(branding), 0.12));
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 8px;">
  <tr>
    <td align="center" style="border-radius:10px;background:${bg};background-image:linear-gradient(180deg,${bg} 0%,${bgDark} 100%);">
      <!--[if mso]>
      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${safeHref}" style="height:48px;v-text-anchor:middle;width:280px;" arcsize="18%" strokecolor="${bg}" fillcolor="${bg}">
        <w:anchorlock/>
        <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:16px;font-weight:bold;">${escapeHtml(label)}</center>
      </v:roundrect>
      <![endif]-->
      <!--[if !mso]><!-->
      <a href="${safeHref}" target="_blank" style="display:inline-block;padding:15px 32px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;font-weight:700;line-height:1.2;color:${BRAND.white};text-decoration:none;border-radius:10px;background:${bg};background-image:linear-gradient(180deg,${bg} 0%,${bgDark} 100%);">${escapeHtml(label)}</a>
      <!--<![endif]-->
    </td>
  </tr>
</table>`;
}

function mutedLink(href: string, label: string): string {
  return `<a href="${escapeHtml(href)}" style="color:${BRAND.primary};text-decoration:none;font-weight:600;">${escapeHtml(label)}</a>`;
}

function headline(text: string, branding: EmailBrandingValue): string {
  const accent = escapeHtml(primaryColor(branding));
  return `<h1 style="margin:0 0 8px;font-size:28px;font-weight:700;line-height:1.25;color:${BRAND.text};letter-spacing:-0.02em;">${escapeHtml(text)}</h1>
<p style="margin:0 0 24px;width:48px;height:3px;background:${accent};border-radius:2px;font-size:0;line-height:0;">&nbsp;</p>`;
}

function paragraph(text: string): string {
  return `<p style="margin:0 0 16px;font-size:16px;line-height:1.65;color:${BRAND.text};">${text}</p>`;
}

function infoCard(
  rows: Array<{ label: string; value: string; highlight?: boolean }>,
  branding: EmailBrandingValue,
): string {
  const primary = escapeHtml(primaryColor(branding));
  const rowsHtml = rows
    .map((row, index) => {
      const borderTop =
        index > 0 ? `border-top:1px solid ${BRAND.border};` : '';
      if (row.highlight) {
        return `<tr>
  <td colspan="2" style="padding:16px 20px;${borderTop}background:${BRAND.surfaceAlt};border-radius:0 0 12px 12px;">
    <p style="margin:0 0 4px;font-size:12px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;color:${BRAND.muted};">${escapeHtml(row.label)}</p>
    <p style="margin:0;font-size:22px;font-weight:700;color:${primary};">${row.value}</p>
  </td>
</tr>`;
      }
      return `<tr>
  <td style="padding:14px 20px;${borderTop}font-size:13px;font-weight:600;color:${BRAND.muted};width:38%;vertical-align:top;">${escapeHtml(row.label)}</td>
  <td style="padding:14px 20px;${borderTop}font-size:15px;font-weight:600;color:${BRAND.text};vertical-align:top;">${row.value}</td>
</tr>`;
    })
    .join('');

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 20px;border:1px solid ${BRAND.border};border-radius:12px;overflow:hidden;background:${BRAND.white};">
  ${rowsHtml}
</table>`;
}

function noticeBox(text: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 0;border-radius:10px;background:${BRAND.accentLight};border:1px solid #fcd34d;">
  <tr>
    <td style="padding:14px 16px;font-size:13px;line-height:1.55;color:#92400e;">${text}</td>
  </tr>
</table>`;
}

function layout(
  title: string,
  bodyHtml: string,
  branding: EmailBrandingValue,
  options?: { footerNote?: string; webUrl?: string; preheader?: string },
): string {
  const footer = escapeHtml(footerText(branding));
  const year = new Date().getFullYear();
  const base = webBase(options?.webUrl);
  const preheader = escapeHtml(options?.preheader ?? title);
  const footerNoteBlock = options?.footerNote
    ? `<p style="margin:0 0 14px;font-size:13px;line-height:1.55;color:${BRAND.muted};">${escapeHtml(options.footerNote)}</p>`
    : '';

  return `<!DOCTYPE html>
<html lang="fr" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>${escapeHtml(title)}</title>
  <style>
    @media only screen and (max-width: 620px) {
      .email-shell { padding: 16px 8px !important; }
      .email-body { padding: 28px 22px !important; }
      .trust-col { display: block !important; width: 100% !important; border-left: none !important; border-top: 1px solid ${BRAND.border} !important; }
      .trust-col:first-child { border-top: none !important; }
      .footer-links a { display: block !important; margin: 6px 0 !important; }
    }
  </style>
  <!--[if mso]>
  <style type="text/css">
    body, table, td { font-family: Arial, Helvetica, sans-serif !important; }
  </style>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background:${BRAND.surface};font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${BRAND.text};-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all;">${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
  <table role="presentation" class="email-shell" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.surface};padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:${BRAND.white};border-radius:16px;overflow:hidden;box-shadow:0 12px 40px rgba(11,110,79,0.12);border:1px solid ${BRAND.border};">
          ${renderHeroHeader(branding)}
          <tr>
            <td class="email-body" style="padding:36px 36px 12px;">
              ${bodyHtml}
            </td>
          </tr>
          ${renderTrustBar(branding)}
          <tr>
            <td style="padding:16px 32px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${BRAND.border};padding-top:24px;">
                <tr>
                  <td style="text-align:center;">
                    ${footerNoteBlock}
                    <p class="footer-links" style="margin:0 0 12px;font-size:14px;line-height:1.8;color:${BRAND.muted};">
                      ${mutedLink(base, 'Site web')}
                      <span style="color:${BRAND.border};">&nbsp;&nbsp;|&nbsp;&nbsp;</span>
                      ${mutedLink('mailto:service@africatourismgate.org', 'service@africatourismgate.org')}
                      <span style="color:${BRAND.border};">&nbsp;&nbsp;|&nbsp;&nbsp;</span>
                      ${mutedLink('mailto:support@africatourismgate.org', 'Support')}
                    </p>
                    <p style="margin:0;font-size:12px;color:${BRAND.muted};">© ${year} Africa Tourism Gate · Tous droits réservés</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <p style="margin:18px 0 0;font-size:12px;line-height:1.5;color:#71717a;text-align:center;">${footer}</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
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
    `${headline('Réinitialisation du mot de passe', branding)}
${paragraph(`Bonjour <strong>${name}</strong>,`)}
${paragraph('Vous avez demandé à réinitialiser votre mot de passe. Utilisez le bouton ci-dessous — ce lien est valide <strong>1 heure</strong>.')}
${ctaButton(payload.resetUrl, 'Réinitialiser mon mot de passe', branding)}
${noticeBox('Si vous n\'êtes pas à l\'origine de cette demande, ignorez cet e-mail. Votre mot de passe actuel reste inchangé.')}
<p style="margin:16px 0 0;font-size:12px;line-height:1.5;color:${BRAND.muted};word-break:break-all;">Lien direct : ${escapeHtml(payload.resetUrl)}</p>`,
    branding,
    {
      preheader: 'Réinitialisez votre mot de passe en un clic — lien valide 1 heure.',
    },
  );
  const text = `Bonjour ${payload.firstName},\n\nRéinitialisez votre mot de passe : ${payload.resetUrl}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.`;
  return { subject, html, text };
}

export function renderWelcomeEmail(
  payload: WelcomeEmailPayload,
  branding: EmailBrandingValue,
): { subject: string; html: string; text: string } {
  const name = escapeHtml(payload.firstName.trim() || 'Client');
  const base = webBase(payload.webUrl);
  const loginUrl = `${base}/login`;
  const exploreUrl = base;
  const subject = applySubjectTemplate(
    branding.welcomeSubject ?? 'Bienvenue sur {displayName}',
    { displayName: branding.displayName },
  );
  const html = layout(
    subject,
    `${headline('Bienvenue !', branding)}
${paragraph(`Bonjour <strong>${name}</strong>,`)}
${paragraph('Votre compte a été créé avec succès. Vous pouvez dès maintenant explorer nos expériences de voyage — safaris, croisières, hébergements et bien plus — et réserver en toute confiance.')}
${ctaButton(exploreUrl, 'Découvrir nos expériences', branding)}
<p style="margin:0;font-size:14px;line-height:1.6;color:${BRAND.muted};">Déjà prêt à réserver ? ${mutedLink(loginUrl, 'Connectez-vous à votre espace')}</p>
${paragraph('Merci de nous faire confiance pour vos aventures en Afrique.')}`,
    branding,
    {
      webUrl: payload.webUrl,
      preheader: 'Votre compte est prêt — explorez des expériences authentiques à travers l\'Afrique.',
    },
  );
  const text = `Bonjour ${payload.firstName},\n\nBienvenue sur ${branding.displayName}. Votre compte a été créé avec succès.\n\nExplorer : ${exploreUrl}\nSe connecter : ${loginUrl}`;
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
  const confirmedLabel = escapeHtml(formatDateFr(payload.confirmedAt));
  const reservationsUrl = `${webBase(payload.webUrl)}/account/reservations`;

  const itemRows =
    payload.itemTitles.length > 0
      ? payload.itemTitles
          .map(
            (t) =>
              `<li style="margin:0 0 6px;font-size:15px;line-height:1.5;color:${BRAND.text};">${escapeHtml(t)}</li>`,
          )
          .join('')
      : '';

  const itemsBlock = itemRows
    ? `<ul style="margin:0;padding-left:18px;">${itemRows}</ul>`
    : `<span style="color:${BRAND.muted};">—</span>`;

  const cardRows: Array<{ label: string; value: string; highlight?: boolean }> =
    [
      { label: 'Référence', value: `<span style="font-family:Consolas,Monaco,monospace;letter-spacing:0.04em;">${ref}</span>` },
      { label: 'Confirmée le', value: confirmedLabel },
      { label: 'Prestations', value: itemsBlock },
      { label: 'Montant total', value: total, highlight: true },
    ];

  const subject = applySubjectTemplate(
    branding.bookingSubject ?? 'Confirmation de réservation — {ref}',
    { displayName: branding.displayName, ref: refShort },
  );
  const html = layout(
    subject,
    `${headline('Réservation confirmée', branding)}
${paragraph(`Bonjour <strong>${name}</strong>,`)}
${paragraph('Bonne nouvelle — votre réservation est confirmée. Retrouvez le récapitulatif ci-dessous et conservez cet e-mail pour vos archives.')}
${infoCard(cardRows, branding)}
${ctaButton(reservationsUrl, 'Voir ma réservation', branding)}
<p style="margin:0;font-size:13px;line-height:1.55;color:${BRAND.muted};">Une question ? Écrivez-nous à ${mutedLink('mailto:support@africatourismgate.org', 'support@africatourismgate.org')}</p>`,
    branding,
    {
      webUrl: payload.webUrl,
      preheader: `Réservation ${refShort} confirmée — total ${total}.`,
    },
  );
  const itemsText =
    payload.itemTitles.length > 0
      ? payload.itemTitles.map((t, i) => `  ${i + 1}. ${t}`).join('\n')
      : '';
  const text = `Bonjour ${payload.firstName},\n\nRéservation ${payload.bookingId} confirmée le ${formatDateFr(payload.confirmedAt)}.\n\n${itemsText}\n\nTotal : ${formatMoney(payload.totalCents, payload.currency)}\n\nVoir : ${reservationsUrl}`;
  return { subject, html, text };
}

function operationPurposeLabel(
  purpose: OperationAlertEmailPayload['purpose'],
): string {
  switch (purpose) {
    case 'register':
      return 'création de compte';
    case 'google_signup':
      return 'inscription via Google';
    case 'booking':
      return 'réservation';
    case 'login':
      return 'connexion';
    default:
      return 'opération';
  }
}

function codeDisplayBlock(code: string, branding: EmailBrandingValue): string {
  const primary = escapeHtml(primaryColor(branding));
  const digits = code.split('').map(
    (d) =>
      `<td style="width:44px;height:52px;border-radius:10px;background:${BRAND.surfaceAlt};border:2px solid ${BRAND.border};font-size:24px;font-weight:700;color:${primary};text-align:center;vertical-align:middle;">${escapeHtml(d)}</td>`,
  ).join('<td style="width:8px;"></td>');
  return `<table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:24px auto;">
  <tr>${digits}</tr>
</table>`;
}

export function renderOperationAlertEmail(
  payload: OperationAlertEmailPayload,
  branding: EmailBrandingValue,
): { subject: string; html: string; text: string } {
  const name = escapeHtml(payload.firstName.trim() || 'Client');
  const operation = operationPurposeLabel(payload.purpose);
  const base = webBase(payload.webUrl);
  const verifyUrl = `${base}/booking/verify?verificationId=${encodeURIComponent(payload.verificationId)}`;
  const safeCode = escapeHtml(payload.code);
  const subject = `Alerte sécurité — ${operation} sur votre adresse e-mail`;

  const html = layout(
    subject,
    `${headline('Alerte de sécurité', branding)}
${paragraph(`Bonjour <strong>${name}</strong>,`)}
${paragraph(`Une tentative de <strong>${escapeHtml(operation)}</strong> a été initiée avec votre adresse e-mail sur Africa Tourism Gate.`)}
${noticeBox('<strong>Si c\'est bien vous</strong>, saisissez le code ci-dessous sur la plateforme pour continuer et terminer l\'opération. <strong>Sinon</strong>, ignorez cet e-mail — l\'opération restera bloquée sans ce code.')}
<p style="margin:0 0 8px;font-size:13px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;color:${BRAND.muted};text-align:center;">Votre code de vérification</p>
${codeDisplayBlock(payload.code, branding)}
<p style="margin:0;font-size:13px;line-height:1.55;color:${BRAND.muted};text-align:center;">Valide ${payload.expiresInMinutes} minutes</p>
${ctaButton(verifyUrl, 'Saisir mon code', branding)}`,
    branding,
    {
      webUrl: payload.webUrl,
      preheader: `Code ${safeCode} — confirmez ou ignorez cette ${operation}.`,
    },
  );

  const text = `Bonjour ${payload.firstName},\n\nUne ${operation} a été initiée avec votre e-mail.\n\nCode : ${payload.code}\nValide ${payload.expiresInMinutes} minutes.\n\nSi ce n'est pas vous, ignorez cet e-mail.\nSaisir le code : ${verifyUrl}`;
  return { subject, html, text };
}

export function renderLoginNotificationEmail(
  payload: LoginNotificationEmailPayload,
  branding: EmailBrandingValue,
): { subject: string; html: string; text: string } {
  const welcome = renderWelcomeEmail(
    { to: payload.to, firstName: payload.firstName, webUrl: payload.webUrl },
    branding,
  );
  return {
    ...welcome,
    subject: 'Connexion à votre compte — Africa Tourism Gate',
  };
}

export function renderAbandonmentReminderEmail(
  payload: AbandonmentReminderEmailPayload,
  branding: EmailBrandingValue,
): { subject: string; html: string; text: string } {
  const name = escapeHtml(payload.firstName.trim() || 'Client');
  const operation = operationPurposeLabel(payload.purpose);
  const base = webBase(payload.webUrl);
  const verifyUrl = `${base}/booking/verify?verificationId=${encodeURIComponent(payload.verificationId)}`;
  const subject = `Vous n'avez pas terminé votre ${operation}`;

  const html = layout(
    subject,
    `${headline('Reprenez là où vous en étiez', branding)}
${paragraph(`Bonjour <strong>${name}</strong>,`)}
${paragraph(`Vous avez commencé une <strong>${escapeHtml(operation)}</strong> sur Africa Tourism Gate sans la terminer. Votre code de vérification est toujours valide si vous souhaitez poursuivre.`)}
${ctaButton(verifyUrl, 'Terminer mon opération', branding)}
${noticeBox('Si vous avez changé d\'avis, vous pouvez ignorer cet e-mail. Aucune action ne sera effectuée sans votre code.')}`,
    branding,
    {
      webUrl: payload.webUrl,
      preheader: `Terminez votre ${operation} en quelques clics.`,
    },
  );

  const text = `Bonjour ${payload.firstName},\n\nReprenez votre ${operation} : ${verifyUrl}`;
  return { subject, html, text };
}
