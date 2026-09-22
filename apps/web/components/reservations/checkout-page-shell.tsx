'use client';

import type { ReactNode } from 'react';
import { HomeFooter } from '../home/home-footer';
import { HomeHeader } from '../home/home-header';
import { SupportContextualHelpLink } from '../support/support-contextual-help-link';
import {
  CheckoutStepper,
  type CheckoutStepId,
  type CheckoutStepperLabels,
} from './checkout-stepper';

type CheckoutPageShellProps = {
  title: string;
  currentStep: CheckoutStepId;
  stepperLabels: CheckoutStepperLabels;
  cancelled?: boolean;
  children: ReactNode;
};

export function CheckoutPageShell({
  title,
  currentStep,
  stepperLabels,
  cancelled = false,
  children,
}: CheckoutPageShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-atg-surface dark:bg-atg-surface">
      <HomeHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <CheckoutStepper
          currentStep={currentStep}
          labels={stepperLabels}
          cancelled={cancelled}
        />
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h1 className="text-2xl font-bold text-atg-fg">{title}</h1>
          <SupportContextualHelpLink />
        </div>
        {children}
      </main>
      <HomeFooter />
    </div>
  );
}
