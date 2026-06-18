'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { BrandingLogo } from '../branding-mark';
import { useTranslations } from '../../lib/i18n/locale-provider';
import { useResolvedPublicBranding } from '../../lib/branding/use-resolved-public-branding';
import { useResolvedPublicContact } from '../../lib/contact/use-resolved-public-contact';
import { buildSocialLinks } from '../../lib/contact/social-links';
import { buildVerticalListRoute } from '../../lib/search/route';

export function HomeFooter() {
  const t = useTranslations();
  const [email, setEmail] = useState('');
  const { branding, logoBroken, setLogoBroken } = useResolvedPublicBranding();
  const contact = useResolvedPublicContact();
  const socialLinks = useMemo(() => buildSocialLinks(contact), [contact]);

  const productLinks = useMemo(
    () => [
      { href: buildVerticalListRoute('hotels'), label: t.footer.specialistLinks.premium },
      { href: buildVerticalListRoute('flights'), label: t.footer.specialistLinks.flights },
      { href: buildVerticalListRoute('cars'), label: t.footer.specialistLinks.cars },
      { href: buildVerticalListRoute('tours'), label: t.footer.specialistLinks.safaris },
      { href: buildVerticalListRoute('cruises'), label: t.footer.specialistLinks.cruises },
      { href: '/packages', label: t.footer.specialistLinks.packages },
    ],
    [t],
  );

  return (
    <footer>
      <div className="bg-[#1b1b2f] text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <BrandingLogo
                  branding={branding}
                  logoBroken={logoBroken}
                  setLogoBroken={setLogoBroken}
                />
                <span className="text-lg font-bold">{branding.displayName}</span>
              </Link>
              <p className="text-sm text-white/60 leading-relaxed mb-5">{t.footer.tagline}</p>
              <a
                href="#about"
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-primary-hover"
              >
                {t.footer.learnMore}
              </a>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-white mb-5">
                {t.footer.products}
              </h3>
              <ul className="space-y-2.5">
                {productLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 hover:text-white transition-colors flex items-center gap-1.5"
                    >
                      <svg className="h-3 w-3 text-primary" fill="currentColor" viewBox="0 0 6 10" aria-hidden>
                        <path d="M1 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-white mb-5">
                {t.footer.newsletter}
              </h3>
              <p className="text-sm text-white/60 leading-relaxed mb-4">{t.footer.newsletterDesc}</p>
              <form
                className="flex gap-0 rounded-lg overflow-hidden"
                onSubmit={(e) => {
                  e.preventDefault();
                  setEmail('');
                }}
              >
                <input
                  type="email"
                  placeholder={t.footer.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="min-h-[42px] min-w-0 flex-1 border-0 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="submit"
                  className="shrink-0 bg-primary px-4 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-primary-hover"
                >
                  {t.footer.newsletterSubmit}
                </button>
              </form>
            </div>

            <div id="contact" className="scroll-mt-24">
              <h3 className="text-sm font-bold uppercase tracking-wide text-white mb-5">
                {t.footer.contact}
              </h3>

              <div className="space-y-4">
                {contact.phone ? (
                  <div className="flex items-start gap-3">
                    <svg className="mt-0.5 h-5 w-5 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 5z" />
                    </svg>
                    <span className="text-lg font-bold text-white">{contact.phone}</span>
                  </div>
                ) : null}

                {contact.email ? (
                  <div className="flex items-start gap-3">
                    <svg className="mt-0.5 h-5 w-5 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <a
                      href={`mailto:${contact.email}`}
                      className="text-sm text-white/60 hover:text-white transition-colors"
                    >
                      {contact.email}
                    </a>
                  </div>
                ) : null}

                {contact.location ? (
                  <div className="flex items-start gap-3">
                    <svg className="mt-0.5 h-5 w-5 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm text-white/60">{contact.location}</span>
                  </div>
                ) : null}
              </div>

              {socialLinks.length > 0 ? (
                <div className="mt-4 flex items-center gap-2">
                  {socialLinks.map((s) => (
                    <a
                      key={s.key}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/70 transition-colors hover:bg-primary hover:text-white"
                      aria-label={s.label}
                    >
                      <span className="h-4 w-4">{s.icon}</span>
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#14142a] text-white/50">
        <div className="mx-auto max-w-7xl flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p className="text-xs">
            © {new Date().getFullYear()} {branding.displayName}
            <span className="mx-2">|</span>
            <a href="#" className="hover:text-white transition-colors">
              {t.footer.privacy}
            </a>
            <span className="mx-2">|</span>
            <a href="#about" className="hover:text-white transition-colors">
              {t.footer.about}
            </a>
            <span className="mx-2">|</span>
            <Link href="/support" className="hover:text-white transition-colors">
              {t.footer.faq}
            </Link>
            <span className="mx-2">|</span>
            <a href="#contact" className="hover:text-white transition-colors">
              {t.footer.contact}
            </a>
          </p>
          <p className="text-xs">
            {t.footer.designedBy} <strong className="text-white/70">{branding.displayName}</strong>
          </p>
        </div>
      </div>
    </footer>
  );
}
