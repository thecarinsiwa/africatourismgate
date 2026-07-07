'use client';

import {
  BookingChatFabIcon,
  DraggableFab,
  Modal,
} from '@africatourismgate/ui';
import { useEffect, useState } from 'react';
import { useTranslations } from '../../lib/i18n/locale-provider';
import { BookingChatPanel } from './booking-chat-panel';

const FAB_STORAGE_KEY = 'atg-web-booking-chat-fab-position';

type BookingMessagesSectionProps = {
  bookingId: string;
  localeTag: string;
  chatToken?: string | null;
  canReply?: boolean;
  initialUnreadCount?: number;
  autoOpen?: boolean;
};

export function BookingMessagesSection({
  bookingId,
  localeTag,
  chatToken,
  canReply = true,
  initialUnreadCount = 0,
  autoOpen = false,
}: BookingMessagesSectionProps) {
  const t = useTranslations();
  const m = t.account.reservations.detail.messages;

  const [open, setOpen] = useState(autoOpen);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);

  useEffect(() => {
    setUnreadCount(initialUnreadCount);
  }, [bookingId, initialUnreadCount]);

  useEffect(() => {
    if (autoOpen) {
      setOpen(true);
    }
  }, [autoOpen, bookingId]);

  const fabAriaLabel =
    unreadCount > 0
      ? m.fabAriaLabelWithUnread.replace('{count}', String(unreadCount))
      : m.fabAriaLabel;

  return (
    <>
      {!open ? (
        <DraggableFab
          onClick={() => setOpen(true)}
          ariaLabel={fabAriaLabel}
          storageKey={FAB_STORAGE_KEY}
          badgeCount={unreadCount}
        >
          <BookingChatFabIcon className="size-11" />
        </DraggableFab>
      ) : null}

      <Modal
        open={open}
        onOpenChange={setOpen}
        title={m.title}
        showClose
        className="flex max-h-[min(720px,90vh)] w-full max-w-2xl flex-col"
      >
        <BookingChatPanel
          bookingId={bookingId}
          localeTag={localeTag}
          chatToken={chatToken}
          canReply={canReply}
          initialUnreadCount={initialUnreadCount}
          onUnreadChange={setUnreadCount}
          active={open}
          className="flex min-h-0 flex-1 flex-col"
        />
      </Modal>
    </>
  );
}
