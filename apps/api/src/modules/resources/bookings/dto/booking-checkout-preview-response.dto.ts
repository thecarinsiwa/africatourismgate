export type BookingCheckoutLineDto = {
  roomId: string;
  date: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
  titleSnapshot: string;
  currency: string;
};

export type BookingCheckoutPreviewResponseDto = {
  lines: BookingCheckoutLineDto[];
  totalCents: number;
  currency: string;
};
