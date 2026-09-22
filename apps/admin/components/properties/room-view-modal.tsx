'use client';

import { Button, DataTableBadge, Modal } from '@africatourismgate/ui';
import type { Room } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { formatMoney } from '../../lib/format-money';
import { RoomImagesSection } from './room-images-section';

type RoomViewModalProps = {
  room: Room | null;
  propertyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (room: Room) => void;
};

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-atg-muted">
        {label}
      </dt>
      <dd className="mt-0.5 truncate text-sm font-medium text-atg-fg">{value}</dd>
    </div>
  );
}

export function RoomViewModal({
  room,
  propertyId,
  open,
  onOpenChange,
  onEdit,
}: RoomViewModalProps) {
  const t = useTranslations('modules.properties.sections.rooms');
  const tColumns = useTranslations('modules.common.columns');
  const tCommon = useTranslations('modules.common');
  const tActions = useTranslations('common.actions');
  const emptyDash = tCommon('empty.dash');

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={room?.name ?? t('viewTitle')}
      description={t('viewIntro')}
      showClose
      closeAriaLabel={tActions('close')}
      className="max-w-4xl"
    >
      {room ? (
        <div className="space-y-6">
          <div className="rounded-xl border border-atg-border bg-atg-surface/50 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold text-atg-fg">{room.name}</h3>
                  {room.roomType?.trim() ? (
                    <DataTableBadge variant="muted">{room.roomType.trim()}</DataTableBadge>
                  ) : null}
                </div>
                <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <DetailItem
                    label={t('maxCapacity')}
                    value={tCommon('maxGuests', { count: room.maxGuests })}
                  />
                  <DetailItem
                    label={t('bedConfig')}
                    value={room.bedConfig?.trim() || emptyDash}
                  />
                  <DetailItem
                    label={tColumns('basePrice')}
                    value={formatMoney(room.basePriceCents, room.currency)}
                  />
                  <DetailItem label={tCommon('form.currency')} value={room.currency} />
                </dl>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    onOpenChange(false);
                    onEdit(room);
                  }}
                >
                  {tActions('edit')}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  href={`/hebergements/${propertyId}/chambres/${room.id}/disponibilites`}
                >
                  {t('availabilityAction')}
                </Button>
              </div>
            </div>
          </div>

          <RoomImagesSection roomId={room.id} roomName={room.name} embedded />
        </div>
      ) : null}
    </Modal>
  );
}
