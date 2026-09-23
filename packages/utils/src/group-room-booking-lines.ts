/**
 * Group per-night hotel room booking lines into one stay row for display/PDF.
 * Storage stays one row per night; this is display-only.
 */

export type RoomGroupableBookingLine = {
  id: string;
  itemType: string;
  referenceId: string;
  titleSnapshot: string;
  quantity: number;
  unitPriceCents: number;
  startDate: string | null;
  endDate: string | null;
};

export type GroupedBookingLineDisplay<T extends RoomGroupableBookingLine> = T & {
  /** Number of night rows merged (1 for non-room lines). */
  nightCount: number;
  /** Sum of quantity × unitPrice across merged nights. */
  lineTotalCents: number;
};

function toDateOnly(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(value.trim());
  return match ? match[1]! : value.trim().slice(0, 10);
}

/** Calendar day after a YYYY-MM-DD (checkout = last night + 1). */
function addOneDay(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return iso;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

function roomGroupKey(item: RoomGroupableBookingLine): string {
  return `${item.referenceId}::${item.quantity}`;
}

function lineAmount(item: RoomGroupableBookingLine): number {
  return item.quantity * item.unitPriceCents;
}

/**
 * Merge `room` lines that share the same room + room quantity into one stay.
 * Non-room lines are left unchanged (`nightCount` = 1).
 *
 * Display fields after merge:
 * - `quantity` = number of rooms
 * - `unitPriceCents` = average price per room-night
 * - `lineTotalCents` = sum of night amounts (use this for PDF line totals)
 * - `startDate` = check-in (first night)
 * - `endDate` = check-out (day after last night)
 */
export function groupRoomBookingLinesForDisplay<T extends RoomGroupableBookingLine>(
  items: T[],
): Array<GroupedBookingLineDisplay<T>> {
  const usedIds = new Set<string>();
  const result: Array<GroupedBookingLineDisplay<T>> = [];

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index]!;
    if (item.itemType !== 'room') {
      result.push({
        ...item,
        nightCount: 1,
        lineTotalCents: lineAmount(item),
      });
      continue;
    }
    if (usedIds.has(item.id)) {
      continue;
    }

    const key = roomGroupKey(item);
    const group: T[] = [];
    for (let j = index; j < items.length; j += 1) {
      const candidate = items[j]!;
      if (candidate.itemType !== 'room') continue;
      if (usedIds.has(candidate.id)) continue;
      if (roomGroupKey(candidate) !== key) continue;
      group.push(candidate);
      usedIds.add(candidate.id);
    }

    group.sort((a, b) =>
      (toDateOnly(a.startDate) ?? '').localeCompare(toDateOnly(b.startDate) ?? ''),
    );

    const nightCount = group.length;
    const lineTotalCents = group.reduce((sum, row) => sum + lineAmount(row), 0);
    const roomsQty = item.quantity;
    const startDate = toDateOnly(group[0]?.startDate) ?? item.startDate;
    const lastNight =
      toDateOnly(group[group.length - 1]?.endDate ?? group[group.length - 1]?.startDate) ??
      toDateOnly(item.endDate);
    const endDate = lastNight ? addOneDay(lastNight) : item.endDate;
    const unitPriceCents =
      nightCount > 0 && roomsQty > 0
        ? Math.round(lineTotalCents / (nightCount * roomsQty))
        : item.unitPriceCents;

    result.push({
      ...item,
      id: group[0]!.id,
      startDate,
      endDate,
      quantity: roomsQty,
      unitPriceCents,
      nightCount,
      lineTotalCents,
    });
  }

  return result;
}

/** Format stay dates for UI tables. */
export function formatBookingLineDateRange(
  startDate: string | null | undefined,
  endDate: string | null | undefined,
): string | null {
  const start = toDateOnly(startDate);
  if (!start) return null;
  const end = toDateOnly(endDate);
  if (!end || end === start) return start;
  return `${start} - ${end}`;
}
