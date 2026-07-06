'use client';

import { useMemo } from 'react';
import { useResolvedPublicContact } from '../../lib/contact/use-resolved-public-contact';
import { buildSocialLinks } from '../../lib/contact/social-links';
import { useTranslations } from '../../lib/i18n/locale-provider';
import { SupportTicketForm } from '../support/support-ticket-form';

export function AboutContactPageContent() {
  const t = useTranslations();
  const a = t.about;
  const contact = useResolvedPublicContact();
  const socialLinks = useMemo(() => buildSocialLinks(contact), [contact]);

  return (
    <div className="space-y-10">
      <section aria-labelledby="about-contact-info-heading">
        <h2 id="about-contact-info-heading" className="text-lg font-semibold text-atg-fg">
          {a.contact.infoTitle}
        </h2>
        <p className="mt-1 text-sm text-atg-muted">{a.contact.subtitle}</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {contact.phone ? (
            <div className="rounded-xl border border-atg-border bg-atg-elevated/50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-atg-muted">
                {t.footer.contact}
              </p>
              <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="mt-2 block text-lg font-semibold text-atg-fg hover:text-primary">
                {contact.phone}
              </a>
            </div>
          ) : null}
          {contact.email ? (
            <div className="rounded-xl border border-atg-border bg-atg-elevated/50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-atg-muted">E-mail</p>
              <a href={`mailto:${contact.email}`} className="mt-2 block text-sm font-medium text-primary hover:underline">
                {contact.email}
              </a>
            </div>
          ) : null}
          {contact.location ? (
            <div className="rounded-xl border border-atg-border bg-atg-elevated/50 p-4 sm:col-span-2">
              <p className="text-xs font-medium uppercase tracking-wide text-atg-muted">
                {t.footer.location}
              </p>
              <p className="mt-2 text-sm text-atg-fg">{contact.location}</p>
            </div>
          ) : null}
        </div>

        {socialLinks.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {socialLinks.map((link) => (
              <a
                key={link.key}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-atg-border text-atg-muted transition-colors hover:border-primary hover:text-primary"
                aria-label={link.label}
              >
                <span className="h-4 w-4">{link.icon}</span>
              </a>
            ))}
          </div>
        ) : null}
      </section>

      <section aria-labelledby="about-contact-form-heading">
        <h2 id="about-contact-form-heading" className="text-lg font-semibold text-atg-fg">
          {a.contact.formTitle}
        </h2>
        <p className="mt-1 text-sm text-atg-muted">{a.contact.formSubtitle}</p>
        <div className="mt-4">
          <SupportTicketForm />
        </div>
      </section>
    </div>
  );
}
