'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { Button, Input, Modal, useToast } from '@africatourismgate/ui';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useId, useState } from 'react';
import {
  downloadAccommodationWorkbook,
  downloadBookingsPdf,
  downloadCatalogPdf,
  downloadKpiSummaryPdf,
} from '../../lib/properties-reports';

type ExportAction = 'excel' | 'pdfKpi' | 'pdfCatalog' | 'pdfBookings';

type PropertiesExportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  search: string;
  destinationId: string;
  canExportBookings: boolean;
};

function isValidDateRange(dateFrom: string, dateTo: string): boolean {
  if (!dateFrom || !dateTo) {
    return false;
  }
  return dateFrom <= dateTo;
}

export function PropertiesExportDialog({
  open,
  onOpenChange,
  search,
  destinationId,
  canExportBookings,
}: PropertiesExportDialogProps) {
  const { hebergements: getHebergementsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.properties.exports');
  const tActions = useTranslations('common.actions');
  const locale = useLocale();
  const { toast } = useToast();
  const dateFromId = useId();
  const dateToId = useId();

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loadingAction, setLoadingAction] = useState<ExportAction | null>(null);

  const scope = {
    search: search || undefined,
    destinationId: destinationId || undefined,
    locale,
  };

  const hasValidPeriod = isValidDateRange(dateFrom, dateTo);
  const periodError =
    dateFrom && dateTo && !hasValidPeriod ? t('periodInvalid') : null;

  const resetLoading = useCallback(() => {
    setLoadingAction(null);
  }, []);

  const runExport = useCallback(
    async (action: ExportAction, runner: () => Promise<void>) => {
      if (action === 'excel' || action === 'pdfBookings') {
        if (!hasValidPeriod) {
          toast({ variant: 'error', message: t('periodRequired') });
          return;
        }
      }

      setLoadingAction(action);
      try {
        await runner();
        toast({ variant: 'success', message: t('success') });
        onOpenChange(false);
      } catch (error) {
        toast({
          variant: 'error',
          message: getHebergementsErrorMessage(error) || t('error'),
        });
      } finally {
        resetLoading();
      }
    },
    [
      getHebergementsErrorMessage,
      hasValidPeriod,
      onOpenChange,
      resetLoading,
      t,
      toast,
    ],
  );

  const datedScope = {
    ...scope,
    dateFrom,
    dateTo,
  };

  return (
    <Modal
      open={open}
      onOpenChange={(nextOpen) => {
        if (!loadingAction) {
          onOpenChange(nextOpen);
        }
      }}
      title={t('dialogTitle')}
      description={t('dialogDescription')}
      showClose
      className="max-w-xl"
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id={dateFromId}
            type="date"
            label={t('dateFrom')}
            value={dateFrom}
            onChange={(event) => setDateFrom(event.target.value)}
            disabled={loadingAction !== null}
          />
          <Input
            id={dateToId}
            type="date"
            label={t('dateTo')}
            value={dateTo}
            onChange={(event) => setDateTo(event.target.value)}
            disabled={loadingAction !== null}
          />
        </div>
        {periodError ? (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {periodError}
          </p>
        ) : null}

        <div className="space-y-2">
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start"
            disabled={loadingAction !== null || !hasValidPeriod}
            loading={loadingAction === 'excel'}
            onClick={() =>
              void runExport('excel', () => downloadAccommodationWorkbook(datedScope))
            }
          >
            {t('excel')}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start"
            disabled={loadingAction !== null}
            loading={loadingAction === 'pdfKpi'}
            onClick={() => void runExport('pdfKpi', () => downloadKpiSummaryPdf(scope))}
          >
            {t('pdfKpi')}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start"
            disabled={loadingAction !== null}
            loading={loadingAction === 'pdfCatalog'}
            onClick={() => void runExport('pdfCatalog', () => downloadCatalogPdf(scope))}
          >
            {t('pdfCatalog')}
          </Button>
          {canExportBookings ? (
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start"
              disabled={loadingAction !== null || !hasValidPeriod}
              loading={loadingAction === 'pdfBookings'}
              onClick={() =>
                void runExport('pdfBookings', () => downloadBookingsPdf(datedScope))
              }
            >
              {t('pdfBookings')}
            </Button>
          ) : (
            <p className="text-sm text-atg-muted">{t('noPermissionBookings')}</p>
          )}
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={loadingAction !== null}
          >
            {tActions('cancel')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
