'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  Button,
  Card,
  Input,
  Select,
  StarRatingInput,
  Textarea,
  useToast,
} from '@africatourismgate/ui';
import type { ReviewStatus } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { usePermissions } from '../../lib/auth/use-permissions';
import { useReviewStatusLabels } from '../../lib/i18n/use-module-labels';

export const AVIS_LIST_HREF = '/contenu/avis';

type FormValues = {
  authorName: string;
  rating: number;
  title: string;
  body: string;
  status: ReviewStatus;
};

type FieldErrors = Partial<Record<keyof FormValues, string>>;

const DEFAULT_VALUES: FormValues = {
  authorName: '',
  rating: 5,
  title: '',
  body: '',
  status: 'approved',
};

export function TripadvisorReviewForm() {
  const { reviews: getReviewsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.reviews.createTripadvisor');
  const tActions = useTranslations('common.actions');
  const statusLabels = useReviewStatusLabels();
  const { hasPermission, isSuperAdmin } = usePermissions();
  const canWrite = isSuperAdmin || hasPermission('reviews.write');
  const router = useRouter();
  const { toast } = useToast();

  const [values, setValues] = useState<FormValues>(DEFAULT_VALUES);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const statusOptions = useMemo(
    () =>
      (['approved', 'pending', 'hidden'] as const).map((status) => ({
        value: status,
        label: statusLabels[status],
      })),
    [statusLabels],
  );

  const updateField = useCallback(<K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    setSubmitError(null);
  }, []);

  const validate = useCallback((): FieldErrors => {
    const errors: FieldErrors = {};
    if (!values.authorName.trim()) {
      errors.authorName = t('validation.authorNameRequired');
    } else if (values.authorName.trim().length > 120) {
      errors.authorName = t('validation.authorNameTooLong');
    }
    if (!Number.isInteger(values.rating) || values.rating < 1 || values.rating > 5) {
      errors.rating = t('validation.ratingRequired');
    }
    if (!values.body.trim()) {
      errors.body = t('validation.bodyRequired');
    }
    if (values.title.trim().length > 180) {
      errors.title = t('validation.titleTooLong');
    }
    return errors;
  }, [t, values]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canWrite) return;

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    setSubmitError(null);
    try {
      const created = await getApiClient().createTripadvisorReview({
        authorName: values.authorName.trim(),
        rating: values.rating,
        body: values.body.trim(),
        status: values.status,
        ...(values.title.trim() ? { title: values.title.trim() } : {}),
      });
      toast({
        variant: 'success',
        title: t('toast.created.title'),
        message: t('toast.created.message'),
      });
      router.push(`${AVIS_LIST_HREF}/${created.id}`);
    } catch (error) {
      setSubmitError(getReviewsErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  if (!canWrite) {
    return <p className="text-sm text-destructive">{t('denied')}</p>;
  }

  return (
    <Card className="max-w-2xl p-6">
      <div className="mb-6 space-y-1">
        <h2 className="text-lg font-semibold text-atg-fg">{t('heading')}</h2>
        <p className="text-sm text-atg-muted">{t('description')}</p>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5" noValidate>
        <Input
          id="tripadvisor-author-name"
          label={t('fields.authorName')}
          value={values.authorName}
          onChange={(e) => updateField('authorName', e.target.value)}
          placeholder={t('fields.authorNamePlaceholder')}
          error={fieldErrors.authorName}
          maxLength={120}
          required
        />

        <StarRatingInput
          label={t('fields.rating')}
          value={values.rating}
          onChange={(next) => updateField('rating', Math.max(1, Math.round(next)))}
          step={1}
          error={fieldErrors.rating}
        />

        <Input
          id="tripadvisor-title"
          label={t('fields.title')}
          value={values.title}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder={t('fields.titlePlaceholder')}
          error={fieldErrors.title}
          maxLength={180}
          hint={t('fields.titleHint')}
        />

        <Textarea
          id="tripadvisor-body"
          label={t('fields.body')}
          value={values.body}
          onChange={(e) => updateField('body', e.target.value)}
          placeholder={t('fields.bodyPlaceholder')}
          error={fieldErrors.body}
          rows={5}
          required
        />

        <Select
          id="tripadvisor-status"
          label={t('fields.status')}
          value={values.status}
          options={statusOptions}
          onChange={(e) => updateField('status', e.target.value as ReviewStatus)}
          hint={t('fields.statusHint')}
        />

        {submitError ? (
          <p className="text-sm text-destructive" role="alert">
            {submitError}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Button type="submit" disabled={saving} loading={saving} loadingText={t('saving')}>
            {t('saveButton')}
          </Button>
          <Button type="button" variant="ghost" href={AVIS_LIST_HREF} disabled={saving}>
            {tActions('cancel')}
          </Button>
        </div>
      </form>
    </Card>
  );
}
