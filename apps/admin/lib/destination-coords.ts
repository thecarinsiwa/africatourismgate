export function parseDestinationCoord(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const num = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(num) ? num : null;
}

export function hasValidDestinationCoords(
  latitude: string | number | null | undefined,
  longitude: string | number | null | undefined,
): boolean {
  const lat = parseDestinationCoord(latitude);
  const lng = parseDestinationCoord(longitude);
  if (lat === null || lng === null) {
    return false;
  }
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/** OpenStreetMap embed URL (no API key required). */
export function buildDestinationMapEmbedUrl(latitude: number, longitude: number): string {
  const delta = 0.06;
  const bbox = [
    longitude - delta,
    latitude - delta,
    longitude + delta,
    latitude + delta,
  ].join(',');
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${latitude},${longitude}`;
}
