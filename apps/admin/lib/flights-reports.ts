import { ApiHttpError } from '@africatourismgate/api-client';
import { resolveApiBaseUrl } from './auth/api';
import { getSession } from './auth/session';

export type FlightsReportScope = {
  search?: string;
  locale?: string;
};

export type FlightsReportDateRange = FlightsReportScope & {
  dateFrom: string;
  dateTo: string;
};

type ReportDownload = {
  blob: Blob;
  filename: string;
};

function parseFilenameFromContentDisposition(header: string | null): string | null {
  if (!header) {
    return null;
  }

  const utf8Match = /filename\*=UTF-8''([^;]+)/i.exec(header);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1]);
    } catch {
      return utf8Match[1];
    }
  }

  const asciiMatch = /filename="([^"]+)"/i.exec(header);
  return asciiMatch?.[1] ?? null;
}

function buildQuery(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    const trimmed = value?.trim();
    if (trimmed) {
      search.set(key, trimmed);
    }
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}

async function fetchFlightsReport(
  path: string,
  query: Record<string, string | undefined>,
): Promise<ReportDownload> {
  const session = getSession();
  if (!session?.accessToken) {
    throw new Error('Not authenticated');
  }

  const res = await fetch(`${resolveApiBaseUrl()}${path}${buildQuery(query)}`, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });

  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = undefined;
    }
    const message =
      body &&
      typeof body === 'object' &&
      typeof (body as { message?: unknown }).message === 'string'
        ? (body as { message: string }).message
        : res.statusText;
    throw new ApiHttpError(res.status, res.statusText, body, message);
  }

  const blob = await res.blob();
  const filename =
    parseFilenameFromContentDisposition(res.headers.get('Content-Disposition')) ?? 'export';

  return { blob, filename };
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

async function downloadReport(
  path: string,
  query: Record<string, string | undefined>,
): Promise<void> {
  const { blob, filename } = await fetchFlightsReport(path, query);
  downloadBlob(blob, filename);
}

export function downloadFlightsWorkbook(params: FlightsReportDateRange): Promise<void> {
  return downloadReport('/flights/reports/workbook', params);
}

export function downloadFlightsKpiSummaryPdf(params: FlightsReportScope): Promise<void> {
  return downloadReport('/flights/reports/pdf/kpi-summary', params);
}

export function downloadFlightsCatalogPdf(params: FlightsReportScope): Promise<void> {
  return downloadReport('/flights/reports/pdf/catalog', params);
}

export function downloadFlightsBookingsPdf(params: FlightsReportDateRange): Promise<void> {
  return downloadReport('/flights/reports/pdf/bookings', params);
}

export function downloadFlightDossierPdf(
  flightId: string,
  params?: FlightsReportScope,
): Promise<void> {
  return downloadReport(
    `/flights/${encodeURIComponent(flightId)}/reports/pdf/dossier`,
    params ?? {},
  );
}
