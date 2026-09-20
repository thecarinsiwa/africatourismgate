# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: customer-account.spec.ts >> profile form submits PATCH /auth/me
- Location: tests\e2e\customer-account.spec.ts:70:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input').nth(1)
    - locator resolved to <input disabled readonly id="profile-email" value="client.e2e@example.com" class="w-full rounded-lg border bg-atg-elevated px-4 py-3 text-sm text-atg-fg placeholder:text-atg-muted/70 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary border-atg-border"/>
    - fill("Updated")
  - attempting fill action
    - waiting for element to be visible, enabled and editable
    - element is not enabled
  - retrying fill action
    - waiting for element to be visible, enabled and editable
  - element was detached from the DOM, retrying
    - locator resolved to <input disabled readonly id="profile-email" value="client.e2e@example.com" class="w-full rounded-lg border bg-atg-elevated px-4 py-3 text-sm text-atg-fg placeholder:text-atg-muted/70 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary border-atg-border"/>
    - fill("Updated")
  - attempting fill action
    2 × waiting for element to be visible, enabled and editable
      - element is not enabled
    - retrying fill action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and editable
      - element is not enabled
    - retrying fill action
      - waiting 100ms
    50 × waiting for element to be visible, enabled and editable
       - element is not enabled
     - retrying fill action
       - waiting 500ms
    - waiting for element to be visible, enabled and editable

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
    - main [ref=e67]:
      - generic [ref=e70]:
        - navigation "Breadcrumb" [ref=e72]:
          - link "Accueil" [ref=e73] [cursor=pointer]:
            - /url: /
          - generic [ref=e74]: /
          - link "Mon compte" [ref=e75] [cursor=pointer]:
            - /url: /account/profile
        - heading "Mon compte" [level=1] [ref=e76]
        - paragraph [ref=e78]: Gérez votre profil, vos adresses et vos réservations.
      - generic [ref=e80]:
        - complementary [ref=e81]:
          - navigation "Navigation du compte" [ref=e82]:
            - list [ref=e83]:
              - listitem [ref=e84]:
                - link "Profil" [ref=e85] [cursor=pointer]:
                  - /url: /account/profile
                  - img [ref=e86]
                  - generic [ref=e88]: Profil
              - listitem [ref=e89]:
                - link "Adresses" [ref=e90] [cursor=pointer]:
                  - /url: /account/addresses
                  - img [ref=e91]
                  - generic [ref=e94]: Adresses
              - listitem [ref=e95]:
                - link "Réservations" [ref=e96] [cursor=pointer]:
                  - /url: /account/reservations
                  - img [ref=e97]
                  - generic [ref=e99]: Réservations
              - listitem [ref=e100]:
                - link "Fidélité OneKey" [ref=e101] [cursor=pointer]:
                  - /url: /account/loyalty
                  - img [ref=e102]
                  - generic [ref=e104]: Fidélité OneKey
              - listitem [ref=e105]:
                - link "Moyens de paiement" [ref=e106] [cursor=pointer]:
                  - /url: /account/payment-methods
                  - img [ref=e107]
                  - generic [ref=e109]: Moyens de paiement
            - link "Explorer les hébergements" [ref=e111] [cursor=pointer]:
              - /url: /hotels
              - img [ref=e112]
              - generic [ref=e114]: Explorer les hébergements
        - generic [ref=e116]:
          - heading "Profil" [level=2] [ref=e117]
          - generic [ref=e118]:
            - generic [ref=e119]:
              - generic [ref=e120]:
                - generic [ref=e122]: CE
                - generic [ref=e123]:
                  - paragraph [ref=e124]: Client E2E
                  - paragraph [ref=e125]: client.e2e@example.com
                  - generic [ref=e127]: Compte actif
              - generic [ref=e128]:
                - paragraph [ref=e129]: Identifiant client
                - paragraph [ref=e130]: user-e2e-account
            - generic [ref=e131]:
              - heading "Photo de profil" [level=3] [ref=e132]
              - paragraph [ref=e133]: JPEG, PNG ou WebP — 5 Mo max.
              - generic [ref=e134]:
                - button "Choose File" [ref=e135]
                - button "Ajouter une photo" [ref=e136] [cursor=pointer]:
                  - generic [ref=e137]: Ajouter une photo
            - generic [ref=e138]:
              - generic [ref=e139]:
                - heading "Informations personnelles" [level=3] [ref=e140]
                - paragraph [ref=e141]: Vos coordonnées utilisées pour les réservations.
                - generic [ref=e142]:
                  - generic [ref=e143]:
                    - generic [ref=e144]: E-mail
                    - textbox "E-mail" [disabled] [ref=e147]: client.e2e@example.com
                    - paragraph [ref=e148]: L'adresse e-mail ne peut pas être modifiée ici.
                  - generic [ref=e149]:
                    - generic [ref=e150]: Prénom
                    - textbox "Prénom" [ref=e153]: Client
                  - generic [ref=e154]:
                    - generic [ref=e155]: Nom
                    - textbox "Nom" [ref=e158]: E2E
                  - generic [ref=e159]:
                    - generic [ref=e160]: Téléphone
                    - textbox "Téléphone" [ref=e163]:
                      - /placeholder: +243 800 000 000
              - generic [ref=e164]:
                - heading "Préférences" [level=3] [ref=e165]
                - paragraph [ref=e166]: Langue d'affichage du site et des communications.
                - generic [ref=e167]:
                  - generic [ref=e168]: Langue préférée
                  - combobox "Langue préférée" [ref=e169]:
                    - option "Français" [selected]
                    - option "English"
                    - option "Español"
              - button "Enregistrer" [disabled] [ref=e171]:
                - generic [ref=e172]: Enregistrer
    - contentinfo [ref=e173]:
      - generic [ref=e176]:
        - generic [ref=e177]:
          - link "Africa Tourism Gate Africa Tourism Gate" [ref=e178] [cursor=pointer]:
            - /url: /
            - img "Africa Tourism Gate" [ref=e179]
            - generic [ref=e180]: Africa Tourism Gate
          - paragraph [ref=e181]: Votre passerelle vers les meilleures expériences de voyage en Afrique. Découvrez des destinations uniques et réservez en toute confiance.
          - link "En savoir plus" [ref=e182] [cursor=pointer]:
            - /url: /about/who-we-are
        - generic [ref=e183]:
          - heading "Nos Produits" [level=3] [ref=e184]
          - list [ref=e185]:
            - listitem [ref=e186]:
              - link "Hébergements Premium" [ref=e187] [cursor=pointer]:
                - /url: /hotels
                - img [ref=e188]
                - text: Hébergements Premium
            - listitem [ref=e190]:
              - link "Vols Première Classe" [ref=e191] [cursor=pointer]:
                - /url: /flights
                - img [ref=e192]
                - text: Vols Première Classe
            - listitem [ref=e194]:
              - link "Location de Voitures" [ref=e195] [cursor=pointer]:
                - /url: /cars
                - img [ref=e196]
                - text: Location de Voitures
            - listitem [ref=e198]:
              - link "Safaris & Tours" [ref=e199] [cursor=pointer]:
                - /url: /activities
                - img [ref=e200]
                - text: Safaris & Tours
            - listitem [ref=e202]:
              - link "Croisières Côtières" [ref=e203] [cursor=pointer]:
                - /url: /cruises
                - img [ref=e204]
                - text: Croisières Côtières
            - listitem [ref=e206]:
              - link "Forfaits" [ref=e207] [cursor=pointer]:
                - /url: /packages
                - img [ref=e208]
                - text: Forfaits
        - generic [ref=e210]:
          - heading "À propos" [level=3] [ref=e211]
          - list [ref=e212]:
            - listitem [ref=e213]:
              - link "Qui nous sommes" [ref=e214] [cursor=pointer]:
                - /url: /about/who-we-are
                - img [ref=e215]
                - text: Qui nous sommes
            - listitem [ref=e217]:
              - link "Notre histoire" [ref=e218] [cursor=pointer]:
                - /url: /about/our-history
                - img [ref=e219]
                - text: Notre histoire
            - listitem [ref=e221]:
              - link "Notre équipe" [ref=e222] [cursor=pointer]:
                - /url: /about/team
                - img [ref=e223]
                - text: Notre équipe
            - listitem [ref=e225]:
              - link "Comment nous travaillons" [ref=e226] [cursor=pointer]:
                - /url: /about/how-we-work
                - img [ref=e227]
                - text: Comment nous travaillons
            - listitem [ref=e229]:
              - link "Notre gouvernance" [ref=e230] [cursor=pointer]:
                - /url: /about/governance
                - img [ref=e231]
                - text: Notre gouvernance
            - listitem [ref=e233]:
              - link "Rapports et finances" [ref=e234] [cursor=pointer]:
                - /url: /about/reports
                - img [ref=e235]
                - text: Rapports et finances
            - listitem [ref=e237]:
              - link "Responsabilité" [ref=e238] [cursor=pointer]:
                - /url: /about/responsibility
                - img [ref=e239]
                - text: Responsabilité
            - listitem [ref=e241]:
              - link "Médias & ressources" [ref=e242] [cursor=pointer]:
                - /url: /about/media-resources
                - img [ref=e243]
                - text: Médias & ressources
            - listitem [ref=e245]:
              - link "Nous contacter" [ref=e246] [cursor=pointer]:
                - /url: /about/contact
                - img [ref=e247]
                - text: Nous contacter
        - generic [ref=e249]:
          - heading "Newsletter" [level=3] [ref=e250]
          - paragraph [ref=e251]: Inspiration, idées de voyages, bons plans et actualités.
          - generic [ref=e252]:
            - textbox "Adresse email" [ref=e253]
            - button "OK" [ref=e254] [cursor=pointer]
        - generic [ref=e255]:
          - heading "Contact" [level=3] [ref=e256]:
            - link "Contact" [ref=e257] [cursor=pointer]:
              - /url: /about/contact
          - generic [ref=e258]:
            - generic [ref=e259]:
              - img [ref=e260]
              - generic [ref=e262]: "+243975579097"
            - generic [ref=e263]:
              - img [ref=e264]
              - link "support@africatourismgate.org" [ref=e266] [cursor=pointer]:
                - /url: mailto:support@africatourismgate.org
            - generic [ref=e267]:
              - img [ref=e268]
              - generic [ref=e271]: Kinshasa, RD Congo
          - generic [ref=e272]:
            - link "Facebook" [ref=e273] [cursor=pointer]:
              - /url: https://www.facebook.com/africatourismgate
              - img [ref=e275]
            - link "X / Twitter" [ref=e277] [cursor=pointer]:
              - /url: https://x.com/Congotourismga1
              - img [ref=e279]
            - link "Instagram" [ref=e281] [cursor=pointer]:
              - /url: https://www.instagram.com/africatourismgate
              - img [ref=e283]
      - generic [ref=e286]:
        - paragraph [ref=e287]:
          - text: © 2026 Africa Tourism Gate|
          - link "Politique de Confidentialité" [ref=e288] [cursor=pointer]:
            - /url: /legal/privacy
          - text: "|"
          - link "Conditions d'utilisation" [ref=e289] [cursor=pointer]:
            - /url: /legal/terms
          - text: "|"
          - link "À propos" [ref=e290] [cursor=pointer]:
            - /url: /about/who-we-are
          - text: "|"
          - link "FAQ" [ref=e291] [cursor=pointer]:
            - /url: /support
          - text: "|"
          - link "Contact" [ref=e292] [cursor=pointer]:
            - /url: /about/contact
          - text: "|"
          - link "GAP" [ref=e293] [cursor=pointer]:
            - /url: http://localhost:3004
        - paragraph [ref=e294]:
          - text: Conçu par
          - strong [ref=e295]: Carin Siwa et Ruth Bwiza
  - alert [ref=e296]
  - generic "Notifications"
```

# Test source

```ts
  18  |           organizationId: null,
  19  |           status: 'active',
  20  |         },
  21  |       }),
  22  |     );
  23  |   });
  24  | }
  25  | 
  26  | test('redirects to login when visiting /account without session', async ({ page }) => {
  27  |   await page.goto('/account/profile');
  28  |   await expect(page).toHaveURL(/\/booking\/login\?next=%2Faccount%2Fprofile/);
  29  | });
  30  | 
  31  | test('shows only current user bookings on /account/reservations', async ({ page }) => {
  32  |   await mockSession(page);
  33  | 
  34  |   await page.route('**/api/bookings**', async (route) => {
  35  |     if (route.request().method() !== 'GET') {
  36  |       await route.continue();
  37  |       return;
  38  |     }
  39  |     await route.fulfill({
  40  |       status: 200,
  41  |       contentType: 'application/json',
  42  |       body: JSON.stringify({
  43  |         data: [
  44  |           {
  45  |             id: 'booking-mine',
  46  |             userId: USER_ID,
  47  |             status: 'confirmed',
  48  |             totalCents: 120000,
  49  |             currency: 'USD',
  50  |             promoCodeId: null,
  51  |             createdAt: '2026-01-15T10:00:00.000Z',
  52  |             updatedAt: null,
  53  |             clientEmail: 'client.e2e@example.com',
  54  |             clientFirstName: 'Client',
  55  |             clientLastName: 'E2E',
  56  |             organizationId: null,
  57  |           },
  58  |         ],
  59  |         meta: { total: 1, page: 1, limit: 50, totalPages: 1 },
  60  |       }),
  61  |     });
  62  |   });
  63  | 
  64  |   await page.goto('/account/reservations');
  65  |   await expect(page.locator('tbody tr')).toHaveCount(1);
  66  |   await expect(page.getByText('1200.00')).toBeVisible();
  67  |   await expect(page.getByText(/Confirmée|Confirmed|Confirmada/i)).toBeVisible();
  68  | });
  69  | 
  70  | test('profile form submits PATCH /auth/me', async ({ page }) => {
  71  |   await mockSession(page);
  72  | 
  73  |   let patchCalled = false;
  74  |   await page.route('**/api/auth/me', async (route) => {
  75  |     if (route.request().method() === 'GET') {
  76  |       await route.fulfill({
  77  |         status: 200,
  78  |         contentType: 'application/json',
  79  |         body: JSON.stringify({
  80  |           user: {
  81  |             id: USER_ID,
  82  |             email: 'client.e2e@example.com',
  83  |             firstName: 'Client',
  84  |             lastName: 'E2E',
  85  |             phone: null,
  86  |             preferredLanguage: 'fr',
  87  |             organizationId: null,
  88  |             status: 'active',
  89  |           },
  90  |           permissions: ['bookings.read'],
  91  |           isSuperAdmin: false,
  92  |         }),
  93  |       });
  94  |       return;
  95  |     }
  96  |     if (route.request().method() === 'PATCH') {
  97  |       patchCalled = true;
  98  |       await route.fulfill({
  99  |         status: 200,
  100 |         contentType: 'application/json',
  101 |         body: JSON.stringify({
  102 |           id: USER_ID,
  103 |           email: 'client.e2e@example.com',
  104 |           firstName: 'Updated',
  105 |           lastName: 'E2E',
  106 |           phone: '+243800000000',
  107 |           preferredLanguage: 'fr',
  108 |           organizationId: null,
  109 |           status: 'active',
  110 |         }),
  111 |       });
  112 |       return;
  113 |     }
  114 |     await route.continue();
  115 |   });
  116 | 
  117 |   await page.goto('/account/profile');
> 118 |   await page.locator('input').nth(1).fill('Updated');
      |                                      ^ Error: locator.fill: Test timeout of 30000ms exceeded.
  119 |   await page.getByRole('button', { name: /Enregistrer|Save|Guardar/i }).click();
  120 |   await expect(page.getByText(/Profil mis à jour|Profile updated|Perfil actualizado/i)).toBeVisible();
  121 |   expect(patchCalled).toBe(true);
  122 | });
  123 | 
  124 | test('reservations table shows scoped booking rows only', async ({ page }) => {
  125 |   await mockSession(page);
  126 | 
  127 |   await page.route('**/api/bookings**', async (route) => {
  128 |     await route.fulfill({
  129 |       status: 200,
  130 |       contentType: 'application/json',
  131 |       body: JSON.stringify({
  132 |         data: [
  133 |           {
  134 |             id: 'aaaa1111-2222-3333-4444-555566667777',
  135 |             userId: USER_ID,
  136 |             status: 'pending_payment',
  137 |             totalCents: 50000,
  138 |             currency: 'USD',
  139 |             promoCodeId: null,
  140 |             createdAt: '2026-02-01T12:00:00.000Z',
  141 |             updatedAt: null,
  142 |             clientEmail: 'client.e2e@example.com',
  143 |             clientFirstName: 'Client',
  144 |             clientLastName: 'E2E',
  145 |             organizationId: null,
  146 |           },
  147 |         ],
  148 |         meta: { total: 1, page: 1, limit: 50, totalPages: 1 },
  149 |       }),
  150 |     });
  151 |   });
  152 | 
  153 |   await page.goto('/account/reservations');
  154 |   await expect(page.locator('tbody tr')).toHaveCount(1);
  155 |   await expect(page.getByText('aaaa1111')).toBeVisible();
  156 | });
  157 | 
  158 | test('logout clears session from both storages and redirects to login', async ({ page }) => {
  159 |   await mockSession(page);
  160 | 
  161 |   await page.route('**/api/auth/logout', async (route) => {
  162 |     await route.fulfill({
  163 |       status: 200,
  164 |       contentType: 'application/json',
  165 |       body: JSON.stringify({ success: true }),
  166 |     });
  167 |   });
  168 | 
  169 |   await page.goto('/booking/logout');
  170 |   await expect(page).toHaveURL(/\/booking\/login$/);
  171 | 
  172 |   const cleared = await page.evaluate(() => ({
  173 |     local: window.localStorage.getItem('atg.web.session'),
  174 |     session: window.sessionStorage.getItem('atg.web.session'),
  175 |   }));
  176 |   expect(cleared.local).toBeNull();
  177 |   expect(cleared.session).toBeNull();
  178 | });
  179 | 
```