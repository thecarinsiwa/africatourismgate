# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: manifest-checkout-validation.spec.ts >> manifeste checkout: bloqué si téléphone urgence manquant
- Location: tests\e2e\manifest-checkout-validation.spec.ts:136:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /recapitulatif/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: /recapitulatif/i })

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
  - navigation "Étapes de réservation":
    - list:
      - listitem: Panier
      - listitem: Récap
      - listitem: Demande
      - listitem: Confirmation
  - heading "Récapitulatif" [level=1]
  - paragraph: Forfait combiné
  - heading "Kinshasa Activities Duo" [level=2]
  - paragraph: 1 août 2026 → 2 août 2026 · 2 voyageurs
  - list:
    - listitem:
      - paragraph: Activit?
      - paragraph: Gombe City Tour
      - paragraph: Cr?neau ? confirmer apr?s validation
    - listitem:
      - paragraph: Activit?
      - paragraph: Congo River Walk
      - paragraph: Cr?neau ? confirmer apr?s validation
  - paragraph: "Total estim?: $136"
  - paragraph: Vous économisez $24
  - paragraph: Prix forfait
  - paragraph: $160
  - paragraph: $136
  - text: "-15 %"
  - paragraph: "Total: $136"
  - heading "Informations des voyageurs" [level=3]
  - paragraph: Renseignez les informations de chaque voyageur. Nom, nationalité, n° de pièce et contact d’urgence (nom + téléphone) sont obligatoires. Le genre est optionnel.
  - group "Voyageur 1":
    - text: Voyageur 1 Nom complet
    - textbox "Nom complet"
    - text: Âge
    - spinbutton "Âge"
    - text: Genre
    - combobox "Genre":
      - option "Non précisé" [selected]
      - option "Homme"
      - option "Femme"
      - option "Autre"
    - text: Nationalité *
    - button "Nationalité *": Choisir un pays
    - text: N° pièce d'identité
    - textbox "N° pièce d'identité"
    - paragraph: Informations médicales
    - text: Allergies
    - textbox "Allergies":
      - /placeholder: Ex. pollen, arachides…
    - text: Conditions médicales graves
    - textbox "Conditions médicales graves":
      - /placeholder: Ex. asthme, diabète…
    - text: Traitements en cours
    - textbox "Traitements en cours":
      - /placeholder: Ex. médicaments quotidiens…
    - text: Notes alimentaires
    - textbox "Notes alimentaires":
      - /placeholder: Ex. végétarien, sans gluten…
    - paragraph: Contact d'urgence
    - text: Nom du contact
    - textbox "Nom du contact"
    - text: Téléphone
    - textbox "Téléphone"
    - text: E-mail
    - textbox "E-mail"
    - text: Pays
    - button "Pays": Choisir un pays
    - text: Adresse
    - textbox "Adresse":
      - /placeholder: Rue, ville…
    - paragraph: Pièce d'identité
    - paragraph: JPEG, PNG, WebP ou PDF — 10 Mo max.
    - text: Choisir un fichier
    - button "Choisir un fichier"
    - button "Prendre une photo"
  - group "Voyageur 2":
    - text: Voyageur 2 Nom complet
    - textbox "Nom complet"
    - text: Âge
    - spinbutton "Âge"
    - text: Genre
    - combobox "Genre":
      - option "Non précisé" [selected]
      - option "Homme"
      - option "Femme"
      - option "Autre"
    - text: Nationalité *
    - button "Nationalité *": Choisir un pays
    - text: N° pièce d'identité
    - textbox "N° pièce d'identité"
    - paragraph: Informations médicales
    - text: Allergies
    - textbox "Allergies":
      - /placeholder: Ex. pollen, arachides…
    - text: Conditions médicales graves
    - textbox "Conditions médicales graves":
      - /placeholder: Ex. asthme, diabète…
    - text: Traitements en cours
    - textbox "Traitements en cours":
      - /placeholder: Ex. médicaments quotidiens…
    - text: Notes alimentaires
    - textbox "Notes alimentaires":
      - /placeholder: Ex. végétarien, sans gluten…
    - paragraph: Contact d'urgence
    - text: Nom du contact
    - textbox "Nom du contact"
    - text: Téléphone
    - textbox "Téléphone"
    - text: E-mail
    - textbox "E-mail"
    - text: Pays
    - button "Pays": Choisir un pays
    - text: Adresse
    - textbox "Adresse":
      - /placeholder: Rue, ville…
    - paragraph: Pièce d'identité
    - paragraph: JPEG, PNG, WebP ou PDF — 10 Mo max.
    - text: Choisir un fichier
    - button "Choisir un fichier"
    - button "Prendre une photo"
  - group "Mode de paiement":
    - text: Mode de paiement
    - paragraph: Choisissez comment vous souhaitez régler cette réservation.
    - radio "Carte (Stripe) Paiement sécurisé en ligne immédiat."
    - text: Carte (Stripe) Paiement sécurisé en ligne immédiat.
    - radio "Virement bancaire Réservation en attente — réglez par virement ; validation par notre équipe."
    - text: Virement bancaire Réservation en attente — réglez par virement ; validation par notre équipe.
    - radio "Mobile Money Réservation en attente — payez via Mobile Money puis envoyez une preuve."
    - text: Mobile Money Réservation en attente — payez via Mobile Money puis envoyez une preuve.
  - link "Retour panier":
    - /url: /booking/cart?kind=package&packageId=00000000-0000-4000-8000-000000005001&startDate=2026-08-01&endDate=2026-08-02&travelers=2
  - button "Demander une réservation" [disabled]
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
  1   | import { expect, test } from '@playwright/test';
  2   | import { fillCheckoutManifest, mockManifestApi } from './helpers/fill-manifest';
  3   | 
  4   | const PACKAGE_ID = '00000000-0000-4000-8000-000000005001';
  5   | const BOOKING_ID = 'booking-e2e-package-manifest';
  6   | const DATE = '2026-08-01';
  7   | const TRAVELERS = 2;
  8   | const TOTAL_CENTS = 15300;
  9   | 
  10  | const packageDetailMock = {
  11  |   package: {
  12  |     id: PACKAGE_ID,
  13  |     name: 'Kinshasa Activities Duo',
  14  |     description: 'Two guided experiences in Kinshasa at a bundled discount.',
  15  |     discountPercent: '15',
  16  |     durationDays: 1,
  17  |   },
  18  |   items: [
  19  |     {
  20  |       id: '00000000-0000-4000-8000-000000005002',
  21  |       packageId: PACKAGE_ID,
  22  |       itemType: 'activity',
  23  |       itemId: '00000000-0000-4000-8000-000000004031',
  24  |       label: 'Gombe City Tour',
  25  |       unitPriceCents: 4500,
  26  |       currency: 'USD',
  27  |     },
  28  |     {
  29  |       id: '00000000-0000-4000-8000-000000005003',
  30  |       packageId: PACKAGE_ID,
  31  |       itemType: 'activity',
  32  |       itemId: '00000000-0000-4000-8000-000000004032',
  33  |       label: 'Congo River Walk',
  34  |       unitPriceCents: 3500,
  35  |       currency: 'USD',
  36  |     },
  37  |   ],
  38  |   pricing: {
  39  |     subtotalCents: 8000,
  40  |     discountPercent: 15,
  41  |     discountAmountCents: 1200,
  42  |     totalCents: 6800,
  43  |     currency: 'USD',
  44  |   },
  45  |   images: [],
  46  | };
  47  | 
  48  | async function gotoPackageRecap(page: import('@playwright/test').Page) {
  49  |   await page.addInitScript(() => {
  50  |     window.sessionStorage.setItem(
  51  |       'atg.web.session',
  52  |       JSON.stringify({
  53  |         accessToken: 'e2e-token',
  54  |         refreshToken: 'e2e-refresh-token',
  55  |         expiresAt: Date.now() + 60 * 60 * 1000,
  56  |         user: {
  57  |           id: 'user-e2e',
  58  |           email: 'client.e2e@example.com',
  59  |           firstName: 'Client',
  60  |           lastName: 'E2E',
  61  |           organizationId: null,
  62  |           status: 'active',
  63  |         },
  64  |       }),
  65  |     );
  66  |   });
  67  | 
  68  |   await page.route(`**/api/public/packages/${PACKAGE_ID}**`, async (route) => {
  69  |     await route.fulfill({
  70  |       status: 200,
  71  |       contentType: 'application/json',
  72  |       body: JSON.stringify(packageDetailMock),
  73  |     });
  74  |   });
  75  | 
  76  |   await page.route('**/api/bookings/request', async (route) => {
  77  |     if (route.request().method() !== 'POST') {
  78  |       await route.continue();
  79  |       return;
  80  |     }
  81  |     await route.fulfill({
  82  |       status: 201,
  83  |       contentType: 'application/json',
  84  |       body: JSON.stringify({
  85  |         bookingId: BOOKING_ID,
  86  |         status: 'pending_approval',
  87  |         message: 'Booking request submitted',
  88  |         totalCents: TOTAL_CENTS,
  89  |         currency: 'USD',
  90  |       }),
  91  |     });
  92  |   });
  93  | 
  94  |   await mockManifestApi(page);
  95  | 
  96  |   await page.goto(
  97  |     `/booking/recap?kind=package&packageId=${PACKAGE_ID}&startDate=${DATE}&endDate=2026-08-02&travelers=${TRAVELERS}`,
  98  |   );
> 99  |   await expect(page.getByRole('heading', { name: /recapitulatif/i })).toBeVisible();
      |                                                                       ^ Error: expect(locator).toBeVisible() failed
  100 |   await expect(page.getByText(/informations des voyageurs|traveler information|información de los viajeros/i)).toBeVisible();
  101 | }
  102 | 
  103 | test('manifeste checkout: bloqué si n° pièce manquant', async ({ page }) => {
  104 |   test.setTimeout(60_000);
  105 |   await gotoPackageRecap(page);
  106 | 
  107 |   await page.locator('input[name="preferredPaymentMethod"][value="stripe"]').check();
  108 | 
  109 |   const nameInputs = page.getByLabel(/nom complet|full name|nombre completo/i);
  110 |   const count = await nameInputs.count();
  111 |   expect(count).toBeGreaterThan(0);
  112 |   for (let i = 0; i < count; i += 1) {
  113 |     await nameInputs.nth(i).fill(`Voyageur ${i + 1}`);
  114 |   }
  115 | 
  116 |   for (let i = 0; i < count; i += 1) {
  117 |     const nat = page.getByLabel(/^nationalit[eé]$|^nationality$|^nacionalidad$/i).nth(i);
  118 |     await nat.click();
  119 |     await page.locator('input[type="search"]').last().fill('Congo');
  120 |     await page.getByRole('option').filter({ hasText: /\(CD\)/i }).first().click();
  121 |   }
  122 |   // Leave idNumber empty on purpose
  123 | 
  124 |   await page
  125 |     .getByRole('button', { name: /demander une r[ée]servation|request a booking|solicitar una reserva/i })
  126 |     .click();
  127 | 
  128 |   await expect(
  129 |     page.getByRole('alert').filter({
  130 |       hasText: /pi[eè]ce d.identit|passport number|documento/i,
  131 |     }),
  132 |   ).toBeVisible();
  133 |   await expect(page).toHaveURL(/\/booking\/recap/);
  134 | });
  135 | 
  136 | test('manifeste checkout: bloqué si téléphone urgence manquant', async ({ page }) => {
  137 |   test.setTimeout(60_000);
  138 |   await gotoPackageRecap(page);
  139 | 
  140 |   await page.locator('input[name="preferredPaymentMethod"][value="stripe"]').check();
  141 |   await fillCheckoutManifest(page);
  142 | 
  143 |   const emPhoneInputs = page.getByLabel(/^t[ée]l[ée]phone$|^phone$|^tel[ée]fono$/i);
  144 |   const phoneCount = await emPhoneInputs.count();
  145 |   expect(phoneCount).toBeGreaterThan(0);
  146 |   for (let i = 0; i < phoneCount; i += 1) {
  147 |     await emPhoneInputs.nth(i).fill('');
  148 |   }
  149 | 
  150 |   await page
  151 |     .getByRole('button', { name: /demander une r[ée]servation|request a booking|solicitar una reserva/i })
  152 |     .click();
  153 | 
  154 |   await expect(
  155 |     page.getByRole('alert').filter({
  156 |       hasText: /t[ée]l[ée]phone.*urgence|emergency contact phone|tel[ée]fono.*emergencia/i,
  157 |     }),
  158 |   ).toBeVisible();
  159 |   await expect(page).toHaveURL(/\/booking\/recap/);
  160 | });
  161 | 
  162 | test('manifeste checkout: OK avec nom + nationalité + n° pièce + urgence (genre vide)', async ({
  163 |   page,
  164 | }) => {
  165 |   test.setTimeout(60_000);
  166 |   await gotoPackageRecap(page);
  167 | 
  168 |   await page.locator('input[name="preferredPaymentMethod"][value="stripe"]').check();
  169 |   await fillCheckoutManifest(page);
  170 | 
  171 |   await page
  172 |     .getByRole('button', { name: /demander une r[ée]servation|request a booking|solicitar una reserva/i })
  173 |     .click();
  174 | 
  175 |   await expect(page).toHaveURL(new RegExp(`/booking/request-success\\?booking_id=${BOOKING_ID}`), {
  176 |     timeout: 15_000,
  177 |   });
  178 | });
  179 | 
```