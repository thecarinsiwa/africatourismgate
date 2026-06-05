import { emailLogoImgHtml } from './email-attachments';
import type {
  BookingConfirmationEmailPayload,
  PasswordResetEmailPayload,
  PersonalVacationNotePayload,
  SupportNewAccountEmailPayload,
  SupportNewBookingEmailPayload,
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

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function webBase(url?: string): string {
  return (url?.trim() || DEFAULT_WEB_URL).replace(/\/$/, '');
}

function layout(
  title: string,
  bodyHtml: string,
  options?: { footerNote?: string; webUrl?: string },
): string {
  const year = new Date().getFullYear();
  const base = webBase(options?.webUrl);
  const footerNote = options?.footerNote
    ? `<p style="margin:0 0 12px;font-size:13px;line-height:1.55;color:${BRAND.muted};">${options.footerNote}</p>`
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
            <td style="padding:18px 32px 14px;background:${BRAND.white};">
              <table role="presentation" cellpadding="0" cellspacing="0" align="center">
                <tr>
                  <td style="vertical-align:middle;padding-right:12px;">
                    <a href="${escapeHtml(base)}" style="text-decoration:none;line-height:0;">${emailLogoImgHtml('Africa Tourism Gate', LOGO_SIZE)}</a>
                  </td>
                  <td style="vertical-align:middle;text-align:left;">
                    <a href="${escapeHtml(base)}" style="text-decoration:none;">
                      <p style="margin:0;font-size:15px;font-weight:800;color:${BRAND.text};letter-spacing:-0.01em;line-height:1.2;">Africa Tourism Gate</p>
                      <p style="margin:2px 0 0;font-size:11px;font-weight:500;color:${BRAND.muted};letter-spacing:0.02em;">Connect People to Adventures</p>
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="height:2px;background:linear-gradient(90deg,${BRAND.primary} 0%,${BRAND.secondary} 70%,${BRAND.accent} 100%);font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px 36px 24px;">
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
                    ${footerNote}
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
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function button(
  href: string,
  label: string,
  variant: 'primary' | 'secondary' = 'primary',
): string {
  const safeHref = escapeHtml(href);
  if (variant === 'primary') {
    return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0 6px;">
  <tr>
    <td style="border-radius:12px;background:linear-gradient(135deg,${BRAND.primary} 0%,${BRAND.secondary} 100%);box-shadow:0 4px 14px rgba(11,110,79,0.35);">
      <a href="${safeHref}" style="display:inline-block;padding:15px 32px;font-size:15px;font-weight:700;color:${BRAND.white};text-decoration:none;border-radius:12px;letter-spacing:0.02em;">${escapeHtml(label)}</a>
    </td>
  </tr>
</table>`;
  }
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 6px;">
  <tr>
    <td style="border-radius:12px;border:2px solid ${BRAND.primary};">
      <a href="${safeHref}" style="display:inline-block;padding:13px 28px;font-size:15px;font-weight:700;color:${BRAND.primary};text-decoration:none;border-radius:10px;">${escapeHtml(label)}</a>
    </td>
  </tr>
</table>`;
}

function featureCard(icon: string, title: string, desc: string): string {
  return `<td style="padding:6px;vertical-align:top;width:33%;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.white};border:1px solid ${BRAND.border};border-radius:14px;height:100%;">
    <tr>
      <td style="padding:18px 14px;text-align:center;">
        <p style="margin:0 0 10px;font-size:28px;line-height:1;">${icon}</p>
        <p style="margin:0 0 6px;font-size:14px;font-weight:800;color:${BRAND.text};">${escapeHtml(title)}</p>
        <p style="margin:0;font-size:12px;line-height:1.5;color:${BRAND.muted};">${escapeHtml(desc)}</p>
      </td>
    </tr>
  </table>
</td>`;
}

function infoCard(content: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;background:${BRAND.surface};border:1px solid ${BRAND.border};border-radius:16px;">
  <tr><td style="padding:22px 24px;">${content}</td></tr>
</table>`;
}

function statusBadge(label: string, color: string): string {
  return `<span style="display:inline-block;padding:6px 14px;border-radius:999px;background:${color};font-size:11px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND.white};">${escapeHtml(label)}</span>`;
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
): { subject: string; html: string; text: string } {
  const name = escapeHtml(payload.firstName.trim() || 'Client');
  const subject = 'Réinitialisation de votre mot de passe';
  const html = layout(
    subject,
    `<h1 style="margin:0 0 12px;font-size:28px;font-weight:800;color:${BRAND.text};line-height:1.2;letter-spacing:-0.02em;">Réinitialisation du mot de passe</h1>
<p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:${BRAND.muted};">Bonjour ${name},</p>
<p style="margin:0 0 8px;font-size:15px;line-height:1.7;color:${BRAND.text};">Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous — le lien est valide <strong style="color:${BRAND.primary};">1 heure</strong>.</p>
${button(payload.resetUrl, 'Réinitialiser mon mot de passe')}
<p style="margin:16px 0 0;font-size:13px;color:${BRAND.muted};line-height:1.55;">Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail. Votre mot de passe restera inchangé.</p>`,
  );
  const text = `Bonjour ${payload.firstName},\n\nRéinitialisez votre mot de passe : ${payload.resetUrl}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.`;
  return { subject, html, text };
}

export function renderWelcomeEmail(
  payload: WelcomeEmailPayload,
): { subject: string; html: string; text: string } {
  const name = escapeHtml(payload.firstName.trim() || 'Voyageur');
  const base = webBase(payload.webUrl);
  const accountUrl = `${base}/account`;
  const subject = 'Bienvenue chez Africa Tourism Gate';
  const html = layout(
    subject,
    `${statusBadge('Compte activé', BRAND.secondary)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 28px;background:linear-gradient(145deg,${BRAND.surfaceAlt} 0%,${BRAND.white} 60%,${BRAND.accentLight} 100%);border-radius:18px;border:1px solid ${BRAND.border};">
  <tr>
    <td style="padding:32px 28px;text-align:center;">
      <h1 style="margin:0 0 10px;font-size:30px;font-weight:800;color:${BRAND.text};line-height:1.2;letter-spacing:-0.03em;">Bienvenue, ${name}</h1>
      <p style="margin:0 auto;max-width:420px;font-size:16px;line-height:1.65;color:${BRAND.muted};">Votre compte est prêt. Explorez des hébergements d'exception, des vols et des expériences authentiques à travers tout le continent africain.</p>
    </td>
  </tr>
</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 12px;">
  <tr>
    ${featureCard('🏨', 'Hébergements', 'Hôtels & lodges sélectionnés')}
    ${featureCard('✈️', 'Vols', 'Réservation simple & rapide')}
    ${featureCard('🎯', 'Expériences', 'Safaris, tours & activités')}
  </tr>
</table>
${button(base, 'Découvrir nos offres')}
${button(accountUrl, 'Accéder à mon compte', 'secondary')}
<p style="margin:28px 0 0;font-size:14px;line-height:1.65;color:${BRAND.muted};text-align:center;">Merci de nous faire confiance. Notre équipe vous accompagne à chaque étape de votre voyage.</p>`,
    {
      footerNote:
        'Vous recevez cet e-mail car un compte a été créé sur Africa Tourism Gate.',
      webUrl: base,
    },
  );
  const text = `Bonjour ${payload.firstName},\n\nBienvenue sur Africa Tourism Gate ! Votre compte a été créé avec succès.\n\nExplorer : ${base}\nMon compte : ${accountUrl}`;
  return { subject, html, text };
}

export function renderBookingConfirmationEmail(
  payload: BookingConfirmationEmailPayload,
): { subject: string; html: string; text: string } {
  const name = escapeHtml(payload.firstName.trim() || 'Client');
  const total = escapeHtml(formatMoney(payload.totalCents, payload.currency));
  const ref = escapeHtml(payload.bookingId);
  const shortRef = escapeHtml(payload.bookingId.slice(0, 8).toUpperCase());
  const confirmedAt = escapeHtml(formatDateFr(payload.confirmedAt));
  const base = webBase(payload.webUrl);
  const reservationsUrl = `${base}/account/reservations`;

  const itemsRows =
    payload.itemTitles.length > 0
      ? payload.itemTitles
          .map(
            (t, i) => `<tr>
  <td style="padding:14px 0;border-top:1px solid ${BRAND.border};font-size:13px;font-weight:700;color:${BRAND.muted};width:32px;vertical-align:top;">${String(i + 1).padStart(2, '0')}</td>
  <td style="padding:14px 0;border-top:1px solid ${BRAND.border};font-size:15px;font-weight:600;color:${BRAND.text};line-height:1.45;vertical-align:top;">${escapeHtml(t)}</td>
</tr>`,
          )
          .join('')
      : `<tr><td colspan="2" style="padding:14px 0;font-size:14px;color:${BRAND.muted};">Détails disponibles dans votre espace client.</td></tr>`;

  const subject = `Confirmation de réservation — ${shortRef}`;
  const html = layout(
    subject,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 8px;">
  <tr>
    <td>
      ${statusBadge('Confirmée', BRAND.primary)}
    </td>
  </tr>
</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0 24px;">
  <tr>
    <td style="width:56px;vertical-align:top;">
      <table role="presentation" cellpadding="0" cellspacing="0">
        <tr>
          <td style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,${BRAND.primary},${BRAND.secondary});text-align:center;font-size:24px;color:#fff;line-height:48px;">✓</td>
        </tr>
      </table>
    </td>
    <td style="vertical-align:top;padding-left:14px;">
      <h1 style="margin:0 0 8px;font-size:28px;font-weight:800;color:${BRAND.text};line-height:1.2;letter-spacing:-0.02em;">Réservation confirmée</h1>
      <p style="margin:0;font-size:16px;line-height:1.65;color:${BRAND.muted};">Bonjour ${name}, votre paiement a été enregistré avec succès. Voici le récapitulatif de votre commande.</p>
    </td>
  </tr>
</table>
${infoCard(`
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td style="padding-bottom:16px;">
      <p style="margin:0 0 6px;font-size:11px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${BRAND.muted};">Référence de réservation</p>
      <p style="margin:0;font-size:26px;font-weight:800;font-family:Consolas,'Courier New',monospace;color:${BRAND.primary};letter-spacing:0.08em;">${shortRef}</p>
      <p style="margin:6px 0 0;font-size:12px;color:${BRAND.muted};">${ref}</p>
    </td>
  </tr>
  <tr>
    <td style="padding:14px 0;border-top:1px solid ${BRAND.border};">
      <p style="margin:0 0 6px;font-size:11px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${BRAND.muted};">Date de confirmation</p>
      <p style="margin:0;font-size:15px;font-weight:700;color:${BRAND.text};">${confirmedAt}</p>
    </td>
  </tr>
</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px;padding-top:18px;border-top:1px solid ${BRAND.border};">
  <tr>
    <td colspan="2" style="padding-bottom:10px;font-size:11px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${BRAND.muted};">Vos prestations</td>
  </tr>
  ${itemsRows}
  <tr>
    <td colspan="2" style="padding-top:18px;border-top:2px solid ${BRAND.primary};">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:16px;font-weight:800;color:${BRAND.text};">Total payé</td>
          <td align="right" style="font-size:26px;font-weight:800;color:${BRAND.primary};letter-spacing:-0.02em;">${total}</td>
        </tr>
      </table>
    </td>
  </tr>
</table>
`)}
${button(reservationsUrl, 'Voir ma réservation')}
<p style="margin:22px 0 0;font-size:14px;line-height:1.7;color:${BRAND.muted};">Conservez cet e-mail pour vos archives. Pour toute question, notre équipe est joignable à <a href="mailto:support@africatourismgate.org" style="color:${BRAND.primary};font-weight:700;text-decoration:none;">support@africatourismgate.org</a>.</p>`,
    {
      footerNote: 'Merci pour votre confiance — Africa Tourism Gate',
      webUrl: base,
    },
  );
  const itemsText =
    payload.itemTitles.length > 0
      ? payload.itemTitles.map((t, i) => `  ${i + 1}. ${t}`).join('\n')
      : '';
  const text = `Bonjour ${payload.firstName},\n\nRéservation ${payload.bookingId} confirmée le ${formatDateFr(payload.confirmedAt)}.\n\n${itemsText}\n\nTotal : ${formatMoney(payload.totalCents, payload.currency)}\n\nVoir : ${reservationsUrl}`;
  return { subject, html, text };
}

export function renderSupportNewAccountEmail(
  payload: SupportNewAccountEmailPayload,
): { subject: string; html: string; text: string } {
  const subject = `[Support] Nouveau compte — ${payload.email}`;
  const phone = payload.phone?.trim()
    ? escapeHtml(payload.phone.trim())
    : '—';
  const lang = payload.preferredLanguage?.trim()
    ? escapeHtml(payload.preferredLanguage.trim())
    : '—';
  const html = layout(
    subject,
    `<h1 style="margin:0 0 16px;font-size:22px;font-weight:800;">Nouveau compte client</h1>
${infoCard(`
<p style="margin:0 0 10px;font-size:15px;line-height:1.6;"><strong>Nom :</strong> ${escapeHtml(payload.firstName)} ${escapeHtml(payload.lastName)}</p>
<p style="margin:0 0 10px;font-size:15px;line-height:1.6;"><strong>E-mail :</strong> ${escapeHtml(payload.email)}</p>
<p style="margin:0 0 10px;font-size:15px;line-height:1.6;"><strong>ID utilisateur :</strong> <code style="font-size:13px;">${escapeHtml(payload.userId)}</code></p>
<p style="margin:0 0 10px;font-size:15px;line-height:1.6;"><strong>Téléphone :</strong> ${phone}</p>
<p style="margin:0;font-size:15px;line-height:1.6;"><strong>Langue :</strong> ${lang}</p>
`)}`,
  );
  const text = `Nouveau compte\n${payload.firstName} ${payload.lastName}\n${payload.email}\nID: ${payload.userId}`;
  return { subject, html, text };
}

export function renderSupportNewBookingEmail(
  payload: SupportNewBookingEmailPayload,
): { subject: string; html: string; text: string } {
  const total = escapeHtml(formatMoney(payload.totalCents, payload.currency));
  const ref = escapeHtml(payload.bookingId);
  const client = escapeHtml(payload.clientName.trim() || 'Client');
  const email = escapeHtml(payload.clientEmail);
  const items =
    payload.itemTitles.length > 0
      ? `<ul style="margin:8px 0 0;padding-left:20px;line-height:1.7;">${payload.itemTitles
          .map((t) => `<li style="margin-bottom:4px;">${escapeHtml(t)}</li>`)
          .join('')}</ul>`
      : '';
  const subject = `[Support] Réservation confirmée — ${payload.bookingId.slice(0, 8)}`;
  const html = layout(
    subject,
    `<h1 style="margin:0 0 16px;font-size:22px;font-weight:800;">Réservation confirmée</h1>
${infoCard(`
<p style="margin:0 0 10px;font-size:15px;line-height:1.6;"><strong>Référence :</strong> ${ref}</p>
<p style="margin:0 0 10px;font-size:15px;line-height:1.6;"><strong>Client :</strong> ${client} (${email})</p>
<p style="margin:0 0 10px;font-size:15px;line-height:1.6;"><strong>ID utilisateur :</strong> ${escapeHtml(payload.userId)}</p>
<p style="margin:0;font-size:15px;line-height:1.6;"><strong>Total :</strong> ${total}</p>
${items}
`)}`,
  );
  const text = `Réservation ${payload.bookingId}\nClient: ${payload.clientName} <${payload.clientEmail}>\nTotal: ${formatMoney(payload.totalCents, payload.currency)}`;
  return { subject, html, text };
}

function vacationLayout(title: string, bodyHtml: string, webUrl?: string): string {
  const year = new Date().getFullYear();
  const base = webBase(webUrl);
  const sunset = '#f59e0b';
  const sky = '#fff7ed';
  const ocean = '#0e7490';
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:linear-gradient(180deg,${sky} 0%,${BRAND.surface} 100%);font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${BRAND.text};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:36px 14px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:${BRAND.white};border-radius:24px;overflow:hidden;box-shadow:0 12px 40px rgba(14,116,144,0.15);border:1px solid ${BRAND.border};">
          <tr>
            <td style="padding:36px 32px 28px;text-align:center;background:linear-gradient(135deg,${ocean} 0%,${BRAND.primary} 45%,${sunset} 100%);">
              <p style="margin:0 0 8px;font-size:36px;line-height:1;">🌴☀️🌊</p>
              <p style="margin:0;font-size:13px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.9);">Bonnes vacances</p>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 32px 8px;">
              <table role="presentation" cellpadding="0" cellspacing="0" align="center">
                <tr>
                  <td style="vertical-align:middle;padding-right:10px;">${emailLogoImgHtml('Africa Tourism Gate', 40)}</td>
                  <td style="vertical-align:middle;">
                    <p style="margin:0;font-size:14px;font-weight:800;color:${BRAND.text};">Africa Tourism Gate</p>
                    <p style="margin:2px 0 0;font-size:11px;color:${BRAND.muted};">Connect People to Adventures</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 36px 32px;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:0 36px 32px;text-align:center;">
              <p style="margin:0;font-size:12px;color:${BRAND.muted};">© ${year} <a href="${escapeHtml(base)}" style="color:${BRAND.primary};text-decoration:none;font-weight:600;">Africa Tourism Gate</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function noteBlock(icon: string, title: string, content: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;background:${BRAND.surface};border-left:4px solid ${BRAND.primary};border-radius:0 14px 14px 0;">
  <tr>
    <td style="padding:18px 22px;">
      <p style="margin:0 0 8px;font-size:14px;font-weight:800;color:${BRAND.primary};">${icon} ${escapeHtml(title)}</p>
      <p style="margin:0;font-size:15px;line-height:1.75;color:${BRAND.text};">${content}</p>
    </td>
  </tr>
</table>`;
}

export function renderPersonalVacationNoteEmail(
  payload: PersonalVacationNotePayload,
): { subject: string; html: string; text: string } {
  const name = escapeHtml(payload.recipientName.trim());
  const subject = 'Bonnes vacances — Africa Tourism Gate';
  const html = vacationLayout(
    subject,
    `<p style="margin:0 0 6px;font-size:13px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${BRAND.muted};">Message personnel</p>
<h1 style="margin:0 0 24px;font-size:26px;font-weight:800;color:${BRAND.text};line-height:1.3;letter-spacing:-0.02em;">Très cher ${name},</h1>
<p style="margin:0 0 18px;font-size:16px;line-height:1.8;color:${BRAND.text};">J'espère que ce message vous trouve en toute <strong>quiétude</strong>, et que vous passez de <strong>belles vacances</strong>.</p>
<p style="margin:0 0 18px;font-size:16px;line-height:1.8;color:${BRAND.text};">Je vous ai envoyé deux e-mails de démonstration&nbsp;: l'un pour la <strong>création de compte</strong>, l'autre pour une <strong>confirmation de réservation</strong>.</p>
${noteBlock('🎨', 'Retour design', 'Fort de votre expertise professionnelle en design, pourriez-vous, à votre retour de vacances, nous proposer des pistes d\'amélioration pour ces templates&nbsp;?')}
${noteBlock('🔀', 'Avant le merge de la PR', `<strong>E-mails de relance</strong> — Serait-il pertinent d'envoyer un rappel lorsqu'un utilisateur démarre la création de compte ou une réservation sans terminer le processus&nbsp;? Cette pratique est courante sur de nombreuses plateformes.<br/><br/><strong>Personnalisation admin</strong> — Serait-il possible d'ajouter, dans l'espace admin, une fonctionnalité permettant de personnaliser le design des e-mails&nbsp;?`)}
<p style="margin:28px 0 18px;font-size:16px;line-height:1.8;color:${BRAND.text};">Merci pour votre compréhension.</p>
<p style="margin:0 0 6px;font-size:17px;font-weight:700;color:${BRAND.primary};">Passez d'excellentes vacances&nbsp;! 🌞</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;padding-top:24px;border-top:1px solid ${BRAND.border};">
  <tr>
    <td>
      <p style="margin:0 0 4px;font-size:15px;font-weight:700;color:${BRAND.text};">Best regards,</p>
      <p style="margin:0;font-size:15px;font-weight:800;color:${BRAND.primary};">Africa Tourism Gate</p>
    </td>
  </tr>
</table>`,
    payload.webUrl,
  );
  const plainName = payload.recipientName.trim();
  const text = `Très cher ${plainName},

J'espère que ce message vous trouve en toute quiétude, et que vous passez de belles vacances.

Je vous ai envoyé deux e-mails de démonstration : l'un pour la création de compte, l'autre pour une confirmation de réservation.

Fort de votre expertise en design, pourriez-vous, à votre retour, nous proposer des pistes d'amélioration ?

Avant le merge de la PR :
- E-mails de relance pour processus abandonnés (création compte / réservation) ?
- Personnalisation du design des e-mails dans l'admin ?

Merci pour votre compréhension. Passez d'excellentes vacances !

Best regards,
Africa Tourism Gate`;
  return { subject, html, text };
}
