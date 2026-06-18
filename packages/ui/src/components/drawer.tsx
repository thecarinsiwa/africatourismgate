'use client';

import { useCallback, useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../lib/cn';
import { getFocusableElements, trapFocus } from '../lib/focus-trap';
import { Button } from './button';

export type DrawerSide = 'right' | 'bottom';

export type DrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  /** Panel slides in from the right (default) or bottom. */
  side?: DrawerSide;
  className?: string;
  showClose?: boolean;
};

export function Drawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  side = 'right',
  className,
  showClose = true,
}: DrawerProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  useEffect(() => {
    if (!open) return;

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const frame = window.requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = getFocusableElements(panel);
      if (focusable.length > 0) {
        focusable[0].focus();
      } else {
        panel.focus();
      }
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }
      const panel = panelRef.current;
      if (panel) trapFocus(panel, event);
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocusedRef.current?.focus?.();
    };
  }, [open, close]);

  if (!open || typeof document === 'undefined') return null;

  const isBottom = side === 'bottom';

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/50 dark:bg-black/70"
        aria-hidden
        onClick={close}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          'absolute z-10 flex flex-col border-atg-border bg-atg-elevated shadow-xl shadow-black/10 dark:shadow-black/40',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          isBottom
            ? 'inset-x-0 bottom-0 max-h-[85vh] rounded-t-xl border-t'
            : 'inset-y-0 right-0 w-full max-w-sm border-l',
          className,
        )}
      >
        {(title || showClose) && (
          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-atg-border px-4 py-4">
            <div className="min-w-0">
              {title ? (
                <h2 id={titleId} className="text-lg font-semibold text-atg-fg">
                  {title}
                </h2>
              ) : null}
              {description ? (
                <p id={descriptionId} className="mt-1 text-sm text-atg-muted">
                  {description}
                </p>
              ) : null}
            </div>
            {showClose ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={close}
                aria-label="Fermer"
                className="shrink-0"
              >
                ✕
              </Button>
            ) : null}
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        {footer ? <div className="shrink-0 border-t border-atg-border">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  );
}
