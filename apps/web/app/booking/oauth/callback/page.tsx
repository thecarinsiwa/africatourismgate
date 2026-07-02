import { Suspense } from 'react';
import { BookingOAuthCallbackPageContent } from '../../../../components/reservations/booking-oauth-callback-page-content';

type PageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

function pickParam(value: string | string[] | undefined): string | undefined {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value[0];
  return undefined;
}

function OAuthCallbackBody({ searchParams }: PageProps) {
  return (
    <BookingOAuthCallbackPageContent
      accessToken={pickParam(searchParams.accessToken)}
      refreshToken={pickParam(searchParams.refreshToken)}
      expiresIn={pickParam(searchParams.expiresIn)}
      nextPath={pickParam(searchParams.next)}
    />
  );
}

export default function BookingOAuthCallbackPage({ searchParams }: PageProps) {
  return (
    <Suspense>
      <OAuthCallbackBody searchParams={searchParams} />
    </Suspense>
  );
}
