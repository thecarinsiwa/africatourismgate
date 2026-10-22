'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState, type ReactNode } from 'react';
import type { PublicTeamMember } from '@africatourismgate/types';
import { Spinner } from '@africatourismgate/ui';
import { ABOUT_PATHS } from '../../lib/about/routes';
import { getTeamMemberBySlug } from '../../lib/api/public';
import { RichText } from '../shared/rich-text';
import { AboutContentLayout } from './about-shell';

type ContactLink = {
  key: 'email' | 'linkedin' | 'x' | 'facebook' | 'instagram';
  href: string;
  display: string;
  external: boolean;
  icon: ReactNode;
};

const ICON_CLASS = 'h-5 w-5 shrink-0';

function displayUrl(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '');
}

function buildContactLinks(member: PublicTeamMember): ContactLink[] {
  const links: ContactLink[] = [];
  if (member.email) {
    links.push({
      key: 'email',
      href: `mailto:${member.email}`,
      display: member.email,
      external: false,
      icon: (
        <svg className={ICON_CLASS} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </svg>
      ),
    });
  }
  if (member.linkedinUrl) {
    links.push({
      key: 'linkedin',
      href: member.linkedinUrl,
      display: displayUrl(member.linkedinUrl),
      external: true,
      icon: (
        <svg className={ICON_CLASS} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
        </svg>
      ),
    });
  }
  if (member.xUrl) {
    links.push({
      key: 'x',
      href: member.xUrl,
      display: displayUrl(member.xUrl),
      external: true,
      icon: (
        <svg className={ICON_CLASS} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23Zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64Z" />
        </svg>
      ),
    });
  }
  if (member.facebookUrl) {
    links.push({
      key: 'facebook',
      href: member.facebookUrl,
      display: displayUrl(member.facebookUrl),
      external: true,
      icon: (
        <svg className={ICON_CLASS} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.23 2.68.23v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07Z" />
        </svg>
      ),
    });
  }
  if (member.instagramUrl) {
    links.push({
      key: 'instagram',
      href: member.instagramUrl,
      display: displayUrl(member.instagramUrl),
      external: true,
      icon: (
        <svg className={ICON_CLASS} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      ),
    });
  }
  return links;
}

function BackToTeamLink() {
  const t = useTranslations('about.team');
  return (
    <Link
      href={ABOUT_PATHS.team}
      className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-atg-border bg-atg-elevated px-4 py-2 text-sm font-semibold text-atg-fg transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:hover:border-emerald-300 dark:hover:text-emerald-300"
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      {t('backToTeam')}
    </Link>
  );
}

export function AboutTeamMemberProfileContent({ slug }: { slug: string }) {
  const locale = useLocale();
  const t = useTranslations('about');

  const [member, setMember] = useState<PublicTeamMember | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    void getTeamMemberBySlug(slug, locale)
      .then((data) => {
        if (!cancelled) setMember(data);
      })
      .catch(() => {
        if (!cancelled) setMember(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug, locale]);

  const contactLinks = member ? buildContactLinks(member) : [];

  return (
    <>
      <section className="relative overflow-hidden bg-[#1b1b2f] text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-[#1b1b2f] via-[#1b1b2f]/90 to-[#1b1b2f]/70" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-white/75">
              <li>
                <Link href="/" className="hover:text-white">
                  {t('breadcrumbHome')}
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link href={ABOUT_PATHS.whoWeAre} className="hover:text-white">
                  {t('breadcrumbAbout')}
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link href={ABOUT_PATHS.team} className="hover:text-white">
                  {t('nav.team')}
                </Link>
              </li>
              {member ? (
                <>
                  <li aria-hidden>/</li>
                  <li aria-current="page" className="font-medium text-white">
                    {member.name}
                  </li>
                </>
              ) : null}
            </ol>
          </nav>

          {member ? (
            <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-center sm:gap-8 sm:text-left">
              {member.photoUrl ? (
                <Image
                  src={member.photoUrl}
                  alt={t('team.profile.photoAlt', { name: member.name })}
                  width={192}
                  height={192}
                  unoptimized
                  priority
                  className="h-40 w-40 shrink-0 rounded-full border-4 border-white/20 object-cover shadow-xl sm:h-48 sm:w-48"
                />
              ) : (
                <span
                  className="flex h-40 w-40 shrink-0 items-center justify-center rounded-full border-4 border-white/20 bg-white/10 text-5xl font-bold text-white sm:h-48 sm:w-48"
                  aria-hidden
                >
                  {member.name.charAt(0)}
                </span>
              )}
              <div>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{member.name}</h1>
                <h2 className="mt-2 text-lg font-medium text-emerald-300 sm:text-xl">{member.role}</h2>
              </div>
            </div>
          ) : (
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {loading ? t('nav.team') : t('team.profile.notFoundTitle')}
            </h1>
          )}
        </div>
      </section>

      <AboutContentLayout>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner size="md" variant="primary" label={t('loading')} showLabel />
          </div>
        ) : !member ? (
          <div className="space-y-6">
            <div className="rounded-lg border border-atg-border bg-atg-elevated/50 px-4 py-8 text-center">
              <p className="text-sm text-atg-muted">{t('team.profile.notFoundHint')}</p>
            </div>
            <BackToTeamLink />
          </div>
        ) : (
          <div className="space-y-10">
            <section aria-labelledby="team-member-bio-heading">
              <h2 id="team-member-bio-heading" className="text-xl font-semibold text-atg-fg">
                {t('team.profile.aboutHeading', { name: member.name })}
              </h2>
              {member.bio ? (
                <RichText
                  content={member.bio}
                  className="mt-4 text-base leading-relaxed text-atg-fg/85 [&_p]:my-3"
                  fallbackClassName="mt-4 text-base leading-relaxed text-atg-fg/85"
                />
              ) : (
                <p className="mt-4 text-sm text-atg-muted">{t('team.profile.noBio')}</p>
              )}
            </section>

            {contactLinks.length > 0 ? (
              <section aria-labelledby="team-member-contact-heading">
                <h2 id="team-member-contact-heading" className="text-xl font-semibold text-atg-fg">
                  {t('team.profile.contactHeading')}
                </h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {contactLinks.map((link) => (
                    <li key={link.key}>
                      <a
                        href={link.href}
                        {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                        className="flex min-h-[44px] items-center gap-3 rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:hover:border-emerald-300"
                      >
                        <span className="text-primary dark:text-emerald-300">{link.icon}</span>
                        <span className="min-w-0">
                          <span className="block font-semibold text-atg-fg">
                            {t(`team.profile.${link.key}`)}
                          </span>
                          <span className="block truncate text-atg-muted">{link.display}</span>
                        </span>
                        {link.external ? (
                          <span className="sr-only">{t('team.profile.externalLinkHint')}</span>
                        ) : null}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <BackToTeamLink />
          </div>
        )}
      </AboutContentLayout>
    </>
  );
}
