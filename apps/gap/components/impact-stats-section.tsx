import type { PublicGapImpactStat } from '@africatourismgate/types';
import { getTranslations } from 'next-intl/server';

type ImpactStatsSectionProps = {
  stats: PublicGapImpactStat[];
  showHeader?: boolean;
};

export async function ImpactStatsSection({ stats, showHeader = true }: ImpactStatsSectionProps) {
  const t = await getTranslations('home');

  if (stats.length === 0) {
    return null;
  }

  return (
    <section className="gap-section-pattern border-y border-atg-border bg-atg-elevated py-14 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {showHeader ? (
          <div className="mb-10 max-w-2xl">
            <h2 className="text-3xl font-bold text-atg-fg">{t('impactTitle')}</h2>
            <p className="mt-3 text-atg-muted">{t('impactSubtitle')}</p>
          </div>
        ) : null}

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
                <p className={`text-3xl font-bold tabular-nums ${valueColor}`}>
                  {stat.valueDisplay}
                </p>
                <p className="mt-2 font-medium text-atg-fg">{stat.label}</p>
                {stat.description ? (
                  <div
                    className="prose prose-sm mt-2 max-w-none text-atg-muted dark:prose-invert prose-p:my-1 prose-p:leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: stat.description }}
                  />
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
