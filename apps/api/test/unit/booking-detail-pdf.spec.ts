import { DEFAULT_EMAIL_BRANDING } from '../../src/modules/email/email-branding.constants';
import { extractBrandingUploadFilename } from '../../src/modules/email/email-attachments';
import { getBookingDetailPdfLabels } from '../../src/modules/email/booking-detail-pdf.labels';
import type { BookingDetailPdfInput } from '../../src/modules/email/booking-detail-pdf.types';
import {
  bookingRefForPdf,
  renderBookingDetailPdf,
} from '../../src/modules/email/booking-detail-pdf.renderer';

const BOOKING_ID = '00000000-0000-4000-8000-000000009999';

/** Minimal valid 1×1 PNG (used as logo Buffer). */
const MINIMAL_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

function sampleInput(
  overrides: Partial<BookingDetailPdfInput> & { locale?: 'fr' | 'en' | 'es' } = {},
): BookingDetailPdfInput {
  const locale = overrides.locale ?? 'fr';
  return {
    bookingId: BOOKING_ID,
    status: 'pending_payment',
    totalCents: 92250,
    currency: 'USD',
    customer: {
      firstName: 'Marie',
      lastName: 'Dupont',
      email: 'marie@example.com',
    },
    items: [
      {
        title: 'Safari 3 jours — Parc national',
        itemType: 'activity_schedule',
        quantity: 1,
        unitPriceCents: 30750,
        startDate: '2026-08-10',
        endDate: '2026-08-12',
        schedule: 'sam. 10 août 2026 · 08:00 – 11:00',
      },
    ],
    travelers: [
      { fullName: 'Marie Dupont', age: 34, priceCents: 30750 },
      { fullName: 'Jean Dupont', age: 36, priceCents: 30750 },
      { fullName: 'Lea Dupont', age: 8, priceCents: 30750 },
    ],
    itinerary: [
      {
        title: 'Safari 3 jours — Parc national',
        itemType: 'activity_schedule',
        steps: [
          { order: 1, label: 'Accueil au camp', detail: 'Briefing sécurité' },
          { order: 2, label: 'Safari matinal' },
        ],
      },
    ],
    guides: [
      {
        name: 'Marie Kabila',
        role: 'primary' as const,
        schedule: 'lun. 11 août 2026 · 09:00 – 17:00',
      },
    ],
    payments: [],
    bookingCreatedAt: '2026-07-01T10:00:00.000Z',
    visitStartDate: '2026-08-10',
    visitEndDate: '2026-08-12',
    chatUrl: 'https://example.com/account/reservations/chat',
    accountUrl: 'https://example.com/account/reservations/detail',
    locale,
    branding: DEFAULT_EMAIL_BRANDING,
    logoPath: null,
    generatedAt: '2026-07-04T12:00:00.000Z',
    ...overrides,
  };
}

/**
 * PDFKit stores Helvetica text as hex TJ chunks (often split by kerning).
 * Reconstruct decoded payload so content assertions work without a PDF parser.
 */
function pdfContentIncludes(buffer: Buffer, text: string): boolean {
  const raw = buffer.toString('latin1');
  if (raw.includes(text)) {
    return true;
  }
  const decoded = [...raw.matchAll(/<([0-9a-fA-F]+)>/g)]
    .map((match) => {
      const hex = match[1]!;
      if (hex.length % 2 !== 0) return '';
      return Buffer.from(hex, 'hex').toString('latin1');
    })
    .join('');
  return decoded.includes(text);
}

describe('booking-detail-pdf', () => {
  it('extracts branding upload filename from logo URLs', () => {
    expect(
      extractBrandingUploadFilename(
        'https://app-africatourismgate.org/api/uploads/branding/logo-org.png',
      ),
    ).toBe('logo-org.png');
    expect(extractBrandingUploadFilename('/api/uploads/branding/sample.png')).toBe(
      'sample.png',
    );
  });

  it('generates a non-empty PDF buffer with booking reference', async () => {
    const buffer = await renderBookingDetailPdf(sampleInput({ locale: 'fr' }));
    expect(buffer.length).toBeGreaterThan(500);
    expect(buffer.subarray(0, 4).toString()).toBe('%PDF');
    expect(buffer.includes(Buffer.from(bookingRefForPdf(BOOKING_ID)))).toBe(true);
  });

  it('produces a valid PDF without logo including travelers and total', async () => {
    const buffer = await renderBookingDetailPdf(
      sampleInput({
        logoPath: null,
        travelers: [
          {
            fullName: 'Marie Dupont',
            age: 34,
            nationality: 'CD',
            idNumber: 'P100001',
            priceCents: 30750,
          },
          {
            fullName: 'Jean Dupont',
            age: 36,
            nationality: 'FR',
            idNumber: 'P100002',
            priceCents: 30750,
          },
          {
            fullName: 'Lea Dupont',
            age: 8,
            nationality: 'CD',
            idNumber: 'P100003',
            priceCents: 30750,
          },
        ],
      }),
    );

    expect(buffer.subarray(0, 4).toString()).toBe('%PDF');
    expect(pdfContentIncludes(buffer, 'Marie Dupont')).toBe(true);
    expect(pdfContentIncludes(buffer, 'Jean Dupont')).toBe(true);
    expect(pdfContentIncludes(buffer, 'Lea Dupont')).toBe(true);
    expect(pdfContentIncludes(buffer, 'P100001')).toBe(true);
    expect(pdfContentIncludes(buffer, 'P100002')).toBe(true);
    expect(pdfContentIncludes(buffer, 'P100003')).toBe(true);
    // Montant formaté fr-FR (ex. 922,50)
    expect(pdfContentIncludes(buffer, '922')).toBe(true);
  });

  it('renders multi-traveler manifest with idNumber and nationality', async () => {
    const travelers = [
      {
        fullName: 'Alice Traveler',
        age: 28,
        sex: 'F' as const,
        nationality: 'CD',
        idNumber: 'CDAA111',
        priceCents: 10000,
      },
      {
        fullName: 'Bob Traveler',
        age: 31,
        sex: 'M' as const,
        nationality: 'KE',
        idNumber: 'KEBB222',
        priceCents: 10000,
      },
      {
        fullName: 'Carol Traveler',
        age: 12,
        sex: 'F' as const,
        nationality: 'UG',
        idNumber: 'UGCC333',
        priceCents: 5000,
      },
      {
        fullName: 'Dan Traveler',
        age: 45,
        sex: 'M' as const,
        nationality: 'RW',
        idNumber: 'RWDD444',
        priceCents: 10000,
      },
    ];

    const buffer = await renderBookingDetailPdf(
      sampleInput({
        totalCents: 35000,
        travelers,
        logoPath: null,
      }),
    );

    expect(buffer.subarray(0, 4).toString()).toBe('%PDF');
    for (const traveler of travelers) {
      expect(pdfContentIncludes(buffer, traveler.fullName)).toBe(true);
      expect(pdfContentIncludes(buffer, traveler.idNumber)).toBe(true);
    }
  });

  it('includes emergency contact name and phone in traveler notes', async () => {
    const buffer = await renderBookingDetailPdf(
      sampleInput({
        locale: 'fr',
        logoPath: null,
        travelers: [
          {
            fullName: 'Marie Dupont',
            age: 34,
            nationality: 'CD',
            idNumber: 'P100001',
            priceCents: 30750,
            allergies: 'Allergie pollen',
            emergencyContactName: 'Paul Urgence',
            emergencyContactPhone: '+243900000001',
            emergencyContactEmail: 'paul@example.com',
          },
        ],
      }),
    );

    expect(buffer.subarray(0, 4).toString()).toBe('%PDF');
    expect(pdfContentIncludes(buffer, 'Allergies')).toBe(true);
    expect(pdfContentIncludes(buffer, 'Allergie pollen')).toBe(true);
    expect(pdfContentIncludes(buffer, 'Urgence')).toBe(true);
    expect(pdfContentIncludes(buffer, 'Paul Urgence')).toBe(true);
    expect(pdfContentIncludes(buffer, '+243900000001')).toBe(true);
  });

  it('includes structured medical fields in traveler notes', async () => {
    const buffer = await renderBookingDetailPdf(
      sampleInput({
        locale: 'fr',
        logoPath: null,
        travelers: [
          {
            fullName: 'Marie Dupont',
            age: 34,
            nationality: 'CD',
            idNumber: 'P100001',
            priceCents: 30750,
            allergies: 'Arachides',
            seriousMedicalConditions: 'Asthme',
            currentMedications: 'Ventoline',
            dietaryNotes: 'Sans gluten',
          },
        ],
      }),
    );

    expect(buffer.subarray(0, 4).toString()).toBe('%PDF');
    expect(pdfContentIncludes(buffer, 'Allergies')).toBe(true);
    expect(pdfContentIncludes(buffer, 'Arachides')).toBe(true);
    expect(pdfContentIncludes(buffer, 'Conditions graves')).toBe(true);
    expect(pdfContentIncludes(buffer, 'Asthme')).toBe(true);
    expect(pdfContentIncludes(buffer, 'Traitements')).toBe(true);
    expect(pdfContentIncludes(buffer, 'Ventoline')).toBe(true);
    expect(pdfContentIncludes(buffer, 'Alimentation')).toBe(true);
    expect(pdfContentIncludes(buffer, 'Sans gluten')).toBe(true);
  });

  it('includes legacy conditions text when structured medical fields are empty', async () => {
    const buffer = await renderBookingDetailPdf(
      sampleInput({
        locale: 'fr',
        logoPath: null,
        travelers: [
          {
            fullName: 'Marie Dupont',
            age: 34,
            nationality: 'CD',
            idNumber: 'P100001',
            priceCents: 30750,
            conditions: 'Note libre historique',
          },
        ],
      }),
    );

    expect(buffer.subarray(0, 4).toString()).toBe('%PDF');
    expect(pdfContentIncludes(buffer, 'Anciennes notes')).toBe(true);
    expect(pdfContentIncludes(buffer, 'Note libre historique')).toBe(true);
  });

  it('accepts a minimal PNG logo buffer without crashing', async () => {
    const buffer = await renderBookingDetailPdf(
      sampleInput({ logoPath: MINIMAL_PNG }),
    );
    expect(buffer.subarray(0, 4).toString()).toBe('%PDF');
    expect(buffer.length).toBeGreaterThan(500);
    expect(buffer.includes(Buffer.from(bookingRefForPdf(BOOKING_ID)))).toBe(true);
  });

  it('still generates a PDF when logo path is invalid', async () => {
    const buffer = await renderBookingDetailPdf(
      sampleInput({
        logoPath: '/nonexistent/path/logo-does-not-exist.png',
      }),
    );
    expect(buffer.subarray(0, 4).toString()).toBe('%PDF');
    expect(buffer.length).toBeGreaterThan(500);
    expect(pdfContentIncludes(buffer, 'Marie Dupont')).toBe(true);
    expect(buffer.includes(Buffer.from(bookingRefForPdf(BOOKING_ID)))).toBe(true);
  });

  it('produces distinct output per locale', async () => {
    const fr = await renderBookingDetailPdf(sampleInput({ locale: 'fr' }));
    const en = await renderBookingDetailPdf(sampleInput({ locale: 'en' }));
    const es = await renderBookingDetailPdf(sampleInput({ locale: 'es' }));

    expect(fr.equals(en)).toBe(false);
    expect(fr.equals(es)).toBe(false);
    expect(getBookingDetailPdfLabels('en').documentTitle).not.toBe(
      getBookingDetailPdfLabels('fr').documentTitle,
    );
  });
});
