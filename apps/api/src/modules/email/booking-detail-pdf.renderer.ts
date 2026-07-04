import PDFDocument from 'pdfkit';
import type { BookingDetailPdfInput } from './booking-detail-pdf.types';
import { formatMoney } from './email.templates';
import type { BookingDetailPdfLabels } from './booking-detail-pdf.labels';
import { getBookingDetailPdfLabels } from './booking-detail-pdf.labels';

const PAGE_MARGIN = 48;
const CONTENT_WIDTH = 595.28 - PAGE_MARGIN * 2;

function toDateOnlyString(value: string | null | undefined): string | null {
  if (!value?.trim()) {
    return null;
  }
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(value.trim());
  return match ? match[1]! : value.slice(0, 10);
}

function formatPdfDate(iso: string, locale: BookingDetailPdfInput['locale']): string {
  const tag = locale === 'en' ? 'en-US' : locale === 'es' ? 'es-ES' : 'fr-FR';
  try {
    return new Intl.DateTimeFormat(tag, {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function formatVisitDate(value: string | null, locale: BookingDetailPdfInput['locale']): string {
  const dateOnly = toDateOnlyString(value);
  if (!dateOnly) {
    return '—';
  }
  const tag = locale === 'en' ? 'en-US' : locale === 'es' ? 'es-ES' : 'fr-FR';
  try {
    return new Intl.DateTimeFormat(tag, { dateStyle: 'medium' }).format(
      new Date(`${dateOnly}T00:00:00Z`),
    );
  } catch {
    return dateOnly;
  }
}

function formatItemDates(
  startDate: string | null,
  endDate: string | null,
  locale: BookingDetailPdfInput['locale'],
): string {
  const start = toDateOnlyString(startDate);
  if (!start) {
    return '—';
  }
  const end = toDateOnlyString(endDate);
  if (!end || end === start) {
    return formatVisitDate(start, locale);
  }
  return `${formatVisitDate(start, locale)} → ${formatVisitDate(end, locale)}`;
}

function itemTypeLabel(itemType: string, labels: BookingDetailPdfLabels): string {
  return labels.itemTypes[itemType] ?? itemType;
}

function primaryColor(branding: BookingDetailPdfInput['branding']): string {
  return branding.primaryColor?.trim() || '#0b6e4f';
}

function ensureSpace(doc: InstanceType<typeof PDFDocument>, needed: number): void {
  const bottom = doc.page.height - PAGE_MARGIN;
  if (doc.y + needed > bottom) {
    doc.addPage();
    doc.y = PAGE_MARGIN;
  }
}

function drawSectionTitle(doc: InstanceType<typeof PDFDocument>, title: string, color: string): void {
  ensureSpace(doc, 28);
  doc
    .moveDown(0.6)
    .fillColor(color)
    .fontSize(13)
    .font('Helvetica-Bold')
    .text(title, PAGE_MARGIN, doc.y, { width: CONTENT_WIDTH });
  doc.moveDown(0.2);
  doc
    .strokeColor('#d4d4d8')
    .lineWidth(0.5)
    .moveTo(PAGE_MARGIN, doc.y)
    .lineTo(PAGE_MARGIN + CONTENT_WIDTH, doc.y)
    .stroke();
  doc.moveDown(0.5);
}

function drawKeyValue(
  doc: InstanceType<typeof PDFDocument>,
  label: string,
  value: string,
  mutedColor: string,
): void {
  ensureSpace(doc, 18);
  doc
    .fillColor(mutedColor)
    .fontSize(9)
    .font('Helvetica-Bold')
    .text(label, PAGE_MARGIN, doc.y, { continued: true, width: CONTENT_WIDTH });
  doc
    .fillColor('#0f1a16')
    .font('Helvetica')
    .text(` ${value}`, { width: CONTENT_WIDTH });
}

export function renderBookingDetailPdf(input: BookingDetailPdfInput): Promise<Buffer> {
  const labels = getBookingDetailPdfLabels(input.locale);
  const brandColor = primaryColor(input.branding);
  const mutedColor = '#5c6d66';
  const customerName = [input.customer.firstName, input.customer.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();

  const doc = new PDFDocument({
    size: 'A4',
    margins: {
      top: PAGE_MARGIN,
      bottom: PAGE_MARGIN,
      left: PAGE_MARGIN,
      right: PAGE_MARGIN,
    },
    info: {
      Title: labels.documentTitle,
      Author: input.branding.displayName ?? 'Africa Tourism Gate',
    },
  });

  const chunks: Buffer[] = [];
  doc.on('data', (chunk: Buffer) => chunks.push(chunk));

  const finished = new Promise<Buffer>((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });

  let headerX = PAGE_MARGIN;
  let headerTop = PAGE_MARGIN;
  const logoHeight = 48;
  if (input.logoPath) {
    try {
      const logoWidth = 120;
      doc.image(input.logoPath, PAGE_MARGIN, PAGE_MARGIN, {
        fit: [logoWidth, logoHeight],
      });
      headerX = PAGE_MARGIN + logoWidth + 10;
      headerTop = PAGE_MARGIN;
    } catch {
      // logo optional
    }
  }

  doc
    .fillColor(brandColor)
    .fontSize(18)
    .font('Helvetica-Bold')
    .text(labels.documentTitle, headerX, headerTop, {
      width: CONTENT_WIDTH - (headerX - PAGE_MARGIN),
    });

  const orgName = input.branding.displayName?.trim() || 'Africa Tourism Gate';
  doc
    .fillColor(mutedColor)
    .fontSize(10)
    .font('Helvetica')
    .text(orgName, headerX, doc.y, { width: CONTENT_WIDTH - (headerX - PAGE_MARGIN) });

  doc.y = Math.max(
    doc.y,
    input.logoPath ? PAGE_MARGIN + logoHeight + 4 : PAGE_MARGIN + 44,
  );
  doc
    .fillColor(mutedColor)
    .fontSize(9)
    .text(`${labels.generatedOn} ${formatPdfDate(input.generatedAt, input.locale)}`, PAGE_MARGIN);

  drawKeyValue(doc, labels.reference, input.bookingId.slice(0, 8).toUpperCase(), mutedColor);
  drawKeyValue(
    doc,
    labels.status,
    input.status === 'pending_payment' ? labels.statusPendingPayment : input.status,
    mutedColor,
  );

  drawSectionTitle(doc, labels.customerSection, brandColor);
  drawKeyValue(doc, labels.customerName, customerName || '—', mutedColor);
  drawKeyValue(doc, labels.customerEmail, input.customer.email, mutedColor);

  if (input.visitStartDate) {
    drawSectionTitle(doc, labels.visitPeriod, brandColor);
    drawKeyValue(doc, labels.visitFrom, formatVisitDate(input.visitStartDate, input.locale), mutedColor);
    drawKeyValue(
      doc,
      labels.visitTo,
      formatVisitDate(input.visitEndDate ?? input.visitStartDate, input.locale),
      mutedColor,
    );
  }

  drawSectionTitle(doc, labels.itemsSection, brandColor);

  const itemCols = [
    { key: 'title', label: labels.colItem, width: 0.34 },
    { key: 'type', label: labels.colType, width: 0.14 },
    { key: 'dates', label: labels.colDates, width: 0.22 },
    { key: 'qty', label: labels.colQty, width: 0.08 },
    { key: 'unit', label: labels.colUnitPrice, width: 0.11 },
    { key: 'total', label: labels.colLineTotal, width: 0.11 },
  ] as const;

  const tableLeft = PAGE_MARGIN;
  let tableTop = doc.y;

  function drawItemsHeader(): void {
    tableTop = doc.y;
    let x = tableLeft;
    doc.fontSize(8).font('Helvetica-Bold').fillColor(mutedColor);
    for (const col of itemCols) {
      const width = CONTENT_WIDTH * col.width;
      doc.text(col.label, x, tableTop, { width, lineBreak: false });
      x += width;
    }
    doc.y = tableTop + 14;
    doc
      .strokeColor('#d4d4d8')
      .lineWidth(0.5)
      .moveTo(tableLeft, doc.y)
      .lineTo(tableLeft + CONTENT_WIDTH, doc.y)
      .stroke();
    doc.moveDown(0.3);
  }

  drawItemsHeader();

  for (const item of input.items) {
    ensureSpace(doc, 22);
    const rowTop = doc.y;
    const lineTotal = item.quantity * item.unitPriceCents;
    const cells = [
      item.title,
      itemTypeLabel(item.itemType, labels),
      formatItemDates(item.startDate, item.endDate, input.locale),
      String(item.quantity),
      formatMoney(item.unitPriceCents, input.currency),
      formatMoney(lineTotal, input.currency),
    ];

    let x = tableLeft;
    let rowHeight = 14;
    doc.fontSize(8.5).font('Helvetica').fillColor('#0f1a16');
    cells.forEach((cell, index) => {
      const width = CONTENT_WIDTH * itemCols[index]!.width;
      const height = doc.heightOfString(cell, { width });
      rowHeight = Math.max(rowHeight, height);
      doc.text(cell, x, rowTop, { width });
      x += width;
    });
    doc.y = rowTop + rowHeight + 4;
  }

  if (input.travelers.length > 0) {
    drawSectionTitle(doc, labels.travelersSection, brandColor);

    const travelerCols = [
      { label: labels.colTraveler, width: 0.55 },
      { label: labels.colAge, width: 0.15 },
      { label: labels.colTravelerPrice, width: 0.3 },
    ] as const;

    let tTop = doc.y;
    let x = tableLeft;
    doc.fontSize(8).font('Helvetica-Bold').fillColor(mutedColor);
    for (const col of travelerCols) {
      const width = CONTENT_WIDTH * col.width;
      doc.text(col.label, x, tTop, { width, lineBreak: false });
      x += width;
    }
    doc.y = tTop + 14;
    doc
      .strokeColor('#d4d4d8')
      .moveTo(tableLeft, doc.y)
      .lineTo(tableLeft + CONTENT_WIDTH, doc.y)
      .stroke();
    doc.moveDown(0.3);

    for (const traveler of input.travelers) {
      ensureSpace(doc, 18);
      const rowTop = doc.y;
      const age =
        traveler.age != null && !Number.isNaN(traveler.age) ? String(traveler.age) : '—';
      const price =
        traveler.priceCents != null
          ? formatMoney(traveler.priceCents, input.currency)
          : '—';
      const cells = [traveler.fullName, age, price];
      let cx = tableLeft;
      let rowHeight = 14;
      doc.fontSize(8.5).font('Helvetica').fillColor('#0f1a16');
      cells.forEach((cell, index) => {
        const width = CONTENT_WIDTH * travelerCols[index]!.width;
        const height = doc.heightOfString(cell, { width });
        rowHeight = Math.max(rowHeight, height);
        doc.text(cell, cx, rowTop, { width, align: index === 2 ? 'right' : 'left' });
        cx += width;
      });
      doc.y = rowTop + rowHeight + 4;
    }
  }

  ensureSpace(doc, 36);
  doc
    .fillColor(brandColor)
    .fontSize(12)
    .font('Helvetica-Bold')
    .text(`${labels.total} : ${formatMoney(input.totalCents, input.currency)}`, PAGE_MARGIN, doc.y, {
      width: CONTENT_WIDTH,
      align: 'right',
    });

  drawSectionTitle(doc, labels.nextStepsSection, brandColor);
  doc
    .fillColor('#0f1a16')
    .fontSize(10)
    .font('Helvetica')
    .text(labels.nextStepsBody, PAGE_MARGIN, doc.y, { width: CONTENT_WIDTH });
  doc.moveDown(0.4);
  doc
    .fillColor(brandColor)
    .fontSize(9)
    .text(`${labels.accountLink}: ${input.accountUrl}`, PAGE_MARGIN, doc.y, {
      width: CONTENT_WIDTH,
      link: input.accountUrl,
    });
  doc.text(`${labels.chatLink}: ${input.chatUrl}`, PAGE_MARGIN, doc.y, {
    width: CONTENT_WIDTH,
    link: input.chatUrl,
  });

  const footer = input.branding.footerText?.trim();
  if (footer) {
    ensureSpace(doc, 24);
    doc
      .fillColor(mutedColor)
      .fontSize(8)
      .font('Helvetica')
      .text(footer, PAGE_MARGIN, doc.y, { width: CONTENT_WIDTH, align: 'center' });
  }

  doc.end();
  return finished;
}

/** Expose booking ref substring for tests. */
export function bookingRefForPdf(bookingId: string): string {
  return bookingId.slice(0, 8).toUpperCase();
}
