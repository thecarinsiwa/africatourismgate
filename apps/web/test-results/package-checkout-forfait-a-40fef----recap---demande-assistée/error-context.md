# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: package-checkout.spec.ts >> forfait activités: réserver sans créneaux, panier -> recap -> demande assistée
- Location: tests\e2e\package-checkout.spec.ts:54:5

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: locator.click: Test timeout of 60000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /voir le r[ée]cap|view summary|ver resumen/i })

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
      - generic [ref=e71]: /
      - link "Forfaits" [ref=e72] [cursor=pointer]:
        - /url: /packages
      - generic [ref=e73]: /
      - generic [ref=e74]: Kinshasa Activities Duo
    - generic [ref=e76]:
      - generic [ref=e77]:
        - banner [ref=e78]:
          - paragraph [ref=e79]: Forfait combiné
          - heading "Kinshasa Activities Duo" [level=1] [ref=e80]
          - paragraph [ref=e81]: Two guided experiences in Kinshasa at a bundled discount.
        - navigation "?tapes de composition du forfait" [ref=e82]:
          - list [ref=e83]:
            - listitem [ref=e84]:
              - generic [ref=e85]: ✓
              - paragraph [ref=e87]: Aper?u des prestations
            - listitem [ref=e89]:
              - generic [ref=e90]: "2"
              - generic [ref=e91]:
                - paragraph [ref=e92]: R?server
                - paragraph [ref=e93]: Dates et voyageurs renseign?s
            - listitem [ref=e95]:
              - generic [ref=e96]: "3"
              - paragraph [ref=e98]: R?capitulatif
        - generic [ref=e99]:
          - generic [ref=e100]:
            - heading "Réserver le forfait" [level=2] [ref=e101]
            - paragraph [ref=e102]: Choisissez la date de départ et le nombre de voyageurs. Les créneaux horaires seront confirmés par notre équipe après votre demande.
          - generic [ref=e103]:
            - generic [ref=e104]:
              - generic [ref=e105]: Date de départ
              - textbox "Date de départ" [ref=e106]: 2026-08-01
            - generic [ref=e107]:
              - generic [ref=e108]: Voyageurs
              - spinbutton "Voyageurs" [ref=e109]: "4"
            - generic [ref=e110]:
              - paragraph [ref=e111]: Date de retour
              - paragraph [ref=e112]: 2 août 2026 · 1 jour(s)
          - generic [ref=e113]:
            - heading "Prestations incluses" [level=3] [ref=e114]
            - generic [ref=e115]:
              - heading "Prestations incluses" [level=2] [ref=e116]
              - list [ref=e117]:
                - listitem [ref=e118]:
                  - generic [ref=e119]:
                    - paragraph [ref=e120]: Activit?
                    - paragraph [ref=e121]: Gombe City Tour
                  - generic [ref=e122]:
                    - paragraph [ref=e123]: $45
                    - button "Voir la fiche" [ref=e124] [cursor=pointer]
                - listitem [ref=e125]:
                  - generic [ref=e126]:
                    - paragraph [ref=e127]: Activit?
                    - paragraph [ref=e128]: Congo River Walk
                  - generic [ref=e129]:
                    - paragraph [ref=e130]: $35
                    - button "Voir la fiche" [ref=e131] [cursor=pointer]
            - paragraph [ref=e132]: Les horaires précis seront attribués après validation de votre demande par notre équipe.
          - generic [ref=e133]:
            - button "Retour" [ref=e134] [cursor=pointer]
            - button "Voir le r?capitulatif" [ref=e135] [cursor=pointer]
      - complementary [ref=e136]:
        - generic [ref=e137]:
          - heading "Tarif du forfait" [level=2] [ref=e138]
          - generic [ref=e139]:
            - paragraph [ref=e140]: Prix forfait
            - generic [ref=e141]:
              - paragraph [ref=e142]: $320
              - paragraph [ref=e143]: $272
              - generic [ref=e144]: "-15 %"
          - paragraph [ref=e145]: Vous économisez 48 USD
          - generic [ref=e146]:
            - paragraph [ref=e147]:
              - generic [ref=e148]: "Date de départ:"
              - text: 1 août 2026
            - paragraph [ref=e149]:
              - generic [ref=e150]: "Date de retour:"
              - text: 2 août 2026
            - paragraph [ref=e151]:
              - generic [ref=e152]: "Voyageurs:"
              - text: "4"
            - paragraph [ref=e153]: 1 jour(s)
          - button "Ajouter au panier" [disabled] [ref=e154]
          - list [ref=e155]:
            - listitem [ref=e156]:
              - generic [ref=e157]: ✓
              - generic [ref=e158]: Tarifs indicatifs — la réservation en ligne arrive bientôt.
            - listitem [ref=e159]:
              - generic [ref=e160]: ✓
              - generic [ref=e161]: Montant affiché sans frais cachés.
            - listitem [ref=e162]:
              - generic [ref=e163]: ✓
              - generic [ref=e164]: Une question ? Notre équipe vous accompagne.
    - contentinfo [ref=e165]:
      - generic [ref=e168]:
        - generic [ref=e169]:
          - link "Africa Tourism Gate Africa Tourism Gate" [ref=e170] [cursor=pointer]:
            - /url: /
            - img "Africa Tourism Gate" [ref=e171]
            - generic [ref=e172]: Africa Tourism Gate
          - paragraph [ref=e173]: Votre passerelle vers les meilleures expériences de voyage en Afrique. Découvrez des destinations uniques et réservez en toute confiance.
          - link "En savoir plus" [ref=e174] [cursor=pointer]:
            - /url: /about/who-we-are
        - generic [ref=e175]:
          - heading "Nos Produits" [level=3] [ref=e176]
          - list [ref=e177]:
            - listitem [ref=e178]:
              - link "Hébergements Premium" [ref=e179] [cursor=pointer]:
                - /url: /hotels
                - img [ref=e180]
                - text: Hébergements Premium
            - listitem [ref=e182]:
              - link "Vols Première Classe" [ref=e183] [cursor=pointer]:
                - /url: /flights
                - img [ref=e184]
                - text: Vols Première Classe
            - listitem [ref=e186]:
              - link "Location de Voitures" [ref=e187] [cursor=pointer]:
                - /url: /cars
                - img [ref=e188]
                - text: Location de Voitures
            - listitem [ref=e190]:
              - link "Safaris & Tours" [ref=e191] [cursor=pointer]:
                - /url: /activities
                - img [ref=e192]
                - text: Safaris & Tours
            - listitem [ref=e194]:
              - link "Croisières Côtières" [ref=e195] [cursor=pointer]:
                - /url: /cruises
                - img [ref=e196]
                - text: Croisières Côtières
            - listitem [ref=e198]:
              - link "Forfaits" [ref=e199] [cursor=pointer]:
                - /url: /packages
                - img [ref=e200]
                - text: Forfaits
        - generic [ref=e202]:
          - heading "À propos" [level=3] [ref=e203]
          - list [ref=e204]:
            - listitem [ref=e205]:
              - link "Qui nous sommes" [ref=e206] [cursor=pointer]:
                - /url: /about/who-we-are
                - img [ref=e207]
                - text: Qui nous sommes
            - listitem [ref=e209]:
              - link "Notre histoire" [ref=e210] [cursor=pointer]:
                - /url: /about/our-history
                - img [ref=e211]
                - text: Notre histoire
            - listitem [ref=e213]:
              - link "Notre équipe" [ref=e214] [cursor=pointer]:
                - /url: /about/team
                - img [ref=e215]
                - text: Notre équipe
            - listitem [ref=e217]:
              - link "Comment nous travaillons" [ref=e218] [cursor=pointer]:
                - /url: /about/how-we-work
                - img [ref=e219]
                - text: Comment nous travaillons
            - listitem [ref=e221]:
              - link "Notre gouvernance" [ref=e222] [cursor=pointer]:
                - /url: /about/governance
                - img [ref=e223]
                - text: Notre gouvernance
            - listitem [ref=e225]:
              - link "Rapports et finances" [ref=e226] [cursor=pointer]:
                - /url: /about/reports
                - img [ref=e227]
                - text: Rapports et finances
            - listitem [ref=e229]:
              - link "Responsabilité" [ref=e230] [cursor=pointer]:
                - /url: /about/responsibility
                - img [ref=e231]
                - text: Responsabilité
            - listitem [ref=e233]:
              - link "Médias & ressources" [ref=e234] [cursor=pointer]:
                - /url: /about/media-resources
                - img [ref=e235]
                - text: Médias & ressources
            - listitem [ref=e237]:
              - link "Nous contacter" [ref=e238] [cursor=pointer]:
                - /url: /about/contact
                - img [ref=e239]
                - text: Nous contacter
        - generic [ref=e241]:
          - heading "Newsletter" [level=3] [ref=e242]
          - paragraph [ref=e243]: Inspiration, idées de voyages, bons plans et actualités.
          - generic [ref=e244]:
            - textbox "Adresse email" [ref=e245]
            - button "OK" [ref=e246] [cursor=pointer]
        - generic [ref=e247]:
          - heading "Contact" [level=3] [ref=e248]:
            - link "Contact" [ref=e249] [cursor=pointer]:
              - /url: /about/contact
          - generic [ref=e250]:
            - generic [ref=e251]:
              - img [ref=e252]
              - generic [ref=e254]: "+243975579097"
            - generic [ref=e255]:
              - img [ref=e256]
              - link "support@africatourismgate.org" [ref=e258] [cursor=pointer]:
                - /url: mailto:support@africatourismgate.org
            - generic [ref=e259]:
              - img [ref=e260]
              - generic [ref=e263]: Kinshasa, RD Congo
          - generic [ref=e264]:
            - link "Facebook" [ref=e265] [cursor=pointer]:
              - /url: https://www.facebook.com/africatourismgate
              - img [ref=e267]
            - link "X / Twitter" [ref=e269] [cursor=pointer]:
              - /url: https://x.com/Congotourismga1
              - img [ref=e271]
            - link "Instagram" [ref=e273] [cursor=pointer]:
              - /url: https://www.instagram.com/africatourismgate
              - img [ref=e275]
      - generic [ref=e278]:
        - paragraph [ref=e279]:
          - text: © 2026 Africa Tourism Gate|
          - link "Politique de Confidentialité" [ref=e280] [cursor=pointer]:
            - /url: /legal/privacy
          - text: "|"
          - link "Conditions d'utilisation" [ref=e281] [cursor=pointer]:
            - /url: /legal/terms
          - text: "|"
          - link "À propos" [ref=e282] [cursor=pointer]:
            - /url: /about/who-we-are
          - text: "|"
          - link "FAQ" [ref=e283] [cursor=pointer]:
            - /url: /support
          - text: "|"
          - link "Contact" [ref=e284] [cursor=pointer]:
            - /url: /about/contact
          - text: "|"
          - link "GAP" [ref=e285] [cursor=pointer]:
            - /url: http://localhost:3004
        - paragraph [ref=e286]:
          - text: Conçu par
          - strong [ref=e287]: Carin Siwa et Ruth Bwiza
  - alert [ref=e288]
  - generic "Notifications"
```

# Test source

```ts
  42  |     },
  43  |   ],
  44  |   pricing: {
  45  |     subtotalCents: UNIT_PRICE_A + UNIT_PRICE_B,
  46  |     discountPercent: DISCOUNT_PERCENT,
  47  |     discountAmountCents: Math.round(((UNIT_PRICE_A + UNIT_PRICE_B) * DISCOUNT_PERCENT) / 100),
  48  |     totalCents: PER_TRAVELER_TOTAL,
  49  |     currency: 'USD',
  50  |   },
  51  |   images: [],
  52  | };
  53  | 
  54  | test('forfait activités: réserver sans créneaux, panier -> recap -> demande assistée', async ({
  55  |   page,
  56  | }) => {
  57  |   test.setTimeout(60_000);
  58  | 
  59  |   await page.addInitScript(() => {
  60  |     window.sessionStorage.setItem(
  61  |       'atg.web.session',
  62  |       JSON.stringify({
  63  |         accessToken: 'e2e-token',
  64  |         refreshToken: 'e2e-refresh-token',
  65  |         expiresAt: Date.now() + 60 * 60 * 1000,
  66  |         user: {
  67  |           id: 'user-e2e',
  68  |           email: 'client.e2e@example.com',
  69  |           firstName: 'Client',
  70  |           lastName: 'E2E',
  71  |           organizationId: null,
  72  |           status: 'active',
  73  |         },
  74  |       }),
  75  |     );
  76  |   });
  77  | 
  78  |   await page.route(`**/api/public/packages/${PACKAGE_ID}**`, async (route) => {
  79  |     await route.fulfill({
  80  |       status: 200,
  81  |       contentType: 'application/json',
  82  |       body: JSON.stringify(packageDetailMock),
  83  |     });
  84  |   });
  85  | 
  86  |   let postedCheckout: unknown = null;
  87  | 
  88  |   await page.route('**/api/bookings/request', async (route) => {
  89  |     if (route.request().method() !== 'POST') {
  90  |       await route.continue();
  91  |       return;
  92  |     }
  93  | 
  94  |     postedCheckout = route.request().postDataJSON();
  95  | 
  96  |     await route.fulfill({
  97  |       status: 201,
  98  |       contentType: 'application/json',
  99  |       body: JSON.stringify({
  100 |         bookingId: BOOKING_ID,
  101 |         status: 'pending_approval',
  102 |         message: 'Booking request submitted',
  103 |         totalCents: TOTAL_CENTS,
  104 |         currency: 'USD',
  105 |       }),
  106 |     });
  107 |   });
  108 | 
  109 |   await page.route(`**/api/bookings/${BOOKING_ID}`, async (route) => {
  110 |     await route.fulfill({
  111 |       status: 200,
  112 |       contentType: 'application/json',
  113 |       body: JSON.stringify({
  114 |         booking: {
  115 |           id: BOOKING_ID,
  116 |           userId: 'user-e2e',
  117 |           status: 'pending_approval',
  118 |           totalCents: TOTAL_CENTS,
  119 |           currency: 'USD',
  120 |           promoCodeId: null,
  121 |           createdAt: new Date().toISOString(),
  122 |           updatedAt: null,
  123 |         },
  124 |         items: [],
  125 |         totalCents: TOTAL_CENTS,
  126 |         currency: 'USD',
  127 |       }),
  128 |     });
  129 |   });
  130 | 
  131 |   await mockManifestApi(page);
  132 | 
  133 |   await page.goto(
  134 |     `/packages/${PACKAGE_ID}?startDate=${DATE}&travelers=${TRAVELERS}#configure`,
  135 |   );
  136 | 
  137 |   await expect(page.getByRole('heading', { name: 'Kinshasa Activities Duo' })).toBeVisible();
  138 |   await expect(page.getByText('Gombe City Tour')).toBeVisible();
  139 |   await expect(page.getByText('Congo River Walk')).toBeVisible();
  140 |   await expect(page.getByText(/aucun cr|no time slots|sin horarios/i)).not.toBeVisible();
  141 | 
> 142 |   await page.getByRole('button', { name: /voir le r[ée]cap|view summary|ver resumen/i }).click();
      |                                                                                          ^ Error: locator.click: Test timeout of 60000ms exceeded.
  143 |   await expect(
  144 |     page.getByRole('heading', { name: /r[ée]capitulatif du forfait|package summary|resumen del paquete/i }),
  145 |   ).toBeVisible();
  146 | 
  147 |   await page.getByRole('button', { name: /ajouter au panier|add to cart|a[ñn]adir al carrito/i }).click();
  148 | 
  149 |   await expect(page).toHaveURL(/\/booking\/cart\?.*kind=package/);
  150 |   await expect(page.getByText('Kinshasa Activities Duo')).toBeVisible();
  151 |   await expect(page.getByText('Gombe City Tour')).toBeVisible();
  152 |   await expect(page.getByText('Congo River Walk')).toBeVisible();
  153 | 
  154 |   await page.getByRole('link', { name: /continuer vers r[ée]cap/i }).click();
  155 |   await expect(page).toHaveURL(/\/booking\/recap\?.*kind=package/);
  156 |   await expect(page.getByRole('heading', { name: /recapitulatif/i })).toBeVisible();
  157 | 
  158 |   await page.locator('input[name="preferredPaymentMethod"][value="stripe"]').check();
  159 |   await fillCheckoutManifest(page);
  160 | 
  161 |   await expect(
  162 |     page.getByRole('button', { name: /demander une r[ée]servation|request a booking|solicitar una reserva/i }),
  163 |   ).toBeEnabled();
  164 |   await page
  165 |     .getByRole('button', { name: /demander une r[ée]servation|request a booking|solicitar una reserva/i })
  166 |     .click();
  167 |   await expect(page).toHaveURL(new RegExp(`/booking/request-success\\?booking_id=${BOOKING_ID}`), {
  168 |     timeout: 15_000,
  169 |   });
  170 | 
  171 |   expect(postedCheckout).toEqual({
  172 |     preferredPaymentMethod: 'stripe',
  173 |     packageId: PACKAGE_ID,
  174 |     items: [
  175 |       {
  176 |         itemType: 'package',
  177 |         referenceId: PACKAGE_ID,
  178 |         quantity: TRAVELERS,
  179 |         startDate: DATE,
  180 |         endDate: END_DATE,
  181 |       },
  182 |     ],
  183 |   });
  184 | 
  185 |   await expect(page.getByText(/demande envoy[ée]e|request submitted|solicitud enviada/i)).toBeVisible();
  186 |   await expect(page.getByText(/r[ée]f\. demande|request ref|ref\. solicitud/i)).toBeVisible();
  187 | });
  188 | 
```