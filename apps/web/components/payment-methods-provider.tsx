'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  DEFAULT_WEB_PAYMENT_METHODS,
  normalizeWebPaymentMethods,
  type ResolvedWebPaymentMethods,
  type WebPaymentMethodsSettingValue,
} from '@africatourismgate/types/organization-settings';

declare global {
  interface Window {
    /** Playwright E2E only — see tests/e2e/helpers/mock-web-payment-methods.ts */
    __ATG_E2E_WEB_PAYMENT_METHODS__?: WebPaymentMethodsSettingValue;
  }
}

const PaymentMethodsContext = createContext<ResolvedWebPaymentMethods>(
  DEFAULT_WEB_PAYMENT_METHODS,
);

export function PaymentMethodsProvider({
  methods,
  children,
}: {
  methods: ResolvedWebPaymentMethods;
  children: ReactNode;
}) {
  const [resolved, setResolved] = useState(methods);

  useEffect(() => {
    const override = window.__ATG_E2E_WEB_PAYMENT_METHODS__;
    setResolved(override ? normalizeWebPaymentMethods(override) : methods);
  }, [methods]);

  return (
    <PaymentMethodsContext.Provider value={resolved}>
      {children}
    </PaymentMethodsContext.Provider>
  );
}

export function useWebPaymentMethods(): ResolvedWebPaymentMethods {
  return useContext(PaymentMethodsContext);
}
