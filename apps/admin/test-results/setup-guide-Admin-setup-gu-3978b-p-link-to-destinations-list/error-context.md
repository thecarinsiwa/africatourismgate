# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: setup-guide.spec.ts >> Admin setup guide (mise en route) >> nav → Destinations module → deep-link to destinations list
- Location: tests\e2e\setup-guide.spec.ts:16:7

# Error details

```
TimeoutError: locator.click: Timeout 30000ms exceeded.
Call log:
  - waiting for locator('a[href="/mise-en-route"]').first()
    - locator resolved to <a href="/mise-en-route" class="flex items-center gap-3 rounded-lg py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary px-3 text-atg-muted hover:bg-atg-surface/80 hover:text-atg-fg">…</a>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is not visible
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is not visible
    - retrying click action
      - waiting 100ms
    50 × waiting for element to be visible, enabled and stable
       - element is not visible
     - retrying click action
       - waiting 500ms

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - complementary [ref=e4]:
      - link "Africa Tourism Gate" [ref=e6] [cursor=pointer]:
        - /url: /dashboard
        - generic [ref=e8]: Africa Tourism Gate
      - navigation [ref=e9]:
        - link "Tableau de bord" [ref=e10] [cursor=pointer]:
          - /url: /dashboard
          - img [ref=e12]
          - generic [ref=e14]: Tableau de bord
        - link "Mise en route" [ref=e15] [cursor=pointer]:
          - /url: /mise-en-route
          - img [ref=e17]
          - generic [ref=e19]: Mise en route
        - link "Notifications" [ref=e20] [cursor=pointer]:
          - /url: /notifications
          - img [ref=e22]
          - generic [ref=e24]: Notifications
        - button "Utilisateurs & authentification" [ref=e26] [cursor=pointer]:
          - img [ref=e28]
          - generic [ref=e30]: Utilisateurs & authentification
          - img [ref=e31]
        - button "Fidélité (OneKey)" [ref=e34] [cursor=pointer]:
          - img [ref=e36]
          - generic [ref=e38]: Fidélité (OneKey)
          - img [ref=e39]
        - button "Produits touristiques" [ref=e42] [cursor=pointer]:
          - img [ref=e44]
          - generic [ref=e46]: Produits touristiques
          - img [ref=e47]
        - button "Réservations" [ref=e50] [cursor=pointer]:
          - img [ref=e52]
          - generic [ref=e54]: Réservations
          - img [ref=e55]
        - button "Paiements" [ref=e58] [cursor=pointer]:
          - img [ref=e60]
          - generic [ref=e62]: Paiements
          - img [ref=e63]
        - button "GAP (Gorilla Ambassadors)" [ref=e66] [cursor=pointer]:
          - img [ref=e68]
          - generic [ref=e70]: GAP (Gorilla Ambassadors)
          - img [ref=e71]
        - button "Contenu & support" [ref=e74] [cursor=pointer]:
          - img [ref=e76]
          - generic [ref=e78]: Contenu & support
          - img [ref=e79]
        - button "Système" [ref=e82] [cursor=pointer]:
          - img [ref=e84]
          - generic [ref=e87]: Système
          - img [ref=e88]
        - link "Centre d'aide" [ref=e90] [cursor=pointer]:
          - /url: /aide
          - img [ref=e92]
          - generic [ref=e94]: Centre d'aide
    - generic [ref=e95]:
      - banner [ref=e96]:
        - paragraph [ref=e99]: Tableau de bord
        - generic [ref=e100]:
          - button "Ouvrir la recherche" [ref=e101] [cursor=pointer]:
            - img [ref=e102]
          - link "Ouvrir l'aide pour cette page" [ref=e104] [cursor=pointer]:
            - /url: /aide/prise-en-main/naviguer-dans-le-dashboard
            - img [ref=e105]
          - button "Ouvrir les notifications" [ref=e108] [cursor=pointer]:
            - img [ref=e109]
          - generic [ref=e111]:
            - generic [ref=e112]: Choisir la langue
            - button "Choisir la langue" [ref=e113] [cursor=pointer]:
              - generic [ref=e114]: FR
              - img [ref=e115]
          - button "Mode sombre" [ref=e117] [cursor=pointer]:
            - img [ref=e118]
          - button "Carin Admin Carin Siwa Admin admin@africatourismgate.local" [ref=e121] [cursor=pointer]:
            - img "Carin Admin" [ref=e122]
            - generic [ref=e123]:
              - generic [ref=e124]: Carin Siwa Admin
              - generic [ref=e125]: admin@africatourismgate.local
            - img [ref=e126]
      - main [ref=e128]:
        - generic [ref=e129]:
          - generic [ref=e131]:
            - generic [ref=e132]:
              - heading "Bonjour, Carin" [level=1] [ref=e133]
              - paragraph [ref=e134]: Vue d'ensemble de votre plateforme Africa Tourism Gate
            - tablist "Période" [ref=e136]:
              - tab "7 jours" [ref=e137] [cursor=pointer]:
                - generic [ref=e138]: 7 jours
              - tab "30 jours" [selected] [ref=e139] [cursor=pointer]:
                - generic [ref=e140]: 30 jours
              - tab "90 jours" [ref=e141] [cursor=pointer]:
                - generic [ref=e142]: 90 jours
          - generic [ref=e144]:
            - link "Utilisateurs 1 Comptes enregistrés" [ref=e145] [cursor=pointer]:
              - /url: /utilisateurs
              - generic [ref=e148]:
                - generic [ref=e149]:
                  - paragraph [ref=e150]: Utilisateurs
                  - paragraph [ref=e151]: "1"
                  - paragraph [ref=e152]: Comptes enregistrés
                - img [ref=e154]
            - link "Réservations 0 0 % · vs période précédente Sur la période sélectionnée" [ref=e156] [cursor=pointer]:
              - /url: /reservations
              - generic [ref=e159]:
                - generic [ref=e160]:
                  - paragraph [ref=e161]: Réservations
                  - paragraph [ref=e162]: "0"
                  - paragraph [ref=e163]:
                    - text: 0 %
                    - generic [ref=e164]: · vs période précédente
                  - paragraph [ref=e165]: Sur la période sélectionnée
                - img [ref=e167]
            - generic [ref=e172]:
              - generic [ref=e173]:
                - paragraph [ref=e174]: Revenus
                - paragraph [ref=e175]: 0,00 CDF
                - paragraph [ref=e176]:
                  - text: 0 %
                  - generic [ref=e177]: · vs période précédente
                - paragraph [ref=e178]: Paiements réussis sur la période
              - img [ref=e180]
            - link "Hébergements 0 Hébergements publiés" [ref=e182] [cursor=pointer]:
              - /url: /hebergements
              - generic [ref=e185]:
                - generic [ref=e186]:
                  - paragraph [ref=e187]: Hébergements
                  - paragraph [ref=e188]: "0"
                  - paragraph [ref=e189]: Hébergements publiés
                - img [ref=e191]
          - generic [ref=e194]:
            - heading "Activité" [level=2] [ref=e196]
            - paragraph [ref=e198]: Aucune donnée sur cette période
          - generic [ref=e199]:
            - generic [ref=e201]:
              - heading "Statistiques utilisateurs" [level=2] [ref=e202]
              - paragraph [ref=e203]: Répartition des comptes sur la plateforme
              - list [ref=e204]:
                - listitem [ref=e205]:
                  - generic [ref=e206]:
                    - img [ref=e208]
                    - generic [ref=e210]: Actifs
                  - generic [ref=e211]: "1"
                - listitem [ref=e212]:
                  - generic [ref=e213]:
                    - img [ref=e215]
                    - generic [ref=e217]: Suspendus
                  - generic [ref=e218]: "0"
                - listitem [ref=e219]:
                  - generic [ref=e220]:
                    - img [ref=e222]
                    - generic [ref=e224]: Total
                  - generic [ref=e225]: "1"
              - link "Voir tous les utilisateurs →" [ref=e226] [cursor=pointer]:
                - /url: /utilisateurs
            - generic [ref=e228]:
              - heading "Vue plateforme" [level=2] [ref=e229]
              - paragraph [ref=e230]: Organisations, hébergements et activité
              - generic [ref=e231]:
                - link "Organisations 1" [ref=e232] [cursor=pointer]:
                  - /url: /organisations
                  - img [ref=e234]
                  - generic [ref=e236]: Organisations
                  - generic [ref=e237]: "1"
                - link "Hébergements 0" [ref=e238] [cursor=pointer]:
                  - /url: /hebergements
                  - img [ref=e240]
                  - generic [ref=e242]: Hébergements
                  - generic [ref=e243]: "0"
                - link "Réservations 0" [ref=e244] [cursor=pointer]:
                  - /url: /reservations
                  - img [ref=e246]
                  - generic [ref=e248]: Réservations
                  - generic [ref=e249]: "0"
                - link "Utilisateurs 1" [ref=e250] [cursor=pointer]:
                  - /url: /utilisateurs
                  - img [ref=e252]
                  - generic [ref=e254]: Utilisateurs
                  - generic [ref=e255]: "1"
          - generic [ref=e256]:
            - generic [ref=e258]:
              - heading "Actions rapides" [level=2] [ref=e259]
              - paragraph [ref=e260]: Accès direct aux sections principales
              - generic [ref=e261]:
                - link "Utilisateurs Gérer les comptes" [ref=e262] [cursor=pointer]:
                  - /url: /utilisateurs
                  - img [ref=e264]
                  - generic [ref=e266]: Utilisateurs
                  - generic [ref=e267]: Gérer les comptes
                - link "Organisations Partenaires & entités" [ref=e268] [cursor=pointer]:
                  - /url: /organisations
                  - img [ref=e270]
                  - generic [ref=e272]: Organisations
                  - generic [ref=e273]: Partenaires & entités
                - link "Hébergements Catalogue & fiches" [ref=e274] [cursor=pointer]:
                  - /url: /hebergements
                  - img [ref=e276]
                  - generic [ref=e278]: Hébergements
                  - generic [ref=e279]: Catalogue & fiches
                - link "Réservations Suivi des bookings" [ref=e280] [cursor=pointer]:
                  - /url: /reservations
                  - img [ref=e282]
                  - generic [ref=e284]: Réservations
                  - generic [ref=e285]: Suivi des bookings
            - generic [ref=e287]:
              - heading "Activité récente" [level=2] [ref=e288]
              - paragraph [ref=e289]: Réservations, avis et tickets support
              - paragraph [ref=e290]: Aucune activité récente.
  - alert [ref=e291]
  - generic "Notifications"
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test';
  2  | import { loginAsSeedAdmin } from './helpers/admin-auth';
  3  | 
  4  | const PAGE_HEADING =
  5  |   /Mise en route|Getting started|Puesta en marcha/i;
  6  | const MODULE_DESTINATIONS =
  7  |   /^(Destinations|Destinos)$/;
  8  | const OPEN_LIST =
  9  |   /Ouvrir la liste|Open list|Abrir lista/i;
  10 | 
  11 | test.describe('Admin setup guide (mise en route)', () => {
  12 |   test.beforeEach(async ({ page }) => {
  13 |     await loginAsSeedAdmin(page);
  14 |   });
  15 | 
  16 |   test('nav → Destinations module → deep-link to destinations list', async ({
  17 |     page,
  18 |   }) => {
  19 |     await page.goto('/dashboard');
  20 | 
> 21 |     await page.locator('a[href="/mise-en-route"]').first().click();
     |                                                            ^ TimeoutError: locator.click: Timeout 30000ms exceeded.
  22 |     await expect(page).toHaveURL(/\/mise-en-route\/?$/);
  23 | 
  24 |     const guide = page.getByTestId('setup-guide-page');
  25 |     await expect(guide).toBeVisible();
  26 |     await expect(
  27 |       page.getByRole('heading', { name: PAGE_HEADING, level: 1 }),
  28 |     ).toBeVisible();
  29 | 
  30 |     const moduleNav = page.getByTestId('setup-module-nav');
  31 |     await expect(moduleNav).toBeVisible();
  32 | 
  33 |     await moduleNav.locator('[data-module-id="destinations"]').click();
  34 |     await expect(
  35 |       moduleNav.locator('[data-module-id="destinations"]'),
  36 |     ).toHaveAttribute('aria-current', 'true');
  37 | 
  38 |     await expect(
  39 |       guide.getByRole('heading', { name: MODULE_DESTINATIONS, level: 2 }),
  40 |     ).toBeVisible();
  41 | 
  42 |     const destinationsStep = guide.locator(
  43 |       '[data-testid="setup-step-card"][data-step-id="destinations"]',
  44 |     );
  45 |     await expect(destinationsStep).toBeVisible();
  46 | 
  47 |     await destinationsStep.getByRole('link', { name: OPEN_LIST }).click();
  48 |     await expect(page).toHaveURL(/\/produits\/destinations\/?$/);
  49 |   });
  50 | });
  51 | 
```