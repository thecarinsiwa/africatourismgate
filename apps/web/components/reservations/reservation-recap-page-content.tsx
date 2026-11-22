'use client';

import type {
  BookingPreferredPaymentMethod,
  PropertyDetail,
  PublicMobileMoneyCountry,
  PublicPaymentBankAccount,
  VehicleTrip,
} from '@africatourismgate/types';
import { Button, Spinner } from '@africatourismgate/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createBooking, createBookingCheckoutSession, requestBooking } from '../../lib/api/booking';
import { listPublicPaymentBankAccounts } from '../../lib/api/public-payment-bank-accounts';
import { listPublicMobileMoneyConfig } from '../../lib/api/public-mobile-money';
import {
  fetchBookingIdentityDocumentBlob,
  uploadBookingIdentityDocument,
} from '../../lib/api/booking-identity-documents';
import { formatCarPrice } from '../../lib/cars/listings';
import type { VehicleDetail } from '../../lib/cars/types';
import { formatActivityPrice, formatScheduleTime } from '../../lib/activities/listings';
import type { ActivityDetail } from '../../lib/activities/types';
import { getAccommodationDetail, getActivityDetail, getCruiseSailingDetail, getFlightDetail, getPackageDetail, getVehicleDetail } from '../../lib/api/public';
import {
  ensurePublicVehicleTripSeats,
  getPublicVehicleTrip,
  joinPublicVehicleTrip,
} from '../../lib/api/vehicle-trips';
import { formatPackagePrice } from '../../lib/packages/listings';
import type { PackageDetail } from '../../lib/packages/types';
import { formatAirportLabel } from '../../lib/flights/airports';
import { formatFlightPrice } from '../../lib/flights/listings';
import type { FlightDetail } from '../../lib/flights/types';
import { formatCruisePrice } from '../../lib/cruises/listings';
import type { CruiseSailingDetail } from '../../lib/cruises/types';
import {
  ensureClientAccessToken,
  getClientAccessToken,
  getWebSession,
} from '../../lib/auth/client-session';
import { loadVehicleTripBookingPrefill } from '../../lib/reservations/vehicle-trip-booking';
import { useBookingItemTypeModes } from '../../components/booking-modes-provider';
import { useWebPaymentMethods } from '../../components/payment-methods-provider';
import { isAssistedBookingDraft } from '../../lib/bookings/booking-mode';
import { formatDisplayDate } from '../../lib/hotels/dates';
import { formatHotelPrice } from '../../lib/hotels/listings';
import { useLocale, useMessages } from 'next-intl';
import type { Translations } from '../../lib/i18n/message-types';
import { useNamespaceLabels } from '../../lib/i18n/use-namespace-labels';
import {
  buildCheckoutRequest,
  buildDraftBrowseHref,
  buildDraftDetailHref,
  buildReservationQuery,
  isActivityScheduleOfferBookable,
  isActivityScheduleReservationDraft,
  isCabinOfferBookable,
  isCabinReservationDraft,
  isFlightReservationDraft,
  isPackageReservationDraft,
  isPackageReservationDraftStructurallyComplete,
  isRoomReservationDraft,
  isVehicleReservationDraft,
  packageReservationTotalCents,
  type ReservationDraft,
} from '../../lib/reservations/flow';
import { PackagePriceDisplay } from '../packages/package-price-display';
import { PackageReservationSummary } from '../packages/package-reservation-summary';
import { CheckoutPageShell } from './checkout-page-shell';
import { CheckoutManifestForm, emptyManifestEntryDraft, manifestDraftToPayload, type ManifestEntryDraft, type ManifestFieldErrors } from './checkout-manifest-form';
import {
  BookingEmergencyContactForm,
  emptyEmergencyContactDraft,
  emergencyContactDraftToPayload,
  type EmergencyContactDraft,
  type EmergencyContactFieldErrors,
} from './booking-emergency-contact-form';
import { CheckoutRecapLine } from './checkout-recap-line';
import { StripePaymentError } from './stripe-payment-error';
import { BankTransferAccountsPanel } from './bank-transfer-accounts-panel';
import { MobileMoneyInstructionsPanel } from './mobile-money-instructions-panel';
import { createApiClient } from '@africatourismgate/api-client';

type Props = {
  draft: ReservationDraft | null;
};

export function ReservationRecapPageContent({ draft }: Props) {
  const router = useRouter();
  const locale = useLocale();
  const messages = useMessages();
  const ck = (messages as { checkout: Translations['checkout'] }).checkout;
  const f = useNamespaceLabels('flights');
  const cr = useNamespaceLabels('cruises');
  const p = useNamespaceLabels('packages');

  const [hotelDetail, setHotelDetail] = useState<PropertyDetail | null>(null);
  const [flightDetail, setFlightDetail] = useState<FlightDetail | null>(null);
  const [vehicleDetail, setVehicleDetail] = useState<VehicleDetail | null>(null);
  const [vehicleTrip, setVehicleTrip] = useState<VehicleTrip | null>(null);
  const [existingVehicleBookingId, setExistingVehicleBookingId] = useState<string | null>(
    null,
  );
  const [vehicleSeats, setVehicleSeats] = useState(() =>
    draft && isVehicleReservationDraft(draft) && draft.seats != null && draft.seats >= 1
      ? draft.seats
      : 1,
  );
  const [seatsAdjusting, setSeatsAdjusting] = useState(false);
  const committedVehicleSeatsRef = useRef(vehicleSeats);
  const [cruiseDetail, setCruiseDetail] = useState<CruiseSailingDetail | null>(null);
  const [activityDetail, setActivityDetail] = useState<ActivityDetail | null>(null);
  const [packageDetail, setPackageDetail] = useState<PackageDetail | null>(null);
  const [loading, setLoading] = useState(Boolean(draft));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manifestEntries, setManifestEntries] = useState<ManifestEntryDraft[]>([]);
  const [manifestErrors, setManifestErrors] = useState<Record<number, ManifestFieldErrors>>({});
  const [emergencyContact, setEmergencyContact] = useState<EmergencyContactDraft>(
    emptyEmergencyContactDraft,
  );
  const [emergencyContactErrors, setEmergencyContactErrors] =
    useState<EmergencyContactFieldErrors>({});
  const [preferredPaymentMethod, setPreferredPaymentMethod] =
    useState<BookingPreferredPaymentMethod | null>(null);
  const [bankAccounts, setBankAccounts] = useState<PublicPaymentBankAccount[]>([]);
  const [bankAccountsLoading, setBankAccountsLoading] = useState(false);
  const [mobileMoneyCountries, setMobileMoneyCountries] = useState<
    PublicMobileMoneyCountry[]
  >([]);
  const [mobileMoneyLoading, setMobileMoneyLoading] = useState(false);
  const paymentMethods = useWebPaymentMethods();

  useEffect(() => {
    if (
      preferredPaymentMethod &&
      !paymentMethods[preferredPaymentMethod]
    ) {
      setPreferredPaymentMethod(null);
    }
  }, [paymentMethods, preferredPaymentMethod]);

  useEffect(() => {
    if (preferredPaymentMethod !== 'bank_transfer') {
      return;
    }
    let cancelled = false;
    setBankAccountsLoading(true);
    void listPublicPaymentBankAccounts()
      .then((accounts) => {
        if (!cancelled) setBankAccounts(accounts);
      })
      .catch(() => {
        if (!cancelled) setBankAccounts([]);
      })
      .finally(() => {
        if (!cancelled) setBankAccountsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [preferredPaymentMethod]);

  useEffect(() => {
    if (preferredPaymentMethod !== 'mobile_money') {
      return;
    }
    let cancelled = false;
    setMobileMoneyLoading(true);
    void listPublicMobileMoneyConfig()
      .then((countries) => {
        if (!cancelled) setMobileMoneyCountries(countries);
      })
      .catch(() => {
        if (!cancelled) setMobileMoneyCountries([]);
      })
      .finally(() => {
        if (!cancelled) setMobileMoneyLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [preferredPaymentMethod]);

  useEffect(() => {
    let cancelled = false;
    if (!draft) return;

    setLoading(true);

    if (isRoomReservationDraft(draft)) {
      void getAccommodationDetail(draft.propertyId, {
        checkIn: draft.checkIn,
        checkOut: draft.checkOut,
        guests: draft.guests,
      })
        .then((data) => {
          if (!cancelled) {
            setHotelDetail(data);
            setFlightDetail(null);
            setVehicleDetail(null);
            setCruiseDetail(null);
            setActivityDetail(null);
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    } else if (isFlightReservationDraft(draft)) {
      void getFlightDetail(draft.flightId, {
        departureDate: draft.departureDate,
        passengers: draft.passengers,
      })
        .then((data) => {
          if (!cancelled) {
            setFlightDetail(data);
            setHotelDetail(null);
            setVehicleDetail(null);
            setCruiseDetail(null);
            setActivityDetail(null);
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    } else if (isActivityScheduleReservationDraft(draft)) {
      void getActivityDetail(draft.activityId, {
        date: draft.date,
        participants: draft.participants,
      })
        .then((data) => {
          if (!cancelled) {
            setActivityDetail(data);
            setHotelDetail(null);
            setFlightDetail(null);
            setVehicleDetail(null);
            setCruiseDetail(null);
            setPackageDetail(null);
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    } else if (isPackageReservationDraft(draft)) {
      void getPackageDetail(draft.packageId)
        .then((pkg) => {
          if (cancelled) return;
          setPackageDetail(pkg);
          setHotelDetail(null);
          setFlightDetail(null);
          setVehicleDetail(null);
          setCruiseDetail(null);
          setActivityDetail(null);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    } else if (isCabinReservationDraft(draft)) {
      void getCruiseSailingDetail(draft.sailingId, { guests: draft.guests })
        .then((data) => {
          if (!cancelled) {
            setCruiseDetail(data);
            setHotelDetail(null);
            setFlightDetail(null);
            setVehicleDetail(null);
            setActivityDetail(null);
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    } else if (isVehicleReservationDraft(draft)) {
      const tripId = draft.vehicleTripId;
      const seats =
        draft.seats != null && draft.seats >= 1 ? draft.seats : 1;
      void (async () => {
        try {
          const token = await ensureClientAccessToken();
          const [data, trip] = await Promise.all([
            getVehicleDetail(draft.vehicleId, {
              routeId: draft.routeId,
              travelDate: draft.travelDate,
            }),
            tripId
              ? getPublicVehicleTrip(tripId, token)
              : Promise.resolve(null),
          ]);
          if (cancelled) return;
          setVehicleDetail(data);
          setVehicleTrip(trip);
          setHotelDetail(null);
          setFlightDetail(null);
          setCruiseDetail(null);
          setActivityDetail(null);

          if (token && tripId) {
            try {
              const prefill = await loadVehicleTripBookingPrefill(
                token,
                tripId,
                seats,
                getWebSession()?.user ?? null,
              );
              if (cancelled) return;
              setExistingVehicleBookingId(prefill.bookingId);
              setEmergencyContact(prefill.emergencyContact);
              setManifestEntries(prefill.manifestEntries);
            } catch {
              if (!cancelled) setExistingVehicleBookingId(null);
            }
          }
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
    }

    return () => {
      cancelled = true;
    };
  }, [draft]);

  useEffect(() => {
    if (!draft || !isVehicleReservationDraft(draft) || !draft.vehicleTripId) return;
    const seats = draft.seats != null && draft.seats >= 1 ? draft.seats : 1;
    setVehicleSeats(seats);
    committedVehicleSeatsRef.current = seats;
  }, [draft && isVehicleReservationDraft(draft) ? draft.vehicleTripId : null]);

  const room = useMemo(
    () =>
      draft && isRoomReservationDraft(draft)
        ? (hotelDetail?.rooms.find((item) => item.id === draft.roomId) ?? null)
        : null,
    [draft, hotelDetail],
  );

  const flightClass = useMemo(
    () =>
      draft && isFlightReservationDraft(draft)
        ? (flightDetail?.classes.find((item) => item.id === draft.flightClassId) ?? null)
        : null,
    [draft, flightDetail],
  );

  const vehicleReady = useMemo((): VehicleDetail | null => {
    if (!draft || !isVehicleReservationDraft(draft) || !vehicleDetail) return null;
    if (draft.vehicleTripId) {
      if (vehicleDetail.route.id !== draft.routeId) return null;
      if (!vehicleTrip) return null;
      return vehicleDetail;
    }
    if (vehicleDetail.availabilitySlot?.id !== draft.availabilitySlotId) return null;
    return vehicleDetail;
  }, [draft, vehicleDetail, vehicleTrip]);

  const cruiseCabin = useMemo(
    () =>
      draft && isCabinReservationDraft(draft)
        ? (cruiseDetail?.cabins.find((item) => item.availabilityId === draft.cabinAvailabilityId) ??
          null)
        : null,
    [draft, cruiseDetail],
  );

  const cruiseReady = useMemo(
    () =>
      draft && isCabinReservationDraft(draft) && isCabinOfferBookable(cruiseCabin, draft.guests)
        ? cruiseCabin
        : null,
    [draft, cruiseCabin],
  );

  const activitySchedule = useMemo(
    () =>
      draft && isActivityScheduleReservationDraft(draft)
        ? (activityDetail?.schedules.find((item) => item.scheduleId === draft.scheduleId) ?? null)
        : null,
    [draft, activityDetail],
  );

  const activityReady = useMemo(
    () =>
      draft &&
      isActivityScheduleReservationDraft(draft) &&
      isActivityScheduleOfferBookable(activitySchedule, draft.participants)
        ? activitySchedule
        : null,
    [draft, activitySchedule],
  );

  const packageReady = useMemo(() => {
    if (!draft || !isPackageReservationDraft(draft)) {
      return false;
    }
    return isPackageReservationDraftStructurallyComplete(draft);
  }, [draft]);

  const modes = useBookingItemTypeModes();
  const isAssisted = draft ? isAssistedBookingDraft(draft, modes) : false;

  const travelerCount = useMemo(() => {
    if (!draft) return 0;
    if (isRoomReservationDraft(draft)) return draft.guests;
    if (isFlightReservationDraft(draft)) return draft.passengers;
    if (isCabinReservationDraft(draft)) return draft.guests;
    if (isActivityScheduleReservationDraft(draft)) return draft.participants;
    if (isPackageReservationDraft(draft)) return draft.travelers;
    if (isVehicleReservationDraft(draft)) {
      return vehicleSeats >= 1 ? vehicleSeats : 1;
    }
    return 1;
  }, [draft, vehicleSeats]);

  const vehicleSeatsMax = useMemo(() => {
    if (!vehicleTrip) return 1;
    if (vehicleTrip.isMine) {
      // Creator can fill free seats, or stay within seats already reserved for this trip.
      return Math.max(
        1,
        Math.min(
          vehicleTrip.maxCapacity,
          Math.max(vehicleSeats, vehicleTrip.seatsReserved) +
            Math.max(0, vehicleTrip.seatsRemaining),
        ),
      );
    }
    return Math.max(1, vehicleSeats + Math.max(0, vehicleTrip.seatsRemaining));
  }, [vehicleTrip, vehicleSeats]);

  const vehicleSeatsRemainingToAdd = useMemo(
    () => Math.max(0, vehicleSeatsMax - vehicleSeats),
    [vehicleSeatsMax, vehicleSeats],
  );

  function syncVehicleSeatsUrl(nextSeats: number) {
    if (!draft || !isVehicleReservationDraft(draft)) return;
    const nextDraft: ReservationDraft = { ...draft, seats: nextSeats };
    router.replace(`/booking/recap?${buildReservationQuery(nextDraft)}`, {
      scroll: false,
    });
  }

  async function adjustVehicleSeats(nextSeats: number) {
    if (!draft || !isVehicleReservationDraft(draft) || !draft.vehicleTripId || !vehicleTrip) {
      return;
    }
    const clamped = Math.max(1, Math.min(nextSeats, vehicleSeatsMax));
    if (clamped === vehicleSeats || seatsAdjusting) return;

    if (clamped > committedVehicleSeatsRef.current) {
      setSeatsAdjusting(true);
      setError(null);
      try {
        const token = await ensureClientAccessToken();
        if (!token) {
          setError(ck.stripeError.authDescription);
          return;
        }
        const updatedTrip = vehicleTrip.isMine
          ? await ensurePublicVehicleTripSeats(token, draft.vehicleTripId, {
              seats: clamped,
            })
          : await joinPublicVehicleTrip(token, draft.vehicleTripId, {
              seats: clamped - committedVehicleSeatsRef.current,
            });
        setVehicleTrip(updatedTrip);
        committedVehicleSeatsRef.current = clamped;
      } catch {
        setError(ck.manifest.seatsAdjustError);
        return;
      } finally {
        setSeatsAdjusting(false);
      }
    }

    setVehicleSeats(clamped);
    syncVehicleSeatsUrl(clamped);
  }

  async function saveTravelerEntry(
    index: number,
    entry: ManifestEntryDraft,
  ): Promise<ManifestEntryDraft> {
    const n = String(index + 1);
    const fieldErrors: ManifestFieldErrors = {};
    if (!entry.fullName.trim()) {
      fieldErrors.fullName = ck.manifest.fullNameRequired.replace('{n}', n);
    }
    if (!entry.nationality.trim()) {
      fieldErrors.nationality = ck.manifest.nationalityRequired.replace('{n}', n);
    }
    if (!entry.idNumber.trim()) {
      fieldErrors.idNumber = ck.manifest.idNumberRequired.replace('{n}', n);
    }
    if (Object.keys(fieldErrors).length > 0) {
      setManifestErrors((prev) => ({ ...prev, [index]: fieldErrors }));
      throw new Error('validation');
    }
    setManifestErrors((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });

    const bookingId = existingVehicleBookingId;
    if (!bookingId) {
      return entry;
    }

    const accessToken = await ensureClientAccessToken();
    if (!accessToken) {
      throw new Error('auth');
    }
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api').replace(
      /\/$/,
      '',
    );
    const apiClient = createApiClient({ baseUrl: apiBaseUrl, accessToken });
    const payload = manifestDraftToPayload(entry, index);
    const saved = entry.entryId
      ? await apiClient.updateBookingManifestEntry(bookingId, entry.entryId, payload)
      : await apiClient.createBookingManifestEntry(bookingId, payload);

    let existingDocument = entry.existingDocument;
    if (entry.file) {
      const uploaded = await uploadBookingIdentityDocument(
        bookingId,
        entry.file,
        'passport',
        saved.id,
      );
      let previewUrl: string | undefined;
      try {
        const blob = await fetchBookingIdentityDocumentBlob(bookingId, uploaded.id);
        previewUrl = URL.createObjectURL(blob);
      } catch {
        previewUrl = undefined;
      }
      if (existingDocument?.previewUrl) {
        URL.revokeObjectURL(existingDocument.previewUrl);
      }
      existingDocument = {
        id: uploaded.id,
        mimeType: uploaded.mimeType,
        filename: uploaded.originalFilename,
        previewUrl,
      };
    }

    return {
      ...entry,
      entryId: saved.id,
      file: undefined,
      existingDocument,
    };
  }

  async function persistManifestEntries(accessToken: string, bookingId: string) {
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api').replace(
      /\/$/,
      '',
    );
    const apiClient = createApiClient({ baseUrl: apiBaseUrl, accessToken });
    await apiClient.updateBookingEmergencyContact(
      bookingId,
      emergencyContactDraftToPayload(emergencyContact),
    );
    const createdEntries: { entryId: string; file: File | null }[] = [];
    for (let i = 0; i < manifestEntries.length; i++) {
      const entry = manifestEntries[i]!;
      const created = await apiClient.createBookingManifestEntry(
        bookingId,
        manifestDraftToPayload(entry, i),
      );
      createdEntries.push({ entryId: created.id, file: entry.file ?? null });
    }
    const filesToUpload = createdEntries.filter((e) => e.file);
    if (filesToUpload.length === 0) return;

    const results = await Promise.allSettled(
      filesToUpload.map((entry) =>
        uploadBookingIdentityDocument(
          bookingId,
          entry.file!,
          'passport',
          entry.entryId,
        ),
      ),
    );
    const firstFailure = results.find(
      (r): r is PromiseRejectedResult => r.status === 'rejected',
    );
    if (firstFailure) {
      const reason = firstFailure.reason;
      throw reason instanceof Error
        ? reason
        : new Error(typeof reason === 'string' ? reason : ck.manifest.uploadFailed);
    }
  }

  function validateEmergencyContact(): boolean {
    const errors: EmergencyContactFieldErrors = {};
    if (!emergencyContact.name.trim()) {
      errors.name = ck.manifest.emergencyContactNameRequired;
    }
    if (!emergencyContact.phone.trim()) {
      errors.phone = ck.manifest.emergencyContactPhoneRequired;
    }
    setEmergencyContactErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function validateManifestEntries(): boolean {
    if (travelerCount < 1) {
      setManifestErrors({});
      setEmergencyContactErrors({});
      return true;
    }
    const emergencyOk = validateEmergencyContact();
    const errors: Record<number, ManifestFieldErrors> = {};
    const entries =
      manifestEntries.length >= travelerCount
        ? manifestEntries
        : Array.from(
            { length: travelerCount },
            (_, i) => manifestEntries[i] ?? emptyManifestEntryDraft(),
          );

    entries.slice(0, travelerCount).forEach((entry, i) => {
      const n = String(i + 1);
      const fieldErrors: ManifestFieldErrors = {};
      if (!entry.fullName.trim()) {
        fieldErrors.fullName = ck.manifest.fullNameRequired.replace('{n}', n);
      }
      if (!entry.nationality.trim()) {
        fieldErrors.nationality = ck.manifest.nationalityRequired.replace('{n}', n);
      }
      if (!entry.idNumber.trim()) {
        fieldErrors.idNumber = ck.manifest.idNumberRequired.replace('{n}', n);
      }
      if (Object.keys(fieldErrors).length > 0) {
        errors[i] = fieldErrors;
      }
    });

    if (Object.keys(errors).length > 0) {
      setManifestErrors(errors);
      return false;
    }
    setManifestErrors({});
    return emergencyOk;
  }

  async function handleCheckout() {
    if (!draft) return;
    if (!preferredPaymentMethod) {
      setError(ck.paymentMethodRequired);
      return;
    }
    const accessToken = await ensureClientAccessToken();
    if (!accessToken) {
      setError(ck.stripeError.authDescription);
      return;
    }

    if (!validateManifestEntries()) {
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const checkoutDraft =
        isVehicleReservationDraft(draft) && draft.vehicleTripId
          ? { ...draft, seats: vehicleSeats >= 1 ? vehicleSeats : 1 }
          : draft;
      const payload = buildCheckoutRequest(checkoutDraft, preferredPaymentMethod);
      if (isAssisted) {
        const response = await requestBooking(accessToken, payload);
        if (travelerCount >= 1) {
          await persistManifestEntries(accessToken, response.bookingId);
        }
        router.push(`/booking/request-success?booking_id=${response.bookingId}`);
        return;
      }

      const booking = await createBooking(accessToken, payload);
      if (travelerCount >= 1) {
        await persistManifestEntries(accessToken, booking.booking.id);
      }

      if (booking.requiresVerification && booking.verificationId) {
        const params = new URLSearchParams({
          verificationId: booking.verificationId,
          bookingId: booking.booking.id,
          next: '/booking/recap',
        });
        router.push(`/booking/verify?${params.toString()}`);
        return;
      }

      if (preferredPaymentMethod === 'cash') {
        router.push(
          `/booking/success?booking_id=${booking.booking.id}&payment=cash`,
        );
        return;
      }

      if (preferredPaymentMethod === 'bank_transfer') {
        router.push(
          `/booking/success?booking_id=${booking.booking.id}&payment=bank_transfer`,
        );
        return;
      }

      if (preferredPaymentMethod === 'mobile_money') {
        router.push(
          `/booking/success?booking_id=${booking.booking.id}&payment=mobile_money`,
        );
        return;
      }

      const checkout = await createBookingCheckoutSession(accessToken, booking.booking.id);
      window.location.assign(checkout.url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : ck.stripeError.genericHint);
      setSubmitting(false);
    }
  }

  const cartHref = draft ? `/booking/cart?${buildReservationQuery(draft)}` : '/booking/cart';
  const browseHref = draft ? buildDraftBrowseHref(draft) : '/hotels';
  const detailHref = draft ? buildDraftDetailHref(draft) : browseHref;
  const hasToken = Boolean(getClientAccessToken());

  const totalLabel =
    draft && isRoomReservationDraft(draft) && room
      ? formatHotelPrice(room.totalPriceCents ?? room.basePriceCents, room.currency)
      : draft && isFlightReservationDraft(draft) && flightClass && flightDetail
        ? formatFlightPrice(flightClass.totalPriceCents, flightDetail.currency)
        : draft && isCabinReservationDraft(draft) && cruiseReady && cruiseDetail
          ? formatCruisePrice(cruiseReady.priceCents, cruiseDetail.currency)
          : draft &&
              isActivityScheduleReservationDraft(draft) &&
              activityReady &&
              activityDetail
            ? formatActivityPrice(
                activityReady.priceCents * draft.participants,
                activityDetail.currency,
              )
            : draft && isPackageReservationDraft(draft) && packageDetail && packageReady
              ? formatPackagePrice(
                  packageReservationTotalCents(packageDetail.pricing, draft.travelers),
                  packageDetail.pricing.currency,
                )
            : vehicleReady && isVehicleReservationDraft(draft!)
            ? formatCarPrice(
                draft!.vehicleTripId && vehicleTrip
                  ? vehicleTrip.priceCentsPerPerson *
                      (vehicleSeats >= 1 ? vehicleSeats : 1)
                  : vehicleReady.totalPriceCents,
                vehicleTrip?.currency ?? vehicleReady.currency,
              )
            : null;

  const canPay =
    Boolean(draft) &&
    !loading &&
    ((isRoomReservationDraft(draft!) && room) ||
      (isFlightReservationDraft(draft!) && flightClass) ||
      (isCabinReservationDraft(draft!) && cruiseReady) ||
      (isActivityScheduleReservationDraft(draft!) && activityReady) ||
      (isPackageReservationDraft(draft!) && packageReady) ||
      Boolean(vehicleReady));

  const stepperLabels = useMemo(
    () => ({
      stepperAriaLabel: ck.stepperAriaLabel,
      cart: ck.stepCart,
      recap: ck.stepRecap,
      payment: isAssisted ? ck.stepRequest : ck.stepPayment,
      confirmation: ck.stepConfirmation,
      cancelled: ck.stepCancelled,
    }),
    [ck, isAssisted],
  );

  return (
    <CheckoutPageShell
      title={ck.recapTitle}
      currentStep="payment"
      stepperLabels={stepperLabels}
    >
        {!draft && (
          <div className="mt-6 rounded-xl border border-red-200 bg-atg-elevated p-5 dark:border-red-900/40 dark:bg-atg-elevated">
            <p className="text-sm text-red-700 dark:text-red-300">{ck.invalidRecap}</p>
            <Link
              href="/booking/cart"
              className="mt-4 inline-flex min-h-[44px] items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              {ck.backToCart}
            </Link>
          </div>
        )}

        {draft && (
          <div className="mt-6 space-y-4 rounded-xl border border-atg-border bg-atg-elevated p-5 dark:border-atg-border dark:bg-atg-elevated">
            {loading && (
              <div className="flex items-center justify-center py-10">
                <Spinner size="md" variant="primary" label={ck.loading} showLabel />
              </div>
            )}

            {!loading && isRoomReservationDraft(draft) && hotelDetail && room && (
              <CheckoutRecapLine
                icon="hotel"
                eyebrow={hotelDetail.destinationName}
                title={hotelDetail.name}
                details={
                  <>
                    <p>{room.name}</p>
                    <p>
                      {formatDisplayDate(draft.checkIn, locale)} {'->'}{' '}
                      {formatDisplayDate(draft.checkOut, locale)}
                    </p>
                    <p>
                      {draft.guests} voyageur{draft.guests > 1 ? 's' : ''}
                    </p>
                  </>
                }
                price={totalLabel ?? undefined}
              />
            )}

            {!loading && isFlightReservationDraft(draft) && flightDetail && flightClass && (
              <CheckoutRecapLine
                icon="flight"
                eyebrow={`${flightDetail.airlineName} · ${flightDetail.flightNumber}`}
                title={`${formatAirportLabel(flightDetail.departureAirport.iataCode, flightDetail.departureAirport)} → ${formatAirportLabel(flightDetail.arrivalAirport.iataCode, flightDetail.arrivalAirport)}`}
                details={
                  <>
                    <p>{f.classNames[flightClass.className] ?? flightClass.className}</p>
                    <p>{formatDisplayDate(draft.departureDate, locale)}</p>
                    <p>
                      {draft.passengers === 1
                        ? `1 ${f.passengerSingular}`
                        : f.passengerPlural.replace('{n}', String(draft.passengers))}
                    </p>
                  </>
                }
                price={totalLabel ?? undefined}
              />
            )}

            {!loading && cruiseReady && cruiseDetail && isCabinReservationDraft(draft) && (
              <CheckoutRecapLine
                icon="cruise"
                eyebrow={cruiseDetail.cruiseLineName}
                title={cruiseDetail.itineraryName}
                details={
                  <>
                    <p>
                      {cr.shipLabel}: {cruiseDetail.shipName} · {cruiseReady.categoryName}
                    </p>
                    <p>
                      {formatDisplayDate(cruiseDetail.departureDate, locale)} {'->'}{' '}
                      {formatDisplayDate(cruiseDetail.returnDate, locale)}
                    </p>
                    <p>
                      {draft.guests === 1
                        ? `1 ${cr.guestSingular}`
                        : cr.guestPlural.replace('{n}', String(draft.guests))}
                    </p>
                  </>
                }
                price={totalLabel ?? undefined}
              />
            )}

            {!loading &&
              activityReady &&
              activityDetail &&
              isActivityScheduleReservationDraft(draft) && (
                <CheckoutRecapLine
                  icon="activity"
                  eyebrow={activityDetail.providerName}
                  title={activityDetail.title}
                  details={
                    <>
                      <p>
                        {formatDisplayDate(draft.date, locale)} ·{' '}
                        {formatScheduleTime(activityReady.startDatetime, locale)}
                      </p>
                      <p>
                        {draft.participants === 1
                          ? `1 ${f.passengerSingular}`
                          : f.passengerPlural.replace('{n}', String(draft.participants))}
                      </p>
                    </>
                  }
                  price={totalLabel ?? undefined}
                />
              )}

            {!loading &&
              draft &&
              isPackageReservationDraft(draft) &&
              packageDetail &&
              packageReady && (
                <div className="space-y-4">
                  <PackageReservationSummary
                    draft={draft}
                    packageDetail={packageDetail}
                    t={p}
                    locale={locale}
                    showPricing
                  />
                  <div className="border-t border-atg-border pt-4 dark:border-atg-border">
                    <PackagePriceDisplay
                      pricing={{
                        ...packageDetail.pricing,
                        subtotalCents:
                          packageDetail.pricing.subtotalCents * draft.travelers,
                        discountAmountCents:
                          packageDetail.pricing.discountAmountCents * draft.travelers,
                        totalCents: packageReservationTotalCents(
                          packageDetail.pricing,
                          draft.travelers,
                        ),
                      }}
                      priceLabel={p.packagePrice}
                      discountBadgeTemplate={p.discountBadge}
                      originalPriceAria={p.originalPriceAria}
                      className="text-left [&_div]:justify-start"
                    />
                  </div>
                  {totalLabel && (
                    <p className="sr-only">Total: {totalLabel}</p>
                  )}
                </div>
              )}

            {!loading &&
              draft &&
              isPackageReservationDraft(draft) &&
              packageDetail &&
              !packageReady && (
                <p className="text-sm text-red-700 dark:text-red-300">
                  {p.packageCartInvalid}{' '}
                  <Link href={detailHref} className="font-semibold underline">
                    {p.modifySelection}
                  </Link>
                </p>
              )}

            {!loading && vehicleReady && isVehicleReservationDraft(draft) && (
              <>
                {vehicleTrip?.isMine ? (
                  <div className="space-y-2">
                    <p
                      role="status"
                      className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm text-atg-fg"
                    >
                      {ck.vehicleTripOrganizerBanner}
                    </p>
                    {existingVehicleBookingId ? (
                      <p className="text-sm text-atg-muted">
                        <Link
                          href={`/account/reservations/${existingVehicleBookingId}`}
                          className="font-semibold text-primary underline-offset-2 hover:underline"
                        >
                          {ck.vehicleTripExistingBooking}
                        </Link>
                      </p>
                    ) : null}
                  </div>
                ) : null}
                <CheckoutRecapLine
                  icon="car"
                  eyebrow={vehicleReady.agency.name}
                  title={`${vehicleReady.route.departureCity} → ${vehicleReady.route.arrivalCity}`}
                  details={
                    <>
                      <p>
                        {vehicleReady.category.exampleModel ?? vehicleReady.category.name}
                      </p>
                      <p>{formatDisplayDate(draft.travelDate, locale)}</p>
                      {draft.vehicleTripId && vehicleTrip ? (
                        <>
                          <p>
                            {new Intl.DateTimeFormat(locale || undefined, {
                              hour: '2-digit',
                              minute: '2-digit',
                            }).format(new Date(vehicleTrip.departureDatetime))}
                          </p>
                          <p>
                            {vehicleSeats > 1
                              ? `${vehicleSeats} places`
                              : '1 place'}
                          </p>
                          <p className="font-medium text-atg-fg">
                            {ck.vehicleSharedPricePerPerson.replace(
                              '{price}',
                              formatCarPrice(
                                vehicleTrip.priceCentsPerPerson,
                                vehicleTrip.currency,
                              ),
                            )}
                          </p>
                        </>
                      ) : null}
                    </>
                  }
                  price={totalLabel ?? undefined}
                />
              </>
            )}

            {!loading && isCabinReservationDraft(draft) && cruiseDetail && !cruiseReady && (
              <p className="text-sm text-red-700 dark:text-red-300">
                {cr.unavailable}.{' '}
                <Link href={detailHref} className="font-semibold underline">
                  {cr.modifySearch}
                </Link>
              </p>
            )}

            {!loading &&
              isActivityScheduleReservationDraft(draft) &&
              activityDetail &&
              !activityReady && (
                <p className="text-sm text-red-700 dark:text-red-300">
                  Créneau indisponible ou places insuffisantes.{' '}
                  <Link href={detailHref} className="font-semibold underline">
                    Modifier la sélection
                  </Link>
                </p>
              )}

            {!loading && !canPay && draft && !isPackageReservationDraft(draft) && (
              <p className="text-sm text-red-700 dark:text-red-300">
                Selection indisponible.{' '}
                <Link href={browseHref} className="font-semibold underline">
                  {ck.resumeSearch}
                </Link>
              </p>
            )}

            {!loading && canPay && travelerCount >= 1 && (
              <div className="space-y-4">
                <BookingEmergencyContactForm
                  value={emergencyContact}
                  onChange={(next) => {
                    setEmergencyContact(next);
                    setEmergencyContactErrors({});
                  }}
                  labels={{
                    title: ck.manifest.emergencyContactSection,
                    subtitle: ck.manifest.emergencyContactHint,
                    name: ck.manifest.emergencyContactName,
                    phone: ck.manifest.emergencyContactPhone,
                    email: ck.manifest.emergencyContactEmail,
                    country: ck.manifest.emergencyContactCountry,
                    address: ck.manifest.emergencyContactAddress,
                    addressPlaceholder: ck.manifest.emergencyContactAddressPlaceholder,
                    nationalityPlaceholder: ck.manifest.nationalityPlaceholder,
                    nationalitySearch: ck.manifest.nationalitySearch,
                    nationalityEmpty: ck.manifest.nationalityEmpty,
                  }}
                  errors={emergencyContactErrors}
                  collapsible
                />
                <CheckoutManifestForm
                  count={travelerCount}
                  entries={manifestEntries}
                  onChange={(entries) => {
                    setManifestEntries(entries);
                    setManifestErrors({});
                  }}
                  labels={ck.manifest}
                  validationErrors={manifestErrors}
                  onSaveTraveler={saveTravelerEntry}
                  {...(draft &&
                  isVehicleReservationDraft(draft) &&
                  draft.vehicleTripId &&
                  vehicleTrip
                    ? {
                        onAddTraveler: () => void adjustVehicleSeats(vehicleSeats + 1),
                        onRemoveTraveler: (index: number) => {
                          setManifestEntries((prev) =>
                            prev.filter((_, i) => i !== index),
                          );
                          setManifestErrors({});
                          void adjustVehicleSeats(vehicleSeats - 1);
                        },
                        canAddTraveler:
                          !seatsAdjusting && vehicleSeatsRemainingToAdd > 0,
                        canRemoveTraveler: !seatsAdjusting && vehicleSeats > 1,
                        addingTraveler: seatsAdjusting,
                        seatsRemainingCount: vehicleSeatsRemainingToAdd,
                      }
                    : {})}
                />
              </div>
            )}

            {!loading && canPay ? (
              <fieldset className="space-y-3 rounded-lg border border-atg-border p-4 dark:border-atg-border">
                <legend className="px-1 text-sm font-semibold text-atg-fg">
                  {ck.paymentMethodTitle}
                </legend>
                <p className="text-sm text-atg-muted">{ck.paymentMethodHint}</p>
                {paymentMethods.stripe ? (
                  <label className="flex cursor-pointer gap-3 rounded-lg border border-atg-border p-3 has-[:checked]:border-primary has-[:checked]:bg-primary/5 dark:border-atg-border">
                    <input
                      type="radio"
                      name="preferredPaymentMethod"
                      value="stripe"
                      checked={preferredPaymentMethod === 'stripe'}
                      onChange={() => {
                        setPreferredPaymentMethod('stripe');
                        setError(null);
                      }}
                      className="mt-1"
                    />
                    <span>
                      <span className="block text-sm font-medium text-atg-fg">
                        {ck.paymentMethodStripe}
                      </span>
                      <span className="block text-xs text-atg-muted">
                        {ck.paymentMethodStripeHint}
                      </span>
                    </span>
                  </label>
                ) : null}
                {paymentMethods.cash ? (
                  <label className="flex cursor-pointer gap-3 rounded-lg border border-atg-border p-3 has-[:checked]:border-primary has-[:checked]:bg-primary/5 dark:border-atg-border">
                    <input
                      type="radio"
                      name="preferredPaymentMethod"
                      value="cash"
                      checked={preferredPaymentMethod === 'cash'}
                      onChange={() => {
                        setPreferredPaymentMethod('cash');
                        setError(null);
                      }}
                      className="mt-1"
                    />
                    <span>
                      <span className="block text-sm font-medium text-atg-fg">
                        {ck.paymentMethodCash}
                      </span>
                      <span className="block text-xs text-atg-muted">
                        {ck.paymentMethodCashHint}
                      </span>
                    </span>
                  </label>
                ) : null}
                {paymentMethods.bank_transfer ? (
                  <label className="flex cursor-pointer gap-3 rounded-lg border border-atg-border p-3 has-[:checked]:border-primary has-[:checked]:bg-primary/5 dark:border-atg-border">
                    <input
                      type="radio"
                      name="preferredPaymentMethod"
                      value="bank_transfer"
                      checked={preferredPaymentMethod === 'bank_transfer'}
                      onChange={() => {
                        setPreferredPaymentMethod('bank_transfer');
                        setError(null);
                      }}
                      className="mt-1"
                    />
                    <span>
                      <span className="block text-sm font-medium text-atg-fg">
                        {ck.paymentMethodBankTransfer}
                      </span>
                      <span className="block text-xs text-atg-muted">
                        {ck.paymentMethodBankTransferHint}
                      </span>
                    </span>
                  </label>
                ) : null}
                {paymentMethods.mobile_money ? (
                  <label className="flex cursor-pointer gap-3 rounded-lg border border-atg-border p-3 has-[:checked]:border-primary has-[:checked]:bg-primary/5 dark:border-atg-border">
                    <input
                      type="radio"
                      name="preferredPaymentMethod"
                      value="mobile_money"
                      checked={preferredPaymentMethod === 'mobile_money'}
                      onChange={() => {
                        setPreferredPaymentMethod('mobile_money');
                        setError(null);
                      }}
                      className="mt-1"
                    />
                    <span>
                      <span className="block text-sm font-medium text-atg-fg">
                        {ck.paymentMethodMobileMoney}
                      </span>
                      <span className="block text-xs text-atg-muted">
                        {ck.paymentMethodMobileMoneyHint}
                      </span>
                    </span>
                  </label>
                ) : null}
                {preferredPaymentMethod === 'bank_transfer' ? (
                  <BankTransferAccountsPanel
                    accounts={bankAccounts}
                    loading={bankAccountsLoading}
                    labels={{
                      title: ck.bankTransferAccountsTitle,
                      empty: ck.bankTransferAccountsEmpty,
                      holder: ck.bankTransferHolder,
                      accountNumber: ck.bankTransferAccountNumber,
                      swift: ck.bankTransferSwift,
                      currency: ck.bankTransferCurrency,
                      referenceHint: ck.bankTransferReferenceHint,
                    }}
                  />
                ) : null}
                {preferredPaymentMethod === 'mobile_money' ? (
                  <MobileMoneyInstructionsPanel
                    countries={mobileMoneyCountries}
                    loading={mobileMoneyLoading}
                    labels={{
                      title: ck.mobileMoneyTitle,
                      empty: ck.mobileMoneyEmpty,
                      country: ck.mobileMoneyCountry,
                      operator: ck.mobileMoneyOperator,
                      phone: ck.mobileMoneyPhone,
                      label: ck.mobileMoneyLabel,
                      referenceHint: ck.mobileMoneyReferenceHint,
                      selectCountry: ck.mobileMoneySelectCountry,
                      selectOperator: ck.mobileMoneySelectOperator,
                    }}
                  />
                ) : null}
              </fieldset>
            ) : null}

            {!hasToken && (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
                {isAssisted ? ck.authRequiredRequest : ck.authRequiredPayment}
              </p>
            )}
            {error && (
              <StripePaymentError
                message={error}
                labels={ck.stripeError}
                onDismiss={() => setError(null)}
              />
            )}

            <div className="mt-6 flex flex-wrap gap-3 border-t border-atg-border pt-4 dark:border-atg-border">
              <Link
                href={cartHref}
                className="inline-flex min-h-[44px] items-center rounded-lg border border-atg-border px-4 py-2 text-sm font-semibold text-atg-fg hover:bg-atg-surface dark:border-atg-border dark:text-white/80 dark:hover:bg-white/5"
              >
                {ck.backToCart}
              </Link>
              <Button
                type="button"
                onClick={() => void handleCheckout()}
                disabled={!canPay || !preferredPaymentMethod}
                loading={submitting}
                loadingText={
                  isAssisted
                    ? ck.requestSubmitting
                    : preferredPaymentMethod === 'cash'
                      ? ck.cashSubmitting
                      : preferredPaymentMethod === 'bank_transfer'
                        ? ck.bankTransferSubmitting
                        : preferredPaymentMethod === 'mobile_money'
                          ? ck.mobileMoneySubmitting
                          : ck.stripeRedirecting
                }
              >
                {isAssisted
                  ? ck.requestBooking
                  : preferredPaymentMethod === 'cash'
                    ? ck.payWithCash
                    : preferredPaymentMethod === 'bank_transfer'
                      ? ck.payWithBankTransfer
                      : preferredPaymentMethod === 'mobile_money'
                        ? ck.payWithMobileMoney
                        : ck.payWithStripe}
              </Button>
            </div>
          </div>
        )}
    </CheckoutPageShell>
  );
}
