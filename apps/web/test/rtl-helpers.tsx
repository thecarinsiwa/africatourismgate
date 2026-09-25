import { NextIntlClientProvider, type AbstractIntlMessages } from 'next-intl';
import { type ReactElement, type ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { vi } from 'vitest';
import { BookingModesProvider } from '../components/booking-modes-provider';
import { CatalogProductsProvider } from '../components/catalog-products-provider';
import {
  DEFAULT_BOOKING_ITEM_TYPE_MODES,
  type ResolvedBookingItemTypeModes,
} from '@africatourismgate/types/tour-guide';
import {
  DEFAULT_CATALOG_PRODUCTS,
  type ResolvedCatalogProducts,
} from '@africatourismgate/types/organization-settings';

/** Minimal messages for component tests (extend per suite as needed). */
export const rtlTestMessages = {
  booking: {
    sessionLock: {
      checkingSession: 'Checking session…',
    },
  },
  hotels: {
    bookNow: 'Book now',
  },
  checkout: {
    requestBooking: 'Request a booking',
  },
} satisfies AbstractIntlMessages;

export function createRouterMock() {
  return {
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  };
}

type RtlProvidersProps = {
  children: ReactNode;
  locale?: string;
  messages?: AbstractIntlMessages;
  bookingModes?: ResolvedBookingItemTypeModes;
  catalogProducts?: ResolvedCatalogProducts;
};

export function RtlProviders({
  children,
  locale = 'en',
  messages = rtlTestMessages,
  bookingModes = DEFAULT_BOOKING_ITEM_TYPE_MODES,
  catalogProducts = DEFAULT_CATALOG_PRODUCTS,
}: RtlProvidersProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <BookingModesProvider modes={bookingModes}>
        <CatalogProductsProvider products={catalogProducts}>
          {children}
        </CatalogProductsProvider>
      </BookingModesProvider>
    </NextIntlClientProvider>
  );
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & {
    locale?: string;
    messages?: AbstractIntlMessages;
    bookingModes?: ResolvedBookingItemTypeModes;
    catalogProducts?: ResolvedCatalogProducts;
  },
) {
  const { locale, messages, bookingModes, catalogProducts, ...renderOptions } =
    options ?? {};
  return render(ui, {
    wrapper: ({ children }) => (
      <RtlProviders
        locale={locale}
        messages={messages}
        bookingModes={bookingModes}
        catalogProducts={catalogProducts}
      >
        {children}
      </RtlProviders>
    ),
    ...renderOptions,
  });
}
