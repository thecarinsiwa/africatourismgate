import type {
  BookingConfirmationEmailPayload,
  PasswordResetEmailPayload,
  WelcomeEmailPayload,
} from './email.types';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function layout(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#18181b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:8px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,.08);">
          <tr>
            <td>
              <p style="margin:0 0 24px;font-size:13px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:#0d9488;">Africa Tourism Gate</p>
              ${bodyHtml}
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0;font-size:12px;color:#71717a;">© Africa Tourism Gate</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function button(href: string, label: string): string {
  const safeHref = escapeHtml(href);
  return `<p style="margin:24px 0;">
  <a href="${safeHref}" style="display:inline-block;padding:12px 24px;background:#0d9488;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;">${escapeHtml(label)}</a>
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

export function renderPasswordResetEmail(
  payload: PasswordResetEmailPayload,
): { subject: string; html: string; text: string } {
  const name = escapeHtml(payload.firstName.trim() || 'Client');
  const subject = 'Réinitialisation de votre mot de passe';
  const html = layout(
    subject,
    `<h1 style="margin:0 0 16px;font-size:22px;">Réinitialisation du mot de passe</h1>
<p style="margin:0 0 16px;line-height:1.6;">Bonjour ${name},</p>
<p style="margin:0 0 16px;line-height:1.6;">Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous (lien valide 1 heure) :</p>
${button(payload.resetUrl, 'Réinitialiser mon mot de passe')}
<p style="margin:16px 0 0;font-size:13px;color:#71717a;line-height:1.5;">Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.</p>`,
  );
  const text = `Bonjour ${payload.firstName},\n\nRéinitialisez votre mot de passe : ${payload.resetUrl}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.`;
  return { subject, html, text };
}

export function renderWelcomeEmail(
  payload: WelcomeEmailPayload,
): { subject: string; html: string; text: string } {
  const name = escapeHtml(payload.firstName.trim() || 'Client');
  const subject = 'Bienvenue sur Africa Tourism Gate';
  const html = layout(
    subject,
    `<h1 style="margin:0 0 16px;font-size:22px;">Bienvenue !</h1>
<p style="margin:0 0 16px;line-height:1.6;">Bonjour ${name},</p>
<p style="margin:0 0 16px;line-height:1.6;">Votre compte a été créé avec succès. Vous pouvez dès maintenant vous connecter et réserver vos expériences de voyage en Afrique.</p>
<p style="margin:0;line-height:1.6;">Merci de nous faire confiance.</p>`,
  );
  const text = `Bonjour ${payload.firstName},\n\nBienvenue sur Africa Tourism Gate. Votre compte a été créé avec succès.`;
  return { subject, html, text };
}

export function renderBookingConfirmationEmail(
  payload: BookingConfirmationEmailPayload,
): { subject: string; html: string; text: string } {
  const name = escapeHtml(payload.firstName.trim() || 'Client');
  const total = escapeHtml(formatMoney(payload.totalCents, payload.currency));
  const ref = escapeHtml(payload.bookingId);
  const items =
    payload.itemTitles.length > 0
      ? `<ul style="margin:8px 0 16px;padding-left:20px;line-height:1.6;">${payload.itemTitles
          .map((t) => `<li>${escapeHtml(t)}</li>`)
          .join('')}</ul>`
      : '';
  const subject = `Confirmation de réservation — ${payload.bookingId.slice(0, 8)}`;
  const html = layout(
    subject,
    `<h1 style="margin:0 0 16px;font-size:22px;">Réservation confirmée</h1>
<p style="margin:0 0 16px;line-height:1.6;">Bonjour ${name},</p>
<p style="margin:0 0 8px;line-height:1.6;">Votre réservation <strong>${ref}</strong> est confirmée.</p>
<p style="margin:0 0 8px;line-height:1.6;"><strong>Total :</strong> ${total}</p>
${items}
<p style="margin:16px 0 0;line-height:1.6;">Conservez cet e-mail pour vos archives.</p>`,
  );
  const text = `Bonjour ${payload.firstName},\n\nRéservation ${payload.bookingId} confirmée.\nTotal : ${formatMoney(payload.totalCents, payload.currency)}\n`;
  return { subject, html, text };
}
