import type { BookingItems } from '../../../../entities/generated';

export type BookingCheckoutLineDto = {
  itemType: BookingItems['itemType'];
  referenceId: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
  titleSnapshot: string;
  currency: string;
  startDate: string | null;
  endDate: string | null;
};

export type BookingCheckoutPreviewResponseDto = {
  lines: BookingCheckoutLineDto[];
  totalCents: number;
  currency: string;
};
