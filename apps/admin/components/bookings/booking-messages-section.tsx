'use client';

import type { BookingMessage } from '@africatourismgate/types';
import { ConversationChat, DraggableFab, BookingChatFabIcon, Modal, useToast } from '@africatourismgate/ui';
import { useFormatter, useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';
import { useFormatDateTime } from '../../lib/i18n/use-module-labels';

const POLL_INTERVAL_MS = 20_000;
const FAB_STORAGE_KEY = 'atg-admin-booking-chat-fab-position';

type BookingMessagesSectionProps = {
  bookingId: string;
  canWrite: boolean;
  initialUnreadCount?: number;
};

export function BookingMessagesSection({
  bookingId,
  canWrite,
  initialUnreadCount = 0,
}: BookingMessagesSectionProps) {
  const { bookings: getBookingsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.bookings.messages');
  const { toast } = useToast();
  const format = useFormatter();
  const formatDateTime = useFormatDateTime();
  const formatDateSeparator = useCallback(
    (iso: string) => {
      try {
        return format.dateTime(new Date(iso), {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
      } catch {
        return iso;
      }
    },
    [format],
  );

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<BookingMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState('');
  const [replyError, setReplyError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const previousUnreadCountRef = useRef(initialUnreadCount);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const result = await getApiClient().getBookingUnreadMessageCount(bookingId);
      const nextCount = result.count;
      if (nextCount > previousUnreadCountRef.current && !open) {
        toast({
          variant: 'info',
          message: t('toast.newCustomerMessage'),
        });
      }
      previousUnreadCountRef.current = nextCount;
      setUnreadCount(nextCount);
    } catch {
      // ignore polling errors
    }
  }, [bookingId, open, t, toast]);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getApiClient().listBookingMessages(bookingId, { markRead: true });
      setMessages(result.messages);
      setUnreadCount(0);
      previousUnreadCountRef.current = 0;
    } catch (err) {
      setError(getBookingsErrorMessage(err));
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [bookingId, getBookingsErrorMessage]);

  useEffect(() => {
    setUnreadCount(initialUnreadCount);
    previousUnreadCountRef.current = initialUnreadCount;
  }, [bookingId, initialUnreadCount]);

  useEffect(() => {
    if (!open) {
      void refreshUnreadCount();
      const intervalId = window.setInterval(() => {
        void refreshUnreadCount();
      }, POLL_INTERVAL_MS);
      return () => window.clearInterval(intervalId);
    }
    return undefined;
  }, [open, refreshUnreadCount]);

  useEffect(() => {
    if (open) {
      void loadMessages();
    }
  }, [open, loadMessages]);

  const handleSend = useCallback(async () => {
    const body = replyBody.trim();
    if (!body) {
      return;
    }
    setReplyError(null);
    setSending(true);
    try {
      const created = await getApiClient().createBookingMessage(bookingId, { body });
      setReplyBody('');
      await loadMessages();
      toast({
        variant: 'success',
        message: created.customerNotifiedByEmail
          ? t('toast.sentWithEmail')
          : t('toast.sent'),
      });
    } catch (err) {
      setReplyError(getBookingsErrorMessage(err));
    } finally {
      setSending(false);
    }
  }, [bookingId, getBookingsErrorMessage, loadMessages, replyBody, t, toast]);

  const fabAriaLabel =
    unreadCount > 0
      ? t('fabAriaLabelWithUnread', { count: unreadCount })
      : t('fabAriaLabel');

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
        title={t('title')}
        showClose
        className="flex max-h-[min(720px,90vh)] w-full max-w-2xl flex-col"
      >
        {error ? (
          <p role="alert" className="mb-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        ) : null}

        <ConversationChat
          messages={messages}
          loading={loading}
          labels={{
            threadAria: t('threadAria'),
            loading: t('loading'),
            empty: t('empty'),
            authorStaff: t('author.staff'),
            authorCustomer: t('author.customer'),
            replyTitle: canWrite ? t('replyTitle') : undefined,
            replyLabel: t('replyLabel'),
            replyPlaceholder: t('replyPlaceholder'),
            sendReply: t('sendReply'),
          }}
          formatDateTime={formatDateTime}
          formatDateSeparator={formatDateSeparator}
          canReply={canWrite}
          replyBody={replyBody}
          onReplyBodyChange={setReplyBody}
          onSend={() => void handleSend()}
          sending={sending}
          replyError={replyError}
          className="min-h-0 flex-1"
        />
      </Modal>
    </>
  );
}
