'use client';

import { ApiHttpError } from '@africatourismgate/api-client';
import type {
  BookingCheckoutItem,
  BookingCheckoutLine,
  BookingCheckoutPreview,
} from '@africatourismgate/types';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { posSalePageConfig } from '../../config/sale';
import { getValidApiClient } from '../auth/api';
import { requireSelectedOrganizationId } from '../auth/session';
import type { SaleCartCustomer, SaleCartLine } from './types';

const PREVIEW_DEBOUNCE_MS = 400;
const { cart: cartLabels } = posSalePageConfig;

export type SaleCartLineWithPricing = SaleCartLine & {
  previewLine: BookingCheckoutLine | null;
};

type SaleCartContextValue = {
  lines: SaleCartLine[];
  linesWithPricing: SaleCartLineWithPricing[];
  preview: BookingCheckoutPreview | null;
  previewLoading: boolean;
  previewError: string | null;
  /** Code promo appliqué (null = aucun). */
  appliedPromoCode: string | null;
  applyPromoCode: (code: string) => void;
  clearPromoCode: () => void;
  /** null = client de passage (booking au nom de l’employé). */
  customer: SaleCartCustomer | null;
  setCustomer: (customer: SaleCartCustomer | null) => void;
  addLine: (item: BookingCheckoutItem, label: string) => void;
  removeLine: (lineId: string) => void;
  clearCart: () => void;
};

const SaleCartContext = createContext<SaleCartContextValue | null>(null);

function newCartLineId(): string {
  return `line-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function previewErrorMessage(error: unknown): string {
  if (error instanceof ApiHttpError) {
    if (error.status === 400 && error.message && !error.message.startsWith('HTTP ')) {
      return error.message;
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return cartLabels.previewErrorLabel;
}

export function SaleCartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<SaleCartLine[]>([]);
  const [preview, setPreview] = useState<BookingCheckoutPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null);
  const [customer, setCustomerState] = useState<SaleCartCustomer | null>(null);

  const addLine = useCallback((item: BookingCheckoutItem, label: string) => {
    setLines((prev) => [
      ...prev,
      {
        id: newCartLineId(),
        label,
        item,
      },
    ]);
  }, []);

  const removeLine = useCallback((lineId: string) => {
    setLines((prev) => prev.filter((line) => line.id !== lineId));
  }, []);

  const setCustomer = useCallback((next: SaleCartCustomer | null) => {
    setCustomerState(next);
  }, []);

  const applyPromoCode = useCallback((code: string) => {
    const trimmed = code.trim();
    setAppliedPromoCode(trimmed.length > 0 ? trimmed : null);
  }, []);

  const clearPromoCode = useCallback(() => {
    setAppliedPromoCode(null);
  }, []);

  const clearCart = useCallback(() => {
    setLines([]);
    setPreview(null);
    setPreviewError(null);
    setPreviewLoading(false);
    setAppliedPromoCode(null);
    setCustomerState(null);
  }, []);

  useEffect(() => {
    if (lines.length === 0) {
      setPreview(null);
      setPreviewError(null);
      setPreviewLoading(false);
      return;
    }

    let cancelled = false;
    const items = lines.map((line) => line.item);

    const timer = window.setTimeout(() => {
      setPreviewLoading(true);
      setPreviewError(null);

      void getValidApiClient()
        .then((client) =>
          client.previewBookingCheckout({
            items,
            organizationId: requireSelectedOrganizationId(),
            ...(appliedPromoCode ? { promoCode: appliedPromoCode } : {}),
          }),
        )
        .then((result) => {
          if (cancelled) return;
          setPreview(result);
        })
        .catch((error: unknown) => {
          if (cancelled) return;
          setPreview(null);
          setPreviewError(previewErrorMessage(error));
        })
        .finally(() => {
          if (!cancelled) {
            setPreviewLoading(false);
          }
        });
    }, PREVIEW_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [lines, appliedPromoCode]);

  const linesWithPricing = useMemo((): SaleCartLineWithPricing[] => {
    return lines.map((line, index) => ({
      ...line,
      previewLine: preview?.lines[index] ?? null,
    }));
  }, [lines, preview]);

  const value = useMemo<SaleCartContextValue>(
    () => ({
      lines,
      linesWithPricing,
      preview,
      previewLoading,
      previewError,
      appliedPromoCode,
      applyPromoCode,
      clearPromoCode,
      customer,
      setCustomer,
      addLine,
      removeLine,
      clearCart,
    }),
    [
      lines,
      linesWithPricing,
      preview,
      previewLoading,
      previewError,
      appliedPromoCode,
      applyPromoCode,
      clearPromoCode,
      customer,
      setCustomer,
      addLine,
      removeLine,
      clearCart,
    ],
  );

  return (
    <SaleCartContext.Provider value={value}>{children}</SaleCartContext.Provider>
  );
}

export function useSaleCart(): SaleCartContextValue {
  const ctx = useContext(SaleCartContext);
  if (!ctx) {
    throw new Error('useSaleCart must be used within SaleCartProvider');
  }
  return ctx;
}
