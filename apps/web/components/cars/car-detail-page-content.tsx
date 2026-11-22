'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getVehicleDetail } from '../../lib/api/public';
import {
  createPublicVehicleTrip,
  joinPublicVehicleTrip,
} from '../../lib/api/vehicle-trips';
import { ensureClientAccessToken } from '../../lib/auth/client-session';
import {
  buildCarDetailHref,
  toVehicleDetailQuery,
  type CarDetailSearchParams,
} from '../../lib/cars/listings';
import { resolveVehicleEquipment, resolveVehicleSpecs } from '../../lib/cars/specs';
import type { VehicleDetail } from '../../lib/cars/types';
import { formatDisplayDate } from '../../lib/hotels/dates';
import { isUuidV4 } from '../../lib/ids';
import { useLocale } from 'next-intl';
import { useNamespaceLabels } from '../../lib/i18n/use-namespace-labels';
import { buildReservationQuery } from '../../lib/reservations/flow';
import { HomeFooter } from '../home/home-footer';
import { HomeHeader } from '../home/home-header';
import { DetailPageSkeletonShell } from '../shared/loading-skeletons';
import { scrollToBookingSidebar } from '../shared/booking-sidebar-shell';
import { ProductGallery } from '../shared';
import {
  CarBookingMobileBar,
  CarBookingSidebar,
  type CarReservePayload,
} from './car-booking-sidebar';
import { CarConditionsSection } from './car-conditions-section';
import { CarEquipmentSection } from './car-equipment-section';
import { CarHeroMedia } from './car-hero-media';
import { CarInfoSection } from './car-info-section';
import { CarRouteMapSection } from './car-route-map-section';
import { CarSpecBadges } from './car-spec-badges';

export type CarDetailPageSearch = CarDetailSearchParams;

type CarDetailPageContentProps = {
  vehicleId: string;
  initialSearch: CarDetailPageSearch;
};

export function CarDetailPageContent({
  vehicleId,
  initialSearch,
}: CarDetailPageContentProps) {
  const c = useNamespaceLabels('cars');
  const locale = useLocale();
  const router = useRouter();

  const [detail, setDetail] = useState<VehicleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(false);
  const [fetchId, setFetchId] = useState(0);

  const [travelDate, setTravelDate] = useState(initialSearch.travelDate ?? '');
  const [routeId, setRouteId] = useState(initialSearch.routeId ?? '');
  const [reserving, setReserving] = useState(false);
  const [reserveError, setReserveError] = useState<string | null>(null);

  const searchContext: CarDetailSearchParams = {
    routeId: routeId || undefined,
    departureLocation: initialSearch.departureLocation,
    arrivalLocation: initialSearch.arrivalLocation,
    travelDate,
  };

  const apiQuery = toVehicleDetailQuery(searchContext);

  const syncUrl = useCallback(
    (overrides: Partial<CarDetailSearchParams> = {}) => {
      const href = buildCarDetailHref(vehicleId, {
        routeId: (overrides.routeId ?? routeId) || undefined,
        departureLocation: initialSearch.departureLocation,
        arrivalLocation: initialSearch.arrivalLocation,
        travelDate: (overrides.travelDate ?? travelDate) || undefined,
      });
      router.replace(href, { scroll: false });
    },
    [
      vehicleId,
      initialSearch.departureLocation,
      initialSearch.arrivalLocation,
      routeId,
      travelDate,
      router,
    ],
  );

  useEffect(() => {
    let cancelled = false;
    if (!isUuidV4(vehicleId)) {
      setDetail(null);
      setLoading(false);
      setNotFound(true);
      setError(false);
      return;
    }
    if (!apiQuery) {
      setDetail(null);
      setLoading(false);
      setNotFound(false);
      setError(false);
      return;
    }

    setLoading(true);
    setNotFound(false);
    setError(false);

    void getVehicleDetail(vehicleId, apiQuery)
      .then((data) => {
        if (cancelled) return;
        setDetail(data);
        if (data.route?.id && data.route.id !== routeId) {
          setRouteId(data.route.id);
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setDetail(null);
        const msg = err instanceof Error ? err.message : String(err);
        if (/API (400|404):/.test(msg)) setNotFound(true);
        else setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [vehicleId, apiQuery, fetchId]);

  // Retour liste sans filtres : la fiche porte les params de trajet, pas la recherche.
  const listHref = '/cars';

  useEffect(() => {
    if (!notFound) return;
    router.replace(listHref);
  }, [notFound, listHref, router]);

  function handleTravelDateChange(value: string) {
    setTravelDate(value);
    syncUrl({ travelDate: value || undefined });
  }

  async function handleReserve(payload: CarReservePayload) {
    if (!travelDate) {
      scrollToBookingSidebar({ openDrawer: true });
      return;
    }
    if (!detail?.route?.id) return;

    setReserveError(null);
    const token = await ensureClientAccessToken();
    if (!token) {
      const next = encodeURIComponent(
        typeof window !== 'undefined'
          ? `${window.location.pathname}${window.location.search}`
          : buildCarDetailHref(vehicleId, searchContext),
      );
      router.push(`/booking/login?next=${next}`);
      return;
    }

    setReserving(true);
    try {
      const trip =
        payload.mode === 'join'
          ? await joinPublicVehicleTrip(token, payload.tripId, {
              seats: payload.seats,
            })
          : await createPublicVehicleTrip(token, {
              vehicleId,
              routeId: detail.route.id,
              departureDatetime: payload.departureDatetime,
              seats: payload.seats,
            });

      const query = buildReservationQuery({
        kind: 'vehicle',
        vehicleId,
        availabilitySlotId: trip.availabilityId,
        routeId: trip.routeId,
        travelDate,
        vehicleTripId: trip.id,
        seats: payload.seats,
        departureDatetime: trip.departureDatetime,
      });
      router.push(`/booking/cart?${query}`);
    } catch {
      setReserveError(c.reserveTripError);
    } finally {
      setReserving(false);
    }
  }

  const sidebarProps = detail
    ? {
        detail,
        travelDate,
        onTravelDateChange: handleTravelDateChange,
        onReserve: handleReserve,
        reserving,
        reserveError,
        t: c,
        locale,
      }
    : null;

  const vehicleSpecs = useMemo(
    () => (detail ? resolveVehicleSpecs(detail.category.name) : null),
    [detail],
  );

  const equipmentItems = useMemo(() => {
    if (!detail || !vehicleSpecs) return [];
    return resolveVehicleEquipment(detail.category.name, vehicleSpecs);
  }, [detail, vehicleSpecs]);

  if (notFound || (loading && !detail && apiQuery)) {
    return <DetailPageSkeletonShell loadingLabel={c.loading} />;
  }

  if (!apiQuery) {
    return (
      <div className="flex min-h-screen flex-col bg-atg-surface dark:bg-atg-surface">
        <HomeHeader />
        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-24 text-center sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-atg-fg">{c.selectDatesHint}</h1>
          <p className="mt-2 text-sm text-atg-muted">{c.noSearchParamsHint}</p>
          <Link
            href={listHref}
            className="mt-6 inline-flex min-h-[44px] items-center rounded-lg bg-primary px-6 py-2 text-sm font-bold text-white hover:bg-primary-hover"
          >
            {c.backToList}
          </Link>
        </div>
        <HomeFooter />
      </div>
    );
  }

  if (error || !detail || !sidebarProps || !vehicleSpecs) {
    return (
      <div className="flex min-h-screen flex-col bg-atg-surface dark:bg-atg-surface">
        <HomeHeader />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-red-200 bg-atg-elevated p-5 dark:border-red-900/40 dark:bg-atg-elevated">
            <p className="text-sm text-red-700 dark:text-red-300">{c.loadError}</p>
            <button
              type="button"
              onClick={() => setFetchId((value) => value + 1)}
              className="mt-4 inline-flex min-h-[44px] items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              {c.retry}
            </button>
          </div>
        </main>
        <HomeFooter />
      </div>
    );
  }

  const vehicleTitle =
    detail.category.exampleModel ??
    detail.category.name ??
    detail.licensePlate ??
    c.categoryTitle;
  const routeTitle = `${detail.route.departureCity} → ${detail.route.arrivalCity}`;
  const galleryName = `${routeTitle} · ${vehicleTitle}`;

  return (
    <div className="flex min-h-screen flex-col bg-atg-surface dark:bg-atg-surface">
      <HomeHeader />

      <div className="border-b border-atg-border bg-atg-elevated dark:border-atg-border dark:bg-atg-elevated">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <nav
            className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-atg-muted"
            aria-label={c.breadcrumbAria}
          >
            <Link href="/" className="transition-colors hover:text-primary">
              {c.breadcrumbHome}
            </Link>
            <span className="text-atg-muted/60" aria-hidden>
              ›
            </span>
            <Link href={listHref} className="transition-colors hover:text-primary">
              {c.breadcrumbCarsDetail}
            </Link>
            <span className="text-atg-muted/60" aria-hidden>
              ›
            </span>
            <span className="font-medium text-atg-fg">{routeTitle}</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 pb-40 sm:px-6 lg:px-8 lg:pb-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          <div className="min-w-0 space-y-8 lg:col-span-2">
            {detail.images && detail.images.length > 0 ? (
              <ProductGallery
                images={detail.images}
                name={galleryName}
                labels={{
                  ariaLabel: c.galleryAria,
                  openLightbox: c.galleryOpenLightbox,
                  close: c.galleryClose,
                  previous: c.galleryPrevious,
                  next: c.galleryNext,
                  counter: c.galleryCounter,
                }}
              />
            ) : (
              <CarHeroMedia
                imageUrl={detail.imageUrl}
                categoryName={c.routeLabel}
                title={routeTitle}
                agencyName={`${vehicleTitle} · ${detail.agency.name}`}
                placeholderAria={c.imagePlaceholderAria}
              />
            )}

            <header>
              <p className="text-sm font-medium text-primary">{c.routeLabel}</p>
              <h1 className="mt-1 text-2xl font-bold text-atg-fg sm:text-3xl">
                {routeTitle}
              </h1>
              <p className="mt-2 text-base font-medium text-atg-fg">
                {vehicleTitle}
                {detail.category.exampleModel &&
                detail.category.name &&
                detail.category.exampleModel !== detail.category.name
                  ? ` · ${detail.category.name}`
                  : null}
              </p>
              <p className="mt-1 text-sm text-atg-muted">{detail.agency.name}</p>
              <p className="mt-2 text-sm text-atg-muted">
                {formatDisplayDate(detail.travelDate, locale)}
              </p>
              <CarSpecBadges
                specs={vehicleSpecs}
                labels={c.specs}
                transmissionLabels={c.transmission}
                fuelLabels={c.fuel}
                className="mt-4"
              />
            </header>

            <CarInfoSection
              title={c.infoTitle}
              categoryName={detail.category.name}
              exampleModel={detail.category.exampleModel}
              licensePlate={detail.licensePlate}
              agencyName={detail.agency.name}
              agencyCity={detail.agency.city}
              agencyAddress={detail.agency.address}
              departureCity={detail.route.departureCity}
              arrivalCity={detail.route.arrivalCity}
              travelDate={detail.travelDate}
              t={c}
              locale={locale}
            />

            <CarRouteMapSection
              departureCity={detail.route.departureCity}
              arrivalCity={detail.route.arrivalCity}
              labels={{
                routeMapTitle: c.routeMapTitle,
                routeMapAria: c.routeMapAria,
                routeMapDeparture: c.routeMapDeparture,
                routeMapArrival: c.routeMapArrival,
                routeMapDuration: c.routeMapDuration,
                hourSingular: c.hourSingular,
                hourPlural: c.hourPlural,
                minuteSingular: c.minuteSingular,
                minutePlural: c.minutePlural,
              }}
            />

            <CarEquipmentSection
              items={equipmentItems}
              title={c.equipmentTitle}
              labels={c.equipment}
            />

            <CarConditionsSection title={c.conditionsTitle} items={c.conditionItems} />
          </div>

          <CarBookingSidebar {...sidebarProps} />
        </div>
      </div>

      <CarBookingMobileBar {...sidebarProps} />
      <HomeFooter />
    </div>
  );
}
