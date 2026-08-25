import PDFDocument from 'pdfkit';
import type { BookingDetailPdfInput } from './booking-detail-pdf.types';
import { formatMoney } from './email.templates';
import { formatEmailFooter } from './email-footer.utils';
import type { BookingDetailPdfLabels } from './booking-detail-pdf.labels';
import { getBookingDetailPdfLabels } from './booking-detail-pdf.labels';
import {
  formatItemDateRange,
  formatPdfDateTime,
  formatVisitDate,
} from './booking-detail-pdf.format';

const PAGE_MARGIN = 48;
const CONTENT_WIDTH = 595.28 - PAGE_MARGIN * 2;

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

function sexLabel(
  sex: BookingDetailPdfInput['travelers'][number]['sex'],
  labels: BookingDetailPdfLabels,
): string {
  if (sex === 'M') return labels.sexM;
  if (sex === 'F') return labels.sexF;
  if (sex === 'other') return labels.sexOther;
  return '—';
}

function travelerNotes(traveler: BookingDetailPdfInput['travelers'][number]): string {
  return [traveler.conditions, traveler.comment, traveler.other]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(' · ');
}

function guideRoleLabel(
  role: BookingDetailPdfInput['guides'][number]['role'],
  labels: BookingDetailPdfLabels,
): string {
  return role === 'primary' ? labels.guideRolePrimary : labels.guideRoleSecondary;
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
    .text(`${labels.generatedOn} ${formatPdfDateTime(input.generatedAt, input.locale)}`, PAGE_MARGIN);

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
    { key: 'title', label: labels.colItem, width: 0.28 },
    { key: 'type', label: labels.colType, width: 0.12 },
    { key: 'dates', label: labels.colDates, width: 0.14 },
    { key: 'schedule', label: labels.colSchedule, width: 0.18 },
    { key: 'qty', label: labels.colQty, width: 0.06 },
    { key: 'unit', label: labels.colUnitPrice, width: 0.1 },
    { key: 'total', label: labels.colLineTotal, width: 0.12 },
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
      formatItemDateRange(item.startDate, item.endDate, input.locale),
      item.schedule?.trim() || '—',
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

  if (input.itinerary.length > 0) {
    drawSectionTitle(doc, labels.itinerarySection, brandColor);

    for (const group of input.itinerary) {
      ensureSpace(doc, 24);
      doc
        .fillColor('#0f1a16')
        .fontSize(10)
        .font('Helvetica-Bold')
        .text(group.title, PAGE_MARGIN, doc.y, { width: CONTENT_WIDTH });
      doc.moveDown(0.25);

      for (const step of group.steps) {
        ensureSpace(doc, 16);
        const line = `${step.order}. ${step.label}`;
        doc
          .fillColor('#0f1a16')
          .fontSize(9)
          .font('Helvetica')
          .text(line, PAGE_MARGIN + 8, doc.y, { width: CONTENT_WIDTH - 8 });
        if (step.detail?.trim()) {
          doc
            .fillColor(mutedColor)
            .fontSize(8)
            .text(step.detail.trim(), PAGE_MARGIN + 16, doc.y, { width: CONTENT_WIDTH - 16 });
        }
        doc.moveDown(0.15);
      }

      doc.moveDown(0.35);
    }
  }

  if (input.travelers.length > 0) {
    drawSectionTitle(doc, labels.travelersSection, brandColor);

    const travelerCols = [
      { label: labels.colTravelerIndex, width: 0.05 },
      { label: labels.colTraveler, width: 0.22 },
      { label: labels.colAge, width: 0.07 },
      { label: labels.colSex, width: 0.07 },
      { label: labels.colNationality, width: 0.14 },
      { label: labels.colIdNumber, width: 0.14 },
      { label: labels.colTravelerPrice, width: 0.11 },
      { label: labels.colTravelerNotes, width: 0.2 },
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

    input.travelers.forEach((traveler, index) => {
      ensureSpace(doc, 18);
      const rowTop = doc.y;
      const age =
        traveler.age != null && !Number.isNaN(traveler.age) ? String(traveler.age) : '—';
      const price =
        traveler.priceCents != null
          ? formatMoney(traveler.priceCents, input.currency)
          : '—';
      const notes = travelerNotes(traveler) || '—';
      const cells = [
        String(index + 1),
        traveler.fullName,
        age,
        sexLabel(traveler.sex, labels),
        traveler.nationality?.trim() || '—',
        traveler.idNumber?.trim() || '—',
        price,
        notes,
      ];
      let cx = tableLeft;
      let rowHeight = 14;
      doc.fontSize(7.5).font('Helvetica').fillColor('#0f1a16');
      cells.forEach((cell, colIndex) => {
        const width = CONTENT_WIDTH * travelerCols[colIndex]!.width;
        const height = doc.heightOfString(cell, { width });
        rowHeight = Math.max(rowHeight, height);
        doc.text(cell, cx, rowTop, {
          width,
          align: colIndex === 6 ? 'right' : 'left',
        });
        cx += width;
      });
      doc.y = rowTop + rowHeight + 4;
    });
  }

  if (input.guides.length > 0) {
    drawSectionTitle(doc, labels.guidesSection, brandColor);

    const guideCols = [
      { label: labels.colGuideName, width: 0.34 },
      { label: labels.colGuideRole, width: 0.16 },
      { label: labels.colGuideSchedule, width: 0.5 },
    ] as const;

    let gTop = doc.y;
    let gx = tableLeft;
    doc.fontSize(8).font('Helvetica-Bold').fillColor(mutedColor);
    for (const col of guideCols) {
      const width = CONTENT_WIDTH * col.width;
      doc.text(col.label, gx, gTop, { width, lineBreak: false });
      gx += width;
    }
    doc.y = gTop + 14;
    doc
      .strokeColor('#d4d4d8')
      .moveTo(tableLeft, doc.y)
      .lineTo(tableLeft + CONTENT_WIDTH, doc.y)
      .stroke();
    doc.moveDown(0.3);

    for (const guide of input.guides) {
      ensureSpace(doc, 18);
      const rowTop = doc.y;
      const cells = [guide.name, guideRoleLabel(guide.role, labels), guide.schedule];
      let cx = tableLeft;
      let rowHeight = 14;
      doc.fontSize(8.5).font('Helvetica').fillColor('#0f1a16');
      cells.forEach((cell, colIndex) => {
        const width = CONTENT_WIDTH * guideCols[colIndex]!.width;
        const height = doc.heightOfString(cell, { width });
        rowHeight = Math.max(rowHeight, height);
        doc.text(cell, cx, rowTop, { width });
        cx += width;
      });
      doc.y = rowTop + rowHeight + 4;
    }
  }

  drawSectionTitle(doc, labels.summarySection, brandColor);
  drawKeyValue(
    doc,
    labels.bookingCreatedAt,
    formatPdfDateTime(input.bookingCreatedAt, input.locale),
    mutedColor,
  );

  if (input.payments.length > 0) {
    ensureSpace(doc, 20);
    doc
      .fillColor(mutedColor)
      .fontSize(9)
      .font('Helvetica-Bold')
      .text(labels.paymentsSection, PAGE_MARGIN, doc.y, { width: CONTENT_WIDTH });
    doc.moveDown(0.35);

    const paymentCols = [
      { label: labels.colPaymentDate, width: 0.28 },
      { label: labels.colPaymentAmount, width: 0.2 },
      { label: labels.colPaymentStatus, width: 0.22 },
      { label: labels.colPaymentProvider, width: 0.3 },
    ] as const;

    let pTop = doc.y;
    let px = tableLeft;
    doc.fontSize(8).font('Helvetica-Bold').fillColor(mutedColor);
    for (const col of paymentCols) {
      const width = CONTENT_WIDTH * col.width;
      doc.text(col.label, px, pTop, { width, lineBreak: false });
      px += width;
    }
    doc.y = pTop + 14;
    doc
      .strokeColor('#d4d4d8')
      .moveTo(tableLeft, doc.y)
      .lineTo(tableLeft + CONTENT_WIDTH, doc.y)
      .stroke();
    doc.moveDown(0.3);

    for (const payment of input.payments) {
      ensureSpace(doc, 18);
      const rowTop = doc.y;
      const cells = [
        formatPdfDateTime(payment.createdAt, input.locale),
        formatMoney(payment.amountCents, payment.currency),
        payment.status,
        payment.provider,
      ];
      let cx = tableLeft;
      let rowHeight = 14;
      doc.fontSize(8).font('Helvetica').fillColor('#0f1a16');
      cells.forEach((cell, colIndex) => {
        const width = CONTENT_WIDTH * paymentCols[colIndex]!.width;
        const height = doc.heightOfString(cell, { width });
        rowHeight = Math.max(rowHeight, height);
        doc.text(cell, cx, rowTop, { width, align: colIndex === 1 ? 'right' : 'left' });
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

  const footer = formatEmailFooter(input.branding);
  ensureSpace(doc, 24);
  doc
    .fillColor(mutedColor)
    .fontSize(8)
    .font('Helvetica')
    .text(footer, PAGE_MARGIN, doc.y, { width: CONTENT_WIDTH, align: 'center' });

  doc.end();
  return finished;
}

/** Expose booking ref substring for tests. */
export function bookingRefForPdf(bookingId: string): string {
  return bookingId.slice(0, 8).toUpperCase();
}
