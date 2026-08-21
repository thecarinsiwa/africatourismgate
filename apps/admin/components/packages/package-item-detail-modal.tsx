'use client';

import { Button, Modal } from '@africatourismgate/ui';
import type { PackageItemEnriched, PackageItemType } from '@africatourismgate/types';
import { useLocale, useTranslations } from 'next-intl';
import { formatMoney } from '../../lib/format-money';
import { PackageItemTypeIcon } from './package-item-type-icon';

type PackageItemDetailModalProps = {
  open: boolean;
  item: PackageItemEnriched | null;
  onOpenChange: (open: boolean) => void;
};

function productHref(itemType: PackageItemType, itemId: string): string | null {
  switch (itemType) {
    case 'property':
      return `/hebergements/${itemId}/voir`;
    case 'flight':
      return `/produits/vols/${itemId}/voir`;
    case 'vehicle':
      return `/produits/locations/${itemId}/voir`;
    case 'activity':
      return `/produits/activites/${itemId}/voir`;
    case 'cruise':
      return null;
    default:
      return null;
  }
}

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

export function PackageItemDetailModal({
  open,
  item,
  onOpenChange,
}: PackageItemDetailModalProps) {
  const t = useTranslations('modules.packages.sections.items');
  const tCommon = useTranslations('modules.common');
  const tActions = useTranslations('common.actions');
  const locale = useLocale();
  const href = item ? productHref(item.itemType, item.itemId) : null;
  const createdAtLabel = item?.createdAt
    ? new Date(item.createdAt).toLocaleString(locale)
    : tCommon('empty.dash');

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={item?.label ?? t('viewTitle')}
      showClose
      closeAriaLabel={tActions('close')}
      className="max-w-lg"
    >
      {!item ? null : (
        <div className="space-y-5">
          <dl className="grid gap-4 sm:grid-cols-2">
            <DetailField label={tCommon('columns.type')}>
              <PackageItemTypeIcon itemType={item.itemType} showLabel size="sm" />
            </DetailField>
            <DetailField label={tCommon('columns.unitPrice')}>
              <span className="tabular-nums font-semibold">
                {formatMoney(item.unitPriceCents, item.currency)}
              </span>
            </DetailField>
            <div className="sm:col-span-2">
              <DetailField label={tCommon('columns.product')}>{item.label}</DetailField>
            </div>
            <DetailField label={t('viewAddedAt')}>{createdAtLabel}</DetailField>
          </dl>

          <div className="flex flex-wrap justify-end gap-3 border-t border-atg-border pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {tActions('close')}
            </Button>
            {href ? (
              <Button type="button" href={href}>
                {t('openProduct')}
              </Button>
            ) : null}
          </div>
        </div>
      )}
    </Modal>
  );
}
