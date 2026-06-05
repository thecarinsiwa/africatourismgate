import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { type Transporter } from 'nodemailer';
import {
  renderBookingConfirmationEmail,
  renderPasswordResetEmail,
  renderSupportNewAccountEmail,
  renderSupportNewBookingEmail,
  renderWelcomeEmail,
} from './email.templates';
import type {
  BookingConfirmationEmailPayload,
  PasswordResetEmailPayload,
  SendMailResult,
  SupportNewAccountEmailPayload,
  SupportNewBookingEmailPayload,
  WelcomeEmailPayload,
} from './email.types';

type EmailTransportMode = 'smtp' | 'mailpit' | 'ethereal' | 'disabled';
type EmailChannel = 'service' | 'support';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private serviceTransporter: Transporter | null | undefined;
  private supportTransporter: Transporter | null | undefined;
  private etherealAccountLogged = false;

  constructor(private readonly config: ConfigService) {}

  async sendPasswordReset(
    payload: PasswordResetEmailPayload,
  ): Promise<SendMailResult> {
    const { subject, html, text } = renderPasswordResetEmail(payload);
    return this.send('service', { to: payload.to, subject, html, text });
  }

  async sendWelcome(payload: WelcomeEmailPayload): Promise<SendMailResult> {
    const { subject, html, text } = renderWelcomeEmail({
      ...payload,
      webUrl: payload.webUrl ?? this.getWebUrl(),
    });
    return this.send('service', { to: payload.to, subject, html, text });
  }

  async sendBookingConfirmation(
    payload: BookingConfirmationEmailPayload,
  ): Promise<SendMailResult> {
    const { subject, html, text } = renderBookingConfirmationEmail({
      ...payload,
      webUrl: payload.webUrl ?? this.getWebUrl(),
      confirmedAt: payload.confirmedAt ?? new Date().toISOString(),
    });
    return this.send('service', { to: payload.to, subject, html, text });
  }

  async sendSupportNewAccount(
    payload: SupportNewAccountEmailPayload,
  ): Promise<SendMailResult> {
    const supportTo = this.getSupportToAddress();
    if (!supportTo) {
      this.logger.warn(
        'Support email skipped: set EMAIL_SUPPORT_TO (new account notification)',
      );
      return { sent: false };
    }
    const { subject, html, text } = renderSupportNewAccountEmail(payload);
    return this.send('support', { to: supportTo, subject, html, text });
  }

  async sendSupportNewBooking(
    payload: SupportNewBookingEmailPayload,
  ): Promise<SendMailResult> {
    const supportTo = this.getSupportToAddress();
    if (!supportTo) {
      this.logger.warn(
        'Support email skipped: set EMAIL_SUPPORT_TO (booking notification)',
      );
      return { sent: false };
    }
    const { subject, html, text } = renderSupportNewBookingEmail(payload);
    return this.send('support', { to: supportTo, subject, html, text });
  }

  private async send(
    channel: EmailChannel,
    options: {
      to: string;
      subject: string;
      html: string;
      text: string;
    },
  ): Promise<SendMailResult> {
    const to = options.to.trim();
    if (!to) {
      this.logger.warn('Email skipped: empty recipient');
      return { sent: false };
    }

    if (!this.isEnabled()) {
      this.logger.warn(
        `Email disabled (EMAIL_ENABLED=false). Would send "${options.subject}" to ${to}`,
      );
      return { sent: false };
    }

    try {
      const transporter = await this.getTransporter(channel);
      if (!transporter) {
        this.logger.warn(
          `No SMTP transport configured (${channel}). Would send "${options.subject}" to ${to}`,
        );
        return { sent: false };
      }

      const info = await transporter.sendMail({
        from: this.getFromAddress(channel),
        to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
      if (previewUrl) {
        this.logger.log(
          `Email [${channel}] "${options.subject}" → ${to} (preview: ${previewUrl})`,
        );
      } else {
        this.logger.log(`Email [${channel}] "${options.subject}" → ${to}`);
      }

      return {
        sent: true,
        messageId: info.messageId,
        previewUrl,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(
        `Failed [${channel}] "${options.subject}" to ${to}: ${message}`,
      );
      return { sent: false };
    }
  }

  private isEnabled(): boolean {
    const flag = this.config.get<string>('EMAIL_ENABLED', 'true');
    return flag.trim().toLowerCase() !== 'false';
  }

  private getFromAddress(channel: EmailChannel): string {
    if (channel === 'support') {
      return (
        this.config.get<string>('EMAIL_SUPPORT_FROM')?.trim() ||
        'Africa Tourism Gate Support <support@africatourismgate.org>'
      );
    }
    return (
      this.config.get<string>('EMAIL_FROM')?.trim() ||
      'Africa Tourism Gate <service@africatourismgate.org>'
    );
  }

  private getSupportToAddress(): string | null {
    const value = this.config.get<string>('EMAIL_SUPPORT_TO')?.trim();
    return value || null;
  }

  private getWebUrl(): string {
    return (
      this.config.get<string>('NEXT_PUBLIC_WEB_URL')?.trim() ||
      'https://africatourismgate.org'
    );
  }

  private getTransportMode(): EmailTransportMode {
    const explicit = this.config
      .get<string>('EMAIL_TRANSPORT')
      ?.trim()
      .toLowerCase();
    if (
      explicit === 'disabled' ||
      explicit === 'none' ||
      explicit === 'off'
    ) {
      return 'disabled';
    }
    if (explicit === 'ethereal') {
      return 'ethereal';
    }
    if (explicit === 'mailpit') {
      return 'mailpit';
    }
    if (explicit === 'smtp') {
      return 'smtp';
    }

    const host = this.config.get<string>('SMTP_HOST')?.trim();
    if (host) {
      return 'smtp';
    }

    if (process.env.NODE_ENV === 'production') {
      return 'disabled';
    }

    return 'mailpit';
  }

  private async getTransporter(channel: EmailChannel): Promise<Transporter | null> {
    const cache =
      channel === 'service' ? this.serviceTransporter : this.supportTransporter;
    if (cache !== undefined) {
      return cache;
    }

    const mode = this.getTransportMode();
    if (mode === 'disabled') {
      this.setTransporterCache(channel, null);
      return null;
    }

    if (mode === 'ethereal') {
      const t = await this.createEtherealTransporter();
      this.setTransporterCache('service', t);
      this.setTransporterCache('support', t);
      return t;
    }

    if (mode === 'mailpit') {
      const t = nodemailer.createTransport({
        host: this.config.get<string>('SMTP_HOST', 'localhost'),
        port: Number(this.config.get<string>('SMTP_PORT', '1025')),
        secure: this.config.get<string>('SMTP_SECURE', 'false') === 'true',
        ignoreTLS: true,
      });
      this.setTransporterCache('service', t);
      this.setTransporterCache('support', t);
      return t;
    }

    const host = this.config.get<string>('SMTP_HOST')?.trim();
    if (!host) {
      this.setTransporterCache(channel, null);
      return null;
    }

    const port = Number(this.config.get<string>('SMTP_PORT', '465'));
    const secure = this.config.get<string>('SMTP_SECURE', 'true') === 'true';
    const auth = this.getSmtpAuth(channel);

    const t = nodemailer.createTransport({
      host,
      port,
      secure,
      auth,
      ...(port === 587 && !secure ? { requireTLS: true } : {}),
    });

    this.setTransporterCache(channel, t);
    return t;
  }

  private getSmtpAuth(
    channel: EmailChannel,
  ): { user: string; pass: string } | undefined {
    const serviceUser =
      this.config.get<string>('SMTP_SERVICE_USER')?.trim() ||
      this.config.get<string>('SMTP_USER')?.trim();
    const servicePass =
      this.config.get<string>('SMTP_SERVICE_PASS')?.trim() ||
      this.config.get<string>('SMTP_PASS')?.trim();

    const supportUser = this.config.get<string>('SMTP_SUPPORT_USER')?.trim();
    const supportPass = this.config.get<string>('SMTP_SUPPORT_PASS')?.trim();

    if (channel === 'support') {
      if (supportUser && supportPass) {
        return { user: supportUser, pass: supportPass };
      }
      if (serviceUser && servicePass) {
        return { user: serviceUser, pass: servicePass };
      }
      return undefined;
    }

    if (serviceUser && servicePass) {
      return { user: serviceUser, pass: servicePass };
    }
    return undefined;
  }

  private setTransporterCache(
    channel: EmailChannel,
    transporter: Transporter | null,
  ): void {
    if (channel === 'service') {
      this.serviceTransporter = transporter;
    } else {
      this.supportTransporter = transporter;
    }
  }

  private async createEtherealTransporter(): Promise<Transporter> {
    const testAccount = await nodemailer.createTestAccount();
    if (!this.etherealAccountLogged) {
      this.logger.log(
        `Ethereal SMTP: ${testAccount.user} (inbox: https://ethereal.email/messages)`,
      );
      this.etherealAccountLogged = true;
    }
    return nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }
}
