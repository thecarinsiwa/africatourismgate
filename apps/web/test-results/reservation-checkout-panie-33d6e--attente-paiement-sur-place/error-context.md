# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: reservation-checkout.spec.ts >> panier -> recap -> cash -> attente paiement sur place
- Location: tests\e2e\reservation-checkout.spec.ts:154:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button:visible').filter({ hasText: /reserver|réserver|book now/i }).first()

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - banner [ref=e4]:
      - generic [ref=e6]:
        - generic [ref=e7]:
          - link "support@africatourismgate.org" [ref=e8] [cursor=pointer]:
            - /url: mailto:support@africatourismgate.org
            - img [ref=e9]
            - generic [ref=e11]: support@africatourismgate.org
          - generic [ref=e12]:
            - img [ref=e13]
            - generic [ref=e15]: "+243975579097"
        - generic [ref=e16]:
          - generic [ref=e17]:
            - generic [ref=e18]: Choisir la langue
            - img [ref=e19]
            - button "Choisir la langue" [ref=e21] [cursor=pointer]:
              - generic [ref=e22]: FR
              - img [ref=e23]
          - link "Facebook" [ref=e25] [cursor=pointer]:
            - /url: https://www.facebook.com/africatourismgate
            - img [ref=e27]
          - link "X / Twitter" [ref=e29] [cursor=pointer]:
            - /url: https://x.com/Congotourismga1
            - img [ref=e31]
          - link "Instagram" [ref=e33] [cursor=pointer]:
            - /url: https://www.instagram.com/africatourismgate
            - img [ref=e35]
      - generic [ref=e38]:
        - link "Africa Tourism Gate Africa Tourism Gate" [ref=e39] [cursor=pointer]:
          - /url: /
          - generic [ref=e40]:
            - img "Africa Tourism Gate" [ref=e41]
            - generic [ref=e42]: Africa Tourism Gate
        - navigation "Navigation principale" [ref=e43]:
          - link "Accueil" [ref=e45] [cursor=pointer]:
            - /url: /
          - link "À propos" [ref=e47] [cursor=pointer]:
            - /url: /about/who-we-are
            - text: À propos
            - img [ref=e48]
          - link "Galerie" [ref=e51] [cursor=pointer]:
            - /url: /#gallery
          - link "Nos Produits" [ref=e53] [cursor=pointer]:
            - /url: /#search
            - text: Nos Produits
            - img [ref=e54]
          - link "Blog" [ref=e57] [cursor=pointer]:
            - /url: /blog
          - link "Forfaits" [ref=e59] [cursor=pointer]:
            - /url: /packages
        - generic [ref=e60]:
          - link "Don" [ref=e61] [cursor=pointer]:
            - /url: https://www.unesco.org/fr/green-citizens/engagement
          - link "Mon compte" [ref=e62] [cursor=pointer]:
            - /url: /account
          - link "Se déconnecter" [ref=e63] [cursor=pointer]:
            - /url: /booking/logout
        - button "Activer le mode sombre" [ref=e64] [cursor=pointer]:
          - img [ref=e65]
    - navigation "Breadcrumb" [ref=e69]:
      - link "Accueil" [ref=e70] [cursor=pointer]:
        - /url: /
      - generic [ref=e71]: ›
      - link "Hôtels" [ref=e72] [cursor=pointer]:
        - /url: /hotels
      - generic [ref=e73]: ›
      - generic [ref=e74]: Hotel Test Kinshasa
    - generic [ref=e76]:
      - generic [ref=e77]:
        - banner [ref=e78]:
          - paragraph [ref=e79]: Hôtel
          - heading "Hotel Test Kinshasa" [level=1] [ref=e80]
          - paragraph [ref=e81]:
            - img [ref=e82]
            - text: 1 Avenue Test, Kinshasa
          - generic [ref=e84]:
            - generic [ref=e85]:
              - img [ref=e86]
              - img [ref=e88]
              - img [ref=e90]
              - img [ref=e92]
              - img [ref=e94]
            - generic [ref=e96]: 4 étoiles
        - generic [ref=e97]:
          - heading "Description" [level=2] [ref=e98]
          - paragraph [ref=e99]: Hotel for e2e.
        - region "Avis des voyageurs" [ref=e100]:
          - heading "Avis des voyageurs" [level=2] [ref=e103]
          - alert [ref=e104]: Impossible de charger les avis.
        - region "Disponibilités et tarifs" [ref=e105]:
          - generic [ref=e106]:
            - heading "Disponibilités et tarifs" [level=2] [ref=e107]
            - generic [ref=e108]:
              - button "Mois précédent" [ref=e109] [cursor=pointer]: ‹
              - generic [ref=e110]: août 2026
              - button "Mois suivant" [ref=e111] [cursor=pointer]: ›
          - generic [ref=e112]:
            - generic [ref=e113]:
              - generic [ref=e114]: L
              - generic [ref=e115]: M
              - generic [ref=e116]: M
              - generic [ref=e117]: J
              - generic [ref=e118]: V
              - generic [ref=e119]: S
              - generic [ref=e120]: D
            - grid [ref=e121]:
              - gridcell "1 — Disponible" [ref=e127] [cursor=pointer]:
                - generic [ref=e128]: "1"
              - gridcell "2 — Disponible" [ref=e129] [cursor=pointer]:
                - generic [ref=e130]: "2"
              - gridcell "3 — Disponible" [ref=e131] [cursor=pointer]:
                - generic [ref=e132]: "3"
              - gridcell "4 — Disponible" [ref=e133] [cursor=pointer]:
                - generic [ref=e134]: "4"
              - gridcell "5 — Disponible" [ref=e135] [cursor=pointer]:
                - generic [ref=e136]: "5"
              - gridcell "6 — Disponible" [ref=e137] [cursor=pointer]:
                - generic [ref=e138]: "6"
              - gridcell "7 — Disponible" [ref=e139] [cursor=pointer]:
                - generic [ref=e140]: "7"
              - gridcell "8 — Disponible" [ref=e141] [cursor=pointer]:
                - generic [ref=e142]: "8"
              - gridcell "9 — Disponible" [ref=e143] [cursor=pointer]:
                - generic [ref=e144]: "9"
              - gridcell "10 — Dates sélectionnées" [selected] [ref=e145] [cursor=pointer]:
                - generic [ref=e146]: "10"
              - gridcell "11 — Dates sélectionnées" [selected] [ref=e147] [cursor=pointer]:
                - generic [ref=e148]: "11"
              - gridcell "12 — Disponible" [ref=e149] [cursor=pointer]:
                - generic [ref=e150]: "12"
              - gridcell "13 — Disponible" [ref=e151] [cursor=pointer]:
                - generic [ref=e152]: "13"
              - gridcell "14 — Disponible" [ref=e153] [cursor=pointer]:
                - generic [ref=e154]: "14"
              - gridcell "15 — Disponible" [ref=e155] [cursor=pointer]:
                - generic [ref=e156]: "15"
              - gridcell "16 — Disponible" [ref=e157] [cursor=pointer]:
                - generic [ref=e158]: "16"
              - gridcell "17 — Disponible" [ref=e159] [cursor=pointer]:
                - generic [ref=e160]: "17"
              - gridcell "18 — Disponible" [ref=e161] [cursor=pointer]:
                - generic [ref=e162]: "18"
              - gridcell "19 — Disponible" [ref=e163] [cursor=pointer]:
                - generic [ref=e164]: "19"
              - gridcell "20 — Disponible" [ref=e165] [cursor=pointer]:
                - generic [ref=e166]: "20"
              - gridcell "21 — Disponible" [ref=e167] [cursor=pointer]:
                - generic [ref=e168]: "21"
              - gridcell "22 — Disponible" [ref=e169] [cursor=pointer]:
                - generic [ref=e170]: "22"
              - gridcell "23 — Disponible" [ref=e171] [cursor=pointer]:
                - generic [ref=e172]: "23"
              - gridcell "24 — Disponible" [ref=e173] [cursor=pointer]:
                - generic [ref=e174]: "24"
              - gridcell "25 — Disponible" [ref=e175] [cursor=pointer]:
                - generic [ref=e176]: "25"
              - gridcell "26 — Disponible" [ref=e177] [cursor=pointer]:
                - generic [ref=e178]: "26"
              - gridcell "27 — Disponible" [ref=e179] [cursor=pointer]:
                - generic [ref=e180]: "27"
              - gridcell "28 — Disponible" [ref=e181] [cursor=pointer]:
                - generic [ref=e182]: "28"
              - gridcell "29 — Disponible" [ref=e183] [cursor=pointer]:
                - generic [ref=e184]: "29"
              - gridcell "30 — Disponible" [ref=e185] [cursor=pointer]:
                - generic [ref=e186]: "30"
              - gridcell "31 — Disponible" [ref=e187] [cursor=pointer]:
                - generic [ref=e188]: "31"
            - generic "Légende" [ref=e189]:
              - generic [ref=e190]: Légende
              - generic [ref=e191]: Disponible
              - generic [ref=e193]: Dates sélectionnées
              - generic [ref=e195]: Indisponible
        - generic [ref=e197]:
          - heading "Chambres" [level=2] [ref=e198]
          - article [ref=e200]:
            - generic [ref=e201]:
              - generic [ref=e202]:
                - heading "Suite E2E" [level=3] [ref=e203]
                - list [ref=e204]:
                  - listitem [ref=e205]: jusqu'à 2 voyageurs
                  - listitem [ref=e206]: "Literie: 1 king bed"
              - generic [ref=e207]:
                - paragraph [ref=e208]: $1,200
                - paragraph [ref=e209]: $600 / nuit
            - button "Choisir cette chambre" [ref=e211] [cursor=pointer]
      - complementary [ref=e213]:
        - generic [ref=e214]:
          - heading "Réserver" [level=2] [ref=e215]
          - generic [ref=e216]:
            - generic [ref=e217]:
              - generic [ref=e218]: Arrivée
              - textbox "Arrivée" [ref=e219]: 2026-08-10
            - generic [ref=e220]:
              - generic [ref=e221]: Départ
              - textbox "Départ" [ref=e222]: 2026-08-12
          - generic [ref=e223]:
            - generic [ref=e224]: Voyageurs
            - group [ref=e225]:
              - button "Diminuer le nombre de voyageurs" [ref=e226] [cursor=pointer]: −
              - generic [ref=e227]: "2"
              - button "Augmenter le nombre de voyageurs" [ref=e228] [cursor=pointer]: +
          - paragraph [ref=e229]: 10 août 2026 → 12 août 2026 · 2 nuits · 2 voyageurs
          - generic [ref=e230]:
            - paragraph [ref=e231]: Total séjour
            - paragraph [ref=e232]: $1,200
            - paragraph [ref=e233]: Tarif par chambre (non multiplié par personne)
          - button "Demander une réservation" [ref=e234] [cursor=pointer]
          - list [ref=e235]:
            - listitem [ref=e236]:
              - generic [ref=e237]: ✓
              - generic [ref=e238]: Tarifs indicatifs — la réservation en ligne arrive bientôt.
            - listitem [ref=e239]:
              - generic [ref=e240]: ✓
              - generic [ref=e241]: Montant affiché sans frais cachés.
            - listitem [ref=e242]:
              - generic [ref=e243]: ✓
              - generic [ref=e244]: Une question ? Notre équipe vous accompagne.
    - contentinfo [ref=e245]:
      - generic [ref=e248]:
        - generic [ref=e249]:
          - link "Africa Tourism Gate Africa Tourism Gate" [ref=e250] [cursor=pointer]:
            - /url: /
            - img "Africa Tourism Gate" [ref=e251]
            - generic [ref=e252]: Africa Tourism Gate
          - paragraph [ref=e253]: Votre passerelle vers les meilleures expériences de voyage en Afrique. Découvrez des destinations uniques et réservez en toute confiance.
          - link "En savoir plus" [ref=e254] [cursor=pointer]:
            - /url: /about/who-we-are
        - generic [ref=e255]:
          - heading "Nos Produits" [level=3] [ref=e256]
          - list [ref=e257]:
            - listitem [ref=e258]:
              - link "Hébergements Premium" [ref=e259] [cursor=pointer]:
                - /url: /hotels
                - img [ref=e260]
                - text: Hébergements Premium
            - listitem [ref=e262]:
              - link "Vols Première Classe" [ref=e263] [cursor=pointer]:
                - /url: /flights
                - img [ref=e264]
                - text: Vols Première Classe
            - listitem [ref=e266]:
              - link "Location de Voitures" [ref=e267] [cursor=pointer]:
                - /url: /cars
                - img [ref=e268]
                - text: Location de Voitures
            - listitem [ref=e270]:
              - link "Safaris & Tours" [ref=e271] [cursor=pointer]:
                - /url: /activities
                - img [ref=e272]
                - text: Safaris & Tours
            - listitem [ref=e274]:
              - link "Croisières Côtières" [ref=e275] [cursor=pointer]:
                - /url: /cruises
                - img [ref=e276]
                - text: Croisières Côtières
            - listitem [ref=e278]:
              - link "Forfaits" [ref=e279] [cursor=pointer]:
                - /url: /packages
                - img [ref=e280]
                - text: Forfaits
        - generic [ref=e282]:
          - heading "À propos" [level=3] [ref=e283]
          - list [ref=e284]:
            - listitem [ref=e285]:
              - link "Qui nous sommes" [ref=e286] [cursor=pointer]:
                - /url: /about/who-we-are
                - img [ref=e287]
                - text: Qui nous sommes
            - listitem [ref=e289]:
              - link "Notre histoire" [ref=e290] [cursor=pointer]:
                - /url: /about/our-history
                - img [ref=e291]
                - text: Notre histoire
            - listitem [ref=e293]:
              - link "Notre équipe" [ref=e294] [cursor=pointer]:
                - /url: /about/team
                - img [ref=e295]
                - text: Notre équipe
            - listitem [ref=e297]:
              - link "Comment nous travaillons" [ref=e298] [cursor=pointer]:
                - /url: /about/how-we-work
                - img [ref=e299]
                - text: Comment nous travaillons
            - listitem [ref=e301]:
              - link "Notre gouvernance" [ref=e302] [cursor=pointer]:
                - /url: /about/governance
                - img [ref=e303]
                - text: Notre gouvernance
            - listitem [ref=e305]:
              - link "Rapports et finances" [ref=e306] [cursor=pointer]:
                - /url: /about/reports
                - img [ref=e307]
                - text: Rapports et finances
            - listitem [ref=e309]:
              - link "Responsabilité" [ref=e310] [cursor=pointer]:
                - /url: /about/responsibility
                - img [ref=e311]
                - text: Responsabilité
            - listitem [ref=e313]:
              - link "Médias & ressources" [ref=e314] [cursor=pointer]:
                - /url: /about/media-resources
                - img [ref=e315]
                - text: Médias & ressources
            - listitem [ref=e317]:
              - link "Nous contacter" [ref=e318] [cursor=pointer]:
                - /url: /about/contact
                - img [ref=e319]
                - text: Nous contacter
        - generic [ref=e321]:
          - heading "Newsletter" [level=3] [ref=e322]
          - paragraph [ref=e323]: Inspiration, idées de voyages, bons plans et actualités.
          - generic [ref=e324]:
            - textbox "Adresse email" [ref=e325]
            - button "OK" [ref=e326] [cursor=pointer]
        - generic [ref=e327]:
          - heading "Contact" [level=3] [ref=e328]:
            - link "Contact" [ref=e329] [cursor=pointer]:
              - /url: /about/contact
          - generic [ref=e330]:
            - generic [ref=e331]:
              - img [ref=e332]
              - generic [ref=e334]: "+243975579097"
            - generic [ref=e335]:
              - img [ref=e336]
              - link "support@africatourismgate.org" [ref=e338] [cursor=pointer]:
                - /url: mailto:support@africatourismgate.org
            - generic [ref=e339]:
              - img [ref=e340]
              - generic [ref=e343]: Kinshasa, RD Congo
          - generic [ref=e344]:
            - link "Facebook" [ref=e345] [cursor=pointer]:
              - /url: https://www.facebook.com/africatourismgate
              - img [ref=e347]
            - link "X / Twitter" [ref=e349] [cursor=pointer]:
              - /url: https://x.com/Congotourismga1
              - img [ref=e351]
            - link "Instagram" [ref=e353] [cursor=pointer]:
              - /url: https://www.instagram.com/africatourismgate
              - img [ref=e355]
      - generic [ref=e358]:
        - paragraph [ref=e359]:
          - text: © 2026 Africa Tourism Gate|
          - link "Politique de Confidentialité" [ref=e360] [cursor=pointer]:
            - /url: /legal/privacy
          - text: "|"
          - link "Conditions d'utilisation" [ref=e361] [cursor=pointer]:
            - /url: /legal/terms
          - text: "|"
          - link "À propos" [ref=e362] [cursor=pointer]:
            - /url: /about/who-we-are
          - text: "|"
          - link "FAQ" [ref=e363] [cursor=pointer]:
            - /url: /support
          - text: "|"
          - link "Contact" [ref=e364] [cursor=pointer]:
            - /url: /about/contact
          - text: "|"
          - link "GAP" [ref=e365] [cursor=pointer]:
            - /url: http://localhost:3004
        - paragraph [ref=e366]:
          - text: Conçu par
          - strong [ref=e367]: Carin Siwa et Ruth Bwiza
  - alert [ref=e368]
  - generic "Notifications"
```

# Test source

```ts
  178 |     await route.fulfill({
  179 |       status: 200,
  180 |       contentType: 'application/json',
  181 |       body: JSON.stringify({
  182 |         id: 'test-hotel',
  183 |         name: 'Hotel Test Kinshasa',
  184 |         propertyType: 'hotel',
  185 |         destinationName: 'Kinshasa',
  186 |         addressLine: '1 Avenue Test',
  187 |         description: 'Hotel for e2e.',
  188 |         starRating: 4,
  189 |         images: [],
  190 |         amenities: [],
  191 |         stay: {
  192 |           nights: 2,
  193 |           minTotalCents: 120000,
  194 |           currency: 'USD',
  195 |         },
  196 |         calendarDays: [],
  197 |         rooms: [
  198 |           {
  199 |             id: 'room-e2e',
  200 |             name: 'Suite E2E',
  201 |             maxGuests: 2,
  202 |             bedConfig: '1 king bed',
  203 |             basePriceCents: 60000,
  204 |             totalPriceCents: 120000,
  205 |             currency: 'USD',
  206 |             available: true,
  207 |           },
  208 |         ],
  209 |       }),
  210 |     });
  211 |   });
  212 | 
  213 |   let postedCheckout: unknown = null;
  214 |   let checkoutSessionCalls = 0;
  215 | 
  216 |   await page.route('**/api/bookings', async (route) => {
  217 |     if (route.request().method() !== 'POST') {
  218 |       await route.continue();
  219 |       return;
  220 |     }
  221 |     postedCheckout = route.request().postDataJSON();
  222 |     await route.fulfill({
  223 |       status: 201,
  224 |       contentType: 'application/json',
  225 |       body: JSON.stringify({
  226 |         booking: {
  227 |           id: 'booking-e2e-cash',
  228 |           userId: 'user-e2e',
  229 |           status: 'pending_payment',
  230 |           preferredPaymentMethod: 'cash',
  231 |           totalCents: 120000,
  232 |           currency: 'USD',
  233 |           promoCodeId: null,
  234 |           createdAt: new Date().toISOString(),
  235 |           updatedAt: null,
  236 |         },
  237 |         items: [],
  238 |         totalCents: 120000,
  239 |         currency: 'USD',
  240 |       }),
  241 |     });
  242 |   });
  243 | 
  244 |   await page.route('**/api/bookings/booking-e2e-cash/checkout-session', async (route) => {
  245 |     checkoutSessionCalls += 1;
  246 |     await route.fulfill({ status: 400, contentType: 'application/json', body: '{}' });
  247 |   });
  248 | 
  249 |   await page.route('**/api/bookings/booking-e2e-cash', async (route) => {
  250 |     await route.fulfill({
  251 |       status: 200,
  252 |       contentType: 'application/json',
  253 |       body: JSON.stringify({
  254 |         booking: {
  255 |           id: 'booking-e2e-cash',
  256 |           userId: 'user-e2e',
  257 |           status: 'pending_payment',
  258 |           preferredPaymentMethod: 'cash',
  259 |           totalCents: 120000,
  260 |           currency: 'USD',
  261 |           promoCodeId: null,
  262 |           createdAt: new Date().toISOString(),
  263 |           updatedAt: null,
  264 |         },
  265 |         items: [],
  266 |         totalCents: 120000,
  267 |         currency: 'USD',
  268 |       }),
  269 |     });
  270 |   });
  271 | 
  272 |   await mockManifestApi(page);
  273 | 
  274 |   await page.goto(
  275 |     '/hotels/test-hotel?checkIn=2026-08-10&checkOut=2026-08-12&guests=2&roomId=room-e2e',
  276 |   );
  277 | 
> 278 |   await page.locator('button:visible', { hasText: /reserver|réserver|book now/i }).first().click();
      |                                                                                            ^ Error: locator.click: Test timeout of 30000ms exceeded.
  279 |   await expect(page).toHaveURL(/\/booking\/cart\?/);
  280 | 
  281 |   await page.getByRole('link', { name: /continuer vers r[ée]cap/i }).click();
  282 |   await expect(page).toHaveURL(/\/booking\/recap\?/);
  283 | 
  284 |   const cashRadio = page.locator('input[name="preferredPaymentMethod"][value="cash"]');
  285 |   await expect(cashRadio).toBeVisible();
  286 |   await cashRadio.check();
  287 |   await fillCheckoutManifest(page);
  288 |   await page
  289 |     .getByRole('button', {
  290 |       name: /confirmer — paiement sur place|confirm — pay on site|confirmar — pago en efectivo/i,
  291 |     })
  292 |     .click();
  293 |   await expect(page).toHaveURL(/\/booking\/success\?booking_id=booking-e2e-cash&payment=cash/);
  294 | 
  295 |   expect(postedCheckout).toMatchObject({ preferredPaymentMethod: 'cash' });
  296 |   expect(checkoutSessionCalls).toBe(0);
  297 | 
  298 |   await expect(
  299 |     page.getByText(/r[ée]servation enregistr[ée]e|booking registered|reserva registrada/i),
  300 |   ).toBeVisible();
  301 |   await expect(
  302 |     page.getByText(/attente de paiement cash|awaiting cash payment|pendiente de pago en efectivo/i),
  303 |   ).toBeVisible();
  304 | });
  305 | 
```