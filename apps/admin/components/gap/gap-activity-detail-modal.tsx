'use client';

import { Button, DataTableBadge, Modal } from '@africatourismgate/ui';
import type { GapActivity } from '@africatourismgate/types';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { isRichTextEmpty } from '../../lib/rich-text';
import { resolveMediaUrl } from '../../lib/resolve-media-url';

type GapActivityDetailModalProps = {
  open: boolean;
  activity: GapActivity | null;
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

function resolveActivityImageUrls(activity: GapActivity): string[] {
  const fromArray = Array.isArray(activity.imageUrls) ? activity.imageUrls : [];
  if (fromArray.length > 0) {
    return [...new Set(fromArray.map((url) => url.trim()).filter(Boolean))];
  }
  return activity.imageUrl?.trim() ? [activity.imageUrl.trim()] : [];
}

export function GapActivityDetailModal({
  open,
  activity,
  onOpenChange,
  canWrite = false,
}: GapActivityDetailModalProps) {
  const t = useTranslations('modules.gap.activities.detail');
  const tForm = useTranslations('modules.gap.activities.form.fields');
  const tIcons = useTranslations('modules.gap.activityIcons');
  const tStatus = useTranslations('modules.about.status');
  const tLocale = useTranslations('modules.about.locale');
  const tCommon = useTranslations('modules.common');
  const emptyDash = tCommon('empty.dash');

  const imageUrls = activity ? resolveActivityImageUrls(activity) : [];

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={activity?.title ?? t('title')}
      showClose
      closeAriaLabel={t('close')}
      className="max-h-[90vh] max-w-2xl overflow-y-auto"
    >
      {!activity ? null : (
        <div className="space-y-6">
          {imageUrls.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {imageUrls.map((url, index) => (
                <div
                  key={`${url}-${index}`}
                  className="overflow-hidden rounded-lg border border-atg-border"
                >
                  <Image
                    src={resolveMediaUrl(url)}
                    alt={
                      index === 0
                        ? activity.title
                        : `${activity.title} (${index + 1})`
                    }
                    width={320}
                    height={200}
                    unoptimized
                    className="aspect-[4/3] h-auto w-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : null}

          <dl className="grid gap-4 sm:grid-cols-2">
            <DetailField label={tForm('iconKey')}>{tIcons(activity.iconKey)}</DetailField>
            <DetailField label={tCommon('columns.status')}>
              <DataTableBadge variant={activity.status === 'published' ? 'success' : 'muted'}>
                {activity.status === 'published' ? tStatus('published') : tStatus('draft')}
              </DataTableBadge>
            </DetailField>
            <DetailField label={tForm('locale')}>
              {tLocale(activity.locale as 'fr' | 'en' | 'es')}
            </DetailField>
            <DetailField label={tForm('sortOrder')}>
              <span className="tabular-nums">{activity.sortOrder}</span>
            </DetailField>
            <div className="sm:col-span-2">
              <DetailField label={tForm('description')}>
                {activity.description.trim() && !isRichTextEmpty(activity.description) ? (
                  <div
                    className="prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: activity.description }}
                  />
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
              <Button type="button" href={`/gap/activites/${activity.id}`}>
                {t('edit')}
              </Button>
            ) : null}
          </div>
        </div>
      )}
    </Modal>
  );
}
