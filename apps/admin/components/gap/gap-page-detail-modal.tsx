'use client';

import { Button, DataTableBadge, Modal } from '@africatourismgate/ui';
import type { GapPage } from '@africatourismgate/types';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { isRichTextEmpty } from '../../lib/rich-text';
import { resolveMediaUrl } from '../../lib/resolve-media-url';
import { RichTextContent } from '../rich-text-content';

type GapPageDetailModalProps = {
  open: boolean;
  page: GapPage | null;
  onOpenChange: (open: boolean) => void;
  canWrite?: boolean;
};

function DetailField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-atg-muted">{label}</dt>
      <dd className="mt-1 break-words text-sm text-atg-fg">{children}</dd>
    </div>
  );
}

function formatDateTime(iso: string | null, emptyDash: string): string {
  if (!iso) return emptyDash;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return emptyDash;
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function GapPageDetailModal({
  open,
  page,
  onOpenChange,
  canWrite = false,
}: GapPageDetailModalProps) {
  const t = useTranslations('modules.gap.pages.detail');
  const tForm = useTranslations('modules.gap.pages.form.fields');
  const tList = useTranslations('modules.gap.pages.list');
  const tSections = useTranslations('modules.gap.sections');
  const tStatus = useTranslations('modules.about.status');
  const tLocale = useTranslations('modules.about.locale');
  const tCommon = useTranslations('modules.common');
  const emptyDash = tCommon('empty.dash');

  const coverUrl = page?.coverImageUrl?.trim() || '';

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={page?.title ?? t('title')}
      showClose
      closeAriaLabel={t('close')}
      className="max-h-[90vh] max-w-2xl overflow-y-auto"
    >
      {!page ? null : (
        <div className="space-y-6">
          {coverUrl ? (
            <div className="overflow-hidden rounded-lg border border-atg-border">
              <Image
                src={resolveMediaUrl(coverUrl)}
                alt={page.title}
                width={640}
                height={360}
                unoptimized
                className="h-48 w-full object-cover"
              />
            </div>
          ) : null}

          <dl className="grid gap-4 sm:grid-cols-2">
            <DetailField label={tForm('section')}>{tSections(page.sectionKey)}</DetailField>
            <DetailField label={tCommon('columns.status')}>
              <DataTableBadge variant={page.status === 'published' ? 'success' : 'muted'}>
                {page.status === 'published' ? tStatus('published') : tStatus('draft')}
              </DataTableBadge>
            </DetailField>
            <DetailField label={tForm('locale')}>
              {tLocale(page.locale as 'fr' | 'en' | 'es')}
            </DetailField>
            <DetailField label={tList('columns.publishedAt')}>
              <span className="tabular-nums">{formatDateTime(page.publishedAt, emptyDash)}</span>
            </DetailField>
            <div className="sm:col-span-2">
              <DetailField label={tForm('excerpt')}>
                {page.excerpt?.trim() || emptyDash}
              </DetailField>
            </div>
            <div className="sm:col-span-2">
              <DetailField label={tForm('content')}>
                {page.content.trim() && !isRichTextEmpty(page.content) ? (
                  <RichTextContent html={page.content} />
                ) : (
                  <span className="text-atg-muted">{emptyDash}</span>
                )}
              </DetailField>
            </div>
          </dl>

          <div className="flex flex-wrap justify-end gap-3 border-t border-atg-border pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('close')}
            </Button>
            {canWrite ? (
              <Button type="button" href={`/gap/pages/${page.id}`}>
                {t('edit')}
              </Button>
            ) : null}
          </div>
        </div>
      )}
    </Modal>
  );
}
