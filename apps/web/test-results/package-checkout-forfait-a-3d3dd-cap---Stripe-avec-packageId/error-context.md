# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: package-checkout.spec.ts >> forfait activités: configurer créneaux, panier -> recap -> Stripe avec packageId
- Location: tests\e2e\package-checkout.spec.ts:102:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /choisir les cr|choose time slots|elegir horarios/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: /choisir les cr|choose time slots|elegir horarios/i })

```

```yaml
- banner:
  - link "support@africatourismgate.com":
    - /url: mailto:support@africatourismgate.com
  - text: +243 815 000 000 Choisir la langue
  - button "Choisir la langue": FR
  - link "Facebook":
    - /url: https://www.facebook.com/africatourismgate/
  - link "X / Twitter":
    - /url: https://x.com/Congotourismga1
  - link "Instagram":
    - /url: https://www.instagram.com/africatourismgate/
  - link "Africa Tourism Gate":
    - /url: /
  - navigation "Navigation principale":
    - link "Accueil":
      - /url: /
    - link "À propos":
      - /url: /#about
    - link "Galerie":
      - /url: /#gallery
    - link "Nos Produits":
      - /url: /#search
    - link "Blog":
      - /url: /coming-soon
    - link "Forfaits":
      - /url: /packages
  - link "Mon compte":
    - /url: /account
  - link "Se déconnecter":
    - /url: /booking/logout
  - button "Activer le mode sombre"
- navigation "Breadcrumb":
  - link "Accueil":
    - /url: /
  - link "Forfaits":
    - /url: /packages
  - text: Kinshasa Activities Duo
- banner:
  - paragraph: Forfait combiné
  - heading "Kinshasa Activities Duo" [level=1]
  - paragraph: Two guided experiences in Kinshasa at a bundled discount.
- heading "Prestations incluses" [level=2]
- list:
  - listitem:
    - paragraph: Activité
    - paragraph: Gombe City Tour
    - paragraph: $45
    - link "Voir la fiche":
      - /url: /activities/00000000-0000-4000-8000-000000004031
  - listitem:
    - paragraph: Activité
    - paragraph: Congo River Walk
    - paragraph: $35
    - link "Voir la fiche":
      - /url: /activities/00000000-0000-4000-8000-000000004032
- heading "Réserver le forfait" [level=2]
- paragraph: "Choisissez la date de départ : la date de retour est calculée automatiquement (3 jour(s)). Les prestations incluses sont préparées sans contrôle de disponibilité."
- text: Date de départ
- textbox "Date de départ": 2026-07-20
- text: Voyageurs
- spinbutton "Voyageurs": "2"
- paragraph: Date de retour
- paragraph: 23 juil. 2026 · 3 jour(s)
- heading "Prestations incluses" [level=3]
- list:
  - listitem:
    - paragraph: Activité
    - paragraph: Gombe City Tour
    - text: Non configuré
  - listitem:
    - paragraph: Activité
    - paragraph: Congo River Walk
    - text: Non configuré
- paragraph: Certaines prestations du forfait n’ont pas pu être associées au catalogue.
- complementary:
  - heading "Tarif du forfait" [level=2]
  - paragraph: Prix forfait
  - paragraph: $80
  - paragraph: $68
  - text: "-15 %"
  - paragraph: Vous économisez 12 USD
  - paragraph: "Date de départ: 20 juil. 2026"
  - paragraph: "Date de retour: 23 juil. 2026"
  - paragraph: 3 jour(s)
  - button "Ajouter au panier" [disabled]
- contentinfo:
  - link "Africa Tourism Gate":
    - /url: /
  - paragraph: Votre passerelle vers les meilleures expériences de voyage en Afrique. Découvrez des destinations uniques et réservez en toute confiance.
  - link "En savoir plus":
    - /url: "#about"
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
  - heading "Newsletter" [level=3]
  - paragraph: Inspiration, idées de voyages, bons plans et actualités.
  - textbox "Adresse email"
  - button "OK"
  - heading "Contact" [level=3]
  - text: +243 815 000 000
  - link "support@africatourismgate.com":
    - /url: mailto:support@africatourismgate.com
  - text: Kinshasa, RD Congo
  - link "Facebook":
    - /url: https://www.facebook.com/africatourismgate/
  - link "X / Twitter":
    - /url: https://x.com/Congotourismga1
  - link "Instagram":
    - /url: https://www.instagram.com/africatourismgate/
  - paragraph:
    - text: © 2026 Africa Tourism Gate|
    - link "Politique de Confidentialité":
      - /url: "#"
    - text: "|"
    - link "À propos":
      - /url: "#about"
    - text: "|"
    - link "FAQ":
      - /url: /support
    - text: "|"
    - link "Contact":
      - /url: "#contact"
  - paragraph:
    - text: Conçu par
    - strong: Africa Tourism Gate
- alert
```

# Test source

```ts
  120 |           status: 'active',
  121 |         },
  122 |       }),
  123 |     );
  124 |   });
  125 | 
  126 |   await page.route(`**/api/public/packages/${PACKAGE_ID}**`, async (route) => {
  127 |     await route.fulfill({
  128 |       status: 200,
  129 |       contentType: 'application/json',
  130 |       body: JSON.stringify(packageDetailMock),
  131 |     });
  132 |   });
  133 | 
  134 |   await page.route(`**/api/public/activities/${ACTIVITY_A}**`, async (route) => {
  135 |     await route.fulfill({
  136 |       status: 200,
  137 |       contentType: 'application/json',
  138 |       body: JSON.stringify(activityAMock),
  139 |     });
  140 |   });
  141 | 
  142 |   await page.route(`**/api/public/activities/${ACTIVITY_B}**`, async (route) => {
  143 |     await route.fulfill({
  144 |       status: 200,
  145 |       contentType: 'application/json',
  146 |       body: JSON.stringify(activityBMock),
  147 |     });
  148 |   });
  149 | 
  150 |   let postedCheckout: unknown = null;
  151 | 
  152 |   await page.route('**/api/bookings', async (route) => {
  153 |     if (route.request().method() !== 'POST') {
  154 |       await route.continue();
  155 |       return;
  156 |     }
  157 | 
  158 |     postedCheckout = route.request().postDataJSON();
  159 | 
  160 |     await route.fulfill({
  161 |       status: 201,
  162 |       contentType: 'application/json',
  163 |       body: JSON.stringify({
  164 |         booking: {
  165 |           id: BOOKING_ID,
  166 |           userId: 'user-e2e',
  167 |           status: 'pending_payment',
  168 |           totalCents: TOTAL_CENTS,
  169 |           currency: 'USD',
  170 |           promoCodeId: null,
  171 |           createdAt: new Date().toISOString(),
  172 |           updatedAt: null,
  173 |         },
  174 |         items: [],
  175 |         totalCents: TOTAL_CENTS,
  176 |         currency: 'USD',
  177 |       }),
  178 |     });
  179 |   });
  180 | 
  181 |   await page.route(`**/api/bookings/${BOOKING_ID}/checkout-session`, async (route) => {
  182 |     await route.fulfill({
  183 |       status: 201,
  184 |       contentType: 'application/json',
  185 |       body: JSON.stringify({
  186 |         paymentId: 'payment-e2e-package',
  187 |         sessionId: 'cs_test_e2e_package',
  188 |         url: `http://127.0.0.1:3002/booking/success?booking_id=${BOOKING_ID}`,
  189 |         amountCents: TOTAL_CENTS,
  190 |         currency: 'USD',
  191 |       }),
  192 |     });
  193 |   });
  194 | 
  195 |   await page.route(`**/api/bookings/${BOOKING_ID}`, async (route) => {
  196 |     await route.fulfill({
  197 |       status: 200,
  198 |       contentType: 'application/json',
  199 |       body: JSON.stringify({
  200 |         booking: {
  201 |           id: BOOKING_ID,
  202 |           userId: 'user-e2e',
  203 |           status: 'confirmed',
  204 |           totalCents: TOTAL_CENTS,
  205 |           currency: 'USD',
  206 |           promoCodeId: null,
  207 |           createdAt: new Date().toISOString(),
  208 |           updatedAt: null,
  209 |         },
  210 |         items: [],
  211 |         totalCents: TOTAL_CENTS,
  212 |         currency: 'USD',
  213 |       }),
  214 |     });
  215 |   });
  216 | 
  217 |   await page.goto(`/packages/${PACKAGE_ID}?date=${DATE}&participants=${PARTICIPANTS}`);
  218 | 
  219 |   await expect(page.getByRole('heading', { name: 'Kinshasa Activities Duo' })).toBeVisible();
> 220 |   await expect(page.getByRole('heading', { name: /choisir les cr|choose time slots|elegir horarios/i })).toBeVisible();
      |                                                                                                          ^ Error: expect(locator).toBeVisible() failed
  221 | 
  222 |   const gombeSection = page.locator('article').filter({ hasText: 'Gombe City Tour' });
  223 |   await gombeSection
  224 |     .getByRole('button', {
  225 |       name: /choisir ce cr[ée]neau|select this slot|elegir este horario/i,
  226 |     })
  227 |     .click();
  228 | 
  229 |   const riverSection = page.locator('article').filter({ hasText: 'Congo River Walk' });
  230 |   await riverSection
  231 |     .getByRole('button', {
  232 |       name: /choisir ce cr[ée]neau|select this slot|elegir este horario/i,
  233 |     })
  234 |     .click();
  235 | 
  236 |   await page
  237 |     .getByRole('button', {
  238 |       name: /ajouter au panier|add to cart|a[ñn]adir al carrito/i,
  239 |     })
  240 |     .click();
  241 | 
  242 |   await expect(page).toHaveURL(/\/booking\/cart\?.*kind=package/);
  243 |   await expect(page.getByText('Kinshasa Activities Duo')).toBeVisible();
  244 |   await expect(page.getByText('Gombe City Tour')).toBeVisible();
  245 |   await expect(page.getByText('Congo River Walk')).toBeVisible();
  246 | 
  247 |   await page.getByRole('link', { name: /continuer vers r[ée]cap/i }).click();
  248 |   await expect(page).toHaveURL(/\/booking\/recap\?.*kind=package/);
  249 |   await expect(page.getByRole('heading', { name: /recapitulatif/i })).toBeVisible();
  250 | 
  251 |   await expect(page.getByRole('button', { name: /payer avec stripe/i })).toBeEnabled();
  252 |   await page.getByRole('button', { name: /payer avec stripe/i }).click();
  253 |   await expect(page).toHaveURL(new RegExp(`/booking/success\\?booking_id=${BOOKING_ID}`), {
  254 |     timeout: 15_000,
  255 |   });
  256 | 
  257 |   expect(postedCheckout).toEqual({
  258 |     packageId: PACKAGE_ID,
  259 |     items: [
  260 |       {
  261 |         itemType: 'activity_schedule',
  262 |         referenceId: SCHEDULE_A,
  263 |         quantity: PARTICIPANTS,
  264 |       },
  265 |       {
  266 |         itemType: 'activity_schedule',
  267 |         referenceId: SCHEDULE_B,
  268 |         quantity: PARTICIPANTS,
  269 |       },
  270 |     ],
  271 |   });
  272 | 
  273 |   await expect(page.getByText(/reservation confirmee/i)).toBeVisible();
  274 |   await expect(page.getByText(/booking id:/i)).toBeVisible();
  275 | });
  276 | 
```