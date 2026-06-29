'use client';

import type { GuideReviewInvite } from '@africatourismgate/types';
import { BookingReviewCard } from './booking-review-card';
import { BookingReviewForm } from './booking-review-form';

type GuideReviewInvitesSectionProps = {
  bookingId: string;
  invites: GuideReviewInvite[];
  localeTag: string;
  labels: {
    sectionTitle: string;
    sectionHint: string;
    rolePrimary: string;
    roleSecondary: string;
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
    yourReview: string;
    reviewPublished: string;
    ratingAria: (n: number) => string;
  };
  onInviteUpdated: (assignmentId: string, invite: GuideReviewInvite) => void;
};

export function GuideReviewInvitesSection({
  bookingId,
  invites,
  localeTag,
  labels,
  onInviteUpdated,
}: GuideReviewInvitesSectionProps) {
  const visible = invites.filter((invite) => invite.canReview || invite.review);
  if (visible.length === 0) {
    return null;
  }

  const formLabels = {
    leaveReview: labels.leaveReview,
    leaveReviewHint: labels.leaveReviewHint,
    reviewRating: labels.reviewRating,
    reviewTitle: labels.reviewTitle,
    reviewTitlePlaceholder: labels.reviewTitlePlaceholder,
    reviewBody: labels.reviewBody,
    reviewBodyPlaceholder: labels.reviewBodyPlaceholder,
    submitReview: labels.submitReview,
    submittingReview: labels.submittingReview,
    reviewSubmitError: labels.reviewSubmitError,
    reviewRatingRequired: labels.reviewRatingRequired,
    reviewCharCount: labels.reviewCharCount,
    ratingAria: labels.ratingAria,
  };

  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-atg-fg">{labels.sectionTitle}</h3>
        <p className="mt-1 text-sm text-atg-muted">{labels.sectionHint}</p>
      </div>

      {visible.map((invite) => {
        const roleLabel =
          invite.role === 'primary' ? labels.rolePrimary : labels.roleSecondary;

        return (
          <div key={invite.assignmentId} className="space-y-3">
            <p className="text-sm font-medium text-atg-fg">
              {invite.guideName}
              <span className="ml-2 text-xs font-normal text-atg-muted">({roleLabel})</span>
            </p>

            {invite.review ? (
              <BookingReviewCard
                review={invite.review}
                localeTag={localeTag}
                labels={{
                  yourReview: labels.yourReview,
                  reviewPublished: labels.reviewPublished,
                }}
              />
            ) : invite.canReview ? (
              <BookingReviewForm
                bookingId={bookingId}
                guideId={invite.guideId}
                labels={formLabels}
                onSubmitted={(review) => {
                  onInviteUpdated(invite.assignmentId, {
                    ...invite,
                    canReview: false,
                    review,
                  });
                }}
              />
            ) : null}
          </div>
        );
      })}
    </section>
  );
}
