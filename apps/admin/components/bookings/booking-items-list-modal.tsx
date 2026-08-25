'use client';

import { Modal } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { BookingItemsList } from './booking-items-list';

type BookingItemsListModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function BookingItemsListModal({ open, onOpenChange }: BookingItemsListModalProps) {
  const t = useTranslations('pages.reservations.lignes');
  const tActions = useTranslations('common.actions');

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={t('title')}
      showClose
      closeAriaLabel={tActions('close')}
      className="max-w-6xl"
    >
      <p className="mb-4 text-sm text-atg-muted">{t('description')}</p>
      <BookingItemsList />
    </Modal>
  );
}
