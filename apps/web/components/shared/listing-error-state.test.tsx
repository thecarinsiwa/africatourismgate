import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ListingErrorState, ListingPageBody } from './listing-patterns';

describe('ListingErrorState', () => {
  it('renders message, retry, and optional home CTA', () => {
    const onRetry = vi.fn();
    render(
      <ListingErrorState
        message="Impossible de charger les résultats."
        retryLabel="Réessayer"
        onRetry={onRetry}
        backHomeLabel="Retour à l'accueil"
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Impossible de charger les résultats.' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Réessayer' })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: "Retour à l'accueil" }),
    ).toHaveAttribute('href', '/');
  });
});

describe('ListingPageBody error', () => {
  it('shows EmptyState error instead of results grid', () => {
    render(
      <ListingPageBody
        error={{
          message: 'Load failed',
          retryLabel: 'Retry',
          onRetry: () => undefined,
          backHomeLabel: 'Home',
        }}
        isEmpty={false}
      >
        <div data-testid="grid-row">Should not show</div>
      </ListingPageBody>,
    );

    expect(screen.getByRole('heading', { name: 'Load failed' })).toBeInTheDocument();
    expect(screen.queryByTestId('grid-row')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
  });
});
