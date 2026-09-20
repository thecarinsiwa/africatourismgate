import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  resolveStripePaymentError,
  StripePaymentError,
} from './stripe-payment-error';
import type { Translations } from '../../lib/i18n/message-types';

const labels: Translations['checkout']['stripeError'] = {
  authTitle: 'Authentication required',
  authDescription: 'Complete card authentication to continue.',
  authHint: 'Retry the payment after confirming with your bank.',
  networkTitle: 'Network error',
  networkHint: 'Check your connection and try again.',
  paymentTitle: 'Payment failed',
  paymentHint: 'Use another card or payment method.',
  genericTitle: 'Something went wrong',
  genericHint: 'Please try again or contact support.',
  dismiss: 'Dismiss',
};

describe('resolveStripePaymentError', () => {
  it('maps authentication messages to auth copy', () => {
    expect(resolveStripePaymentError('Authentication failed', labels)).toEqual({
      title: labels.authTitle,
      description: labels.authDescription,
      hint: labels.authHint,
    });
  });

  it('maps network messages and keeps the raw description', () => {
    expect(resolveStripePaymentError('Failed to fetch', labels)).toEqual({
      title: labels.networkTitle,
      description: 'Failed to fetch',
      hint: labels.networkHint,
    });
  });

  it('falls back to generic copy', () => {
    expect(resolveStripePaymentError('Unknown gateway error', labels).title).toBe(
      labels.genericTitle,
    );
  });
});

describe('StripePaymentError', () => {
  it('renders an alert with auth titles', () => {
    render(
      <StripePaymentError message="Card authentication required" labels={labels} />,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(labels.authTitle)).toBeInTheDocument();
    expect(screen.getByText(labels.authDescription)).toBeInTheDocument();
    expect(screen.getByText(labels.authHint)).toBeInTheDocument();
  });

  it('calls onDismiss when dismiss is clicked', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();

    render(
      <StripePaymentError
        message="Card declined"
        labels={labels}
        onDismiss={onDismiss}
      />,
    );

    await user.click(screen.getByRole('button', { name: labels.dismiss }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
