'use client';

import { formatScheduleTime } from '../../lib/activities/listings';
import { formatAirportLabel } from '../../lib/flights/airports';
import { formatDisplayDate } from '../../lib/hotels/dates';
import type { PackageLineSelection } from '../../lib/packages/package-lines';
import type { PackageDetail } from '../../lib/packages/types';
import type { PackageDraftValidationData, PackageReservationDraft } from '../../lib/reservations/flow';
import type { Translations } from '../../lib/i18n/translations';

type PackageReservationSummaryProps = {
  draft: PackageReservationDraft;
  packageDetail: PackageDetail;
  validation: PackageDraftValidationData;
  t: Translations['packages'];
  participantSingular: string;
  participantPlural: string;
  locale?: string;
  showPricing?: boolean;
};

function renderLineSummary(
  line: PackageLineSelection,
  validation: PackageDraftValidationData,
  participantSingular: string,
  participantPlural: string,
  locale?: string,
) {
  switch (line.lineType) {
    case 'activity': {
      const activity = validation.activityDetails[line.itemId];
      const schedule = activity?.schedules.find((item) => item.scheduleId === line.scheduleId);
      if (!activity) return null;
      return (
        <>
          <p className="font-medium text-atg-fg">{activity.title}</p>
          <p className="mt-1 text-sm text-atg-muted">
            {formatDisplayDate(line.date, locale)}
            {schedule ? <> · {formatScheduleTime(schedule.startDatetime, locale)}</> : null}
            {' · '}
            {line.participants === 1
              ? `1 ${participantSingular}`
              : participantPlural.replace('{n}', String(line.participants))}
          </p>
        </>
      );
    }
    case 'property': {
      const property = validation.propertyDetails[line.itemId];
      const room = property?.rooms.find((item) => item.id === line.roomId);
      if (!property || !room) return null;
      return (
        <>
          <p className="font-medium text-atg-fg">{property.name}</p>
          <p className="mt-1 text-sm text-atg-muted">
            {room.name} · {formatDisplayDate(line.checkIn, locale)} →{' '}
            {formatDisplayDate(line.checkOut, locale)} · {line.guests} guest(s)
          </p>
        </>
      );
    }
    case 'flight': {
      const flight = validation.flightDetails[line.itemId];
      const flightClass = flight?.classes.find((item) => item.id === line.flightClassId);
      if (!flight || !flightClass) return null;
      return (
        <>
          <p className="font-medium text-atg-fg">
            {flight.airlineName} · {flight.flightNumber}
          </p>
          <p className="mt-1 text-sm text-atg-muted">
            {formatAirportLabel(flight.departureAirport.iataCode)} →{' '}
            {formatAirportLabel(flight.arrivalAirport.iataCode)} ·{' '}
            {formatDisplayDate(line.departureDate, locale)} · {line.passengers} pax
          </p>
        </>
      );
    }
    case 'vehicle': {
      const vehicle = validation.vehicleDetails[line.itemId];
      if (!vehicle) return null;
      return (
        <>
          <p className="font-medium text-atg-fg">
            {vehicle.category.exampleModel ?? vehicle.category.name}
          </p>
          <p className="mt-1 text-sm text-atg-muted">
            {formatDisplayDate(line.pickupDate, locale)} → {formatDisplayDate(line.returnDate, locale)}
          </p>
        </>
      );
    }
    case 'cruise': {
      const sailing = validation.cruiseDetails[line.sailingId];
      const cabin = sailing?.cabins.find(
        (item) => item.availabilityId === line.cabinAvailabilityId,
      );
      if (!sailing || !cabin) return null;
      return (
        <>
          <p className="font-medium text-atg-fg">{sailing.shipName}</p>
          <p className="mt-1 text-sm text-atg-muted">
            {cabin.categoryName} · {formatDisplayDate(sailing.departureDate, locale)} · {line.guests}{' '}
            guest(s)
          </p>
        </>
      );
    }
    default:
      return null;
  }
}

export function PackageReservationSummary({
  draft,
  packageDetail,
  validation,
  t,
  participantSingular,
  participantPlural,
  locale,
  showPricing = false,
}: PackageReservationSummaryProps) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-primary">{t.cardBadge}</p>
        <h2 className="text-xl font-bold text-atg-fg">
          {packageDetail.package.name}
        </h2>
        <p className="mt-2 text-sm text-atg-muted">
          {t.itemsProgress
            .replace('{selected}', String(draft.lines.length))
            .replace('{total}', String(draft.lines.length))}
        </p>
      </div>

      <ul className="space-y-3 border-t border-atg-border pt-4 dark:border-atg-border">
        {draft.lines.map((line, index) => {
          const typeLabel =
            line.lineType === 'cruise'
              ? t.itemTypes.cruise
              : t.itemTypes[line.lineType as keyof typeof t.itemTypes];
          const content = renderLineSummary(
            line,
            validation,
            participantSingular,
            participantPlural,
            locale,
          );
          if (!content) return null;

          return (
            <li
              key={`${line.lineType}-${line.itemId}-${index}`}
              className="rounded-xl border border-atg-border px-4 py-3 dark:border-atg-border"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                {typeLabel} {index + 1}
              </p>
              {content}
            </li>
          );
        })}
      </ul>

      {showPricing && packageDetail.pricing.discountAmountCents > 0 ? (
        <p className="text-sm text-emerald-700 dark:text-emerald-300">
          {t.youSave.replace(
            '{amount}',
            `${(packageDetail.pricing.discountAmountCents / 100).toFixed(0)} ${packageDetail.pricing.currency}`,
          )}
        </p>
      ) : null}
    </div>
  );
}
