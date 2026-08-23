'use client';

import { Button, Modal } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';

type AdminNetworkErrorModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRetry?: () => void;
  retrying?: boolean;
};

export function AdminNetworkErrorModal({
  open,
  onOpenChange,
  onRetry,
  retrying = false,
}: AdminNetworkErrorModalProps) {
  const tErrors = useTranslations('common.errors');
  const tActions = useTranslations('common.actions');

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={tErrors('networkTitle')}
      description={tErrors('network')}
      showClose
      closeAriaLabel={tActions('close')}
    >
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={retrying}
        >
          {tActions('close')}
        </Button>
        {onRetry ? (
          <Button
            type="button"
            onClick={onRetry}
            loading={retrying}
            loadingText={tActions('retry')}
          >
            {tActions('retry')}
          </Button>
        ) : null}
      </div>
    </Modal>
  );
}
