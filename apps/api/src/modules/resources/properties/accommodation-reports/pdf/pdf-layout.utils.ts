import PDFDocument from 'pdfkit';
import type { EmailBrandingValue } from '@africatourismgate/types';
import type { AccommodationReportLocale } from '../labels/accommodation-reports.labels';

export const PDF_PAGE_MARGIN = 48;
export const PDF_CONTENT_WIDTH = 595.28 - PDF_PAGE_MARGIN * 2;
export const PDF_MUTED_COLOR = '#5c6d66';
export const PDF_TEXT_COLOR = '#0f1a16';

export type PdfTableColumn = {
  label: string;
  width: number;
  align?: 'left' | 'right' | 'center';
};

export function pdfPrimaryColor(branding: EmailBrandingValue): string {
  return branding.primaryColor?.trim() || '#0b6e4f';
}

export function formatPdfDateTime(
  value: Date | string,
  locale: AccommodationReportLocale,
): string {
  const tag = locale === 'en' ? 'en-US' : locale === 'es' ? 'es-ES' : 'fr-FR';
  const date = value instanceof Date ? value : new Date(value);
  try {
    return new Intl.DateTimeFormat(tag, {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(date);
  } catch {
    return date.toISOString();
  }
}

export function formatPdfDateOnly(
  value: string | null | undefined,
  locale: AccommodationReportLocale,
): string {
  const match = value?.trim() ? /^(\d{4}-\d{2}-\d{2})/.exec(value.trim()) : null;
  if (!match) {
    return '—';
  }
  const tag = locale === 'en' ? 'en-US' : locale === 'es' ? 'es-ES' : 'fr-FR';
  try {
    return new Intl.DateTimeFormat(tag, { dateStyle: 'medium' }).format(
      new Date(`${match[1]}T00:00:00Z`),
    );
  } catch {
    return match[1]!;
  }
}

export function createPdfDocument(info: {
  title: string;
  author?: string;
}): {
  doc: InstanceType<typeof PDFDocument>;
  finished: Promise<Buffer>;
} {
  const doc = new PDFDocument({
    size: 'A4',
    margins: {
      top: PDF_PAGE_MARGIN,
      bottom: PDF_PAGE_MARGIN,
      left: PDF_PAGE_MARGIN,
      right: PDF_PAGE_MARGIN,
    },
    info: {
      Title: info.title,
      Author: info.author ?? 'Africa Tourism Gate',
    },
  });

  const chunks: Buffer[] = [];
  doc.on('data', (chunk: Buffer) => chunks.push(chunk));

  const finished = new Promise<Buffer>((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });

  return { doc, finished };
}

export function ensurePdfSpace(
  doc: InstanceType<typeof PDFDocument>,
  needed: number,
): void {
  const bottom = doc.page.height - PDF_PAGE_MARGIN;
  if (doc.y + needed > bottom) {
    doc.addPage();
    doc.y = PDF_PAGE_MARGIN;
  }
}

export function drawPdfBrandedHeader(
  doc: InstanceType<typeof PDFDocument>,
  options: {
    title: string;
    branding: EmailBrandingValue;
    logoPath: string | Buffer | null;
    generatedLabel: string;
    exportedAt: Date;
    locale: AccommodationReportLocale;
    subtitle?: string;
  },
): void {
  const brandColor = pdfPrimaryColor(options.branding);
  let headerX = PDF_PAGE_MARGIN;
  const headerTop = PDF_PAGE_MARGIN;
  const logoHeight = 48;

  if (options.logoPath) {
    try {
      const logoWidth = 120;
      doc.image(options.logoPath, PDF_PAGE_MARGIN, PDF_PAGE_MARGIN, {
        fit: [logoWidth, logoHeight],
      });
      headerX = PDF_PAGE_MARGIN + logoWidth + 10;
    } catch {
      // logo optional
    }
  }

  doc
    .fillColor(brandColor)
    .fontSize(18)
    .font('Helvetica-Bold')
    .text(options.title, headerX, headerTop, {
      width: PDF_CONTENT_WIDTH - (headerX - PDF_PAGE_MARGIN),
    });

  const orgName = options.branding.displayName?.trim() || 'Africa Tourism Gate';
  doc
    .fillColor(PDF_MUTED_COLOR)
    .fontSize(10)
    .font('Helvetica')
    .text(orgName, headerX, doc.y, {
      width: PDF_CONTENT_WIDTH - (headerX - PDF_PAGE_MARGIN),
    });

  if (options.subtitle?.trim()) {
    doc
      .fillColor(PDF_TEXT_COLOR)
      .fontSize(10)
      .text(options.subtitle, headerX, doc.y, {
        width: PDF_CONTENT_WIDTH - (headerX - PDF_PAGE_MARGIN),
      });
  }

  doc.y = Math.max(
    doc.y,
    options.logoPath ? PDF_PAGE_MARGIN + logoHeight + 4 : PDF_PAGE_MARGIN + 44,
  );

  doc
    .fillColor(PDF_MUTED_COLOR)
    .fontSize(9)
    .text(
      `${options.generatedLabel} ${formatPdfDateTime(options.exportedAt, options.locale)}`,
      PDF_PAGE_MARGIN,
    );
  doc.moveDown(0.4);
}

export function drawPdfSectionTitle(
  doc: InstanceType<typeof PDFDocument>,
  title: string,
  color: string,
): void {
  ensurePdfSpace(doc, 28);
  doc
    .moveDown(0.6)
    .fillColor(color)
    .fontSize(13)
    .font('Helvetica-Bold')
    .text(title, PDF_PAGE_MARGIN, doc.y, { width: PDF_CONTENT_WIDTH });
  doc.moveDown(0.2);
  doc
    .strokeColor('#d4d4d8')
    .lineWidth(0.5)
    .moveTo(PDF_PAGE_MARGIN, doc.y)
    .lineTo(PDF_PAGE_MARGIN + PDF_CONTENT_WIDTH, doc.y)
    .stroke();
  doc.moveDown(0.5);
}

export function drawPdfKeyValue(
  doc: InstanceType<typeof PDFDocument>,
  label: string,
  value: string,
): void {
  ensurePdfSpace(doc, 18);
  doc
    .fillColor(PDF_MUTED_COLOR)
    .fontSize(9)
    .font('Helvetica-Bold')
    .text(label, PDF_PAGE_MARGIN, doc.y, { continued: true, width: PDF_CONTENT_WIDTH });
  doc
    .fillColor(PDF_TEXT_COLOR)
    .font('Helvetica')
    .text(` ${value}`, { width: PDF_CONTENT_WIDTH });
}

export function drawPdfTable(
  doc: InstanceType<typeof PDFDocument>,
  columns: PdfTableColumn[],
  rows: string[][],
): void {
  const tableLeft = PDF_PAGE_MARGIN;

  function drawHeader(): void {
    const headerTop = doc.y;
    let x = tableLeft;
    doc.fontSize(8).font('Helvetica-Bold').fillColor(PDF_MUTED_COLOR);
    for (const column of columns) {
      const width = PDF_CONTENT_WIDTH * column.width;
      doc.text(column.label, x, headerTop, { width, lineBreak: false });
      x += width;
    }
    doc.y = headerTop + 14;
    doc
      .strokeColor('#d4d4d8')
      .lineWidth(0.5)
      .moveTo(tableLeft, doc.y)
      .lineTo(tableLeft + PDF_CONTENT_WIDTH, doc.y)
      .stroke();
    doc.moveDown(0.3);
  }

  drawHeader();

  for (const row of rows) {
    ensurePdfSpace(doc, 22);
    const rowTop = doc.y;
    let x = tableLeft;
    let rowHeight = 14;
    doc.fontSize(8.5).font('Helvetica').fillColor(PDF_TEXT_COLOR);
    row.forEach((cell, index) => {
      const column = columns[index];
      if (!column) {
        return;
      }
      const width = PDF_CONTENT_WIDTH * column.width;
      const height = doc.heightOfString(cell, { width });
      rowHeight = Math.max(rowHeight, height);
      doc.text(cell, x, rowTop, { width, align: column.align ?? 'left' });
      x += width;
    });
    doc.y = rowTop + rowHeight + 4;
  }
}

export function drawPdfFooter(
  doc: InstanceType<typeof PDFDocument>,
  branding: EmailBrandingValue,
): void {
  const footer = branding.footerText?.trim();
  if (!footer) {
    return;
  }
  ensurePdfSpace(doc, 24);
  doc
    .fillColor(PDF_MUTED_COLOR)
    .fontSize(8)
    .font('Helvetica')
    .text(footer, PDF_PAGE_MARGIN, doc.y, { width: PDF_CONTENT_WIDTH, align: 'center' });
}

export function truncateText(value: string | null | undefined, maxLength: number): string {
  const text = value?.trim() ?? '';
  if (!text) {
    return '—';
  }
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength - 1)}…`;
}
