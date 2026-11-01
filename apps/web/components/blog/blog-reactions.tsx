'use client';

import {
  BLOG_REACTION_TYPES,
  type BlogReactionCounts,
  type BlogReactionType,
} from '@africatourismgate/types';
import { useTranslations } from 'next-intl';

const REACTION_EMOJI: Record<BlogReactionType, string> = {
  like: '👍',
  love: '❤️',
  clap: '👏',
  wow: '😮',
};

type BlogReactionsProps = {
  counts: BlogReactionCounts;
  viewerReaction: BlogReactionType | null;
  busy?: boolean;
  onToggle: (type: BlogReactionType) => void;
};

export function BlogReactions({
  counts,
  viewerReaction,
  busy = false,
  onToggle,
}: BlogReactionsProps) {
  const t = useTranslations('blog.engagement');

  return (
    <section className="space-y-3" aria-label={t('reactionsAria')}>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-atg-muted">
        {t('reactionsTitle')}
      </h2>
      <div className="flex flex-wrap gap-2">
        {BLOG_REACTION_TYPES.map((type) => {
          const selected = viewerReaction === type;
          return (
            <button
              key={type}
              type="button"
              disabled={busy}
              onClick={() => onToggle(type)}
              aria-pressed={selected}
              className={`inline-flex min-h-[40px] items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors disabled:opacity-60 ${
                selected
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-atg-border bg-atg-elevated text-atg-fg hover:border-primary/60'
              }`}
            >
              <span aria-hidden>{REACTION_EMOJI[type]}</span>
              <span>{t(`reactions.${type}`)}</span>
              <span className="tabular-nums text-atg-muted">{counts[type]}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
