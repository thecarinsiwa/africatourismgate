'use client';

import type { PackageItemEnriched } from '../../lib/packages/types';
import type { PackageLineSelection } from '../../lib/packages/package-lines';
import type { Translations } from '../../lib/i18n/translations';
import { PackageActivityConfigItem } from './package-activity-config-section';
import { PackageCruiseConfigItem } from './package-cruise-config-section';
import { PackageFlightConfigItem } from './package-flight-config-section';
import { PackagePropertyConfigItem } from './package-property-config-section';
import { PackageVehicleConfigItem } from './package-vehicle-config-section';

export type PackageConfigContext = {
  date: string;
  participants: number;
  checkIn: string;
  checkOut: string;
  guests: number;
  departureDate: string;
  passengers: number;
  pickupDate: string;
  returnDate: string;
  sailingId: string;
};

type PackageItemConfigItemProps = {
  item: PackageItemEnriched;
  index: number;
  selectedLine: PackageLineSelection | null;
  onChange: (line: PackageLineSelection | null) => void;
  context: PackageConfigContext;
  t: Translations['packages'];
  a: Translations['activities'];
  h: Translations['hotels'];
  f: Translations['flights'];
  c: Translations['cars'];
  cr: Translations['cruises'];
  locale?: string;
};

export function PackageItemConfigItem({
  item,
  selectedLine,
  onChange,
  context,
  t,
  a,
  h,
  f,
  c,
  cr,
  locale,
}: PackageItemConfigItemProps) {
  switch (item.itemType) {
    case 'activity':
      return (
        <PackageActivityConfigItem
          activityId={item.itemId}
          label={item.label}
          date={context.date}
          participants={context.participants}
          selectedScheduleId={
            selectedLine?.lineType === 'activity' && selectedLine.itemId === item.itemId
              ? selectedLine.scheduleId
              : null
          }
          onSelectSchedule={(scheduleId) =>
            onChange({
              lineType: 'activity',
              itemId: item.itemId,
              scheduleId,
              date: context.date,
              participants: context.participants,
            })
          }
          t={t}
          a={a}
          locale={locale}
        />
      );
    case 'property':
      return (
        <PackagePropertyConfigItem
          propertyId={item.itemId}
          label={item.label}
          checkIn={context.checkIn}
          checkOut={context.checkOut}
          guests={context.guests}
          selectedLine={
            selectedLine?.lineType === 'property' && selectedLine.itemId === item.itemId
              ? selectedLine
              : null
          }
          onChange={onChange}
          t={t}
          h={h}
        />
      );
    case 'flight':
      return (
        <PackageFlightConfigItem
          flightId={item.itemId}
          label={item.label}
          departureDate={context.departureDate}
          passengers={context.passengers}
          selectedLine={
            selectedLine?.lineType === 'flight' && selectedLine.itemId === item.itemId
              ? selectedLine
              : null
          }
          onChange={onChange}
          t={t}
          f={f}
        />
      );
    case 'vehicle':
      return (
        <PackageVehicleConfigItem
          vehicleId={item.itemId}
          label={item.label}
          pickupDate={context.pickupDate}
          returnDate={context.returnDate}
          selectedLine={
            selectedLine?.lineType === 'vehicle' && selectedLine.itemId === item.itemId
              ? selectedLine
              : null
          }
          onChange={onChange}
          t={t}
          c={c}
        />
      );
    case 'cruise':
      return (
        <PackageCruiseConfigItem
          cabinId={item.itemId}
          label={item.label}
          sailingId={context.sailingId}
          guests={context.guests}
          selectedLine={
            selectedLine?.lineType === 'cruise' && selectedLine.itemId === item.itemId
              ? selectedLine
              : null
          }
          onChange={onChange}
          t={t}
          cr={cr}
        />
      );
    default:
      return null;
  }
}
