'use client';

export type CheckoutStepId = 'cart' | 'recap' | 'payment' | 'confirmation';

export type CheckoutStepperLabels = {
  stepperAriaLabel: string;
  cart: string;
  recap: string;
  payment: string;
  confirmation: string;
  cancelled: string;
};

type CheckoutStepperProps = {
  currentStep: CheckoutStepId;
  labels: CheckoutStepperLabels;
  cancelled?: boolean;
};

type StepState = 'complete' | 'current' | 'upcoming' | 'cancelled';

function resolveStepState(
  stepId: CheckoutStepId,
  currentStep: CheckoutStepId,
  cancelled: boolean,
): StepState {
  const order: CheckoutStepId[] = ['cart', 'recap', 'payment', 'confirmation'];
  const currentIndex = order.indexOf(currentStep);
  const stepIndex = order.indexOf(stepId);

  if (cancelled && stepId === 'payment') return 'cancelled';
  if (stepIndex < currentIndex) return 'complete';
  if (stepIndex === currentIndex) return 'current';
  return 'upcoming';
}

const STEP_ORDER: CheckoutStepId[] = ['cart', 'recap', 'payment', 'confirmation'];

export function CheckoutStepper({ currentStep, labels, cancelled = false }: CheckoutStepperProps) {
  return (
    <nav aria-label={labels.stepperAriaLabel} className="mb-8 min-w-0">
      <ol className="flex items-center gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch] sm:flex-wrap sm:overflow-visible sm:pb-0">
        {STEP_ORDER.map((stepId, index) => {
          const state = resolveStepState(stepId, currentStep, cancelled);
          const label =
            state === 'cancelled'
              ? labels.cancelled
              : stepId === 'cart'
                ? labels.cart
                : stepId === 'recap'
                  ? labels.recap
                  : stepId === 'payment'
                    ? labels.payment
                    : labels.confirmation;

          return (
            <li key={stepId} className="flex shrink-0 items-center">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold sm:h-8 sm:w-8 ${
                    state === 'complete'
                      ? 'bg-primary text-white'
                      : state === 'current'
                        ? 'bg-primary text-white ring-4 ring-primary/20'
                        : state === 'cancelled'
                          ? 'bg-amber-500 text-white'
                          : 'border border-atg-border bg-atg-elevated text-atg-muted dark:border-atg-border'
                  }`}
                  aria-hidden
                >
                  {state === 'complete' ? '✓' : index + 1}
                </span>
                <span
                  className={`max-w-[5.5rem] truncate text-sm font-semibold sm:max-w-none ${
                    state === 'current'
                      ? 'text-atg-fg'
                      : state === 'complete'
                        ? 'text-primary'
                        : state === 'cancelled'
                          ? 'text-amber-700 dark:text-amber-300'
                          : 'text-atg-muted'
                  }`}
                >
                  {label}
                </span>
              </div>
              {index < STEP_ORDER.length - 1 ? (
                <span
                  className={`mx-2 hidden h-px w-6 shrink-0 sm:block md:w-12 ${
                    state === 'complete' ? 'bg-primary' : 'bg-atg-border'
                  }`}
                  aria-hidden
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
