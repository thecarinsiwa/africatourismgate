'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';

type BlogShareBarProps = {
  title: string;
  url: string;
};

export function BlogShareBar({ title, url }: BlogShareBarProps) {
  const t = useTranslations('blog.engagement');
  const [copied, setCopied] = useState(false);

  const shareTargets = useMemo(
    () => [
      {
        key: 'facebook',
        label: t('shareFacebook'),
        href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      },
      {
        key: 'x',
        label: t('shareX'),
        href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      },
      {
        key: 'linkedin',
        label: t('shareLinkedIn'),
        href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      },
      {
        key: 'whatsapp',
        label: t('shareWhatsApp'),
        href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
      },
    ],
    [t, title, url],
  );

  const handleNativeShare = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.share) return;
    try {
      await navigator.share({ title, url });
    } catch {
      // User cancelled — ignore.
    }
  }, [title, url]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [url]);

  const canNativeShare =
    typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  return (
    <section className="space-y-3" aria-label={t('shareAria')}>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-atg-muted">
        {t('shareTitle')}
      </h2>
      <div className="flex flex-wrap gap-2">
        {canNativeShare ? (
          <button
            type="button"
            onClick={() => void handleNativeShare()}
            className="inline-flex min-h-[40px] items-center rounded-md border border-atg-border bg-atg-elevated px-3 text-sm font-medium text-atg-fg transition-colors hover:border-primary hover:text-primary"
          >
            {t('shareNative')}
          </button>
        ) : null}
        {shareTargets.map((target) => (
          <a
            key={target.key}
            href={target.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[40px] items-center rounded-md border border-atg-border bg-atg-elevated px-3 text-sm font-medium text-atg-fg transition-colors hover:border-primary hover:text-primary"
          >
            {target.label}
          </a>
        ))}
        <button
          type="button"
          onClick={() => void handleCopy()}
          className="inline-flex min-h-[40px] items-center rounded-md border border-atg-border bg-atg-elevated px-3 text-sm font-medium text-atg-fg transition-colors hover:border-primary hover:text-primary"
        >
          {copied ? t('linkCopied') : t('copyLink')}
        </button>
      </div>
    </section>
  );
}
