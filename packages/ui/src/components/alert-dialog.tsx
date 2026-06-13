'use client';

import { cn } from '../lib/cn';
import { Button } from './button';
import { Modal } from './modal';

export type AlertDialogVariant = 'default' | 'danger';

export type AlertDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  /** Libellé du bouton de confirmation. */
  confirmLabel?: string;
  /** Libellé du bouton d'annulation. */
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  /** `danger` applique un style destructif au bouton de confirmation. */
  variant?: AlertDialogVariant;
  loading?: boolean;
};

export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  onConfirm,
  onCancel,
  variant = 'default',
  loading = false,
}: AlertDialogProps) {
  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={title} description={description}>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={handleCancel} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          type="button"
          variant={variant === 'danger' ? 'primary' : 'primary'}
          onClick={handleConfirm}
          loading={loading}
          className={cn(
            variant === 'danger' &&
              'bg-red-600 hover:bg-red-700 focus-visible:ring-red-600 dark:bg-red-600 dark:hover:bg-red-700',
          )}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
