# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: cruise-checkout.spec.ts >> croisière CDKIN→CDBNW: itinéraire, cabine grisée, panier -> recap -> Stripe
- Location: tests\e2e\cruise-checkout.spec.ts:64:5

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: locator.click: Test timeout of 60000ms exceeded.
Call log:
  - waiting for locator('button:visible').filter({ hasText: /r[ée]server|book now|reservar/i }).first()

```

# Page snapshot

```yaml
- generic [ref=e1]:
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
      - link "Croisières" [ref=e72] [cursor=pointer]:
        - /url: /cruises?guests=2
      - generic [ref=e73]: ›
      - generic [ref=e74]: Kinshasa — Banana
    - generic [ref=e76]:
      - generic [ref=e77]:
        - banner [ref=e78]:
          - paragraph [ref=e79]: Africa River Cruises
          - heading "Kinshasa — Banana" [level=1] [ref=e80]
          - paragraph [ref=e81]: "Navire: Congo River Spirit · CDKIN — Kinshasa Port → CDBNW — Banana Port · 15 sept. 2026 → 20 sept. 2026 · 5 nuits"
        - region "Itinéraire" [ref=e82]:
          - heading "Itinéraire" [level=2] [ref=e83]
          - paragraph [ref=e84]: CDKIN — Kinshasa Port → CDBNW — Banana Port · 15 sept. 2026 → 20 sept. 2026
          - list [ref=e85]:
            - listitem [ref=e86]:
              - paragraph [ref=e87]: Jour 1
              - paragraph [ref=e88]: 15 sept. 2026
              - generic [ref=e90]: CDKIN
              - paragraph [ref=e91]: CDKIN — Kinshasa Port
              - paragraph [ref=e92]: CD
              - paragraph [ref=e94]: "Départ: 18:00"
            - listitem [ref=e95]
            - listitem [ref=e100]:
              - paragraph [ref=e101]: Jour 4
              - paragraph [ref=e102]: 18 sept. 2026
              - generic [ref=e104]: CDBNW
              - paragraph [ref=e105]: CDBNW — Banana Port
              - paragraph [ref=e106]: CD
              - paragraph [ref=e108]: "Arrivée: 10:00"
        - region "Cabines disponibles" [ref=e109]:
          - heading "Cabines disponibles" [level=2] [ref=e110]
          - radiogroup "Cabines disponibles" [ref=e111]:
            - 'radio "Standard Pont: Pont principal Sélectionnée 2 voyageurs max 8 cabine(s) disponible(s) À partir de $2,450 / voyageur Sélectionnée Choisir cette cabine" [checked] [ref=e112] [cursor=pointer]':
              - generic [ref=e113]:
                - generic [ref=e114]:
                  - generic [ref=e115]:
                    - heading "Standard" [level=3] [ref=e116]
                    - paragraph [ref=e117]: "Pont: Pont principal"
                  - generic [ref=e118]: Sélectionnée
                - list [ref=e119]:
                  - listitem [ref=e120]:
                    - img [ref=e121]
                    - text: 2 voyageurs max
                  - listitem [ref=e123]:
                    - img [ref=e124]
                    - text: 8 cabine(s) disponible(s)
                - generic [ref=e126]:
                  - paragraph [ref=e127]: À partir de
                  - paragraph [ref=e128]: $2,450
                  - paragraph [ref=e129]: / voyageur
              - generic [ref=e130]:
                - generic [ref=e131]: Sélectionnée
                - button "Choisir cette cabine" [active] [ref=e132]
            - 'radio "Suite Pont: Pont supérieur 4 voyageurs max 0 cabine(s) disponible(s) À partir de $4,400 / voyageur Complet Choisir cette cabine" [ref=e133] [cursor=pointer]':
              - generic [ref=e134]:
                - generic [ref=e136]:
                  - heading "Suite" [level=3] [ref=e137]
                  - paragraph [ref=e138]: "Pont: Pont supérieur"
                - list [ref=e139]:
                  - listitem [ref=e140]:
                    - img [ref=e141]
                    - text: 4 voyageurs max
                  - listitem [ref=e143]:
                    - img [ref=e144]
                    - text: 0 cabine(s) disponible(s)
                - generic [ref=e146]:
                  - paragraph [ref=e147]: À partir de
                  - paragraph [ref=e148]: $4,400
                  - paragraph [ref=e149]: / voyageur
              - generic [ref=e150]:
                - generic [ref=e151]: Complet
                - button "Choisir cette cabine" [disabled] [ref=e152]
      - complementary [ref=e153]:
        - generic [ref=e154]:
          - heading "Réserver" [level=2] [ref=e155]
          - generic [ref=e156]:
            - paragraph [ref=e157]: Départ
            - paragraph [ref=e158]: 15 sept. 2026
            - generic [ref=e159]: "Arrivée: 20 sept. 2026 · 5 nuits"
          - generic [ref=e160]:
            - generic [ref=e161]: Voyageurs
            - spinbutton "Voyageurs" [ref=e162]: "2"
          - paragraph [ref=e163]: CDKIN — Kinshasa Port → CDBNW — Banana Port · 2 voyageurs
          - generic [ref=e164]:
            - paragraph [ref=e165]: Standard
            - paragraph [ref=e166]: Total croisière
            - paragraph [ref=e167]: $2,450
            - paragraph [ref=e168]: "Pont: Pont principal"
          - button "Demander une réservation" [ref=e169] [cursor=pointer]
          - list [ref=e170]:
            - listitem [ref=e171]:
              - generic [ref=e172]: ✓
              - generic [ref=e173]: Tarifs indicatifs — la réservation en ligne arrive bientôt.
            - listitem [ref=e174]:
              - generic [ref=e175]: ✓
              - generic [ref=e176]: Montant affiché sans frais cachés.
            - listitem [ref=e177]:
              - generic [ref=e178]: ✓
              - generic [ref=e179]: Une question ? Notre équipe vous accompagne.
    - contentinfo [ref=e180]:
      - generic [ref=e183]:
        - generic [ref=e184]:
          - link "Africa Tourism Gate Africa Tourism Gate" [ref=e185] [cursor=pointer]:
            - /url: /
            - img "Africa Tourism Gate" [ref=e186]
            - generic [ref=e187]: Africa Tourism Gate
          - paragraph [ref=e188]: Votre passerelle vers les meilleures expériences de voyage en Afrique. Découvrez des destinations uniques et réservez en toute confiance.
          - link "En savoir plus" [ref=e189] [cursor=pointer]:
            - /url: /about/who-we-are
        - generic [ref=e190]:
          - heading "Nos Produits" [level=3] [ref=e191]
          - list [ref=e192]:
            - listitem [ref=e193]:
              - link "Hébergements Premium" [ref=e194] [cursor=pointer]:
                - /url: /hotels
                - img [ref=e195]
                - text: Hébergements Premium
            - listitem [ref=e197]:
              - link "Vols Première Classe" [ref=e198] [cursor=pointer]:
                - /url: /flights
                - img [ref=e199]
                - text: Vols Première Classe
            - listitem [ref=e201]:
              - link "Location de Voitures" [ref=e202] [cursor=pointer]:
                - /url: /cars
                - img [ref=e203]
                - text: Location de Voitures
            - listitem [ref=e205]:
              - link "Safaris & Tours" [ref=e206] [cursor=pointer]:
                - /url: /activities
                - img [ref=e207]
                - text: Safaris & Tours
            - listitem [ref=e209]:
              - link "Croisières Côtières" [ref=e210] [cursor=pointer]:
                - /url: /cruises
                - img [ref=e211]
                - text: Croisières Côtières
            - listitem [ref=e213]:
              - link "Forfaits" [ref=e214] [cursor=pointer]:
                - /url: /packages
                - img [ref=e215]
                - text: Forfaits
        - generic [ref=e217]:
          - heading "À propos" [level=3] [ref=e218]
          - list [ref=e219]:
            - listitem [ref=e220]:
              - link "Qui nous sommes" [ref=e221] [cursor=pointer]:
                - /url: /about/who-we-are
                - img [ref=e222]
                - text: Qui nous sommes
            - listitem [ref=e224]:
              - link "Notre histoire" [ref=e225] [cursor=pointer]:
                - /url: /about/our-history
                - img [ref=e226]
                - text: Notre histoire
            - listitem [ref=e228]:
              - link "Notre équipe" [ref=e229] [cursor=pointer]:
                - /url: /about/team
                - img [ref=e230]
                - text: Notre équipe
            - listitem [ref=e232]:
              - link "Comment nous travaillons" [ref=e233] [cursor=pointer]:
                - /url: /about/how-we-work
                - img [ref=e234]
                - text: Comment nous travaillons
            - listitem [ref=e236]:
              - link "Notre gouvernance" [ref=e237] [cursor=pointer]:
                - /url: /about/governance
                - img [ref=e238]
                - text: Notre gouvernance
            - listitem [ref=e240]:
              - link "Rapports et finances" [ref=e241] [cursor=pointer]:
                - /url: /about/reports
                - img [ref=e242]
                - text: Rapports et finances
            - listitem [ref=e244]:
              - link "Responsabilité" [ref=e245] [cursor=pointer]:
                - /url: /about/responsibility
                - img [ref=e246]
                - text: Responsabilité
            - listitem [ref=e248]:
              - link "Médias & ressources" [ref=e249] [cursor=pointer]:
                - /url: /about/media-resources
                - img [ref=e250]
                - text: Médias & ressources
            - listitem [ref=e252]:
              - link "Nous contacter" [ref=e253] [cursor=pointer]:
                - /url: /about/contact
                - img [ref=e254]
                - text: Nous contacter
        - generic [ref=e256]:
          - heading "Newsletter" [level=3] [ref=e257]
          - paragraph [ref=e258]: Inspiration, idées de voyages, bons plans et actualités.
          - generic [ref=e259]:
            - textbox "Adresse email" [ref=e260]
            - button "OK" [ref=e261] [cursor=pointer]
        - generic [ref=e262]:
          - heading "Contact" [level=3] [ref=e263]:
            - link "Contact" [ref=e264] [cursor=pointer]:
              - /url: /about/contact
          - generic [ref=e265]:
            - generic [ref=e266]:
              - img [ref=e267]
              - generic [ref=e269]: "+243975579097"
            - generic [ref=e270]:
              - img [ref=e271]
              - link "support@africatourismgate.org" [ref=e273] [cursor=pointer]:
                - /url: mailto:support@africatourismgate.org
            - generic [ref=e274]:
              - img [ref=e275]
              - generic [ref=e278]: Kinshasa, RD Congo
          - generic [ref=e279]:
            - link "Facebook" [ref=e280] [cursor=pointer]:
              - /url: https://www.facebook.com/africatourismgate
              - img [ref=e282]
            - link "X / Twitter" [ref=e284] [cursor=pointer]:
              - /url: https://x.com/Congotourismga1
              - img [ref=e286]
            - link "Instagram" [ref=e288] [cursor=pointer]:
              - /url: https://www.instagram.com/africatourismgate
              - img [ref=e290]
      - generic [ref=e293]:
        - paragraph [ref=e294]:
          - text: © 2026 Africa Tourism Gate|
          - link "Politique de Confidentialité" [ref=e295] [cursor=pointer]:
            - /url: /legal/privacy
          - text: "|"
          - link "Conditions d'utilisation" [ref=e296] [cursor=pointer]:
            - /url: /legal/terms
          - text: "|"
          - link "À propos" [ref=e297] [cursor=pointer]:
            - /url: /about/who-we-are
          - text: "|"
          - link "FAQ" [ref=e298] [cursor=pointer]:
            - /url: /support
          - text: "|"
          - link "Contact" [ref=e299] [cursor=pointer]:
            - /url: /about/contact
          - text: "|"
          - link "GAP" [ref=e300] [cursor=pointer]:
            - /url: http://localhost:3004
        - paragraph [ref=e301]:
          - text: Conçu par
          - strong [ref=e302]: Carin Siwa et Ruth Bwiza
  - alert [ref=e303]
  - generic "Notifications"
```

# Test source

```ts
  86  |   });
  87  | 
  88  |   await page.route(`**/api/public/cruises/sailings/${SAILING_ID}**`, async (route) => {
  89  |     await route.fulfill({
  90  |       status: 200,
  91  |       contentType: 'application/json',
  92  |       body: JSON.stringify(sailingDetailMock),
  93  |     });
  94  |   });
  95  | 
  96  |   let postedItems: unknown = null;
  97  | 
  98  |   await page.route('**/api/bookings', async (route) => {
  99  |     if (route.request().method() !== 'POST') {
  100 |       await route.continue();
  101 |       return;
  102 |     }
  103 | 
  104 |     postedItems = route.request().postDataJSON();
  105 | 
  106 |     await route.fulfill({
  107 |       status: 201,
  108 |       contentType: 'application/json',
  109 |       body: JSON.stringify({
  110 |         booking: {
  111 |           id: BOOKING_ID,
  112 |           userId: 'user-e2e',
  113 |           status: 'pending_payment',
  114 |           preferredPaymentMethod: 'stripe',
  115 |           totalCents: TOTAL_CENTS,
  116 |           currency: 'USD',
  117 |           promoCodeId: null,
  118 |           createdAt: new Date().toISOString(),
  119 |           updatedAt: null,
  120 |         },
  121 |         items: [],
  122 |         totalCents: TOTAL_CENTS,
  123 |         currency: 'USD',
  124 |       }),
  125 |     });
  126 |   });
  127 | 
  128 |   await page.route(`**/api/bookings/${BOOKING_ID}/checkout-session`, async (route) => {
  129 |     await route.fulfill({
  130 |       status: 201,
  131 |       contentType: 'application/json',
  132 |       body: JSON.stringify({
  133 |         paymentId: 'payment-e2e-cruise',
  134 |         sessionId: 'cs_test_e2e_cruise',
  135 |         url: `http://127.0.0.1:3002/booking/success?booking_id=${BOOKING_ID}`,
  136 |         amountCents: TOTAL_CENTS,
  137 |         currency: 'USD',
  138 |       }),
  139 |     });
  140 |   });
  141 | 
  142 |   await page.route(`**/api/bookings/${BOOKING_ID}`, async (route) => {
  143 |     await route.fulfill({
  144 |       status: 200,
  145 |       contentType: 'application/json',
  146 |       body: JSON.stringify({
  147 |         booking: {
  148 |           id: BOOKING_ID,
  149 |           userId: 'user-e2e',
  150 |           status: 'confirmed',
  151 |           preferredPaymentMethod: 'stripe',
  152 |           totalCents: TOTAL_CENTS,
  153 |           currency: 'USD',
  154 |           promoCodeId: null,
  155 |           createdAt: new Date().toISOString(),
  156 |           updatedAt: null,
  157 |         },
  158 |         items: [],
  159 |         totalCents: TOTAL_CENTS,
  160 |         currency: 'USD',
  161 |       }),
  162 |     });
  163 |   });
  164 | 
  165 |   await page.goto(`/cruises/${SAILING_ID}?guests=2`);
  166 | 
  167 |   await expect(page.getByRole('heading', { name: 'Kinshasa — Banana' })).toBeVisible();
  168 | 
  169 |   const itinerary = page.locator('section').filter({
  170 |     has: page.getByRole('heading', { name: /itinéraire|itinerary|itinerario/i }),
  171 |   });
  172 |   await expect(itinerary.locator('ol').getByText('CDKIN — Kinshasa Port')).toBeVisible();
  173 |   await expect(itinerary.locator('ol').getByText('CDBNW — Banana Port')).toBeVisible();
  174 | 
  175 |   const suiteCard = page.locator('article').filter({ hasText: 'Suite' });
  176 |   await expect(suiteCard.getByText(/complet|sold out|agotado/i)).toBeVisible();
  177 |   await expect(
  178 |     suiteCard.getByRole('button', { name: /choisir cette cabine|select this cabin|elegir este camarote/i }),
  179 |   ).toBeDisabled();
  180 | 
  181 |   const standardCard = page.locator('article').filter({ hasText: 'Standard' });
  182 |   await standardCard
  183 |     .getByRole('button', { name: /choisir cette cabine|select this cabin|elegir este camarote/i })
  184 |     .click();
  185 | 
> 186 |   await page.locator('button:visible', { hasText: /r[ée]server|book now|reservar/i }).first().click();
      |                                                                                               ^ Error: locator.click: Test timeout of 60000ms exceeded.
  187 |   await expect(page).toHaveURL(/\/booking\/cart\?.*kind=cabin/);
  188 |   await expect(page.getByText('Kinshasa — Banana')).toBeVisible();
  189 |   await expect(page.getByText('Standard')).toBeVisible();
  190 | 
  191 |   await page.goto(
  192 |     `/booking/recap?kind=cabin&sailingId=${SAILING_ID}&cabinAvailabilityId=${CABIN_AVAIL_STD}&guests=2`,
  193 |   );
  194 |   await expect(page.getByRole('heading', { name: /recapitulatif/i })).toBeVisible();
  195 |   await expect(page.getByText('Kinshasa — Banana')).toBeVisible();
  196 |   await expect(page.getByText('Standard')).toBeVisible();
  197 | 
  198 |   await mockManifestApi(page);
  199 |   await page.locator('input[name="preferredPaymentMethod"][value="stripe"]').check();
  200 |   await fillCheckoutManifest(page);
  201 |   await expect(page.getByRole('button', { name: /payer avec stripe|pay with stripe|pagar con stripe/i })).toBeEnabled();
  202 |   await page.getByRole('button', { name: /payer avec stripe|pay with stripe|pagar con stripe/i }).click();
  203 |   await expect(page).toHaveURL(new RegExp(`/booking/success\\?booking_id=${BOOKING_ID}`), {
  204 |     timeout: 15_000,
  205 |   });
  206 | 
  207 |   expect(postedItems).toEqual({
  208 |     preferredPaymentMethod: 'stripe',
  209 |     items: [
  210 |       {
  211 |         itemType: 'cabin',
  212 |         referenceId: CABIN_AVAIL_STD,
  213 |         quantity: 1,
  214 |       },
  215 |     ],
  216 |   });
  217 | 
  218 |   await expect(page.getByText(/reservation confirmee/i)).toBeVisible();
  219 |   await expect(page.getByText(/booking id:/i)).toBeVisible();
  220 | });
  221 | 
```