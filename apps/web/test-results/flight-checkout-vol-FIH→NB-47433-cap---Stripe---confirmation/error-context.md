# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: flight-checkout.spec.ts >> vol FIH→NBO: fiche -> panier -> recap -> Stripe -> confirmation
- Location: tests\e2e\flight-checkout.spec.ts:45:5

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: locator.click: Test timeout of 60000ms exceeded.
Call log:
  - waiting for locator('button:visible').filter({ hasText: /r[ée]server|book now/i }).first()

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
      - link "Vols" [ref=e72] [cursor=pointer]:
        - /url: /flights?from=FIH&to=NBO&departureDate=2026-08-01&passengers=2
      - generic [ref=e73]: ›
      - generic [ref=e74]: KQ550
    - generic [ref=e76]:
      - generic [ref=e77]:
        - banner [ref=e78]:
          - paragraph [ref=e79]: Kenya Airways
          - heading "KQ550" [level=1] [ref=e80]
          - paragraph [ref=e81]: Kinshasa (FIH) → Nairobi (NBO) · 1 août 2026 · 2 passagers
        - region "Itinéraire" [ref=e82]:
          - heading "Itinéraire" [level=2] [ref=e83]
          - generic [ref=e85]:
            - generic [ref=e86]:
              - paragraph [ref=e87]: Départ
              - generic [ref=e88]: FIH
              - generic [ref=e89]:
                - paragraph [ref=e90]: Kinshasa
                - paragraph [ref=e91]: N'djili International Airport
              - paragraph [ref=e92]: 11:00
            - generic [ref=e93]:
              - generic [ref=e94]:
                - paragraph [ref=e95]: 6h 30min
                - paragraph [ref=e96]: Direct
              - img [ref=e101]
            - generic [ref=e105]:
              - paragraph [ref=e106]: Arrivée
              - generic [ref=e107]: NBO
              - generic [ref=e108]:
                - paragraph [ref=e109]: Nairobi
                - paragraph [ref=e110]: Jomo Kenyatta International Airport
              - paragraph [ref=e111]: 17:30
        - region "Classes disponibles" [ref=e112]:
          - heading "Classes disponibles" [level=2] [ref=e113]
          - radiogroup "Classes disponibles" [ref=e114]:
            - radio "Économique 50 siège(s) disponible(s) Sélectionnée $240 $120 / passager · Total vol Sélectionnée Choisir cette classe" [checked] [ref=e115] [cursor=pointer]:
              - generic [ref=e116]:
                - generic [ref=e117]:
                  - generic [ref=e118]:
                    - heading "Économique" [level=3] [ref=e119]
                    - paragraph [ref=e120]: 50 siège(s) disponible(s)
                  - generic [ref=e121]: Sélectionnée
                - generic [ref=e122]:
                  - paragraph [ref=e123]: $240
                  - paragraph [ref=e124]: $120 / passager · Total vol
              - generic [ref=e125]:
                - generic [ref=e126]: Sélectionnée
                - button "Choisir cette classe" [active] [ref=e127]
      - complementary [ref=e128]:
        - generic [ref=e129]:
          - heading "Réserver" [level=2] [ref=e130]
          - generic [ref=e131]:
            - paragraph [ref=e132]: Date de départ
            - paragraph [ref=e133]: 1 août 2026
          - generic [ref=e134]:
            - generic [ref=e135]: Passagers
            - spinbutton "Passagers" [ref=e136]: "2"
          - paragraph [ref=e137]: FIH → NBO · 2 passagers
          - generic [ref=e138]:
            - paragraph [ref=e139]: Total vol
            - paragraph [ref=e140]: $240
          - button "Demander une réservation" [ref=e141] [cursor=pointer]
          - list [ref=e142]:
            - listitem [ref=e143]:
              - generic [ref=e144]: ✓
              - generic [ref=e145]: Tarifs indicatifs — la réservation en ligne arrive bientôt.
            - listitem [ref=e146]:
              - generic [ref=e147]: ✓
              - generic [ref=e148]: Montant affiché sans frais cachés.
            - listitem [ref=e149]:
              - generic [ref=e150]: ✓
              - generic [ref=e151]: Une question ? Notre équipe vous accompagne.
    - contentinfo [ref=e152]:
      - generic [ref=e155]:
        - generic [ref=e156]:
          - link "Africa Tourism Gate Africa Tourism Gate" [ref=e157] [cursor=pointer]:
            - /url: /
            - img "Africa Tourism Gate" [ref=e158]
            - generic [ref=e159]: Africa Tourism Gate
          - paragraph [ref=e160]: Votre passerelle vers les meilleures expériences de voyage en Afrique. Découvrez des destinations uniques et réservez en toute confiance.
          - link "En savoir plus" [ref=e161] [cursor=pointer]:
            - /url: /about/who-we-are
        - generic [ref=e162]:
          - heading "Nos Produits" [level=3] [ref=e163]
          - list [ref=e164]:
            - listitem [ref=e165]:
              - link "Hébergements Premium" [ref=e166] [cursor=pointer]:
                - /url: /hotels
                - img [ref=e167]
                - text: Hébergements Premium
            - listitem [ref=e169]:
              - link "Vols Première Classe" [ref=e170] [cursor=pointer]:
                - /url: /flights
                - img [ref=e171]
                - text: Vols Première Classe
            - listitem [ref=e173]:
              - link "Location de Voitures" [ref=e174] [cursor=pointer]:
                - /url: /cars
                - img [ref=e175]
                - text: Location de Voitures
            - listitem [ref=e177]:
              - link "Safaris & Tours" [ref=e178] [cursor=pointer]:
                - /url: /activities
                - img [ref=e179]
                - text: Safaris & Tours
            - listitem [ref=e181]:
              - link "Croisières Côtières" [ref=e182] [cursor=pointer]:
                - /url: /cruises
                - img [ref=e183]
                - text: Croisières Côtières
            - listitem [ref=e185]:
              - link "Forfaits" [ref=e186] [cursor=pointer]:
                - /url: /packages
                - img [ref=e187]
                - text: Forfaits
        - generic [ref=e189]:
          - heading "À propos" [level=3] [ref=e190]
          - list [ref=e191]:
            - listitem [ref=e192]:
              - link "Qui nous sommes" [ref=e193] [cursor=pointer]:
                - /url: /about/who-we-are
                - img [ref=e194]
                - text: Qui nous sommes
            - listitem [ref=e196]:
              - link "Notre histoire" [ref=e197] [cursor=pointer]:
                - /url: /about/our-history
                - img [ref=e198]
                - text: Notre histoire
            - listitem [ref=e200]:
              - link "Notre équipe" [ref=e201] [cursor=pointer]:
                - /url: /about/team
                - img [ref=e202]
                - text: Notre équipe
            - listitem [ref=e204]:
              - link "Comment nous travaillons" [ref=e205] [cursor=pointer]:
                - /url: /about/how-we-work
                - img [ref=e206]
                - text: Comment nous travaillons
            - listitem [ref=e208]:
              - link "Notre gouvernance" [ref=e209] [cursor=pointer]:
                - /url: /about/governance
                - img [ref=e210]
                - text: Notre gouvernance
            - listitem [ref=e212]:
              - link "Rapports et finances" [ref=e213] [cursor=pointer]:
                - /url: /about/reports
                - img [ref=e214]
                - text: Rapports et finances
            - listitem [ref=e216]:
              - link "Responsabilité" [ref=e217] [cursor=pointer]:
                - /url: /about/responsibility
                - img [ref=e218]
                - text: Responsabilité
            - listitem [ref=e220]:
              - link "Médias & ressources" [ref=e221] [cursor=pointer]:
                - /url: /about/media-resources
                - img [ref=e222]
                - text: Médias & ressources
            - listitem [ref=e224]:
              - link "Nous contacter" [ref=e225] [cursor=pointer]:
                - /url: /about/contact
                - img [ref=e226]
                - text: Nous contacter
        - generic [ref=e228]:
          - heading "Newsletter" [level=3] [ref=e229]
          - paragraph [ref=e230]: Inspiration, idées de voyages, bons plans et actualités.
          - generic [ref=e231]:
            - textbox "Adresse email" [ref=e232]
            - button "OK" [ref=e233] [cursor=pointer]
        - generic [ref=e234]:
          - heading "Contact" [level=3] [ref=e235]:
            - link "Contact" [ref=e236] [cursor=pointer]:
              - /url: /about/contact
          - generic [ref=e237]:
            - generic [ref=e238]:
              - img [ref=e239]
              - generic [ref=e241]: "+243975579097"
            - generic [ref=e242]:
              - img [ref=e243]
              - link "support@africatourismgate.org" [ref=e245] [cursor=pointer]:
                - /url: mailto:support@africatourismgate.org
            - generic [ref=e246]:
              - img [ref=e247]
              - generic [ref=e250]: Kinshasa, RD Congo
          - generic [ref=e251]:
            - link "Facebook" [ref=e252] [cursor=pointer]:
              - /url: https://www.facebook.com/africatourismgate
              - img [ref=e254]
            - link "X / Twitter" [ref=e256] [cursor=pointer]:
              - /url: https://x.com/Congotourismga1
              - img [ref=e258]
            - link "Instagram" [ref=e260] [cursor=pointer]:
              - /url: https://www.instagram.com/africatourismgate
              - img [ref=e262]
      - generic [ref=e265]:
        - paragraph [ref=e266]:
          - text: © 2026 Africa Tourism Gate|
          - link "Politique de Confidentialité" [ref=e267] [cursor=pointer]:
            - /url: /legal/privacy
          - text: "|"
          - link "Conditions d'utilisation" [ref=e268] [cursor=pointer]:
            - /url: /legal/terms
          - text: "|"
          - link "À propos" [ref=e269] [cursor=pointer]:
            - /url: /about/who-we-are
          - text: "|"
          - link "FAQ" [ref=e270] [cursor=pointer]:
            - /url: /support
          - text: "|"
          - link "Contact" [ref=e271] [cursor=pointer]:
            - /url: /about/contact
          - text: "|"
          - link "GAP" [ref=e272] [cursor=pointer]:
            - /url: http://localhost:3004
        - paragraph [ref=e273]:
          - text: Conçu par
          - strong [ref=e274]: Carin Siwa et Ruth Bwiza
  - alert [ref=e275]
  - generic "Notifications"
```

# Test source

```ts
  51  |       JSON.stringify({
  52  |         accessToken: 'e2e-token',
  53  |         refreshToken: 'e2e-refresh-token',
  54  |         expiresAt: Date.now() + 60 * 60 * 1000,
  55  |         user: {
  56  |           id: 'user-e2e',
  57  |           email: 'client.e2e@example.com',
  58  |           firstName: 'Client',
  59  |           lastName: 'E2E',
  60  |           organizationId: null,
  61  |           status: 'active',
  62  |         },
  63  |       }),
  64  |     );
  65  |   });
  66  | 
  67  |   await page.route(`**/api/public/flights/${FLIGHT_ID}**`, async (route) => {
  68  |     await route.fulfill({
  69  |       status: 200,
  70  |       contentType: 'application/json',
  71  |       body: JSON.stringify(flightDetailMock),
  72  |     });
  73  |   });
  74  | 
  75  |   let postedItems: unknown = null;
  76  | 
  77  |   await page.route('**/api/bookings', async (route) => {
  78  |     if (route.request().method() !== 'POST') {
  79  |       await route.continue();
  80  |       return;
  81  |     }
  82  | 
  83  |     postedItems = route.request().postDataJSON();
  84  | 
  85  |     await route.fulfill({
  86  |       status: 201,
  87  |       contentType: 'application/json',
  88  |       body: JSON.stringify({
  89  |         booking: {
  90  |           id: BOOKING_ID,
  91  |           userId: 'user-e2e',
  92  |           status: 'pending_payment',
  93  |           preferredPaymentMethod: 'stripe',
  94  |           totalCents: TOTAL_CENTS,
  95  |           currency: 'USD',
  96  |           promoCodeId: null,
  97  |           createdAt: new Date().toISOString(),
  98  |           updatedAt: null,
  99  |         },
  100 |         items: [],
  101 |         totalCents: TOTAL_CENTS,
  102 |         currency: 'USD',
  103 |       }),
  104 |     });
  105 |   });
  106 | 
  107 |   await page.route(`**/api/bookings/${BOOKING_ID}/checkout-session`, async (route) => {
  108 |     await route.fulfill({
  109 |       status: 201,
  110 |       contentType: 'application/json',
  111 |       body: JSON.stringify({
  112 |         paymentId: 'payment-e2e-flight',
  113 |         sessionId: 'cs_test_e2e_flight',
  114 |         url: `http://127.0.0.1:3002/booking/success?booking_id=${BOOKING_ID}`,
  115 |         amountCents: TOTAL_CENTS,
  116 |         currency: 'USD',
  117 |       }),
  118 |     });
  119 |   });
  120 | 
  121 |   await page.route(`**/api/bookings/${BOOKING_ID}`, async (route) => {
  122 |     await route.fulfill({
  123 |       status: 200,
  124 |       contentType: 'application/json',
  125 |       body: JSON.stringify({
  126 |         booking: {
  127 |           id: BOOKING_ID,
  128 |           userId: 'user-e2e',
  129 |           status: 'confirmed',
  130 |           preferredPaymentMethod: 'stripe',
  131 |           totalCents: TOTAL_CENTS,
  132 |           currency: 'USD',
  133 |           promoCodeId: null,
  134 |           createdAt: new Date().toISOString(),
  135 |           updatedAt: null,
  136 |         },
  137 |         items: [],
  138 |         totalCents: TOTAL_CENTS,
  139 |         currency: 'USD',
  140 |       }),
  141 |     });
  142 |   });
  143 | 
  144 |   await page.goto(
  145 |     `/flights/${FLIGHT_ID}?from=FIH&to=NBO&departureDate=2026-08-01&passengers=2`,
  146 |   );
  147 | 
  148 |   await expect(page.getByRole('heading', { name: 'KQ550' })).toBeVisible();
  149 | 
  150 |   await page.getByRole('button', { name: /choisir cette classe|select this class/i }).click();
> 151 |   await page.locator('button:visible', { hasText: /r[ée]server|book now/i }).first().click();
      |                                                                                      ^ Error: locator.click: Test timeout of 60000ms exceeded.
  152 |   await expect(page).toHaveURL(/\/booking\/cart\?.*kind=flight_class/);
  153 |   await expect(page.getByText('KQ550')).toBeVisible();
  154 | 
  155 |   await page.goto(
  156 |     `/booking/recap?kind=flight_class&flightId=${FLIGHT_ID}&flightClassId=${FLIGHT_CLASS_ECO}&departureDate=2026-08-01&passengers=2`,
  157 |   );
  158 |   await expect(page.getByRole('heading', { name: /recapitulatif/i })).toBeVisible();
  159 |   await expect(page.getByText('KQ550')).toBeVisible();
  160 | 
  161 |   await mockManifestApi(page);
  162 |   await page.locator('input[name="preferredPaymentMethod"][value="stripe"]').check();
  163 |   await fillCheckoutManifest(page);
  164 |   await expect(page.getByRole('button', { name: /payer avec stripe|pay with stripe|pagar con stripe/i })).toBeEnabled();
  165 |   await page.getByRole('button', { name: /payer avec stripe|pay with stripe|pagar con stripe/i }).click();
  166 |   await expect(page).toHaveURL(new RegExp(`/booking/success\\?booking_id=${BOOKING_ID}`), {
  167 |     timeout: 15_000,
  168 |   });
  169 | 
  170 |   expect(postedItems).toEqual({
  171 |     preferredPaymentMethod: 'stripe',
  172 |     items: [
  173 |       {
  174 |         itemType: 'flight_class',
  175 |         referenceId: FLIGHT_CLASS_ECO,
  176 |         quantity: 2,
  177 |         date: '2026-08-01',
  178 |       },
  179 |     ],
  180 |   });
  181 | 
  182 |   await expect(page.getByText(/reservation confirmee/i)).toBeVisible();
  183 |   await expect(page.getByText(/booking id:/i)).toBeVisible();
  184 | });
  185 | 
```