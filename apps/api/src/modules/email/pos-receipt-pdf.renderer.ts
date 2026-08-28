import PDFDocument from 'pdfkit';
import type { EmailBrandingValue } from '@africatourismgate/types';
import type { PosReceiptContext } from '../resources/bookings/pos-receipt.context';
import { pdfPrimaryColor } from '../resources/properties/accommodation-reports/pdf/pdf-layout.utils';
import { formatMoney } from './email.templates';

const RECEIPT_WIDTH_PT = 280;
const PAGE_MARGIN = 16;
const CONTENT_WIDTH = RECEIPT_WIDTH_PT - PAGE_MARGIN * 2;
const MUTED_COLOR = '#5c6d66';
const TEXT_COLOR = '#0f1a16';

export type PosReceiptPdfInput = {
  context: PosReceiptContext;
  branding: EmailBrandingValue;
  logoPath?: string | Buffer | null;
};

function formatIssuedAtLabel(iso: string): string {
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function estimatePageHeight(context: PosReceiptContext): number {
  const itemBlocks = context.items.reduce((sum, item) => {
    const titleLines = Math.max(1, Math.ceil(item.title.length / 32));
    return sum + 18 + titleLines * 12;
  }, 0);
  return Math.max(450, PAGE_MARGIN * 2 + 130 + 105 + itemBlocks + 115 + 45);
}

function drawDashedRule(doc: InstanceType<typeof PDFDocument>): void {
  const y = doc.y;
  doc
    .strokeColor('#d4d4d8')
    .lineWidth(0.5)
    .dash(3, { space: 3 })
    .moveTo(PAGE_MARGIN, y)
    .lineTo(PAGE_MARGIN + CONTENT_WIDTH, y)
    .stroke()
    .undash();
  doc.moveDown(0.6);
}

function drawMetaRow(
  doc: InstanceType<typeof PDFDocument>,
  label: string,
  value: string,
): void {
  const startY = doc.y;
  const labelWidth = CONTENT_WIDTH * 0.38;
  const valueWidth = CONTENT_WIDTH * 0.62;

  const valueHeight = doc.heightOfString(value, {
    width: valueWidth,
    align: 'right',
  });

  doc
    .fillColor(MUTED_COLOR)
    .fontSize(8)
    .font('Helvetica')
    .text(label, PAGE_MARGIN, startY, { width: labelWidth });
  doc
    .fillColor(TEXT_COLOR)
    .fontSize(8)
    .font('Helvetica-Bold')
    .text(value, PAGE_MARGIN + labelWidth, startY, {
      width: valueWidth,
      align: 'right',
    });
  
  doc.y = startY + Math.max(12, valueHeight) + 3;
}

export function renderPosReceiptPdf(input: PosReceiptPdfInput): Promise<Buffer> {
  const { context, branding, logoPath } = input;
  const primary = pdfPrimaryColor(branding);
  const titleName = context.organizationName.trim() || branding.displayName;
  const refShort = context.bookingId.slice(0, 8).toUpperCase();

  const doc = new PDFDocument({
    size: [RECEIPT_WIDTH_PT, estimatePageHeight(context)],
    margins: {
      top: PAGE_MARGIN,
      bottom: PAGE_MARGIN,
      left: PAGE_MARGIN,
      right: PAGE_MARGIN,
    },
    info: {
      Title: `Reçu ${refShort}`,
      Author: branding.displayName,
    },
  });

  const chunks: Buffer[] = [];
  doc.on('data', (chunk: Buffer) => chunks.push(chunk));

  const finished = new Promise<Buffer>((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });

  if (logoPath) {
    try {
      const logoWidth = 90;
      const logoHeight = 36;
      doc.image(logoPath, PAGE_MARGIN + (CONTENT_WIDTH - logoWidth) / 2, doc.y, {
        fit: [logoWidth, logoHeight],
        align: 'center',
      });
      doc.moveDown(0.3);
    } catch {
      // skip broken logo
    }
  }

  doc
    .fillColor(TEXT_COLOR)
    .fontSize(11)
    .font('Helvetica-Bold')
    .text(titleName, PAGE_MARGIN, doc.y, { width: CONTENT_WIDTH, align: 'center' });

  if (context.organizationName.trim() && context.organizationName.trim() !== titleName) {
    doc
      .fillColor(MUTED_COLOR)
      .fontSize(8.5)
      .font('Helvetica')
      .text(context.organizationName, { width: CONTENT_WIDTH, align: 'center' });
  }

  doc
    .moveDown(0.25)
    .fillColor(primary)
    .fontSize(8)
    .font('Helvetica-Bold')
    .text('REÇU DE CAISSE', { width: CONTENT_WIDTH, align: 'center', characterSpacing: 0.8 });

  doc.moveDown(0.7);
  drawDashedRule(doc);

  drawMetaRow(doc, 'N° réservation', context.bookingId);
  drawMetaRow(doc, 'Date', formatIssuedAtLabel(context.issuedAt));
  drawMetaRow(doc, 'Caissier', context.employeeName);
  drawMetaRow(doc, 'Client', context.clientName);
  if (context.clientEmail) {
    drawMetaRow(doc, 'E-mail', context.clientEmail);
  }

  drawDashedRule(doc);

  doc
    .fillColor(MUTED_COLOR)
    .fontSize(7.5)
    .font('Helvetica-Bold')
    .text('ARTICLE', PAGE_MARGIN, doc.y, { continued: true, width: CONTENT_WIDTH * 0.52 })
    .text('QTÉ', { continued: true, width: CONTENT_WIDTH * 0.14, align: 'center' })
    .text('TOTAL', { width: CONTENT_WIDTH * 0.34, align: 'right' });
  doc.moveDown(0.35);

  for (const item of context.items) {
    const rowY = doc.y;
    const unitLabel = formatMoney(item.unitPriceCents, context.currency);
    const lineLabel = formatMoney(item.lineTotalCents, context.currency);

    doc
      .fillColor(TEXT_COLOR)
      .fontSize(9)
      .font('Helvetica-Bold')
      .text(item.title, PAGE_MARGIN, rowY, { width: CONTENT_WIDTH * 0.52 });

    const titleHeight = doc.heightOfString(item.title, {
      width: CONTENT_WIDTH * 0.52,
    });

    doc
      .fillColor(MUTED_COLOR)
      .fontSize(7.5)
      .font('Helvetica')
      .text(`${unitLabel} / unité`, PAGE_MARGIN, rowY + titleHeight + 1, {
        width: CONTENT_WIDTH * 0.52,
      });

    doc
      .fillColor(TEXT_COLOR)
      .fontSize(9)
      .font('Helvetica')
      .text(String(item.quantity), PAGE_MARGIN + CONTENT_WIDTH * 0.52, rowY, {
        width: CONTENT_WIDTH * 0.14,
        align: 'center',
      });

    doc
      .fillColor(TEXT_COLOR)
      .fontSize(9)
      .font('Helvetica-Bold')
      .text(lineLabel, PAGE_MARGIN + CONTENT_WIDTH * 0.66, rowY, {
        width: CONTENT_WIDTH * 0.34,
        align: 'right',
      });

    doc.y = rowY + titleHeight + 14;
    doc.moveDown(0.25);
  }

  drawDashedRule(doc);

  const subtotal = formatMoney(context.subtotalCents, context.currency);
  const total = formatMoney(context.totalCents, context.currency);

  drawMetaRow(doc, 'Sous-total', subtotal);
  if (context.discountCents > 0) {
    drawMetaRow(
      doc,
      'Remise',
      `−${formatMoney(context.discountCents, context.currency)}`,
    );
  }

  doc.moveDown(0.15);
  const totalY = doc.y;
  doc
    .fillColor(TEXT_COLOR)
    .fontSize(10)
    .font('Helvetica-Bold')
    .text('Total TTC', PAGE_MARGIN, totalY, { width: CONTENT_WIDTH * 0.5 });
  doc
    .fillColor(primary)
    .fontSize(12)
    .font('Helvetica-Bold')
    .text(total, PAGE_MARGIN + CONTENT_WIDTH * 0.5, totalY, {
      width: CONTENT_WIDTH * 0.5,
      align: 'right',
    });
  doc.moveDown(0.4);

  doc
    .fillColor(MUTED_COLOR)
    .fontSize(7.5)
    .font('Helvetica')
    .text('Montants TTC — TVA incluse', { width: CONTENT_WIDTH, align: 'right' });
  doc.moveDown(0.3);

  drawMetaRow(doc, 'Paiement', context.paymentMethodLabel);

  drawDashedRule(doc);

  doc
    .fillColor(MUTED_COLOR)
    .fontSize(9)
    .font('Helvetica')
    .text('Merci pour votre achat !', { width: CONTENT_WIDTH, align: 'center' });
  doc
    .fillColor('#a1a1aa')
    .fontSize(7.5)
    .text(`${branding.displayName} — ${context.currency}`, {
      width: CONTENT_WIDTH,
      align: 'center',
    });

  doc.end();
  return finished;
}
