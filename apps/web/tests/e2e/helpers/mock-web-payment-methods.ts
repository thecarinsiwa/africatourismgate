import type { Page } from '@playwright/test';

export type E2EWebPaymentMethods = {
  stripe: boolean;
  cash: boolean;
  bank_transfer: boolean;
  mobile_money: boolean;
};

const BASE: E2EWebPaymentMethods = {
  stripe: true,
  cash: false,
  bank_transfer: false,
  mobile_money: false,
};

/**
 * Override public web payment methods for E2E.
 * Layout SSR still uses the API/default (cash off); the client provider
 * applies `window.__ATG_E2E_WEB_PAYMENT_METHODS__` after mount so radios match.
 */
export async function mockWebPaymentMethods(
  page: Page,
  overrides: Partial<E2EWebPaymentMethods>,
): Promise<E2EWebPaymentMethods> {
  const methods: E2EWebPaymentMethods = { ...BASE, ...overrides };

  await page.addInitScript((m) => {
    (
      window as unknown as { __ATG_E2E_WEB_PAYMENT_METHODS__?: E2EWebPaymentMethods }
    ).__ATG_E2E_WEB_PAYMENT_METHODS__ = m;
  }, methods);

  await page.route('**/organization-settings/public/payment-methods**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(methods),
    });
  });

  return methods;
}
