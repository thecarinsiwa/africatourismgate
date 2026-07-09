import { getLocale } from 'next-intl/server';
import { getPublicGapHomeForLocale } from '../../lib/api/public';
import { translations } from '../../lib/i18n/translations';
import { DEFAULT_LOCALE, isLocale } from '../../lib/i18n/types';

export async function GapImpactSection() {
  const rawLocale = await getLocale();
  const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const t = translations[locale];
  const home = await getPublicGapHomeForLocale(locale).catch(() => ({ settings: null, impactStats: [] }));
  const stats = home.impactStats;

  if (stats.length === 0) {
    return null;
  }

  return (
    <section className="border-y border-atg-border bg-atg-elevated py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-3xl font-bold text-atg-fg sm:text-4xl">{t.gapImpact.title}</h2>
          <p className="mt-3 text-atg-muted">{t.gapImpact.subtitle}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const accent =
              stat.colorKey === 'secondary' ? 'border-secondary/30' : 'border-primary/30';
            const valueColor = stat.colorKey === 'secondary' ? 'text-secondary' : 'text-primary';
            return (
              <article
                key={stat.id}
                className={`rounded-2xl border bg-atg-surface p-6 shadow-sm ${accent}`}
              >
                <p className={`text-3xl font-bold tabular-nums ${valueColor}`}>{stat.valueDisplay}</p>
                <p className="mt-2 font-medium text-atg-fg">{stat.label}</p>
                {stat.description ? (
                  <p className="mt-2 text-sm leading-relaxed text-atg-muted">{stat.description}</p>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
