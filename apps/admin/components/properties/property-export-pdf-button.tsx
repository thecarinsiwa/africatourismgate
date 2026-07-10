'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import { Button, useToast } from '@africatourismgate/ui';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';
import { downloadPropertyDossierPdf } from '../../lib/properties-reports';

type PropertyExportPdfButtonProps = {
  propertyId: string;
  className?: string;
};

export function PropertyExportPdfButton({ propertyId, className }: PropertyExportPdfButtonProps) {
  const { hebergements: getHebergementsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.properties.exports');
  const locale = useLocale();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleExport = useCallback(async () => {
    setLoading(true);
    try {
      await downloadPropertyDossierPdf(propertyId, { locale });
      toast({ variant: 'success', message: t('success') });
    } catch (error) {
      toast({
        variant: 'error',
        message: getHebergementsErrorMessage(error) || t('error'),
      });
    } finally {
      setLoading(false);
    }
  }, [getHebergementsErrorMessage, locale, propertyId, t, toast]);

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
