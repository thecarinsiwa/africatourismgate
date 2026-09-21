import { expect, test } from '@playwright/test';

const USER_ID = 'user-e2e-support';
const TICKET_ID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

type SupportTicketPostBody = {
  subject: string;
  body: string;
};

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

test('shows help hub, search, topics and sign-in prompt without session', async ({
  page,
}) => {
  await page.goto('/support');

  await expect(
    page.getByRole('heading', {
      name: /Centre d'aide|Help centre|Centro de ayuda/i,
      level: 1,
    }),
  ).toBeVisible();

  await expect(
    page.getByLabel(/Rechercher dans l'aide|Search help|Buscar en la ayuda/i),
  ).toBeVisible();

  await expect(
    page.getByRole('heading', {
      name: /Parcourir par thème|Browse by topic|Explorar por tema/i,
    }),
  ).toBeVisible();

  await expect(
    page.getByRole('link', {
      name: /Réservations|Bookings|Reservas/i,
    }),
  ).toBeVisible();

  await expect(
    page.getByRole('heading', {
      name: /Articles populaires|Popular articles|Artículos populares/i,
    }),
  ).toBeVisible();

  await expect(
    page.getByRole('heading', {
      name: /Contacter le support|Contact support|Contactar soporte/i,
    }),
  ).toBeVisible();

  await expect(
    page.getByRole('link', { name: /Se connecter|Sign in|Iniciar sesión/i }),
  ).toBeVisible();

  await expect(page.getByLabel(/Sujet|Subject|Asunto/i)).toHaveCount(0);
});

test('navigates from topic to article', async ({ page }) => {
  await page.goto('/support');

  await page
    .getByRole('link', { name: /Réservations|Bookings|Reservas/i })
    .first()
    .click();

  await expect(page).toHaveURL(/\/support\/booking\/?$/);

  await expect(
    page.getByRole('heading', {
      name: /Réservations|Bookings|Reservas/i,
      level: 1,
    }),
  ).toBeVisible();

  await page
    .getByRole('link', {
      name: /modifier ou annuler|change or cancel|cambio o cancelo/i,
    })
    .first()
    .click();

  await expect(page).toHaveURL(/\/support\/booking\/modify-or-cancel\/?$/);

  await expect(
    page.getByRole('heading', {
      name: /modifier ou annuler|change or cancel|cambio o cancelo/i,
      level: 1,
    }),
  ).toBeVisible();

  await expect(
    page.getByRole('heading', {
      name: /Articles liés|Related articles|Artículos relacionados/i,
    }),
  ).toBeVisible();
});

test('opens how-to-book from booking topic list', async ({ page }) => {
  await page.goto('/support');

  await page
    .getByRole('link', { name: /Réservations|Bookings|Reservas/i })
    .first()
    .click();

  await expect(page).toHaveURL(/\/support\/booking\/?$/);

  await page
    .getByRole('link', {
      name: /Comment réserver|How do I book|Cómo reservo/i,
    })
    .first()
    .click();

  await expect(page).toHaveURL(/\/support\/booking\/how-to-book\/?$/);

  await expect(
    page.getByRole('heading', {
      name: /Comment réserver|How do I book|Cómo reservo/i,
      level: 1,
    }),
  ).toBeVisible();

  await expect(
    page.getByText(/\/booking\/cart|My account|Mi cuenta|Mon compte/i).first(),
  ).toBeVisible();
});

test('search finds and opens an article', async ({ page }) => {
  await page.goto('/support');

  const search = page.getByLabel(
    /Rechercher dans l'aide|Search help|Buscar en la ayuda/i,
  );
  await search.fill('paiement');

  const results = page.getByRole('listbox', {
    name: /Résultats de recherche|Search results|Resultados de búsqueda/i,
  });
  await expect(results).toBeVisible();

  await results
    .getByRole('link', {
      name: /moyens de paiement|payment methods|métodos de pago/i,
    })
    .click();

  await expect(page).toHaveURL(/\/support\/payment\/payment-methods\/?$/);
  await expect(
    page.getByRole('heading', {
      name: /moyens de paiement|payment methods|métodos de pago/i,
      level: 1,
    }),
  ).toBeVisible();
});

test('search from category page opens an article', async ({ page }) => {
  await page.goto('/support/booking');

  await expect(
    page.getByRole('heading', {
      name: /Réservations|Bookings|Reservas/i,
      level: 1,
    }),
  ).toBeVisible();

  const search = page.getByLabel(
    /Rechercher dans l'aide|Search help|Buscar en la ayuda/i,
  );
  await search.fill('panier');

  const results = page.getByRole('listbox', {
    name: /Résultats de recherche|Search results|Resultados de búsqueda/i,
  });
  await expect(results).toBeVisible();

  await results
    .getByRole('link', {
      name: /Panier|Cart and checkout|Carrito/i,
    })
    .click();

  await expect(page).toHaveURL(/\/support\/booking\/cart-and-checkout\/?$/);
  await expect(
    page.getByRole('heading', {
      name: /Panier|Cart and checkout|Carrito/i,
      level: 1,
    }),
  ).toBeVisible();
});

test('empty search shows contact CTA to support form anchor', async ({ page }) => {
  await page.goto('/support');

  const search = page.getByLabel(
    /Rechercher dans l'aide|Search help|Buscar en la ayuda/i,
  );
  await search.fill('zzzz-no-match-xyz');

  const results = page.getByRole('listbox', {
    name: /Résultats de recherche|Search results|Resultados de búsqueda/i,
  });
  await expect(results).toBeVisible();
  await expect(
    results.getByText(
      /Aucun article|No articles match|Ningún artículo/i,
    ),
  ).toBeVisible();

  const cta = results.getByRole('link', {
    name: /Contacter le support|Contact support|Contactar soporte/i,
  });
  await expect(cta).toHaveAttribute('href', /\/support#support-form$/);
  await cta.click();

  await expect(page).toHaveURL(/\/support#support-form$/);
  await expect(page.locator('#support-form')).toBeVisible();
});

test('account shell shows Help link to /support', async ({ page }) => {
  await mockSession(page);

  await page.route('**/api/auth/me', async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: {
          id: USER_ID,
          email: 'support.e2e@example.com',
          firstName: 'Support',
          lastName: 'E2E',
          phone: null,
          preferredLanguage: 'fr',
          organizationId: null,
          status: 'active',
        },
        permissions: ['bookings.read'],
        isSuperAdmin: false,
      }),
    });
  });

  await page.goto('/account/profile');

  const helpLink = page
    .getByRole('navigation', {
      name: /Navigation du compte|Account navigation|Navegación de la cuenta/i,
    })
    .getByRole('link', { name: /Aide|Help|Ayuda/i });

  await expect(helpLink).toBeVisible();
  await expect(helpLink).toHaveAttribute('href', '/support');

  await helpLink.click();
  await expect(page).toHaveURL(/\/support\/?$/);
  await expect(
    page.getByRole('heading', {
      name: /Centre d'aide|Help centre|Centro de ayuda/i,
      level: 1,
    }),
  ).toBeVisible();
});

test('submits support ticket when signed in', async ({ page }) => {
  await mockSession(page);

  let postBody: SupportTicketPostBody | undefined;

  await page.route('**/api/support-tickets', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }
    postBody = route.request().postDataJSON() as SupportTicketPostBody;
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

  expect(postBody).toBeDefined();
  expect(postBody!.subject).toBe('Question réservation test');
  expect(postBody!.body).toContain('modifier les dates');
});
