'use client';

import { Button, useToast } from '@africatourismgate/ui';
import type { FundExit, FundExitStatus } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { resolveUnknownApiError } from '../../lib/common-api-errors';
import { PermissionGate } from '../permission-gate';

type ExitActionId = 'markDisbursed' | 'markRecorded';

type ExitTransitionTarget = Extract<FundExitStatus, 'disbursed' | 'recorded'>;

type PendingAction = {
  id: ExitActionId;
  toStatus: ExitTransitionTarget;
};

function actionsForStatus(status: FundExitStatus): PendingAction[] {
  switch (status) {
    case 'draft':
      return [{ id: 'markDisbursed', toStatus: 'disbursed' }];
    case 'disbursed':
      return [{ id: 'markRecorded', toStatus: 'recorded' }];
    default:
      return [];
  }
}

type FundExitWorkflowActionsProps = {
  fundExit: FundExit;
  attachmentCount: number;
  onTransitioned: (updated: FundExit) => void;
};

/**
 * Transitions UI sortie : draft → disbursed → recorded (TRESO-022).
 */
export function FundExitWorkflowActions({
  fundExit,
  attachmentCount,
  onTransitioned,
}: FundExitWorkflowActionsProps) {
  const t = useTranslations('modules.treasury.exits.workflow');
  const tErrors = useTranslations('modules.treasury.errors');
  const tCommonErrors = useTranslations('common.errors');
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const available = useMemo(
    () => actionsForStatus(fundExit.status),
    [fundExit.status],
  );

  const runTransition = useCallback(
    async (action: PendingAction) => {
      if (action.toStatus === 'recorded' && attachmentCount < 1) {
        toast({
          variant: 'error',
          title: t('toast.errorTitle'),
          message: t('attachmentRequired'),
        });
        return;
      }
      setSubmitting(true);
      try {
        const updated = await getApiClient().transitionFundExit(fundExit.id, {
          toStatus: action.toStatus,
        });
        toast({
          variant: 'success',
          title: t('toast.successTitle'),
          message: t('toast.successMessage'),
        });
        onTransitioned(updated);
      } catch (error) {
        toast({
          variant: 'error',
          title: t('toast.errorTitle'),
          message: resolveUnknownApiError(
            error,
            {
              network: tCommonErrors('network'),
              forbidden: tErrors('forbidden'),
              generic: tErrors('invalidTransition'),
              apiStatus: (status: number) =>
                tCommonErrors('apiStatus', { status }),
            },
            {
              useParseApiMessage: true,
              forbidden: tErrors('forbidden'),
            },
          ),
        });
      } finally {
        setSubmitting(false);
      }
    },
    [
      attachmentCount,
      fundExit.id,
      onTransitioned,
      t,
      tCommonErrors,
      tErrors,
      toast,
    ],
  );

  if (available.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {available.map((action) => (
        <PermissionGate key={action.id} permission="treasury.exits.write">
          <Button
            type="button"
            variant="primary"
            disabled={submitting}
            onClick={() => void runTransition(action)}
          >
            {t(`actions.${action.id}`)}
          </Button>
        </PermissionGate>
      ))}
    </div>
  );
}
