import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import {
  CheckoutStepper,
  type CheckoutStepperLabels,
} from './checkout-stepper';

const labels: CheckoutStepperLabels = {
  stepperAriaLabel: 'Checkout steps',
  cart: 'Cart',
  recap: 'Summary',
  payment: 'Payment',
  confirmation: 'Confirmation',
  cancelled: 'Cancelled',
};

describe('CheckoutStepper', () => {
  it('renders all four steps', () => {
    render(<CheckoutStepper currentStep="cart" labels={labels} />);

    const nav = screen.getByRole('navigation', { name: 'Checkout steps' });
    expect(within(nav).getByText('Cart')).toBeInTheDocument();
    expect(within(nav).getByText('Summary')).toBeInTheDocument();
    expect(within(nav).getByText('Payment')).toBeInTheDocument();
    expect(within(nav).getByText('Confirmation')).toBeInTheDocument();
  });

  it('marks the current step on recap', () => {
    render(<CheckoutStepper currentStep="recap" labels={labels} />);

    const nav = screen.getByRole('navigation', { name: 'Checkout steps' });
    expect(within(nav).getByText('Summary')).toHaveClass('text-atg-fg');
    expect(nav.textContent).toContain('✓');
    expect(within(nav).getByText('2')).toBeInTheDocument();
  });

  it('shows cancelled label on payment when cancelled', () => {
    render(
      <CheckoutStepper currentStep="payment" labels={labels} cancelled />,
    );

    const nav = screen.getByRole('navigation', { name: 'Checkout steps' });
    expect(within(nav).getByText('Cancelled')).toBeInTheDocument();
    expect(within(nav).queryByText('Payment')).not.toBeInTheDocument();
  });
});
