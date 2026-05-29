# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: booking-google-oauth.spec.ts >> google oauth callback stores session and redirects to next
- Location: tests\e2e\booking-google-oauth.spec.ts:3:5

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/booking\/cart$/
Received string:  "http://127.0.0.1:3002/booking/oauth/callback?accessToken=access_google&refreshToken=refresh_google&expiresIn=900&next=%2Fbooking%2Fcart"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    13 × unexpected value "http://127.0.0.1:3002/booking/oauth/callback?accessToken=access_google&refreshToken=refresh_google&expiresIn=900&next=%2Fbooking%2Fcart"

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
      - /url: "#about"
    - link "Galerie":
      - /url: "#gallery"
    - link "Pages":
      - /url: "#pages"
    - link "Blog":
      - /url: "#blog"
    - link "Contacts":
      - /url: "#contact"
  - link "Connexion":
    - /url: /booking/login?next=%2Faccount
  - button "Activer le mode sombre"
- main:
  - heading "Connexion Google" [level=1]
  - paragraph: Finalisation de votre session...
- contentinfo:
  - link "Africa Tourism Gate":
    - /url: /
  - paragraph: Votre passerelle vers les meilleures expériences de voyage en Afrique. Découvrez des destinations uniques et réservez en toute confiance.
  - link "En savoir plus":
    - /url: "#about"
  - heading "Spécialistes Voyage" [level=3]
  - list:
    - listitem:
      - link "Hébergements Premium":
        - /url: /hotels
    - listitem:
      - link "Vols Première Classe":
        - /url: "#vols"
    - listitem:
      - link "Safaris & Tours":
        - /url: "#tours"
    - listitem:
      - link "Croisières Côtières":
        - /url: "#croisieres"
  - link "Facebook":
    - /url: https://www.facebook.com/africatourismgate/
  - link "X":
    - /url: https://x.com/Congotourismga1
  - link "Instagram":
    - /url: https://www.instagram.com/africatourismgate/
  - heading "Newsletter" [level=3]
  - paragraph: Inspiration, idées de voyages, bons plans et actualités.
  - textbox "Adresse email"
  - button "OK"
  - heading "Contact" [level=3]
  - text: +243 815 000 000
  - link "support@africatourismgate.com":
    - /url: mailto:support@africatourismgate.com
  - text: Kinshasa, RD Congo
  - paragraph:
    - text: © 2026 Africa Tourism Gate|
    - link "Politique de Confidentialité":
      - /url: "#"
    - text: "|"
    - link "À propos":
      - /url: "#about"
    - text: "|"
    - link "FAQ":
      - /url: "#"
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
  1  | import { expect, test } from '@playwright/test';
  2  | 
  3  | test('google oauth callback stores session and redirects to next', async ({ page }) => {
  4  |   await page.route('**/api/auth/me', async (route) => {
  5  |     await route.fulfill({
  6  |       status: 200,
  7  |       contentType: 'application/json',
  8  |       body: JSON.stringify({
  9  |         user: {
  10 |           id: 'user-google',
  11 |           email: 'client@gmail.com',
  12 |           firstName: 'Client',
  13 |           lastName: 'Google',
  14 |           organizationId: null,
  15 |           status: 'active',
  16 |         },
  17 |         permissions: [],
  18 |         isSuperAdmin: false,
  19 |       }),
  20 |     });
  21 |   });
  22 | 
  23 |   await page.goto(
  24 |     '/booking/oauth/callback?accessToken=access_google&refreshToken=refresh_google&expiresIn=900&next=%2Fbooking%2Fcart',
  25 |   );
  26 | 
> 27 |   await expect(page).toHaveURL(/\/booking\/cart$/);
     |                      ^ Error: expect(page).toHaveURL(expected) failed
  28 |   const stored = await page.evaluate(() => ({
  29 |     session: window.sessionStorage.getItem('atg.web.session'),
  30 |     local: window.localStorage.getItem('atg.web.session'),
  31 |   }));
  32 |   expect(stored.session).toContain('access_google');
  33 |   expect(stored.session).toContain('refresh_google');
  34 |   expect(stored.local).toBeNull();
  35 | });
  36 | 
```