'use client';

import { useCallback, useEffect, useId, useRef } from 'react';
import { cn } from '../lib/cn';
import { Button } from './button';

export type ConversationChatMessage = {
  id: string;
  body: string;
  isStaff: boolean;
  createdAt: string;
};

export type ConversationChatLabels = {
  threadAria: string;
  loading: string;
  empty: string;
  authorStaff: string;
  authorCustomer: string;
  replyTitle?: string;
  replyLabel: string;
  replyPlaceholder: string;
  sendReply: string;
};

export type ConversationChatProps = {
  messages: ConversationChatMessage[];
  loading?: boolean;
  labels: ConversationChatLabels;
  formatDateTime: (iso: string) => string;
  formatDateSeparator?: (iso: string) => string;
  canReply?: boolean;
  replyBody: string;
  onReplyBodyChange: (value: string) => void;
  onSend: () => void;
  sending?: boolean;
  replyError?: string | null;
  className?: string;
};

function defaultDateSeparator(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function dayKey(iso: string): string {
  try {
    const date = new Date(iso);
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  } catch {
    return iso;
  }
}

export function ConversationChat({
  messages,
  loading = false,
  labels,
  formatDateTime,
  formatDateSeparator = defaultDateSeparator,
  canReply = false,
  replyBody,
  onReplyBodyChange,
  onSend,
  sending = false,
  replyError,
  className,
}: ConversationChatProps) {
  const replyBodyId = useId();
  const threadEndRef = useRef<HTMLDivElement>(null);
  const threadContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    threadEndRef.current?.scrollIntoView({ behavior, block: 'end' });
  }, []);

  useEffect(() => {
    if (!loading && messages.length > 0) {
      scrollToBottom('auto');
    }
  }, [loading, messages.length, scrollToBottom]);

  useEffect(() => {
    if (!sending && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, sending, scrollToBottom]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!sending && replyBody.trim()) {
        onSend();
      }
    }
  };

  let lastDayKey: string | null = null;

  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-xl border border-atg-border bg-atg-elevated shadow-sm dark:shadow-black/20',
        className,
      )}
    >
      <div
        ref={threadContainerRef}
        className="max-h-[28rem] min-h-[12rem] flex-1 overflow-y-auto p-4"
        aria-busy={loading}
      >
        {loading ? (
          <p className="text-sm text-atg-muted">{labels.loading}</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-atg-muted">{labels.empty}</p>
        ) : (
          <ul className="space-y-3" aria-label={labels.threadAria}>
            {messages.map((message) => {
              const currentDayKey = dayKey(message.createdAt);
              const showDateSeparator = currentDayKey !== lastDayKey;
              lastDayKey = currentDayKey;

              return (
                <li key={message.id}>
                  {showDateSeparator ? (
                    <div className="mb-4 flex items-center gap-3">
                      <div className="h-px flex-1 bg-atg-border" aria-hidden />
                      <time
                        className="shrink-0 text-xs font-medium text-atg-muted"
                        dateTime={message.createdAt}
                      >
                        {formatDateSeparator(message.createdAt)}
                      </time>
                      <div className="h-px flex-1 bg-atg-border" aria-hidden />
                    </div>
                  ) : null}
                  <div
                    className={cn(
                      'flex',
                      message.isStaff ? 'justify-end' : 'justify-start',
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-[80%] rounded-2xl px-4 py-2.5',
                        message.isStaff
                          ? 'rounded-br-md bg-primary/10 text-atg-fg dark:bg-primary/20'
                          : 'rounded-bl-md bg-atg-muted/15 text-atg-fg dark:bg-white/10',
                      )}
                    >
                      <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-atg-muted">
                          {message.isStaff ? labels.authorStaff : labels.authorCustomer}
                        </span>
                        <time
                          className="text-[10px] text-atg-muted"
                          dateTime={message.createdAt}
                        >
                          {formatDateTime(message.createdAt)}
                        </time>
                      </div>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.body}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <div ref={threadEndRef} aria-hidden />
      </div>

      {canReply ? (
        <div className="border-t border-atg-border bg-atg-surface/50 p-4 dark:bg-white/[0.02]">
          {labels.replyTitle ? (
            <h4 className="mb-3 text-sm font-semibold text-atg-fg">{labels.replyTitle}</h4>
          ) : null}
          <div>
            <label htmlFor={replyBodyId} className="mb-1 block text-xs font-medium text-atg-muted">
              {labels.replyLabel}
            </label>
            <textarea
              id={replyBodyId}
              rows={3}
              value={replyBody}
              onChange={(e) => onReplyBodyChange(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sending}
              placeholder={labels.replyPlaceholder}
              className="w-full resize-y rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg placeholder:text-atg-muted disabled:opacity-60"
            />
          </div>
          {replyError ? (
            <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">
              {replyError}
            </p>
          ) : null}
          <div className="mt-3">
            <Button
              type="button"
              variant="primary"
              disabled={sending || !replyBody.trim()}
              loading={sending}
              onClick={onSend}
            >
              {labels.sendReply}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
