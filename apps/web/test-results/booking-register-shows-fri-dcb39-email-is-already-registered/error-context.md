# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: booking-register.spec.ts >> shows friendly message when email is already registered
- Location: tests\e2e\booking-register.spec.ts:59:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByLabel(/^Prénom$|^First name$|^Nombre$/i)

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
          - link "Connexion" [ref=e62] [cursor=pointer]:
            - /url: /booking/login?next=%2Faccount
        - button "Activer le mode sombre" [ref=e63] [cursor=pointer]:
          - img [ref=e64]
    - main [ref=e66]:
      - generic [ref=e67]:
        - heading "Créer un compte client" [level=1] [ref=e68]
        - paragraph [ref=e69]: Inscrivez-vous pour réserver, suivre vos voyages et gérer votre profil.
        - generic [ref=e71]:
          - generic [ref=e72]:
            - generic [ref=e73]:
              - generic [ref=e75]: Prénom*
              - textbox "Prénom" [ref=e77]
            - generic [ref=e78]:
              - generic [ref=e80]: Nom*
              - textbox "Nom" [ref=e82]
          - generic [ref=e83]:
            - generic [ref=e85]: Adresse e-mail*
            - textbox "Adresse e-mail" [ref=e87]
          - generic [ref=e88]:
            - generic [ref=e90]: Téléphone
            - textbox "Téléphone" [ref=e92]
            - paragraph [ref=e93]: Optionnel
          - generic [ref=e94]:
            - generic [ref=e96]: Mot de passe*
            - generic [ref=e97]:
              - textbox "Mot de passe" [ref=e98]
              - button "Afficher le mot de passe" [ref=e100] [cursor=pointer]:
                - img [ref=e101]
            - paragraph [ref=e103]: Minimum 8 caractères
          - generic [ref=e104]:
            - generic [ref=e106]: Confirmer le mot de passe*
            - generic [ref=e107]:
              - textbox "Confirmer le mot de passe" [ref=e108]
              - button "Afficher le mot de passe" [ref=e110] [cursor=pointer]:
                - img [ref=e111]
          - generic [ref=e113] [cursor=pointer]:
            - checkbox "J'accepte les conditions d'utilisation" [ref=e114]
            - generic [ref=e115]:
              - text: J'accepte les
              - link "conditions d'utilisation" [ref=e116]:
                - /url: /legal/terms
              - text: "*"
          - button "Créer mon compte" [ref=e117] [cursor=pointer]:
            - generic [ref=e118]: Créer mon compte
            - generic [ref=e119]: →
        - generic [ref=e124]: Déjà un compte ?
        - link "Se connecter" [ref=e125] [cursor=pointer]:
          - /url: /booking/login?next=%2Faccount%2Fprofile
        - link "Retour aux hôtels" [ref=e126] [cursor=pointer]:
          - /url: /hotels
    - contentinfo [ref=e127]:
      - generic [ref=e130]:
        - generic [ref=e131]:
          - link "Africa Tourism Gate Africa Tourism Gate" [ref=e132] [cursor=pointer]:
            - /url: /
            - img "Africa Tourism Gate" [ref=e133]
            - generic [ref=e134]: Africa Tourism Gate
          - paragraph [ref=e135]: Votre passerelle vers les meilleures expériences de voyage en Afrique. Découvrez des destinations uniques et réservez en toute confiance.
          - link "En savoir plus" [ref=e136] [cursor=pointer]:
            - /url: /about/who-we-are
        - generic [ref=e137]:
          - heading "Nos Produits" [level=3] [ref=e138]
          - list [ref=e139]:
            - listitem [ref=e140]:
              - link "Hébergements Premium" [ref=e141] [cursor=pointer]:
                - /url: /hotels
                - img [ref=e142]
                - text: Hébergements Premium
            - listitem [ref=e144]:
              - link "Vols Première Classe" [ref=e145] [cursor=pointer]:
                - /url: /flights
                - img [ref=e146]
                - text: Vols Première Classe
            - listitem [ref=e148]:
              - link "Location de Voitures" [ref=e149] [cursor=pointer]:
                - /url: /cars
                - img [ref=e150]
                - text: Location de Voitures
            - listitem [ref=e152]:
              - link "Safaris & Tours" [ref=e153] [cursor=pointer]:
                - /url: /activities
                - img [ref=e154]
                - text: Safaris & Tours
            - listitem [ref=e156]:
              - link "Croisières Côtières" [ref=e157] [cursor=pointer]:
                - /url: /cruises
                - img [ref=e158]
                - text: Croisières Côtières
            - listitem [ref=e160]:
              - link "Forfaits" [ref=e161] [cursor=pointer]:
                - /url: /packages
                - img [ref=e162]
                - text: Forfaits
        - generic [ref=e164]:
          - heading "À propos" [level=3] [ref=e165]
          - list [ref=e166]:
            - listitem [ref=e167]:
              - link "Qui nous sommes" [ref=e168] [cursor=pointer]:
                - /url: /about/who-we-are
                - img [ref=e169]
                - text: Qui nous sommes
            - listitem [ref=e171]:
              - link "Notre histoire" [ref=e172] [cursor=pointer]:
                - /url: /about/our-history
                - img [ref=e173]
                - text: Notre histoire
            - listitem [ref=e175]:
              - link "Notre équipe" [ref=e176] [cursor=pointer]:
                - /url: /about/team
                - img [ref=e177]
                - text: Notre équipe
            - listitem [ref=e179]:
              - link "Comment nous travaillons" [ref=e180] [cursor=pointer]:
                - /url: /about/how-we-work
                - img [ref=e181]
                - text: Comment nous travaillons
            - listitem [ref=e183]:
              - link "Notre gouvernance" [ref=e184] [cursor=pointer]:
                - /url: /about/governance
                - img [ref=e185]
                - text: Notre gouvernance
            - listitem [ref=e187]:
              - link "Rapports et finances" [ref=e188] [cursor=pointer]:
                - /url: /about/reports
                - img [ref=e189]
                - text: Rapports et finances
            - listitem [ref=e191]:
              - link "Responsabilité" [ref=e192] [cursor=pointer]:
                - /url: /about/responsibility
                - img [ref=e193]
                - text: Responsabilité
            - listitem [ref=e195]:
              - link "Médias & ressources" [ref=e196] [cursor=pointer]:
                - /url: /about/media-resources
                - img [ref=e197]
                - text: Médias & ressources
            - listitem [ref=e199]:
              - link "Nous contacter" [ref=e200] [cursor=pointer]:
                - /url: /about/contact
                - img [ref=e201]
                - text: Nous contacter
        - generic [ref=e203]:
          - heading "Newsletter" [level=3] [ref=e204]
          - paragraph [ref=e205]: Inspiration, idées de voyages, bons plans et actualités.
          - generic [ref=e206]:
            - textbox "Adresse email" [ref=e207]
            - button "OK" [ref=e208] [cursor=pointer]
        - generic [ref=e209]:
          - heading "Contact" [level=3] [ref=e210]:
            - link "Contact" [ref=e211] [cursor=pointer]:
              - /url: /about/contact
          - generic [ref=e212]:
            - generic [ref=e213]:
              - img [ref=e214]
              - generic [ref=e216]: "+243975579097"
            - generic [ref=e217]:
              - img [ref=e218]
              - link "support@africatourismgate.org" [ref=e220] [cursor=pointer]:
                - /url: mailto:support@africatourismgate.org
            - generic [ref=e221]:
              - img [ref=e222]
              - generic [ref=e225]: Kinshasa, RD Congo
          - generic [ref=e226]:
            - link "Facebook" [ref=e227] [cursor=pointer]:
              - /url: https://www.facebook.com/africatourismgate
              - img [ref=e229]
            - link "X / Twitter" [ref=e231] [cursor=pointer]:
              - /url: https://x.com/Congotourismga1
              - img [ref=e233]
            - link "Instagram" [ref=e235] [cursor=pointer]:
              - /url: https://www.instagram.com/africatourismgate
              - img [ref=e237]
      - generic [ref=e240]:
        - paragraph [ref=e241]:
          - text: © 2026 Africa Tourism Gate|
          - link "Politique de Confidentialité" [ref=e242] [cursor=pointer]:
            - /url: /legal/privacy
          - text: "|"
          - link "Conditions d'utilisation" [ref=e243] [cursor=pointer]:
            - /url: /legal/terms
          - text: "|"
          - link "À propos" [ref=e244] [cursor=pointer]:
            - /url: /about/who-we-are
          - text: "|"
          - link "FAQ" [ref=e245] [cursor=pointer]:
            - /url: /support
          - text: "|"
          - link "Contact" [ref=e246] [cursor=pointer]:
            - /url: /about/contact
          - text: "|"
          - link "GAP" [ref=e247] [cursor=pointer]:
            - /url: http://localhost:3004
        - paragraph [ref=e248]:
          - text: Conçu par
          - strong [ref=e249]: Carin Siwa et Ruth Bwiza
  - alert [ref=e250]
  - generic "Notifications"
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test';
  2  | 
  3  | test('customer registration stores session and redirects to next', async ({ page }) => {
  4  |   await page.route('**/api/auth/register/customer', async (route) => {
  5  |     if (route.request().method() !== 'POST') {
  6  |       await route.continue();
  7  |       return;
  8  |     }
  9  |     await route.fulfill({
  10 |       status: 201,
  11 |       contentType: 'application/json',
  12 |       body: JSON.stringify({
  13 |         accessToken: 'e2e-register-token',
  14 |         refreshToken: 'e2e-register-refresh',
  15 |         expiresIn: 3600,
  16 |         user: {
  17 |           id: 'user-register',
  18 |           email: 'new.client@example.com',
  19 |           firstName: 'New',
  20 |           lastName: 'Client',
  21 |           preferredLanguage: 'fr',
  22 |           organizationId: null,
  23 |           status: 'active',
  24 |         },
  25 |       }),
  26 |     });
  27 |   });
  28 | 
  29 |   await page.goto('/booking/register?next=%2Faccount%2Fprofile');
  30 |   await page.getByLabel(/^Prénom$|^First name$|^Nombre$/i).fill('New');
  31 |   await page.getByLabel(/^Nom$|^Last name$|^Apellido$/i).fill('Client');
  32 |   await page.getByLabel(/Adresse e-mail|Email address|Correo electrónico/i).fill('new.client@example.com');
  33 |   await page.getByLabel(/^Mot de passe$|^Password$|^Contraseña$/i).first().fill('secret-password');
  34 |   await page.getByLabel(/Confirmer le mot de passe|Confirm password|Confirmar contraseña/i).fill(
  35 |     'secret-password',
  36 |   );
  37 |   await page.getByRole('checkbox').check();
  38 |   await page.getByRole('button', { name: /Créer mon compte|Create my account|Crear mi cuenta/i }).click();
  39 | 
  40 |   await expect(page).toHaveURL(/\/account\/profile$/);
  41 | 
  42 |   const stored = await page.evaluate(() => ({
  43 |     session: window.sessionStorage.getItem('atg.web.session'),
  44 |     local: window.localStorage.getItem('atg.web.session'),
  45 |   }));
  46 |   expect(stored.session).toContain('e2e-register-token');
  47 |   expect(stored.session).toContain('e2e-register-refresh');
  48 |   expect(stored.local).toBeNull();
  49 | });
  50 | 
  51 | test('login page links to register with next param preserved', async ({ page }) => {
  52 |   await page.goto('/booking/login?next=%2Fbooking%2Fcart');
  53 |   const registerLink = page.getByRole('link', {
  54 |     name: /Créer un compte|Create an account|Crear una cuenta/i,
  55 |   });
  56 |   await expect(registerLink).toHaveAttribute('href', '/booking/register?next=%2Fbooking%2Fcart');
  57 | });
  58 | 
  59 | test('shows friendly message when email is already registered', async ({ page }) => {
  60 |   await page.route('**/api/auth/register/customer', async (route) => {
  61 |     if (route.request().method() !== 'POST') {
  62 |       await route.continue();
  63 |       return;
  64 |     }
  65 |     await route.fulfill({
  66 |       status: 409,
  67 |       contentType: 'application/json',
  68 |       body: JSON.stringify({
  69 |         statusCode: 409,
  70 |         message: 'Email already registered',
  71 |         error: 'Conflict',
  72 |       }),
  73 |     });
  74 |   });
  75 | 
  76 |   await page.goto('/booking/register?next=%2Faccount%2Fprofile');
> 77 |   await page.getByLabel(/^Prénom$|^First name$|^Nombre$/i).fill('Existing');
     |                                                            ^ Error: locator.fill: Test timeout of 30000ms exceeded.
  78 |   await page.getByLabel(/^Nom$|^Last name$|^Apellido$/i).fill('User');
  79 |   await page.getByLabel(/Adresse e-mail|Email address|Correo electrónico/i).fill('taken@example.com');
  80 |   await page.getByLabel(/^Mot de passe$|^Password$|^Contraseña$/i).first().fill('secret-password');
  81 |   await page.getByLabel(/Confirmer le mot de passe|Confirm password|Confirmar contraseña/i).fill(
  82 |     'secret-password',
  83 |   );
  84 |   await page.getByRole('checkbox').check();
  85 |   await page.getByRole('button', { name: /Créer mon compte|Create my account|Crear mi cuenta/i }).click();
  86 | 
  87 |   const errorAlert = page.locator('[role="alert"]').filter({ hasText: /déjà utilisée|already in use|ya está en uso/i });
  88 |   await expect(errorAlert).toBeVisible();
  89 |   await expect(errorAlert.getByRole('link', { name: /Se connecter|Sign in|Iniciar sesión/i })).toBeVisible();
  90 |   await expect(page).toHaveURL(/\/booking\/register\?next=%2Faccount%2Fprofile$/);
  91 | });
  92 | 
```