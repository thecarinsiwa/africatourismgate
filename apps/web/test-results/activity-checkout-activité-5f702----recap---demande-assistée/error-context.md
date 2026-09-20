# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: activity-checkout.spec.ts >> activité Gombe City Tour: créneau complet grisé, panier -> recap -> demande assistée
- Location: tests\e2e\activity-checkout.spec.ts:46:5

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
      - listitem: Paiement
      - listitem: Confirmation
  - heading "Récapitulatif" [level=1]
  - article:
    - paragraph: Tourism Gate Experiences Kinshasa
    - heading "Gombe City Tour" [level=2]
    - paragraph: 20 juil. 2026 · 12:00
    - paragraph: 2 passagers
    - paragraph: $90
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
    - /url: /booking/cart?kind=activity_schedule&activityId=00000000-0000-4000-8000-000000004031&scheduleId=00000000-0000-4000-8000-000000004033&date=2026-07-20&participants=2
  - button "Payer avec Stripe" [disabled]
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
  55  |         accessToken: 'e2e-token',
  56  |         refreshToken: 'e2e-refresh-token',
  57  |         expiresAt: Date.now() + 60 * 60 * 1000,
  58  |         user: {
  59  |           id: 'user-e2e',
  60  |           email: 'client.e2e@example.com',
  61  |           firstName: 'Client',
  62  |           lastName: 'E2E',
  63  |           organizationId: null,
  64  |           status: 'active',
  65  |         },
  66  |       }),
  67  |     );
  68  |   });
  69  | 
  70  |   await page.route(`**/api/public/activities/${ACTIVITY_ID}**`, async (route) => {
  71  |     await route.fulfill({
  72  |       status: 200,
  73  |       contentType: 'application/json',
  74  |       body: JSON.stringify(activityDetailMock),
  75  |     });
  76  |   });
  77  | 
  78  |   let postedItems: unknown = null;
  79  | 
  80  |   await page.route('**/api/bookings/request', async (route) => {
  81  |     if (route.request().method() !== 'POST') {
  82  |       await route.continue();
  83  |       return;
  84  |     }
  85  | 
  86  |     postedItems = route.request().postDataJSON();
  87  | 
  88  |     await route.fulfill({
  89  |       status: 201,
  90  |       contentType: 'application/json',
  91  |       body: JSON.stringify({
  92  |         bookingId: BOOKING_ID,
  93  |         status: 'pending_approval',
  94  |         message: 'Booking request submitted',
  95  |         totalCents: TOTAL_CENTS,
  96  |         currency: 'USD',
  97  |       }),
  98  |     });
  99  |   });
  100 | 
  101 |   await page.route(`**/api/bookings/${BOOKING_ID}`, async (route) => {
  102 |     await route.fulfill({
  103 |       status: 200,
  104 |       contentType: 'application/json',
  105 |       body: JSON.stringify({
  106 |         booking: {
  107 |           id: BOOKING_ID,
  108 |           userId: 'user-e2e',
  109 |           status: 'pending_approval',
  110 |           totalCents: TOTAL_CENTS,
  111 |           currency: 'USD',
  112 |           promoCodeId: null,
  113 |           createdAt: new Date().toISOString(),
  114 |           updatedAt: null,
  115 |         },
  116 |         items: [],
  117 |         totalCents: TOTAL_CENTS,
  118 |         currency: 'USD',
  119 |       }),
  120 |     });
  121 |   });
  122 | 
  123 |   await mockManifestApi(page);
  124 | 
  125 |   await page.goto(`/activities/${ACTIVITY_ID}?date=${DATE}&participants=${PARTICIPANTS}`);
  126 | 
  127 |   await expect(page.getByRole('heading', { name: 'Gombe City Tour' })).toBeVisible();
  128 |   await expect(page.getByText('Tourism Gate Experiences Kinshasa')).toBeVisible();
  129 | 
  130 |   const schedules = page.locator('#schedules');
  131 |   await expect(schedules.getByRole('heading', { name: /cr[ée]neaux|time slots|horarios/i })).toBeVisible();
  132 | 
  133 |   const scheduleGroup = schedules.getByRole('radiogroup');
  134 |   await expect(scheduleGroup).toBeVisible();
  135 | 
  136 |   const soldOutChip = scheduleGroup.getByRole('radio', { name: /complet|sold out|agotado/i });
  137 |   await expect(soldOutChip).toBeVisible();
  138 |   await expect(soldOutChip).toBeDisabled();
  139 | 
  140 |   const availableChip = scheduleGroup
  141 |     .getByRole('radio')
  142 |     .filter({ hasNotText: /complet|sold out|agotado/i })
  143 |     .first();
  144 |   await availableChip.click();
  145 |   await expect(availableChip).toHaveAttribute('aria-checked', 'true');
  146 | 
  147 |   await page.locator('button:visible', { hasText: /r[ée]server|book now|reservar/i }).first().click();
  148 |   await expect(page).toHaveURL(/\/booking\/cart\?.*kind=activity_schedule/);
  149 |   await expect(page.getByText('Gombe City Tour')).toBeVisible();
  150 |   await expect(page.getByText('Tourism Gate Experiences Kinshasa')).toBeVisible();
  151 | 
  152 |   await page.goto(
  153 |     `/booking/recap?kind=activity_schedule&activityId=${ACTIVITY_ID}&scheduleId=${SCHEDULE_MORNING}&date=${DATE}&participants=${PARTICIPANTS}`,
  154 |   );
> 155 |   await expect(page.getByRole('heading', { name: /recapitulatif/i })).toBeVisible();
      |                                                                       ^ Error: expect(locator).toBeVisible() failed
  156 |   await expect(page.getByText('Gombe City Tour')).toBeVisible();
  157 |   await expect(page.getByText('Tourism Gate Experiences Kinshasa')).toBeVisible();
  158 | 
  159 |   await page.locator('input[name="preferredPaymentMethod"][value="stripe"]').check();
  160 |   await fillCheckoutManifest(page);
  161 | 
  162 |   await expect(
  163 |     page.getByRole('button', { name: /demander une r[ée]servation|request a booking|solicitar una reserva/i }),
  164 |   ).toBeEnabled();
  165 |   await page
  166 |     .getByRole('button', { name: /demander une r[ée]servation|request a booking|solicitar una reserva/i })
  167 |     .click();
  168 |   await expect(page).toHaveURL(new RegExp(`/booking/request-success\\?booking_id=${BOOKING_ID}`), {
  169 |     timeout: 15_000,
  170 |   });
  171 | 
  172 |   expect(postedItems).toEqual({
  173 |     preferredPaymentMethod: 'stripe',
  174 |     items: [
  175 |       {
  176 |         itemType: 'activity_schedule',
  177 |         referenceId: SCHEDULE_MORNING,
  178 |         quantity: PARTICIPANTS,
  179 |       },
  180 |     ],
  181 |   });
  182 | 
  183 |   await expect(page.getByText(/demande envoy[ée]e|request submitted|solicitud enviada/i)).toBeVisible();
  184 |   await expect(page.getByText(/r[ée]f\. demande|request ref|ref\. solicitud/i)).toBeVisible();
  185 | });
  186 | 
```