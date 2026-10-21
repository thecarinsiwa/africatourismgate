import { ApiHttpError } from '@africatourismgate/api-client';
import { resolveApiBaseUrl } from './auth/api';
import { getSession } from './auth/session';
import { downloadBlob } from './properties-reports';

export type TreasuryExportType = 'all' | 'entries' | 'exits';

export type TreasuryExportQuery = {
  type?: TreasuryExportType;
  dateFrom?: string;
  dateTo?: string;
  organizationId?: string;
  currency?: string;
  source?: string;
  paymentMethod?: string;
  status?: string;
  bookingId?: string;
  expenseRequestId?: string;
  search?: string;
  /** Default true on reports page; lists pass false. */
  realizedOnly?: boolean;
};

function parseFilenameFromContentDisposition(header: string | null): string | null {
  if (!header) return null;
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

function buildQuery(params: TreasuryExportQuery): string {
  const search = new URLSearchParams();
  if (params.type) search.set('type', params.type);
  if (params.dateFrom) search.set('dateFrom', params.dateFrom);
  if (params.dateTo) search.set('dateTo', params.dateTo);
  if (params.organizationId) search.set('organizationId', params.organizationId);
  if (params.currency) search.set('currency', params.currency);
  if (params.source) search.set('source', params.source);
  if (params.paymentMethod) search.set('paymentMethod', params.paymentMethod);
  if (params.status) search.set('status', params.status);
  if (params.bookingId) search.set('bookingId', params.bookingId);
  if (params.expenseRequestId) {
    search.set('expenseRequestId', params.expenseRequestId);
  }
  if (params.search) search.set('search', params.search);
  if (params.realizedOnly === false) search.set('realizedOnly', 'false');
  if (params.realizedOnly === true) search.set('realizedOnly', 'true');
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export async function downloadTreasuryOperationsCsv(
  query: TreasuryExportQuery = {},
): Promise<void> {
  const session = getSession();
  if (!session?.accessToken) {
    throw new Error('Not authenticated');
  }

  const res = await fetch(
    `${resolveApiBaseUrl()}/treasury-reports/export${buildQuery(query)}`,
    {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    },
  );

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
    parseFilenameFromContentDisposition(res.headers.get('Content-Disposition')) ??
    'treasury-export.csv';
  downloadBlob(blob, filename);
}
