export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export {
  ensureHttpsAssetUrl,
  getAdminAppUrl,
  getAdminLoginUrl,
  getApiPublicOrigin,
  getPublicWebUrl,
  normalizeBrandingAssetUrl,
} from './urls';

export {
  formatBookingLineDateRange,
  groupRoomBookingLinesForDisplay,
  type GroupedBookingLineDisplay,
  type RoomGroupableBookingLine,
} from './group-room-booking-lines';

export {
  getOrCreateClientInstanceId,
  withClientInstanceId,
} from './client-instance';

export {
  ISO_3166_1_ALPHA_2_CODES,
  formatNationalityDisplay,
  getIsoCountryLabel,
  getIsoCountryOptions,
  getIsoCountrySelectOptions,
  type Iso3166Alpha2Code,
  type IsoCountryOption,
} from './iso-countries';
