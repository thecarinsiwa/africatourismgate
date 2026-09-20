import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RtlProviders } from './rtl-helpers';

describe('RTL helpers smoke', () => {
  it('renders children inside NextIntl + booking modes providers', () => {
    render(
      <RtlProviders>
        <p>component-test-ready</p>
      </RtlProviders>,
    );
    expect(screen.getByText('component-test-ready')).toBeInTheDocument();
  });
});
