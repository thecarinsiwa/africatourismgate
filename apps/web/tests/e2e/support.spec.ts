import { expect, test } from '@playwright/test';

const USER_ID = 'user-e2e-support';
const TICKET_ID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

function mockSession(page: import('@playwright/test').Page) {
  return page.addInitScript(() => {
    window.sessionStorage.setItem(
      'atg.web.session',
      JSON.stringify({
        accessToken: 'e2e-support-token',
        refreshToken: 'e2e-support-refresh',
        expiresAt: Date.now() + 60 * 60 * 1000,
        user: {
          id: 'user-e2e-support',
          email: 'support.e2e@example.com',
          firstName: 'Support',
          lastName: 'E2E',
          organizationId: null,
          status: 'active',
        },
      }),
    );
  });
}

test('shows public FAQ and sign-in prompt without session', async ({ page }) => {
  await page.goto('/support');

  await expect(
    page.getByRole('heading', {
      name: /Centre d’aide|Help centre|Centro de ayuda/i,
    }),
  ).toBeVisible();

  await expect(
    page.getByRole('heading', {
      name: /Questions fréquentes|Frequently asked questions|Preguntas frecuentes/i,
    }),
  ).toBeVisible();

  await expect(
    page.getByRole('link', { name: /Se connecter|Sign in|Iniciar sesión/i }),
  ).toBeVisible();

  await expect(page.getByLabel(/Sujet|Subject|Asunto/i)).toHaveCount(0);
});

test('submits support ticket when signed in', async ({ page }) => {
  await mockSession(page);

  let postBody: { subject?: string; body?: string } | null = null;

  await page.route('**/api/support-tickets', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }
    postBody = route.request().postDataJSON() as { subject?: string; body?: string };
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        ticket: {
          id: TICKET_ID,
          userId: USER_ID,
          subject: postBody?.subject ?? '',
          status: 'open',
          createdAt: '2026-06-02T12:00:00.000Z',
        },
        initialMessage: {
          id: 'msg-e2e-support-001',
          ticketId: TICKET_ID,
          body: postBody?.body ?? '',
          isStaff: false,
          createdAt: '2026-06-02T12:00:00.000Z',
        },
      }),
    });
  });

  await page.goto('/support');

  await expect(page.getByLabel(/Sujet|Subject|Asunto/i)).toBeVisible();

  await page.getByLabel(/Sujet|Subject|Asunto/i).fill('Question réservation test');
  await page.getByLabel(/Message/i).fill(
    'Bonjour, je souhaite modifier les dates de ma réservation confirmée.',
  );

  await page
    .getByRole('button', {
      name: /Envoyer la demande|Send request|Enviar solicitud/i,
    })
    .click();

  await expect(
    page.getByRole('status').getByText(
      /Demande enregistrée|Request received|Solicitud registrada/i,
    ),
  ).toBeVisible();

  await expect(page.getByText(TICKET_ID)).toBeVisible();

  expect(postBody?.subject).toBe('Question réservation test');
  expect(postBody?.body).toContain('modifier les dates');
});
