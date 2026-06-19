'use client';

import { ApiHttpError } from '@africatourismgate/api-client';
import { Button, Card, Input } from '@africatourismgate/ui';
import type { CreateBookingReviewRequest, Review } from '@africatourismgate/types';
import { useState } from 'react';
import { getAccountApiClient } from '../../lib/api/account';
import { StarRatingInput } from '../shared/star-rating-input';

const TITLE_MAX_LENGTH = 180;
const BODY_MAX_LENGTH = 1000;

const bodyTextareaClass =
  'w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg placeholder:text-atg-muted/70 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60 dark:bg-atg-elevated dark:text-white';

type BookingReviewFormLabels = {
  leaveReview: string;
  leaveReviewHint: string;
  reviewRating: string;
  reviewTitle: string;
  reviewTitlePlaceholder: string;
  reviewBody: string;
  reviewBodyPlaceholder: string;
  submitReview: string;
  submittingReview: string;
  reviewSubmitError: string;
  reviewRatingRequired: string;
  reviewCharCount: string;
  ratingAria: (n: number) => string;
};

type Props = {
  bookingId: string;
  labels: BookingReviewFormLabels;
  onSubmitted: (review: Review) => void;
};

function formatCharCount(template: string, current: number, max: number): string {
  return template.replace('{current}', String(current)).replace('{max}', String(max));
}

export function BookingReviewForm({ bookingId, labels, onSubmitted }: Props) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setValidationError(null);
    setError(null);

    if (rating < 1 || rating > 5) {
      setValidationError(labels.reviewRatingRequired);
      return;
    }

    const payload: CreateBookingReviewRequest = {
      rating,
      title: title.trim() || undefined,
      body: body.trim() || undefined,
    };

    setSubmitting(true);
    try {
      const client = await getAccountApiClient();
      const review = await client.createBookingReview(bookingId, payload);
      onSubmitted(review);
    } catch (err) {
      if (err instanceof ApiHttpError) {
        const msg =
          typeof err.body === 'object' &&
          err.body &&
          'message' in err.body &&
          typeof (err.body as { message: unknown }).message === 'string'
            ? (err.body as { message: string }).message
            : labels.reviewSubmitError;
        setError(msg);
      } else {
        setError(labels.reviewSubmitError);
      }
    } finally {
      setSubmitting(false);
    }
  }

  const titleCharCount = formatCharCount(labels.reviewCharCount, title.length, TITLE_MAX_LENGTH);
  const bodyCharCount = formatCharCount(labels.reviewCharCount, body.length, BODY_MAX_LENGTH);

  return (
    <Card variant="dashboard" padding="sm" className="border-primary/20 bg-primary/5 dark:border-primary/30 dark:bg-primary/10">
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-atg-fg">
            {labels.leaveReview}
          </h3>
          <p className="mt-1 text-sm text-atg-muted">{labels.leaveReviewHint}</p>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-atg-fg">
            {labels.reviewRating}
          </p>
          <StarRatingInput
            value={rating}
            onChange={setRating}
            ratingAria={labels.ratingAria}
            groupAriaLabel={labels.reviewRating}
            disabled={submitting}
          />
        </div>

        <Input
          id="review-title"
          label={labels.reviewTitle}
          labelExtra={
            <span className="text-xs text-atg-muted" aria-live="polite">
              {titleCharCount}
            </span>
          }
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={labels.reviewTitlePlaceholder}
          maxLength={TITLE_MAX_LENGTH}
          disabled={submitting}
        />

        <div className="w-full">
          <div className="mb-2 flex items-center justify-between gap-2">
            <label htmlFor="review-body" className="text-sm font-medium text-atg-fg">
              {labels.reviewBody}
            </label>
            <span className="text-xs text-atg-muted" aria-live="polite">
              {bodyCharCount}
            </span>
          </div>
          <textarea
            id="review-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={labels.reviewBodyPlaceholder}
            rows={4}
            maxLength={BODY_MAX_LENGTH}
            disabled={submitting}
            className={bodyTextareaClass}
          />
        </div>

        {validationError ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {validationError}
          </p>
        ) : null}
        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        ) : null}

        <Button type="submit" loading={submitting} loadingText={labels.submittingReview}>
          {labels.submitReview}
        </Button>
      </form>
    </Card>
  );
}
