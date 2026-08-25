'use client';

import { useCallback, useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../lib/cn';
import { getInitialFocusElement, trapFocus } from '../lib/focus-trap';
import { Button } from './button';

export type ModalProps = {
  /** Contrôle l'affichage de la modale. */
  open: boolean;
  /** Callback lorsque l'utilisateur demande la fermeture (overlay, Escape, bouton). */
  onOpenChange: (open: boolean) => void;
  /** Titre affiché dans l'en-tête de la modale. */
  title?: string;
  /** Description accessible (aria-describedby). */
  description?: string;
  children?: React.ReactNode;
  className?: string;
  /** Classes appliquées au conteneur plein écran (z-index, etc.). */
  containerClassName?: string;
  /** Affiche un bouton de fermeture en haut à droite. */
  showClose?: boolean;
  /** Libellé accessible du bouton de fermeture. */
  closeAriaLabel?: string;
};

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  showClose = false,
  containerClassName,
  closeAriaLabel = 'Fermer',
}: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const onOpenChangeRef = useRef(onOpenChange);
  onOpenChangeRef.current = onOpenChange;

  const close = useCallback(() => {
    onOpenChangeRef.current(false);
  }, []);

  useEffect(() => {
    if (!open) return;

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const frame = window.requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const initialFocus = getInitialFocusElement(panel);
      if (initialFocus) {
        initialFocus.focus();
      } else {
        panel.focus();
      }
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onOpenChangeRef.current(false);
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
  }, [open]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-50 overflow-y-auto overscroll-contain',
        containerClassName,
      )}
    >
      <div
        className="flex min-h-full items-center justify-center p-4"
        onClick={close}
      >
        <div
          className="fixed inset-0 bg-black/50 dark:bg-black/70"
          aria-hidden
        />
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          aria-describedby={description ? descriptionId : undefined}
          tabIndex={-1}
          onClick={(event) => event.stopPropagation()}
          className={cn(
            'relative z-10 my-auto w-full max-w-lg max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain rounded-xl border border-atg-border bg-atg-elevated p-6 shadow-xl shadow-black/10 dark:shadow-black/40',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-atg-surface',
            className,
          )}
        >
          {(title || showClose) && (
            <div className="mb-4 flex items-start justify-between gap-4">
              {title ? (
                <h2 id={titleId} className="text-lg font-semibold text-atg-fg">
                  {title}
                </h2>
              ) : (
                <span />
              )}
              {showClose ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={close}
                  aria-label={closeAriaLabel}
                  className="shrink-0"
                >
                  ✕
                </Button>
              ) : null}
            </div>
          )}
          {description ? (
            <p id={descriptionId} className="mb-4 text-sm text-atg-muted">
              {description}
            </p>
          ) : null}
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
