'use client';

import { Button, Input } from '@africatourismgate/ui';
import type { FundAttachment } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { resolveUnknownApiError } from '../../lib/common-api-errors';

const ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

type FundExitAttachmentsSectionProps = {
  fundExitId: string;
  initialAttachments?: FundAttachment[];
  canWrite: boolean;
  onChanged?: (attachments: FundAttachment[]) => void;
};

export function FundExitAttachmentsSection({
  fundExitId,
  initialAttachments = [],
  canWrite,
  onChanged,
}: FundExitAttachmentsSectionProps) {
  const t = useTranslations('modules.treasury.exits.form.attachments');
  const tErrors = useTranslations('modules.treasury.errors');
  const tCommonErrors = useTranslations('common.errors');
  const fileInputId = useId();
  const [attachments, setAttachments] = useState<FundAttachment[]>(initialAttachments);
  const [uploading, setUploading] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setAttachments(initialAttachments);
  }, [initialAttachments]);

  const commonErrors = {
    network: tCommonErrors('network'),
    forbidden: tErrors('forbidden'),
    generic: tErrors('saveFailed'),
    apiStatus: (status: number) => tCommonErrors('apiStatus', { status }),
  };

  const refresh = useCallback(async () => {
    const list = await getApiClient().listFundExitAttachments(fundExitId);
    setAttachments(list);
    onChanged?.(list);
  }, [fundExitId, onChanged]);

  const handleUpload = useCallback(
    async (file: File | undefined) => {
      if (!file || !canWrite) return;
      setError(null);
      if (!ALLOWED_TYPES.has(file.type) || file.size > ATTACHMENT_MAX_BYTES) {
        setError(t('hint'));
        return;
      }
      setUploading(true);
      try {
        const body = new FormData();
        body.append('file', file);
        await getApiClient().uploadFundExitAttachment(fundExitId, body);
        await refresh();
      } catch (err) {
        setError(
          resolveUnknownApiError(err, commonErrors, { useParseApiMessage: true }),
        );
      } finally {
        setUploading(false);
      }
    },
    [canWrite, commonErrors, fundExitId, refresh, t],
  );

  const handleRemove = useCallback(
    async (attachmentId: string) => {
      if (!canWrite) return;
      setError(null);
      setRemovingId(attachmentId);
      try {
        await getApiClient().deleteFundExitAttachment(fundExitId, attachmentId);
        await refresh();
      } catch (err) {
        setError(
          resolveUnknownApiError(err, commonErrors, { useParseApiMessage: true }),
        );
      } finally {
        setRemovingId(null);
      }
    },
    [canWrite, commonErrors, fundExitId, refresh],
  );

  return (
    <section className="space-y-3 rounded-lg border border-atg-border bg-atg-elevated p-4">
      <div>
        <h2 className="text-sm font-semibold text-atg-fg">{t('title')}</h2>
        <p className="mt-1 text-xs text-atg-muted">{t('hint')}</p>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}

      {attachments.length === 0 ? (
        <p className="text-sm text-atg-muted">{t('empty')}</p>
      ) : (
        <ul className="space-y-2">
          {attachments.map((file) => (
            <li
              key={file.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-atg-border px-3 py-2 text-sm"
            >
              <span className="min-w-0 truncate">{file.originalFilename}</span>
              {canWrite ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={removingId === file.id}
                  onClick={() => void handleRemove(file.id)}
                >
                  {t('remove')}
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {canWrite ? (
        <div>
          <Input
            id={fileInputId}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              void handleUpload(file);
            }}
          />
          {uploading ? (
            <p className="mt-1 text-xs text-atg-muted">{t('uploading')}</p>
          ) : (
            <p className="mt-1 text-xs text-atg-muted">{t('upload')}</p>
          )}
        </div>
      ) : null}
    </section>
  );
}
