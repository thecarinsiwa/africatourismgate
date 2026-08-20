'use client';

import { Button, DataTableBadge, Modal } from '@africatourismgate/ui';
import type { GapMediaItem } from '@africatourismgate/types';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { resolveMediaUrl } from '../../lib/resolve-media-url';

type GapMediaItemDetailModalProps = {
  open: boolean;
  item: GapMediaItem | null;
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

function UrlValue({
  url,
  emptyDash,
  openLabel,
}: {
  url: string | null;
  emptyDash: string;
  openLabel: string;
}) {
  if (!url?.trim()) {
    return <span className="text-atg-muted">{emptyDash}</span>;
  }

  const href = resolveMediaUrl(url);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="break-all text-primary hover:underline"
    >
      {openLabel}
    </a>
  );
}

export function GapMediaItemDetailModal({
  open,
  item,
  onOpenChange,
  canWrite = false,
}: GapMediaItemDetailModalProps) {
  const t = useTranslations('modules.gap.media.detail');
  const tList = useTranslations('modules.gap.media.list');
  const tForm = useTranslations('modules.gap.media.form.fields');
  const tTypes = useTranslations('modules.gap.mediaTypes');
  const tStatus = useTranslations('modules.about.status');
  const tLocale = useTranslations('modules.about.locale');
  const tCommon = useTranslations('modules.common');
  const emptyDash = tCommon('empty.dash');

  const previewUrl = item?.thumbnailUrl?.trim() || item?.fileUrl?.trim() || '';
  const showImagePreview =
    Boolean(previewUrl) &&
    (item?.mediaType === 'image' || Boolean(item?.thumbnailUrl?.trim()));

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={item?.title ?? t('title')}
      showClose
      closeAriaLabel={t('close')}
      className="max-h-[90vh] max-w-2xl overflow-y-auto"
    >
      {!item ? null : (
        <div className="space-y-6">
          {showImagePreview ? (
            <div className="overflow-hidden rounded-lg border border-atg-border">
              <Image
                src={resolveMediaUrl(previewUrl)}
                alt={item.title}
                width={640}
                height={360}
                unoptimized
                className="h-48 w-full object-cover"
              />
            </div>
          ) : null}

          <dl className="grid gap-4 sm:grid-cols-2">
            <DetailField label={tForm('mediaType')}>{tTypes(item.mediaType)}</DetailField>
            <DetailField label={tCommon('columns.status')}>
              <DataTableBadge variant={item.status === 'published' ? 'success' : 'muted'}>
                {item.status === 'published' ? tStatus('published') : tStatus('draft')}
              </DataTableBadge>
            </DetailField>
            <DetailField label={tForm('locale')}>
              {tLocale(item.locale as 'fr' | 'en' | 'es')}
            </DetailField>
            <DetailField label={tForm('sortOrder')}>
              <span className="tabular-nums">{item.sortOrder}</span>
            </DetailField>
            <DetailField label={tList('columns.publishedAt')}>
              <span className="tabular-nums">
                {formatDateTime(item.publishedAt, emptyDash)}
              </span>
            </DetailField>
            <div className="sm:col-span-2">
              <DetailField label={tForm('description')}>
                {item.description?.trim() || emptyDash}
              </DetailField>
            </div>
            <div className="sm:col-span-2">
              <DetailField label={tForm('fileUrl')}>
                <UrlValue url={item.fileUrl} emptyDash={emptyDash} openLabel={t('openUrl')} />
              </DetailField>
            </div>
            <div className="sm:col-span-2">
              <DetailField label={tForm('externalUrl')}>
                <UrlValue
                  url={item.externalUrl}
                  emptyDash={emptyDash}
                  openLabel={t('openUrl')}
                />
              </DetailField>
            </div>
            <div className="sm:col-span-2">
              <DetailField label={tForm('thumbnailUrl')}>
                <UrlValue
                  url={item.thumbnailUrl}
                  emptyDash={emptyDash}
                  openLabel={t('openUrl')}
                />
              </DetailField>
            </div>
          </dl>

          <div className="flex flex-wrap justify-end gap-3 border-t border-atg-border pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('close')}
            </Button>
            {canWrite ? (
              <Button type="button" href={`/gap/medias/${item.id}`}>
                {t('edit')}
              </Button>
            ) : null}
          </div>
        </div>
      )}
    </Modal>
  );
}
