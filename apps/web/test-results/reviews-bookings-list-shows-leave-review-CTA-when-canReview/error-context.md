# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: reviews.spec.ts >> bookings list shows leave review CTA when canReview
- Location: tests\e2e\reviews.spec.ts:178:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/séjour.*avis|stay.*review/i)
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText(/séjour.*avis|stay.*review/i)

```

```yaml
- banner:
  - link "support@africatourismgate.org":
    - /url: mailto:support@africatourismgate.org
  - text: +243975579097 Choisir la langue
  - button "Choisir la langue": FR
  - link "Facebook":
    - /url: https://www.facebook.com/africatourismgate
  - link "X / Twitter":
    - /url: https://x.com/Congotourismga1
  - link "Instagram":
    - /url: https://www.instagram.com/africatourismgate
  - link "Africa Tourism Gate Africa Tourism Gate":
    - /url: /
    - img "Africa Tourism Gate"
    - text: Africa Tourism Gate
  - navigation "Navigation principale":
    - link "Accueil":
      - /url: /
    - link "À propos":
      - /url: /about/who-we-are
    - link "Galerie":
      - /url: /#gallery
    - link "Nos Produits":
      - /url: /#search
    - link "Blog":
      - /url: /blog
    - link "Forfaits":
      - /url: /packages
  - link "Don":
    - /url: https://www.unesco.org/fr/green-citizens/engagement
  - link "Mon compte":
    - /url: /account
  - link "Se déconnecter":
    - /url: /booking/logout
  - button "Activer le mode sombre"
- main:
  - navigation "Breadcrumb":
    - link "Accueil":
      - /url: /
    - link "Mon compte":
      - /url: /account/profile
    - text: Réservations
  - heading "Mon compte" [level=1]
  - paragraph: Gérez votre profil, vos adresses et vos réservations.
  - complementary:
    - navigation "Navigation du compte":
      - list:
        - listitem:
          - link "Profil":
            - /url: /account/profile
        - listitem:
          - link "Adresses":
            - /url: /account/addresses
        - listitem:
          - link "Réservations":
            - /url: /account/reservations
        - listitem:
          - link "Fidélité OneKey":
            - /url: /account/loyalty
        - listitem:
          - link "Moyens de paiement":
            - /url: /account/payment-methods
      - link "Explorer les hébergements":
        - /url: /hotels
  - heading "Réservations" [level=2]
  - status:
    - paragraph: account.reservations.reviewPrompt
  - group "Filtrer par statut":
    - button "Toutes" [pressed]
    - button "Validées"
    - button "En attente"
    - button "Annulées"
  - table:
    - rowgroup:
      - row "Référence Date Statut Total":
        - columnheader "Référence"
        - columnheader "Date"
        - columnheader "Statut"
        - columnheader "Total"
        - columnheader
    - rowgroup:
      - row "bbbb1111… 1 avr. 2026, 12:00 Confirmée Laisser un avis 180.00 USD Laisser un avis Voir":
        - cell "bbbb1111…"
        - cell "1 avr. 2026, 12:00"
        - cell "Confirmée Laisser un avis"
        - cell "180.00 USD"
        - cell "Laisser un avis Voir":
          - link "Laisser un avis":
            - /url: /account/reservations/bbbb1111-2222-3333-4444-555566667777#booking-review
          - link "Voir":
            - /url: /account/reservations/bbbb1111-2222-3333-4444-555566667777
- contentinfo:
  - link "Africa Tourism Gate Africa Tourism Gate":
    - /url: /
    - img "Africa Tourism Gate"
    - text: Africa Tourism Gate
  - paragraph: Votre passerelle vers les meilleures expériences de voyage en Afrique. Découvrez des destinations uniques et réservez en toute confiance.
  - link "En savoir plus":
    - /url: /about/who-we-are
  - heading "Nos Produits" [level=3]
  - list:
    - listitem:
      - link "Hébergements Premium":
        - /url: /hotels
    - listitem:
      - link "Vols Première Classe":
        - /url: /flights
    - listitem:
      - link "Location de Voitures":
        - /url: /cars
    - listitem:
      - link "Safaris & Tours":
        - /url: /activities
    - listitem:
      - link "Croisières Côtières":
        - /url: /cruises
    - listitem:
      - link "Forfaits":
        - /url: /packages
  - heading "À propos" [level=3]
  - list:
    - listitem:
      - link "Qui nous sommes":
        - /url: /about/who-we-are
    - listitem:
      - link "Notre histoire":
        - /url: /about/our-history
    - listitem:
      - link "Notre équipe":
        - /url: /about/team
    - listitem:
      - link "Comment nous travaillons":
        - /url: /about/how-we-work
    - listitem:
      - link "Notre gouvernance":
        - /url: /about/governance
    - listitem:
      - link "Rapports et finances":
        - /url: /about/reports
    - listitem:
      - link "Responsabilité":
        - /url: /about/responsibility
    - listitem:
      - link "Médias & ressources":
        - /url: /about/media-resources
    - listitem:
      - link "Nous contacter":
        - /url: /about/contact
  - heading "Newsletter" [level=3]
  - paragraph: Inspiration, idées de voyages, bons plans et actualités.
  - textbox "Adresse email"
  - button "OK"
  - heading "Contact" [level=3]:
    - link "Contact":
      - /url: /about/contact
  - text: "+243975579097"
  - link "support@africatourismgate.org":
    - /url: mailto:support@africatourismgate.org
  - text: Kinshasa, RD Congo
  - link "Facebook":
    - /url: https://www.facebook.com/africatourismgate
  - link "X / Twitter":
    - /url: https://x.com/Congotourismga1
  - link "Instagram":
    - /url: https://www.instagram.com/africatourismgate
  - paragraph:
    - text: © 2026 Africa Tourism Gate|
    - link "Politique de Confidentialité":
      - /url: /legal/privacy
    - text: "|"
    - link "Conditions d'utilisation":
      - /url: /legal/terms
    - text: "|"
    - link "À propos":
      - /url: /about/who-we-are
    - text: "|"
    - link "FAQ":
      - /url: /support
    - text: "|"
    - link "Contact":
      - /url: /about/contact
    - text: "|"
    - link "GAP":
      - /url: http://localhost:3004
  - paragraph:
    - text: Conçu par
    - strong: Carin Siwa et Ruth Bwiza
- alert
```

# Test source

```ts
  114 |       contentType: 'application/json',
  115 |       body: JSON.stringify(minimalPropertyDetail()),
  116 |     });
  117 |   });
  118 | 
  119 |   await page.goto(`/hotels/${PROPERTY_ID}`);
  120 |   await expect(page.getByRole('heading', { name: 'Tourism Gate Demo Hotel' })).toBeVisible();
  121 |   await expect(page.getByText('4.5').first()).toBeVisible();
  122 |   await expect(page.getByText(/2.*(avis|reviews|opiniones)/i).first()).toBeVisible();
  123 |   await expect(page.getByText('Excellent')).toBeVisible();
  124 |   await expect(page.getByText('Great stay.')).toBeVisible();
  125 | });
  126 | 
  127 | test('booking detail shows post-stay review form when canReview', async ({ page }) => {
  128 |   await mockSession(page);
  129 | 
  130 |   await page.route(`**/api/bookings/${BOOKING_ID}**`, async (route) => {
  131 |     const url = route.request().url();
  132 |     if (route.request().method() === 'GET' && !url.includes('/reviews')) {
  133 |       await route.fulfill({
  134 |         status: 200,
  135 |         contentType: 'application/json',
  136 |         body: JSON.stringify({
  137 |           booking: {
  138 |             id: BOOKING_ID,
  139 |             userId: USER_ID,
  140 |             status: 'confirmed',
  141 |             totalCents: 18000,
  142 |             currency: 'USD',
  143 |             promoCodeId: null,
  144 |             createdAt: '2026-04-01T10:00:00.000Z',
  145 |             updatedAt: null,
  146 |           },
  147 |           items: [
  148 |             {
  149 |               id: 'item-1',
  150 |               bookingId: BOOKING_ID,
  151 |               itemType: 'room',
  152 |               referenceId: 'room-1',
  153 |               titleSnapshot: 'Standard Double',
  154 |               quantity: 1,
  155 |               unitPriceCents: 9000,
  156 |               startDate: '2026-05-01',
  157 |               endDate: '2026-05-02',
  158 |               createdAt: '2026-04-01T10:00:00.000Z',
  159 |               updatedAt: null,
  160 |             },
  161 |           ],
  162 |           totalCents: 18000,
  163 |           currency: 'USD',
  164 |           review: null,
  165 |           canReview: true,
  166 |         }),
  167 |       });
  168 |       return;
  169 |     }
  170 |     await route.continue();
  171 |   });
  172 | 
  173 |   await page.goto(`/account/reservations/${BOOKING_ID}`);
  174 |   await expect(page.getByText(/Laisser un avis|Leave a review|Dejar una opinión/i)).toBeVisible();
  175 |   await expect(page.getByRole('radiogroup')).toBeVisible();
  176 | });
  177 | 
  178 | test('bookings list shows leave review CTA when canReview', async ({ page }) => {
  179 |   await mockSession(page);
  180 | 
  181 |   await page.route('**/api/bookings?**', async (route) => {
  182 |     if (route.request().method() !== 'GET') {
  183 |       await route.continue();
  184 |       return;
  185 |     }
  186 |     await route.fulfill({
  187 |       status: 200,
  188 |       contentType: 'application/json',
  189 |       body: JSON.stringify({
  190 |         data: [
  191 |           {
  192 |             id: BOOKING_ID,
  193 |             userId: USER_ID,
  194 |             status: 'confirmed',
  195 |             totalCents: 18000,
  196 |             currency: 'USD',
  197 |             promoCodeId: null,
  198 |             createdAt: '2026-04-01T10:00:00.000Z',
  199 |             updatedAt: null,
  200 |             clientEmail: 'reviews.e2e@example.com',
  201 |             clientFirstName: 'Review',
  202 |             clientLastName: 'E2E',
  203 |             organizationId: null,
  204 |             canReview: true,
  205 |           },
  206 |         ],
  207 |         meta: { total: 1, page: 1, limit: 50, totalPages: 1 },
  208 |       }),
  209 |     });
  210 |   });
  211 | 
  212 |   await page.goto('/account/reservations');
  213 |   await expect(page.getByRole('link', { name: /Laisser un avis|Leave a review/i })).toBeVisible();
> 214 |   await expect(page.getByText(/séjour.*avis|stay.*review/i)).toBeVisible();
      |                                                              ^ Error: expect(locator).toBeVisible() failed
  215 | });
  216 | 
  217 | test('booking detail submits review via POST /bookings/:id/reviews', async ({ page }) => {
  218 |   await mockSession(page);
  219 | 
  220 |   let postReviewCalled = false;
  221 | 
  222 |   await page.route(`**/api/bookings/${BOOKING_ID}**`, async (route) => {
  223 |     const url = route.request().url();
  224 |     if (route.request().method() === 'GET' && !url.includes('/reviews')) {
  225 |       await route.fulfill({
  226 |         status: 200,
  227 |         contentType: 'application/json',
  228 |         body: JSON.stringify({
  229 |           booking: {
  230 |             id: BOOKING_ID,
  231 |             userId: USER_ID,
  232 |             status: 'confirmed',
  233 |             totalCents: 18000,
  234 |             currency: 'USD',
  235 |             promoCodeId: null,
  236 |             createdAt: '2026-04-01T10:00:00.000Z',
  237 |             updatedAt: null,
  238 |           },
  239 |           items: [
  240 |             {
  241 |               id: 'item-1',
  242 |               bookingId: BOOKING_ID,
  243 |               itemType: 'room',
  244 |               referenceId: 'room-1',
  245 |               titleSnapshot: 'Standard Double',
  246 |               quantity: 1,
  247 |               unitPriceCents: 9000,
  248 |               startDate: '2026-05-01',
  249 |               endDate: '2026-05-02',
  250 |               createdAt: '2026-04-01T10:00:00.000Z',
  251 |               updatedAt: null,
  252 |             },
  253 |           ],
  254 |           totalCents: 18000,
  255 |           currency: 'USD',
  256 |           review: null,
  257 |           canReview: true,
  258 |         }),
  259 |       });
  260 |       return;
  261 |     }
  262 |     if (route.request().method() === 'POST' && url.includes('/reviews')) {
  263 |       postReviewCalled = true;
  264 |       const body = route.request().postDataJSON() as { rating: number; title?: string };
  265 |       await route.fulfill({
  266 |         status: 201,
  267 |         contentType: 'application/json',
  268 |         body: JSON.stringify({
  269 |           id: 'review-new',
  270 |           rating: body.rating,
  271 |           title: body.title ?? null,
  272 |           body: 'E2E comment',
  273 |           authorFirstName: 'Review',
  274 |           createdAt: '2026-06-02T14:00:00.000Z',
  275 |         }),
  276 |       });
  277 |       return;
  278 |     }
  279 |     await route.continue();
  280 |   });
  281 | 
  282 |   await page.goto(`/account/reservations/${BOOKING_ID}`);
  283 |   await page.getByRole('radio', { name: /5 sur 5|5 out of 5|5 de 5/i }).click();
  284 |   await page.locator('#review-title').fill('E2E stay');
  285 |   await page.locator('#review-body').fill('E2E comment');
  286 |   await page.getByRole('button', { name: /Publier mon avis|Submit review|Enviar reseña/i }).click();
  287 | 
  288 |   await expect(
  289 |     page.getByRole('heading', { name: /Votre avis|Your review|Su reseña/i }),
  290 |   ).toBeVisible();
  291 |   await expect(page.getByText('E2E stay')).toBeVisible();
  292 |   expect(postReviewCalled).toBe(true);
  293 | });
  294 | 
```