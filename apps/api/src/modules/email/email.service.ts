import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { type Transporter } from 'nodemailer';
import {
  renderBookingConfirmationEmail,
  renderPasswordResetEmail,
  renderWelcomeEmail,
} from './email.templates';
import type {
  BookingConfirmationEmailPayload,
  PasswordResetEmailPayload,
  SendMailResult,
  WelcomeEmailPayload,
} from './email.types';

type EmailTransportMode = 'smtp' | 'mailpit' | 'ethereal' | 'disabled';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter | null | undefined;
  private etherealAccountLogged = false;

  constructor(private readonly config: ConfigService) {}

  async sendPasswordReset(
    payload: PasswordResetEmailPayload,
  ): Promise<SendMailResult> {
    const { subject, html, text } = renderPasswordResetEmail(payload);
    return this.send({ to: payload.to, subject, html, text });
  }

  async sendWelcome(payload: WelcomeEmailPayload): Promise<SendMailResult> {
    const { subject, html, text } = renderWelcomeEmail(payload);
    return this.send({ to: payload.to, subject, html, text });
  }

  async sendBookingConfirmation(
    payload: BookingConfirmationEmailPayload,
  ): Promise<SendMailResult> {
    const { subject, html, text } = renderBookingConfirmationEmail(payload);
    return this.send({ to: payload.to, subject, html, text });
  }

  private async send(options: {
    to: string;
    subject: string;
    html: string;
    text: string;
  }): Promise<SendMailResult> {
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
      const transporter = await this.getTransporter();
      if (!transporter) {
        this.logger.warn(
          `No SMTP transport configured. Would send "${options.subject}" to ${to}`,
        );
        return { sent: false };
      }

      const info = await transporter.sendMail({
        from: this.getFromAddress(),
        to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
      if (previewUrl) {
        this.logger.log(
          `Email sent "${options.subject}" → ${to} (preview: ${previewUrl})`,
        );
      } else {
        this.logger.log(`Email sent "${options.subject}" → ${to}`);
      }

      return {
        sent: true,
        messageId: info.messageId,
        previewUrl,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(
        `Failed to send "${options.subject}" to ${to}: ${message}`,
      );
      return { sent: false };
    }
  }

  private isEnabled(): boolean {
    const flag = this.config.get<string>('EMAIL_ENABLED', 'true');
    return flag.trim().toLowerCase() !== 'false';
  }

  private getFromAddress(): string {
    return (
      this.config.get<string>('EMAIL_FROM')?.trim() ||
      'Africa Tourism Gate <noreply@africatourismgate.local>'
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

  private async getTransporter(): Promise<Transporter | null> {
    if (this.transporter !== undefined) {
      return this.transporter;
    }

    const mode = this.getTransportMode();
    if (mode === 'disabled') {
      this.transporter = null;
      return null;
    }

    if (mode === 'ethereal') {
      this.transporter = await this.createEtherealTransporter();
      return this.transporter;
    }

    if (mode === 'mailpit') {
      this.transporter = nodemailer.createTransport({
        host: this.config.get<string>('SMTP_HOST', 'localhost'),
        port: Number(this.config.get<string>('SMTP_PORT', '1025')),
        secure: this.config.get<string>('SMTP_SECURE', 'false') === 'true',
        ignoreTLS: true,
      });
      return this.transporter;
    }

    const host = this.config.get<string>('SMTP_HOST')?.trim();
    if (!host) {
      this.transporter = null;
      return null;
    }

    const user = this.config.get<string>('SMTP_USER')?.trim();
    const pass = this.config.get<string>('SMTP_PASS')?.trim();
    this.transporter = nodemailer.createTransport({
      host,
      port: Number(this.config.get<string>('SMTP_PORT', '587')),
      secure: this.config.get<string>('SMTP_SECURE', 'false') === 'true',
      auth: user && pass ? { user, pass } : undefined,
    });
    return this.transporter;
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
