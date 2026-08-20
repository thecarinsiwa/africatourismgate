import Image from 'next/image';
import Link from 'next/link';
import type { PublicGapSiteSettings } from '@africatourismgate/types';
import { getTranslations } from 'next-intl/server';
import { GapDonateButton } from '@/components/gap-donate-button';
import { resolveGapDonateUrl, resolveGapMediaUrl } from '@/lib/api/public-gap';
import { getPublicDonationsForLocale, resolveNavbarDonation } from '@/lib/api/public-donations';
import { getLocale } from 'next-intl/server';

type GapHeroProps = {
  settings: PublicGapSiteSettings | null;
};

export async function GapHero({ settings }: GapHeroProps) {
  const locale = await getLocale();
  const t = await getTranslations('meta');
  const title = settings?.title ?? t('siteName');
  const subtitle = settings?.subtitle ?? t('defaultDescription');
  const heroUrl = resolveGapMediaUrl(settings?.heroImageUrl);
  const heroAlt = settings?.heroImageAlt ?? title;

  const donations = await getPublicDonationsForLocale(locale, 'gap').catch(() => null);
  const featured = resolveNavbarDonation(donations);
  const donateUrl = featured?.url ?? resolveGapDonateUrl(settings);
  const donateLabel =
    featured?.buttonLabel?.trim() ||
    settings?.donateLabel?.trim() ||
    (await getTranslations('nav'))('donate');

  const links =
    settings?.links?.length
      ? settings.links
      : settings?.unescoLabel
        ? [{ label: settings.unescoLabel, url: settings.unescoUrl }]
        : [];

  return (
    <section className="relative isolate overflow-hidden bg-gap-forest text-white">
      {heroUrl ? (
        <Image
          src={heroUrl}
          alt={heroAlt}
          fill
          priority
          className="object-cover opacity-45"
          sizes="100vw"
        />
      ) : (
        <div className="absolute inset-0 gap-hero-gradient opacity-90" aria-hidden />
      )}
      <div
        className="absolute inset-0"
        style={{ background: 'var(--gap-hero-overlay)' }}
        aria-hidden
      />

      <div className="relative mx-auto flex min-h-[min(72vh,640px)] max-w-6xl flex-col justify-end px-4 pb-12 pt-24 sm:px-6 sm:pb-16">
        <div className="max-w-3xl gap-animate-fade-up">
          {links.length > 0 ? (
            <div className="mb-4 flex flex-wrap gap-2">
              {links.map((link) => (
                <p
                  key={`${link.label}-${link.url ?? ''}`}
                  className="inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide backdrop-blur-sm"
                >
                  {link.url ? (
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {link.label}
                    </a>
                  ) : (
                    link.label
                  )}
                </p>
              ))}
            </div>
          ) : null}
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
            {subtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/about"
              className="inline-flex rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-gap-forest transition hover:bg-white/90"
            >
              {(await getTranslations('common'))('learnMore')}
            </Link>
            <Link
              href="/activities"
              className="inline-flex rounded-lg border border-white/40 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {(await getTranslations('nav'))('activities')}
            </Link>
            {donateUrl ? (
              <GapDonateButton href={donateUrl} label={donateLabel} variant="hero" />
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
