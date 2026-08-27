import { getApiClient } from '../auth/api';

export function posReceiptPdfFilename(bookingId: string): string {
  return `recu-${bookingId.slice(0, 8).toLowerCase()}.pdf`;
}

function triggerBrowserDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export async function downloadPosReceiptPdf(bookingId: string): Promise<void> {
  const blob = await getApiClient().downloadBookingReceiptPdf(bookingId);
  triggerBrowserDownload(blob, posReceiptPdfFilename(bookingId));
}
