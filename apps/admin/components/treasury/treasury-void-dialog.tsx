'use client';

import { Button, Modal, Textarea, useToast } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { resolveUnknownApiError } from '../../lib/common-api-errors';

type TreasuryVoidDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind: 'fund_entry' | 'fund_exit';
  entityId: string;
  onVoided: () => void | Promise<void>;
};

export function TreasuryVoidDialog({
  open,
  onOpenChange,
  kind,
  entityId,
  onVoided,
}: TreasuryVoidDialogProps) {
  const t = useTranslations('modules.treasury.void');
  const tCommon = useTranslations('modules.treasury.common');
  const tErrors = useTranslations('modules.treasury.errors');
  const tCommonErrors = useTranslations('common.errors');
  const { toast } = useToast();
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const reset = useCallback(() => {
    setReason('');
    setError(null);
    setSubmitting(false);
  }, []);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) reset();
      onOpenChange(next);
    },
    [onOpenChange, reset],
  );

  const handleConfirm = useCallback(async () => {
    const trimmed = reason.trim();
    if (!trimmed) {
      setError(t('validation.reasonRequired'));
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const client = getApiClient();
      if (kind === 'fund_entry') {
        await client.voidFundEntry(entityId, { reason: trimmed });
      } else {
        await client.voidFundExit(entityId, { reason: trimmed });
      }
      toast({
        title: t('toast.successTitle'),
        message: t('toast.successMessage'),
        variant: 'success',
      });
      handleOpenChange(false);
      await onVoided();
    } catch (err) {
      const message = resolveUnknownApiError(
        err,
        {
          network: tCommonErrors('network'),
          forbidden: t('accessDenied'),
          generic: tErrors('saveFailed'),
          apiStatus: (status: number) => tCommonErrors('apiStatus', { status }),
        },
        {
          useParseApiMessage: true,
          forbidden: t('accessDenied'),
        },
      );
      setError(message);
      toast({
        title: t('toast.errorTitle'),
        message,
        variant: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  }, [
    reason,
    kind,
    entityId,
    t,
    tErrors,
    tCommonErrors,
    toast,
    handleOpenChange,
    onVoided,
  ]);

  return (
    <Modal
      open={open}
      onOpenChange={handleOpenChange}
      title={t('title')}
      description={t('description')}
      showClose
      closeAriaLabel={tCommon('cancel')}
    >
      <div className="space-y-4">
        <Textarea
          label={t('reasonLabel')}
          name="void-reason"
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            setError(null);
          }}
          placeholder={t('reasonPlaceholder')}
          error={error ?? undefined}
          required
          rows={3}
          disabled={submitting}
        />
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={submitting}
          >
            {tCommon('cancel')}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => void handleConfirm()}
            disabled={submitting}
          >
            {submitting ? tCommon('loading') : t('confirm')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
