'use client';

import type {
  ActivitySchedule,
  BookingCheckoutItem,
  CabinAvailability,
  CruiseSailing,
  FlightClassAvailability,
  VehicleAvailability,
} from '@africatourismgate/types';
import { Button, Input } from '@africatourismgate/ui';
import { useEffect, useState } from 'react';
import { posSalePageConfig } from '../../config/sale';
import { getValidApiClient } from '../../lib/auth/api';
import { defaultFlightDate, defaultRoomStayDates, formatDisplayDate, formatDisplayDateTime } from '../../lib/sale/dates';
import { formatCents } from '../../lib/sale/format';
import {
  computePackageEndDate,
  defaultPackageStartDate,
  parsePackageDurationDays,
} from '../../lib/sale/package-dates';
import type { SaleCatalogHit } from '../../lib/sale/types';

const { config: labels } = posSalePageConfig;

type SaleLineConfigSheetProps = {
  hit: SaleCatalogHit | null;
  open: boolean;
  onClose: () => void;
  onAdd: (item: BookingCheckoutItem, label: string) => void;
};

export function SaleLineConfigSheet({ hit, open, onClose, onAdd }: SaleLineConfigSheetProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const [roomDates, setRoomDates] = useState(defaultRoomStayDates);
  const [flightDate, setFlightDate] = useState(defaultFlightDate());
  const [flightAvailability, setFlightAvailability] = useState<FlightClassAvailability[]>([]);

  const [schedules, setSchedules] = useState<ActivitySchedule[]>([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);

  const [vehicleSlots, setVehicleSlots] = useState<VehicleAvailability[]>([]);
  const [selectedVehicleSlotId, setSelectedVehicleSlotId] = useState<string | null>(null);

  const [sailings, setSailings] = useState<CruiseSailing[]>([]);
  const [selectedSailingId, setSelectedSailingId] = useState<string | null>(null);
  const [cabinSlots, setCabinSlots] = useState<CabinAvailability[]>([]);
  const [selectedCabinSlotId, setSelectedCabinSlotId] = useState<string | null>(null);

  const [packageStartDate, setPackageStartDate] = useState(defaultPackageStartDate);
  const [packageTravelers, setPackageTravelers] = useState(2);

  useEffect(() => {
    if (!open || !hit) return;

    const currentHit = hit;

    setError(null);
    setQuantity(1);
    setSelectedScheduleId(null);
    setSelectedVehicleSlotId(null);
    setSelectedSailingId(null);
    setSelectedCabinSlotId(null);
    setRoomDates(defaultRoomStayDates());
    setFlightDate(defaultFlightDate());
    setPackageStartDate(defaultPackageStartDate());
    setPackageTravelers(2);

    let cancelled = false;

    async function load() {
      if (currentHit.kind === 'package') {
        setLoading(false);
        return;
      }

      setLoading(true);
      const client = await getValidApiClient();

      try {
        if (currentHit.kind === 'activity') {
          const res = await client.listActivitySchedules({
            activityId: currentHit.activity.id,
            limit: 30,
          });
          if (cancelled) return;
          const available = res.data.filter(
            (s) => s.capacity - s.bookedCount > 0,
          );
          setSchedules(available);
          if (available.length === 1) {
            setSelectedScheduleId(available[0]!.id);
          }
        } else if (currentHit.kind === 'room') {
          setSchedules([]);
        } else if (currentHit.kind === 'flight_class') {
          const from = defaultFlightDate();
          const to = new Date(from);
          to.setMonth(to.getMonth() + 2);
          const res = await client.listFlightClassAvailability({
            flightClassId: currentHit.flightClass.id,
            dateFrom: from,
            dateTo: to.toISOString().slice(0, 10),
            limit: 30,
          });
          if (cancelled) return;
          const available = res.data.filter((a) => a.availableSeats > 0);
          setFlightAvailability(available);
          if (available.length === 1) {
            setFlightDate(available[0]!.date);
          }
        } else if (currentHit.kind === 'vehicle') {
          const now = new Date().toISOString();
          const res = await client.listVehicleAvailability({
            vehicleId: currentHit.vehicle.id,
            startFrom: now,
            limit: 20,
          });
          if (cancelled) return;
          const available = res.data.filter((s) => s.status === 'available');
          setVehicleSlots(available);
          if (available.length === 1) {
            setSelectedVehicleSlotId(available[0]!.id);
          }
        } else if (currentHit.kind === 'cabin') {
          const res = await client.listCruiseSailings({ limit: 20 });
          if (cancelled) return;
          setSailings(res.data);
          if (res.data.length === 1) {
            setSelectedSailingId(res.data[0]!.id);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : labels.loadingLabel);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [hit, open]);

  useEffect(() => {
    if (!open || hit?.kind !== 'cabin' || !selectedSailingId) {
      setCabinSlots([]);
      setSelectedCabinSlotId(null);
      return;
    }

    let cancelled = false;

    void (async () => {
      const client = await getValidApiClient();
      if (cancelled) return;

      void client
        .listCabinAvailability({
          sailingId: selectedSailingId,
          cabinId: hit.cabin.id,
          limit: 20,
        })
        .then((res) => {
          if (cancelled) return;
          const available = res.data.filter((s) => s.availableCount > 0);
          setCabinSlots(available);
          setSelectedCabinSlotId(available.length === 1 ? available[0]!.id : null);
        })
        .catch(() => {
          if (!cancelled) setCabinSlots([]);
        });
    })();

    return () => {
      cancelled = true;
    };
  }, [hit, open, selectedSailingId]);

  if (!open || !hit) {
    return null;
  }

  const packageDurationDays =
    hit.kind === 'package' ? parsePackageDurationDays(hit.package) : 0;
  const packageEndDate =
    hit.kind === 'package'
      ? computePackageEndDate(packageStartDate, packageDurationDays)
      : '';

  function buildCheckoutItem(): BookingCheckoutItem | null {
    if (hit!.kind === 'activity') {
      if (!selectedScheduleId) return null;
      return {
        itemType: 'activity_schedule',
        referenceId: selectedScheduleId,
        quantity,
      };
    }
    if (hit!.kind === 'room') {
      return {
        itemType: 'room',
        referenceId: hit!.room.id,
        quantity,
        startDate: roomDates.startDate,
        endDate: roomDates.endDate,
      };
    }
    if (hit!.kind === 'flight_class') {
      return {
        itemType: 'flight_class',
        referenceId: hit!.flightClass.id,
        quantity,
        date: flightDate,
      };
    }
    if (hit!.kind === 'vehicle') {
      if (!selectedVehicleSlotId) return null;
      return {
        itemType: 'vehicle',
        referenceId: selectedVehicleSlotId,
        quantity: 1,
      };
    }
    if (hit!.kind === 'cabin') {
      if (!selectedCabinSlotId) return null;
      return {
        itemType: 'cabin',
        referenceId: selectedCabinSlotId,
        quantity,
      };
    }
    if (hit!.kind === 'package') {
      const durationDays = parsePackageDurationDays(hit!.package);
      const endDate = computePackageEndDate(packageStartDate, durationDays);
      if (!packageStartDate || packageTravelers < 1 || endDate <= packageStartDate) {
        return null;
      }
      return {
        itemType: 'package',
        referenceId: hit!.package.id,
        quantity: packageTravelers,
        startDate: packageStartDate,
        endDate,
      };
    }
    return null;
  }

  function canSubmit(): boolean {
    return buildCheckoutItem() !== null;
  }

  function handleAdd() {
    const item = buildCheckoutItem();
    if (!item) return;
    onAdd(item, hit!.title);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sale-config-title"
    >
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-t-2xl border border-atg-border bg-atg-elevated shadow-xl sm:rounded-2xl">
        <div className="border-b border-atg-border px-5 py-4">
          <h2 id="sale-config-title" className="text-xl font-bold text-atg-fg">
            {labels.title}
          </h2>
          <p className="mt-1 text-base text-atg-muted">{hit.title}</p>
          <p className="text-sm text-atg-muted">{hit.subtitle}</p>
        </div>

        <div className="pos-touch flex-1 overflow-y-auto px-5 py-5">
          {error ? (
            <p role="alert" className="text-base text-red-600">
              {error}
            </p>
          ) : null}

          {loading ? (
            <p className="text-center text-atg-muted">{labels.loadingLabel}</p>
          ) : (
            <div className="space-y-5">
              {hit.kind === 'activity' ? (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-atg-muted">{labels.scheduleLabel}</p>
                  {schedules.length === 0 ? (
                    <p className="text-atg-muted">{labels.noSchedules}</p>
                  ) : (
                    <ul className="space-y-2">
                      {schedules.map((schedule) => {
                        const remaining = schedule.capacity - schedule.bookedCount;
                        const selected = selectedScheduleId === schedule.id;
                        return (
                          <li key={schedule.id}>
                            <Button
                              type="button"
                              variant={selected ? 'primary' : 'secondary'}
                              size="lg"
                              fullWidth
                              className="!h-auto min-h-[3.25rem] flex-col items-start py-3 text-left"
                              onClick={() => setSelectedScheduleId(schedule.id)}
                            >
                              <span className="font-semibold">
                                {formatDisplayDateTime(schedule.startDatetime)}
                              </span>
                              <span className="text-sm font-normal opacity-90">
                                {remaining} {labels.seatsLabel}
                              </span>
                            </Button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              ) : null}

              {hit.kind === 'room' ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    id="room-start"
                    type="date"
                    label={labels.startDateLabel}
                    value={roomDates.startDate}
                    onChange={(e) =>
                      setRoomDates((d) => ({ ...d, startDate: e.target.value }))
                    }
                  />
                  <Input
                    id="room-end"
                    type="date"
                    label={labels.endDateLabel}
                    value={roomDates.endDate}
                    onChange={(e) =>
                      setRoomDates((d) => ({ ...d, endDate: e.target.value }))
                    }
                  />
                </div>
              ) : null}

              {hit.kind === 'flight_class' ? (
                <div className="space-y-3">
                  <Input
                    id="flight-date"
                    type="date"
                    label={labels.dateLabel}
                    value={flightDate}
                    onChange={(e) => setFlightDate(e.target.value)}
                  />
                  {flightAvailability.length > 0 ? (
                    <ul className="space-y-2">
                      {flightAvailability.map((row) => (
                        <li key={row.id}>
                          <Button
                            type="button"
                            variant={flightDate === row.date ? 'primary' : 'outline'}
                            size="lg"
                            fullWidth
                            className="min-h-[3rem] justify-between"
                            onClick={() => setFlightDate(row.date)}
                          >
                            <span>{formatDisplayDate(row.date)}</span>
                            <span className="text-sm">
                              {row.availableSeats} {labels.seatsLabel} ·{' '}
                              {formatCents(row.priceCents, hit.currency)}
                            </span>
                          </Button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ) : null}

              {hit.kind === 'vehicle' ? (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-atg-muted">{labels.slotLabel}</p>
                  {vehicleSlots.length === 0 ? (
                    <p className="text-atg-muted">{labels.noSlots}</p>
                  ) : (
                    <ul className="space-y-2">
                      {vehicleSlots.map((slot) => (
                        <li key={slot.id}>
                          <Button
                            type="button"
                            variant={
                              selectedVehicleSlotId === slot.id ? 'primary' : 'secondary'
                            }
                            size="lg"
                            fullWidth
                            className="!h-auto min-h-[3.25rem] flex-col items-start py-3 text-left"
                            onClick={() => setSelectedVehicleSlotId(slot.id)}
                          >
                            <span className="font-semibold">
                              {formatDisplayDateTime(slot.startDatetime)} →{' '}
                              {formatDisplayDateTime(slot.endDatetime)}
                            </span>
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : null}

              {hit.kind === 'cabin' ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-atg-muted">{labels.sailingLabel}</p>
                    {sailings.length === 0 ? (
                      <p className="text-atg-muted">{labels.noSailings}</p>
                    ) : (
                      sailings.map((sailing) => (
                        <Button
                          key={sailing.id}
                          type="button"
                          variant={selectedSailingId === sailing.id ? 'primary' : 'outline'}
                          size="lg"
                          fullWidth
                          className="min-h-[3rem]"
                          onClick={() => setSelectedSailingId(sailing.id)}
                        >
                          {formatDisplayDate(sailing.departureDate)}
                        </Button>
                      ))
                    )}
                  </div>
                  {selectedSailingId ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-atg-muted">{labels.slotLabel}</p>
                      {cabinSlots.length === 0 ? (
                        <p className="text-atg-muted">{labels.noSlots}</p>
                      ) : (
                        cabinSlots.map((slot) => (
                          <Button
                            key={slot.id}
                            type="button"
                            variant={selectedCabinSlotId === slot.id ? 'primary' : 'outline'}
                            size="lg"
                            fullWidth
                            className="min-h-[3rem] justify-between"
                            onClick={() => setSelectedCabinSlotId(slot.id)}
                          >
                            <span>{slot.availableCount} cabines</span>
                            <span>{formatCents(slot.priceCents, hit.currency)}</span>
                          </Button>
                        ))
                      )}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {hit.kind === 'package' ? (
                <div className="space-y-4">
                  <Input
                    id="package-start"
                    type="date"
                    label={labels.departureDateLabel}
                    value={packageStartDate}
                    onChange={(e) => setPackageStartDate(e.target.value)}
                  />
                  <Input
                    id="package-travelers"
                    type="number"
                    min={1}
                    max={50}
                    label={labels.travelersLabel}
                    value={String(packageTravelers)}
                    onChange={(e) =>
                      setPackageTravelers(
                        Math.min(50, Math.max(1, Number.parseInt(e.target.value, 10) || 1)),
                      )
                    }
                  />
                  {packageStartDate && packageEndDate > packageStartDate ? (
                    <div className="rounded-xl border border-atg-border bg-atg-surface/50 px-4 py-3 text-sm">
                      <p className="font-medium text-atg-fg">
                        {labels.packageEndDateLabel} : {formatDisplayDate(packageEndDate)}
                      </p>
                      <p className="mt-1 text-atg-muted">
                        {labels.packageDurationHint(packageDurationDays)} ·{' '}
                        {formatCents(hit.pricing.totalCents * packageTravelers, hit.currency)} total
                      </p>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {hit.kind !== 'vehicle' && hit.kind !== 'package' ? (
                <Input
                  id="qty"
                  type="number"
                  min={1}
                  label={labels.quantityLabel}
                  value={String(quantity)}
                  onChange={(e) =>
                    setQuantity(Math.max(1, Number.parseInt(e.target.value, 10) || 1))
                  }
                />
              ) : null}
            </div>
          )}
        </div>

        <div className="pos-touch flex gap-3 border-t border-atg-border px-5 py-4">
          <Button
            type="button"
            variant="outline"
            size="lg"
            fullWidth
            className="min-h-[3.25rem]"
            onClick={onClose}
          >
            {labels.closeLabel}
          </Button>
          <Button
            type="button"
            variant="primary"
            size="lg"
            fullWidth
            className="min-h-[3.25rem]"
            disabled={!canSubmit() || loading}
            onClick={handleAdd}
          >
            {labels.addLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
