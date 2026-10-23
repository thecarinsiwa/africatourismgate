import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PublicActivitiesService } from '../../src/modules/public/activities/public-activities.service';
import {
  availabilityForBookingRequestStatus,
  renderActivityBookingRequestAdminEmail,
  renderActivityBookingRequestCustomerEmail,
  renderActivityBookingRequestStatusEmail,
} from '../../src/modules/email/activity-booking-request.email.templates';
import { DEFAULT_EMAIL_BRANDING } from '../../src/modules/email/email-branding.constants';
import { ActivityBookingRequestsService } from '../../src/modules/resources/activities/activity-booking-requests.service';

const ACTIVITY_ID = '00000000-0000-4000-8000-00000000a001';
const FUTURE_DATE = '2099-06-15';

function emptyRepo() {
  return {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn((row: unknown) => row),
    save: jest.fn(async (row: unknown) => row),
    createQueryBuilder: jest.fn(),
  };
}

function schedulesQb(rows: Array<{ capacity: number; bookedCount: number }> = []) {
  const qb = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue(rows),
  };
  return qb;
}

function createPublicService(options?: {
  activity?: Record<string, unknown> | null;
  upcomingSchedules?: Array<{ capacity: number; bookedCount: number }>;
  orgContactEmail?: string | null;
}) {
  const activity =
    options && 'activity' in options
      ? options.activity
      : {
          id: ACTIVITY_ID,
          title: 'Kigali City Tour',
          organizationId: '00000000-0000-4000-8000-000000000001',
          allowBookingRequestsWhenUnavailable: true,
          deletedAt: null,
        };

  const activitiesRepository = emptyRepo();
  activitiesRepository.findOne.mockResolvedValue(activity);

  const bookingRequestsRepository = emptyRepo();
  bookingRequestsRepository.create.mockImplementation((row: unknown) => row);
  bookingRequestsRepository.save.mockImplementation(async (row: unknown) => row);

  const schedulesRepository = emptyRepo();
  schedulesRepository.createQueryBuilder.mockReturnValue(
    schedulesQb(options?.upcomingSchedules ?? []),
  );

  const organizationsRepository = emptyRepo();
  organizationsRepository.findOne.mockResolvedValue({
    id: '00000000-0000-4000-8000-000000000001',
    contactEmail: options?.orgContactEmail ?? 'ops@africatourismgate.com',
    deletedAt: null,
  });

  const emailService = {
    sendActivityBookingRequestCustomer: jest.fn().mockResolvedValue({ sent: true }),
    sendActivityBookingRequestAdmin: jest.fn().mockResolvedValue({ sent: true }),
  };

  const staffNotifications = {
    fanOut: jest.fn().mockResolvedValue(undefined),
  };

  const service = new PublicActivitiesService(
    activitiesRepository as never,
    bookingRequestsRepository as never,
    emptyRepo() as never,
    emptyRepo() as never,
    emptyRepo() as never,
    schedulesRepository as never,
    emptyRepo() as never,
    organizationsRepository as never,
    emptyRepo() as never,
    emailService as never,
    staffNotifications as never,
  );

  return {
    service,
    activitiesRepository,
    bookingRequestsRepository,
    schedulesRepository,
    organizationsRepository,
    emailService,
    staffNotifications,
  };
}

async function flushAsyncWork(): Promise<void> {
  await new Promise((resolve) => setImmediate(resolve));
  await new Promise((resolve) => setImmediate(resolve));
}

describe('PublicActivitiesService.submitBookingRequest', () => {
  const validDto = {
    fullName: 'Jane Doe',
    email: 'Jane@Example.com',
    phone: '+250788000000',
    preferredDate: FUTURE_DATE,
    participants: 2,
    message: 'Looking for a private guide',
  };

  it('rejects when the activity is missing', async () => {
    const { service } = createPublicService({ activity: null });
    await expect(service.submitBookingRequest(ACTIVITY_ID, validDto)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('rejects when booking requests are disabled', async () => {
    const { service } = createPublicService({
      activity: {
        id: ACTIVITY_ID,
        title: 'Akagera Safari',
        organizationId: null,
        allowBookingRequestsWhenUnavailable: false,
        deletedAt: null,
      },
    });

    await expect(service.submitBookingRequest(ACTIVITY_ID, validDto)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects when preferred date is in the past', async () => {
    const { service } = createPublicService();
    await expect(
      service.submitBookingRequest(ACTIVITY_ID, {
        ...validDto,
        preferredDate: '2020-01-01',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects when upcoming slots still have places', async () => {
    const { service } = createPublicService({
      upcomingSchedules: [{ capacity: 10, bookedCount: 2 }],
    });

    await expect(service.submitBookingRequest(ACTIVITY_ID, validDto)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('persists the request and notifies customer + admin', async () => {
    const { service, bookingRequestsRepository, emailService, staffNotifications } =
      createPublicService();

    const result = await service.submitBookingRequest(ACTIVITY_ID, validDto);
    await flushAsyncWork();

    expect(result.id).toEqual(expect.any(String));
    expect(result.message).toMatch(/received/i);
    expect(bookingRequestsRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        activityId: ACTIVITY_ID,
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        preferredDate: FUTURE_DATE,
        participants: 2,
        status: 'pending',
      }),
    );
    expect(staffNotifications.fanOut).toHaveBeenCalledWith(
      'activity_booking_request',
      expect.objectContaining({
        href: '/produits/activites/demandes',
        requestId: result.id,
        activityId: ACTIVITY_ID,
        activityTitle: 'Kigali City Tour',
        authorName: 'Jane Doe',
        status: 'pending',
      }),
      ['activities.read'],
    );
    expect(emailService.sendActivityBookingRequestCustomer).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'jane@example.com',
        activityTitle: 'Kigali City Tour',
        requestId: result.id,
      }),
    );
    expect(emailService.sendActivityBookingRequestAdmin).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'ops@africatourismgate.com',
        activityId: ACTIVITY_ID,
        email: 'jane@example.com',
      }),
    );
  });
});

describe('ActivityBookingRequestsService.updateStatusForUser', () => {
  it('updates status and emails the customer', async () => {
    const row = {
      id: 'req-1',
      activityId: ACTIVITY_ID,
      organizationId: 'org-1',
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      phone: null,
      preferredDate: FUTURE_DATE,
      participants: 2,
      message: null,
      status: 'pending' as const,
      deletedAt: null,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: null,
      updatedByUserId: null,
    };

    const requestsRepository = {
      findOne: jest.fn().mockResolvedValue({ ...row }),
      save: jest.fn(async (entity: typeof row) => entity),
    };
    const activitiesRepository = emptyRepo();
    activitiesRepository.findOne.mockResolvedValue({
      id: ACTIVITY_ID,
      title: 'Kigali City Tour',
    });
    const orgScopeService = {
      resolveCatalogListOrganizationId: jest.fn(),
      assertCanAccessOrganization: jest.fn().mockResolvedValue(undefined),
    };
    const emailService = {
      sendActivityBookingRequestStatus: jest.fn().mockResolvedValue({ sent: true }),
      previewActivityBookingRequestStatus: jest.fn(),
    };

    const service = new ActivityBookingRequestsService(
      requestsRepository as never,
      activitiesRepository as never,
      orgScopeService as never,
      emailService as never,
    );

    const updated = await service.updateStatusForUser(
      'req-1',
      { status: 'confirmed' },
      { id: 'user-1' } as never,
    );
    await flushAsyncWork();

    expect(updated.status).toBe('confirmed');
    expect(orgScopeService.assertCanAccessOrganization).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'user-1' }),
      'org-1',
    );
    expect(requestsRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'confirmed', updatedByUserId: 'user-1' }),
    );
    expect(emailService.sendActivityBookingRequestStatus).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'jane@example.com',
        activityId: ACTIVITY_ID,
        activityTitle: 'Kigali City Tour',
        status: 'confirmed',
        requestId: 'req-1',
      }),
    );
  });
});

describe('activity booking request email templates', () => {
  it('marks the customer email as not yet confirmed', () => {
    const rendered = renderActivityBookingRequestCustomerEmail(
      {
        to: 'jane@example.com',
        fullName: 'Jane Doe',
        activityTitle: 'Kigali City Tour',
        preferredDate: FUTURE_DATE,
        participants: 2,
        requestId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
      },
      DEFAULT_EMAIL_BRANDING,
    );

    expect(rendered.subject).toBe(
      "We've received your booking request – Kigali City Tour",
    );
    expect(rendered.html).toMatch(/pas encore une réservation confirmée/i);
    expect(rendered.text).toMatch(/pas encore une réservation confirmée/i);
  });

  it('includes request details for the admin notification', () => {
    const rendered = renderActivityBookingRequestAdminEmail(
      {
        to: 'ops@example.com',
        activityTitle: 'Kigali City Tour',
        activityId: ACTIVITY_ID,
        requestId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        phone: '+250788000000',
        preferredDate: FUTURE_DATE,
        participants: 2,
        message: 'Private guide please',
      },
      DEFAULT_EMAIL_BRANDING,
    );

    expect(rendered.subject).toMatch(/Kigali City Tour/);
    expect(rendered.html).toContain('jane@example.com');
    expect(rendered.html).toContain('Private guide please');
    expect(rendered.text).toContain('+250788000000');
  });

  it('mentions slot availability for confirmed and cancelled statuses', () => {
    expect(availabilityForBookingRequestStatus('confirmed')).toBe('available');
    expect(availabilityForBookingRequestStatus('cancelled')).toBe('unavailable');

    const confirmed = renderActivityBookingRequestStatusEmail(
      {
        to: 'jane@example.com',
        fullName: 'Jane Doe',
        activityId: ACTIVITY_ID,
        activityTitle: 'Kigali City Tour',
        preferredDate: FUTURE_DATE,
        participants: 2,
        requestId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
        status: 'confirmed',
      },
      DEFAULT_EMAIL_BRANDING,
    );
    expect(confirmed.subject).toMatch(/Slot available/i);
    expect(confirmed.html).toMatch(/Créneau rendu disponible|Créneau disponible/i);
    expect(confirmed.text).toMatch(/Créneau disponible/i);
    expect(confirmed.html).toContain(
      `/activities/${ACTIVITY_ID}?date=${FUTURE_DATE}&amp;participants=2`,
    );
    expect(confirmed.html).toMatch(/Réserver maintenant/);
    expect(confirmed.text).toContain(
      `/activities/${ACTIVITY_ID}?date=${FUTURE_DATE}&participants=2`,
    );

    const cancelled = renderActivityBookingRequestStatusEmail(
      {
        to: 'jane@example.com',
        fullName: 'Jane Doe',
        activityId: ACTIVITY_ID,
        activityTitle: 'Kigali City Tour',
        preferredDate: FUTURE_DATE,
        participants: 2,
        requestId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
        status: 'cancelled',
      },
      DEFAULT_EMAIL_BRANDING,
    );
    expect(cancelled.subject).toMatch(/Still unavailable/i);
    expect(cancelled.html).toMatch(/Toujours indisponible/i);
    expect(cancelled.text).toMatch(/Toujours indisponible/i);
    expect(cancelled.html).toMatch(/Voir l'activité/);
  });
});
