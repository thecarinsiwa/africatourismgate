'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { Button, useToast } from '@africatourismgate/ui';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';
import { downloadFlightDossierPdf } from '../../lib/flights-reports';

type FlightExportPdfButtonProps = {
  flightId: string;
  className?: string;
};

export function FlightExportPdfButton({ flightId, className }: FlightExportPdfButtonProps) {
  const { vols: getVolsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.flights.exports');
  const locale = useLocale();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleExport = useCallback(async () => {
    setLoading(true);
    try {
      await downloadFlightDossierPdf(flightId, { locale });
      toast({ variant: 'success', message: t('success') });
    } catch (error) {
      toast({
        variant: 'error',
        message: getVolsErrorMessage(error) || t('error'),
      });
    } finally {
      setLoading(false);
    }
  }, [flightId, getVolsErrorMessage, locale, t, toast]);

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={className}
      loading={loading}
      onClick={() => void handleExport()}
    >
      {t('pdfDossier')}
    </Button>
  );
}
