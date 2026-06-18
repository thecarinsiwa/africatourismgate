'use client';

import { ApiHttpError } from '@africatourismgate/api-client';
import { Button, Input } from '@africatourismgate/ui';
import type { CreateBookingReviewRequest, Review } from '@africatourismgate/types';
import { useState } from 'react';
import { getAccountApiClient } from '../../lib/api/account';

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
  ratingAria: (n: number) => string;
};

type Props = {
  bookingId: string;
  labels: BookingReviewFormLabels;
  onSubmitted: (review: Review) => void;
};

function StarRatingInput({
  value,
  onChange,
  ratingAria,
}: {
  value: number;
  onChange: (rating: number) => void;
  ratingAria: (n: number) => string;
}) {
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
      {Array.from({ length: 5 }, (_, i) => {
        const star = i + 1;
        const filled = star <= value;
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={ratingAria(star)}
            onClick={() => onChange(star)}
            className="rounded p-0.5 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <svg
              className={`h-8 w-8 ${filled ? 'text-atg-warning' : 'text-atg-border dark:text-white/25'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
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

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="space-y-4 rounded-lg border border-primary/20 bg-primary/5 p-4 dark:border-primary/30 dark:bg-primary/10"
    >
      <div>
        <h3 className="text-sm font-semibold text-atg-fg">
          {labels.leaveReview}
        </h3>
        <p className="mt-1 text-sm text-atg-muted">{labels.leaveReviewHint}</p>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-atg-muted">
          {labels.reviewRating}
        </p>
        <StarRatingInput value={rating} onChange={setRating} ratingAria={labels.ratingAria} />
      </div>

      <div>
        <label
          htmlFor="review-title"
          className="mb-1 block text-xs font-medium uppercase tracking-wide text-atg-muted"
        >
          {labels.reviewTitle}
        </label>
        <Input
          id="review-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={labels.reviewTitlePlaceholder}
          maxLength={180}
          disabled={submitting}
        />
      </div>

      <div>
        <label
          htmlFor="review-body"
          className="mb-1 block text-xs font-medium uppercase tracking-wide text-atg-muted"
        >
          {labels.reviewBody}
        </label>
        <textarea
          id="review-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={labels.reviewBodyPlaceholder}
          rows={4}
          disabled={submitting}
          className="w-full rounded-lg border border-atg-border bg-atg-elevated px-3 py-2 text-sm text-atg-fg shadow-sm placeholder:text-atg-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60 dark:border-atg-border dark:bg-atg-elevated dark:text-white dark:placeholder:text-atg-muted"
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

      <Button type="submit" disabled={submitting}>
        {submitting ? labels.submittingReview : labels.submitReview}
      </Button>
    </form>
  );
}
