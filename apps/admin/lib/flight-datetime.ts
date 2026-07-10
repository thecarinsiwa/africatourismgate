/** ISO → value for `<input type="datetime-local" />` */
export function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** datetime-local → ISO string for API */
export function fromDatetimeLocalValue(value: string): string {
  return new Date(value).toISOString();
}

/** Minutes → readable duration (ex. 390 → "6 h 30"). */
export function formatDurationMinutes(minutes: number, locale = 'fr'): string {
  if (!Number.isFinite(minutes) || minutes < 1) return '—';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const lang = locale.slice(0, 2).toLowerCase();

  if (lang === 'en') {
    if (hours === 0) return `${mins} min`;
    if (mins === 0) return `${hours} hr`;
    return `${hours} hr ${mins} min`;
  }

  if (lang === 'es') {
    if (hours === 0) return `${mins} min`;
    if (mins === 0) return `${hours} h`;
    return `${hours} h ${mins} min`;
  }

  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours} h`;
  return `${hours} h ${mins}`;
}

function resolveIntlLocale(locale?: string): string {
  const code = locale?.slice(0, 2).toLowerCase();
  if (code === 'en') return 'en-US';
  if (code === 'es') return 'es-ES';
  return 'fr-FR';
}

function formatFlightTime(iso: string, includeDate: boolean, locale = 'fr'): string {
  const intlLocale = resolveIntlLocale(locale);
  try {
    const date = new Date(iso);
    if (includeDate) {
      return date.toLocaleString(intlLocale, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return date.toLocaleTimeString(intlLocale, {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

/** Format departure/arrival times; include date on arrival if different day. */
export function formatFlightSchedule(
  departureTime: string,
  arrivalTime: string,
  locale = 'fr',
): { departure: string; arrival: string } {
  const depDate = departureTime.slice(0, 10);
  const arrDate = arrivalTime.slice(0, 10);
  const differentDay = depDate !== arrDate;
  return {
    departure: formatFlightTime(departureTime, false, locale),
    arrival: formatFlightTime(arrivalTime, differentDay, locale),
  };
}
