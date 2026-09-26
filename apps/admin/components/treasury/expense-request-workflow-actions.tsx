'use client';

import { Button, Modal, Textarea, useToast } from '@africatourismgate/ui';
import type {
  ExpenseRequest,
  ExpenseRequestStatus,
} from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { usePermissions } from '../../lib/auth/use-permissions';
import { resolveUnknownApiError } from '../../lib/common-api-errors';
import { PermissionGate } from '../permission-gate';

type WorkflowActionId =
  | 'submit'
  | 'validate'
  | 'authorize'
  | 'reject'
  | 'cancel'
  | 'markRecorded';

type PendingAction = {
  id: WorkflowActionId;
  toStatus: ExpenseRequestStatus;
  requireComment: boolean;
};

function actionsForStatus(status: ExpenseRequestStatus): PendingAction[] {
  switch (status) {
    case 'draft':
      return [
        { id: 'submit', toStatus: 'submitted', requireComment: false },
        { id: 'cancel', toStatus: 'cancelled', requireComment: false },
      ];
    case 'submitted':
      return [
        { id: 'validate', toStatus: 'validated', requireComment: false },
        { id: 'reject', toStatus: 'rejected', requireComment: true },
        { id: 'cancel', toStatus: 'cancelled', requireComment: false },
      ];
    case 'validated':
      return [
        { id: 'authorize', toStatus: 'authorized', requireComment: false },
        { id: 'reject', toStatus: 'rejected', requireComment: true },
      ];
    case 'authorized':
      return [
        { id: 'markRecorded', toStatus: 'closed', requireComment: false },
      ];
    default:
      return [];
  }
}

function permissionForAction(
  action: PendingAction,
  currentStatus: ExpenseRequestStatus,
): string {
  switch (action.id) {
    case 'submit':
    case 'cancel':
      return 'treasury.expense_requests.create';
    case 'validate':
      return 'treasury.expense_requests.validate';
    case 'reject':
      return currentStatus === 'submitted'
        ? 'treasury.expense_requests.validate'
        : 'treasury.expense_requests.authorize';
    case 'authorize':
      return 'treasury.expense_requests.authorize';
    case 'markRecorded':
      return 'treasury.exits.write';
    default:
      return 'treasury.read';
  }
}

type ExpenseRequestWorkflowActionsProps = {
  expenseRequest: ExpenseRequest;
  onTransitioned: (updated: ExpenseRequest) => void;
};

export function ExpenseRequestWorkflowActions({
  expenseRequest,
  onTransitioned,
}: ExpenseRequestWorkflowActionsProps) {
  const t = useTranslations('modules.treasury.workflow');
  const tErrors = useTranslations('modules.treasury.errors');
  const tCommonErrors = useTranslations('common.errors');
  const { toast } = useToast();
  const { hasPermission, isSuperAdmin } = usePermissions();

  const [pending, setPending] = useState<PendingAction | null>(null);
  const [comment, setComment] = useState('');
  const [commentError, setCommentError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const available = useMemo(
    () => actionsForStatus(expenseRequest.status),
    [expenseRequest.status],
  );

  const openConfirm = useCallback((action: PendingAction) => {
    setPending(action);
    setComment('');
    setCommentError(null);
  }, []);

  const closeConfirm = useCallback(() => {
    if (submitting) return;
    setPending(null);
    setComment('');
    setCommentError(null);
  }, [submitting]);

  const runTransition = useCallback(async () => {
    if (!pending) return;
    if (pending.requireComment && !comment.trim()) {
      setCommentError(t('rejectReasonRequired'));
      return;
    }
    setSubmitting(true);
    try {
      const updated = await getApiClient().transitionExpenseRequest(
        expenseRequest.id,
        {
          toStatus: pending.toStatus,
          comment: comment.trim() || null,
        },
      );
      toast({
        variant: 'success',
        title: t('toast.successTitle'),
        message: t('toast.successMessage'),
      });
      setPending(null);
      setComment('');
      onTransitioned(updated);
    } catch (error) {
      const message = resolveUnknownApiError(
        error,
        {
          network: tCommonErrors('network'),
          forbidden: tErrors('forbidden'),
          generic: tErrors('saveFailed'),
          apiStatus: (status: number) => tCommonErrors('apiStatus', { status }),
        },
        { useParseApiMessage: true, forbidden: tErrors('forbidden') },
      );
      toast({
        variant: 'error',
        title: t('toast.errorTitle'),
        message,
      });
    } finally {
      setSubmitting(false);
    }
  }, [
    pending,
    comment,
    expenseRequest.id,
    onTransitioned,
    t,
    tCommonErrors,
    tErrors,
    toast,
  ]);

  if (available.length === 0) {
    return null;
  }

  const visibleActions = available.filter((action) => {
    const perm = permissionForAction(action, expenseRequest.status);
    return isSuperAdmin || hasPermission(perm);
  });

  if (visibleActions.length === 0 && expenseRequest.status !== 'authorized') {
    return null;
  }

  const confirmTitle = pending
    ? t(`confirm.${pending.id}Title` as 'confirm.submitTitle')
    : '';
  const confirmDescription = pending
    ? t(`confirm.${pending.id}Description` as 'confirm.submitDescription')
    : '';

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {visibleActions.map((action) => {
          const perm = permissionForAction(action, expenseRequest.status);
          const variant =
            action.id === 'reject' || action.id === 'cancel'
              ? 'outline'
              : 'primary';
          return (
            <PermissionGate key={action.id} permission={perm}>
              <Button
                type="button"
                variant={variant}
                onClick={() => openConfirm(action)}
              >
                {t(`actions.${action.id}`)}
              </Button>
            </PermissionGate>
          );
        })}

        {expenseRequest.status === 'authorized' ? (
          <PermissionGate permission="treasury.exits.write">
            <Button
              href={`/tresorerie/sorties/nouveau?expenseRequestId=${expenseRequest.id}`}
              variant="outline"
            >
              {t('actions.disburse')}
            </Button>
            <Button
              href={`/tresorerie/sorties/nouveau?expenseRequestId=${expenseRequest.id}`}
              variant="outline"
            >
              {t('actions.attachProof')}
            </Button>
          </PermissionGate>
        ) : null}
      </div>

      {expenseRequest.status === 'authorized' ? (
        <p className="text-xs text-atg-muted">{t('disbursementHint')}</p>
      ) : null}

      <Modal
        open={pending != null}
        onOpenChange={(open) => {
          if (!open) closeConfirm();
        }}
        title={confirmTitle}
        description={confirmDescription}
        showClose
        closeAriaLabel={t('confirm.cancel')}
      >
        <div className="space-y-4">
          {pending?.requireComment || pending?.id === 'cancel' ? (
            <Textarea
              label={t('commentLabel')}
              name="workflow-comment"
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                setCommentError(null);
              }}
              placeholder={t('commentPlaceholder')}
              error={commentError ?? undefined}
              required={pending?.requireComment}
              rows={3}
              disabled={submitting}
            />
          ) : (
            <Textarea
              label={t('commentLabel')}
              name="workflow-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t('commentPlaceholder')}
              rows={2}
              disabled={submitting}
            />
          )}
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={closeConfirm}
              disabled={submitting}
            >
              {t('confirm.cancel')}
            </Button>
            <Button
              type="button"
              variant={
                pending?.id === 'reject' || pending?.id === 'cancel'
                  ? 'outline'
                  : 'primary'
              }
              onClick={() => void runTransition()}
              disabled={submitting}
            >
              {submitting ? '…' : t('confirm.confirm')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
