import { expect, test } from './fixtures';

const USER_ID = 'user-e2e-support';
const TICKET_ID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

const HELP_HUB_HEADING =
  /Centre d'aide|Help centre|Centro de ayuda/i;
const SEARCH_LABEL =
  /Rechercher dans l'aide|Search help|Buscar en la ayuda/i;
const CATEGORIES_HEADING =
  /Parcourir par thème|Browse by topic|Explorar por tema/i;
const POPULAR_HEADING =
  /Articles populaires|Popular articles|Artículos populares/i;
const QUICK_START_HEADING =
  /Démarrage rapide|Quick start|Inicio rápido/i;
const SEARCH_RESULTS_ARIA =
  /Résultats de recherche|Search results|Resultados de búsqueda/i;
const SEARCH_SUGGESTIONS_ARIA =
  /Suggestions d'articles populaires|Popular article suggestions|Sugerencias de artículos populares/i;
const NO_RESULTS =
  /Aucun article|No articles match|Ningún artículo/i;
const NO_RESULTS_HINT =
  /Essayez plutôt|Try these quick-start|Pruebe en su lugar/i;
const HOW_TO_BOOK =
  /Comment réserver|How do I book|Cómo reservo/i;
const FIND_BOOKING =
  /retrouver ma réservation|find my booking|encuentro mi reserva/i;
const ARTICLE_COUNT =
  /\d+\s+(article|articles|artículo|artículos)/i;
const CONTEXTUAL_HELP =
  /Aide sur cette page|Help for this page|Ayuda para esta página/i;
const CART_LINK =
  /^(le panier|the cart|carrito|panier)$/i;

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

function mockAuthMe(page: import('@playwright/test').Page) {
  return page.route('**/api/auth/me', async (route) => {
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
}

test('shows help hub, search, topics and sign-in prompt without session', async ({
  page,
}) => {
  await page.goto('/support');

  await expect(
    page.getByRole('heading', {
      name: HELP_HUB_HEADING,
      level: 1,
    }),
  ).toBeVisible();

  await expect(page.getByLabel(SEARCH_LABEL)).toBeVisible();

  await expect(
    page.getByRole('heading', {
      name: QUICK_START_HEADING,
    }),
  ).toBeVisible();

  await expect(
    page.getByRole('heading', {
      name: CATEGORIES_HEADING,
    }),
  ).toBeVisible();

  await expect(
    page.getByRole('link', {
      name: /Réservations|Bookings|Reservas/i,
    }),
  ).toBeVisible();

  await expect(
    page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: CATEGORIES_HEADING }) })
      .getByText(ARTICLE_COUNT)
      .first(),
  ).toBeVisible();

  await expect(
    page.getByRole('heading', {
      name: POPULAR_HEADING,
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

test('shows quick start links and opens an article', async ({ page }) => {
  await page.goto('/support');

  const quickStart = page.locator('#support-quick-start');
  await expect(
    page.getByRole('heading', { name: QUICK_START_HEADING }),
  ).toBeVisible();
  await expect(
    quickStart.getByRole('link', { name: HOW_TO_BOOK }),
  ).toBeVisible();

  await quickStart.getByRole('link', { name: HOW_TO_BOOK }).click();
  await expect(page).toHaveURL(/\/support\/booking\/how-to-book\/?$/);
  await expect(
    page.getByRole('heading', { name: HOW_TO_BOOK, level: 1 }),
  ).toBeVisible();
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
      name: HOW_TO_BOOK,
    })
    .first()
    .click();

  await expect(page).toHaveURL(/\/support\/booking\/how-to-book\/?$/);

  await expect(
    page.getByRole('heading', {
      name: HOW_TO_BOOK,
      level: 1,
    }),
  ).toBeVisible();

  await expect(
    page.getByRole('link', { name: CART_LINK }).first(),
  ).toHaveAttribute('href', '/booking/cart');
});

test('article markdown link opens allowlisted path', async ({ page }) => {
  await page.goto('/support/booking/how-to-book');

  await expect(
    page.getByRole('heading', { name: HOW_TO_BOOK, level: 1 }),
  ).toBeVisible();

  const cartLink = page.getByRole('link', { name: CART_LINK }).first();
  await expect(cartLink).toHaveAttribute('href', '/booking/cart');
  await cartLink.click();
  await expect(page).toHaveURL(/\/booking\/(cart|login)/);
});

test('search finds and opens an article', async ({ page }) => {
  await page.goto('/support');

  const search = page.getByLabel(SEARCH_LABEL);
  await search.fill('paiement');

  const results = page.getByRole('listbox', {
    name: SEARCH_RESULTS_ARIA,
  });
  await expect(results).toBeVisible();
  await expect(results.getByText(ARTICLE_COUNT).first()).toBeVisible();
  await expect(results.locator('mark').first()).toBeVisible();

  await results
    .getByRole('link', {
      name: /Quels moyens de paiement|Which payment methods|Qué métodos de pago/i,
    })
    .click();

  await expect(page).toHaveURL(/\/support\/payment\/payment-methods\/?$/);
  await expect(
    page.getByRole('heading', {
      name: /Quels moyens de paiement|Which payment methods|Qué métodos de pago/i,
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

  const search = page.getByLabel(SEARCH_LABEL);
  await search.fill('panier');

  const results = page.getByRole('listbox', {
    name: SEARCH_RESULTS_ARIA,
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

test('focus on empty search shows popular suggestions', async ({ page }) => {
  await page.goto('/support');

  const search = page.getByLabel(SEARCH_LABEL);
  await search.click();

  const suggestions = page.getByRole('listbox', {
    name: SEARCH_SUGGESTIONS_ARIA,
  });
  await expect(suggestions).toBeVisible();
  await expect(
    suggestions.getByRole('link', { name: HOW_TO_BOOK }),
  ).toBeVisible();
});

test('empty search shows contact CTA and quick-start links', async ({
  page,
}) => {
  await page.goto('/support');

  const search = page.getByLabel(SEARCH_LABEL);
  await search.fill('zzzz-no-match-xyz');

  const results = page.getByRole('listbox', {
    name: SEARCH_RESULTS_ARIA,
  });
  await expect(results).toBeVisible();
  await expect(results.getByText(NO_RESULTS)).toBeVisible();
  await expect(results.getByText(NO_RESULTS_HINT)).toBeVisible();
  await expect(
    results.getByRole('link', { name: HOW_TO_BOOK }),
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
  await mockAuthMe(page);

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
      name: HELP_HUB_HEADING,
      level: 1,
    }),
  ).toBeVisible();
});

test('contextual help from reservations opens find-booking', async ({
  page,
}) => {
  await mockSession(page);
  await mockAuthMe(page);

  await page.route('**/api/bookings**', async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [],
        meta: { total: 0, page: 1, limit: 50, totalPages: 0 },
      }),
    });
  });

  await page.goto('/account/reservations');

  await expect(
    page.getByRole('heading', {
      name: /Réservations|Bookings|Reservas/i,
      level: 2,
    }),
  ).toBeVisible();

  const helpLink = page.getByTestId('support-contextual-help-link');
  await expect(helpLink).toBeVisible();
  await expect(helpLink).toHaveAttribute('data-contextual', 'true');
  await expect(helpLink).toHaveText(CONTEXTUAL_HELP);
  await expect(helpLink).toHaveAttribute(
    'href',
    '/support/booking/find-booking',
  );

  await helpLink.click();
  await expect(page).toHaveURL(/\/support\/booking\/find-booking\/?$/);
  await expect(
    page.getByRole('heading', { name: FIND_BOOKING, level: 1 }),
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

  await expect(
    page.getByRole('link', {
      name: /Ouvrir mon ticket|Open my ticket|Abrir mi ticket/i,
    }),
  ).toHaveAttribute('href', `/account/support/${TICKET_ID}`);
  await expect(
    page.getByRole('link', {
      name: /Voir tous mes tickets|View all my tickets|Ver todos mis tickets/i,
    }),
  ).toHaveAttribute('href', '/account/support');

  expect(postBody).toBeDefined();
  expect(postBody!.subject).toBe('Question réservation test');
  expect(postBody!.body).toContain('modifier les dates');
});

test('account support list shows empty state and nav link', async ({ page }) => {
  await mockSession(page);
  await mockAuthMe(page);

  await page.route('**/api/support-tickets**', async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }
    const url = route.request().url();
    // List only — leave detail routes for the other smoke test.
    if (/\/support-tickets\/[^/?]+/.test(url)) {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [],
        meta: { total: 0, page: 1, limit: 50, totalPages: 0 },
      }),
    });
  });

  await page.goto('/account/support');

  await expect(page).toHaveURL(/\/account\/support\/?$/);
  await expect(
    page
      .getByRole('navigation', {
        name: /Navigation du compte|Account navigation|Navegación de la cuenta/i,
      })
      .getByRole('link', {
        name: /Mes tickets|My tickets|Mis tickets/i,
      }),
  ).toBeVisible();
  await expect(
    page.getByText(
      /Vous n'avez pas encore de ticket support|do not have any support tickets|Aún no tiene tickets/i,
    ),
  ).toBeVisible();
});

test('account support detail shows thread and staff reply', async ({ page }) => {
  await mockSession(page);
  await mockAuthMe(page);

  await page.route(`**/api/support-tickets/${TICKET_ID}`, async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: TICKET_ID,
        userId: USER_ID,
        subject: 'Question réservation test',
        status: 'pending',
        priority: 'normal',
        createdAt: '2026-06-02T12:00:00.000Z',
        messages: [
          {
            id: 'msg-e2e-support-001',
            ticketId: TICKET_ID,
            body: 'Bonjour, je souhaite modifier les dates de ma réservation confirmée.',
            isStaff: false,
            createdAt: '2026-06-02T12:00:00.000Z',
          },
          {
            id: 'msg-e2e-support-002',
            ticketId: TICKET_ID,
            body: 'Bonjour, nous avons bien reçu votre demande et revenons vers vous.',
            isStaff: true,
            createdAt: '2026-06-02T13:00:00.000Z',
          },
        ],
      }),
    });
  });

  await page.goto(`/account/support/${TICKET_ID}`);

  await expect(
    page.getByRole('heading', {
      name: /Question réservation test/i,
      level: 3,
    }),
  ).toBeVisible();
  await expect(
    page.getByText(/En attente|Pending|Pendiente/i).first(),
  ).toBeVisible();
  await expect(
    page.getByText(/modifier les dates de ma réservation/i),
  ).toBeVisible();
  await expect(
    page.getByText(/bien reçu votre demande/i),
  ).toBeVisible();
});
