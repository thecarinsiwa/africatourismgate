'use client';

import { createContext, useContext, type ReactNode } from 'react';
import {
  DEFAULT_WEB_PAYMENT_METHODS,
  type ResolvedWebPaymentMethods,
} from '@africatourismgate/types/organization-settings';

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
  return (
    <PaymentMethodsContext.Provider value={methods}>
      {children}
    </PaymentMethodsContext.Provider>
  );
}

export function useWebPaymentMethods(): ResolvedWebPaymentMethods {
  return useContext(PaymentMethodsContext);
}
