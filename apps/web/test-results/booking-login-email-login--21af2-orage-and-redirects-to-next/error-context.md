# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: booking-login.spec.ts >> email login stores session in sessionStorage and redirects to next
- Location: tests\e2e\booking-login.spec.ts:3:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByLabel(/^Mot de passe$|^Password$|^Contraseña$/i)

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
          - link "Connexion" [ref=e62] [cursor=pointer]:
            - /url: /booking/login?next=%2Faccount
        - button "Activer le mode sombre" [ref=e63] [cursor=pointer]:
          - img [ref=e64]
    - main [ref=e66]:
      - generic [ref=e67]:
        - heading "Connexion client" [level=1] [ref=e68]
        - paragraph [ref=e69]: Connectez-vous avec votre e-mail et mot de passe, ou utilisez Google pour poursuivre votre réservation.
        - generic [ref=e71]:
          - generic [ref=e72]:
            - generic [ref=e74]: Adresse e-mail*
            - textbox "Adresse e-mail" [active] [ref=e76]:
              - /placeholder: vous@exemple.com
              - text: client@example.com
          - generic [ref=e77]:
            - generic [ref=e78]:
              - generic [ref=e79]: Mot de passe*
              - link "Mot de passe oublié ?" [ref=e80] [cursor=pointer]:
                - /url: "#"
            - generic [ref=e81]:
              - textbox "Mot de passe" [ref=e82]:
                - /placeholder: ••••••••
              - button "Afficher le mot de passe" [ref=e84] [cursor=pointer]:
                - img [ref=e85]
          - button "Se connecter" [ref=e87] [cursor=pointer]:
            - generic [ref=e88]: Se connecter
            - generic [ref=e89]: →
        - generic [ref=e94]: ou
        - link "Se connecter avec Google" [ref=e95] [cursor=pointer]:
          - /url: http://localhost:3000/api/auth/google?next=%2Faccount%2Fprofile%3Fatg_dev_origin%3Dhttp%253A%252F%252F127.0.0.1%253A3002&web_origin=http%3A%2F%2F127.0.0.1%3A3002&client_instance=f8305696-4c81-4ee2-9dd5-b35e40caa94f
          - img [ref=e96]
          - text: Se connecter avec Google
        - generic [ref=e105]: Pas encore de compte ?
        - link "Créer un compte" [ref=e106] [cursor=pointer]:
          - /url: /booking/register?next=%2Faccount%2Fprofile
        - link "Retour aux hôtels" [ref=e107] [cursor=pointer]:
          - /url: /hotels
    - contentinfo [ref=e108]:
      - generic [ref=e111]:
        - generic [ref=e112]:
          - link "Africa Tourism Gate Africa Tourism Gate" [ref=e113] [cursor=pointer]:
            - /url: /
            - img "Africa Tourism Gate" [ref=e114]
            - generic [ref=e115]: Africa Tourism Gate
          - paragraph [ref=e116]: Votre passerelle vers les meilleures expériences de voyage en Afrique. Découvrez des destinations uniques et réservez en toute confiance.
          - link "En savoir plus" [ref=e117] [cursor=pointer]:
            - /url: /about/who-we-are
        - generic [ref=e118]:
          - heading "Nos Produits" [level=3] [ref=e119]
          - list [ref=e120]:
            - listitem [ref=e121]:
              - link "Hébergements Premium" [ref=e122] [cursor=pointer]:
                - /url: /hotels
                - img [ref=e123]
                - text: Hébergements Premium
            - listitem [ref=e125]:
              - link "Vols Première Classe" [ref=e126] [cursor=pointer]:
                - /url: /flights
                - img [ref=e127]
                - text: Vols Première Classe
            - listitem [ref=e129]:
              - link "Location de Voitures" [ref=e130] [cursor=pointer]:
                - /url: /cars
                - img [ref=e131]
                - text: Location de Voitures
            - listitem [ref=e133]:
              - link "Safaris & Tours" [ref=e134] [cursor=pointer]:
                - /url: /activities
                - img [ref=e135]
                - text: Safaris & Tours
            - listitem [ref=e137]:
              - link "Croisières Côtières" [ref=e138] [cursor=pointer]:
                - /url: /cruises
                - img [ref=e139]
                - text: Croisières Côtières
            - listitem [ref=e141]:
              - link "Forfaits" [ref=e142] [cursor=pointer]:
                - /url: /packages
                - img [ref=e143]
                - text: Forfaits
        - generic [ref=e145]:
          - heading "À propos" [level=3] [ref=e146]
          - list [ref=e147]:
            - listitem [ref=e148]:
              - link "Qui nous sommes" [ref=e149] [cursor=pointer]:
                - /url: /about/who-we-are
                - img [ref=e150]
                - text: Qui nous sommes
            - listitem [ref=e152]:
              - link "Notre histoire" [ref=e153] [cursor=pointer]:
                - /url: /about/our-history
                - img [ref=e154]
                - text: Notre histoire
            - listitem [ref=e156]:
              - link "Notre équipe" [ref=e157] [cursor=pointer]:
                - /url: /about/team
                - img [ref=e158]
                - text: Notre équipe
            - listitem [ref=e160]:
              - link "Comment nous travaillons" [ref=e161] [cursor=pointer]:
                - /url: /about/how-we-work
                - img [ref=e162]
                - text: Comment nous travaillons
            - listitem [ref=e164]:
              - link "Notre gouvernance" [ref=e165] [cursor=pointer]:
                - /url: /about/governance
                - img [ref=e166]
                - text: Notre gouvernance
            - listitem [ref=e168]:
              - link "Rapports et finances" [ref=e169] [cursor=pointer]:
                - /url: /about/reports
                - img [ref=e170]
                - text: Rapports et finances
            - listitem [ref=e172]:
              - link "Responsabilité" [ref=e173] [cursor=pointer]:
                - /url: /about/responsibility
                - img [ref=e174]
                - text: Responsabilité
            - listitem [ref=e176]:
              - link "Médias & ressources" [ref=e177] [cursor=pointer]:
                - /url: /about/media-resources
                - img [ref=e178]
                - text: Médias & ressources
            - listitem [ref=e180]:
              - link "Nous contacter" [ref=e181] [cursor=pointer]:
                - /url: /about/contact
                - img [ref=e182]
                - text: Nous contacter
        - generic [ref=e184]:
          - heading "Newsletter" [level=3] [ref=e185]
          - paragraph [ref=e186]: Inspiration, idées de voyages, bons plans et actualités.
          - generic [ref=e187]:
            - textbox "Adresse email" [ref=e188]
            - button "OK" [ref=e189] [cursor=pointer]
        - generic [ref=e190]:
          - heading "Contact" [level=3] [ref=e191]:
            - link "Contact" [ref=e192] [cursor=pointer]:
              - /url: /about/contact
          - generic [ref=e193]:
            - generic [ref=e194]:
              - img [ref=e195]
              - generic [ref=e197]: "+243975579097"
            - generic [ref=e198]:
              - img [ref=e199]
              - link "support@africatourismgate.org" [ref=e201] [cursor=pointer]:
                - /url: mailto:support@africatourismgate.org
            - generic [ref=e202]:
              - img [ref=e203]
              - generic [ref=e206]: Kinshasa, RD Congo
          - generic [ref=e207]:
            - link "Facebook" [ref=e208] [cursor=pointer]:
              - /url: https://www.facebook.com/africatourismgate
              - img [ref=e210]
            - link "X / Twitter" [ref=e212] [cursor=pointer]:
              - /url: https://x.com/Congotourismga1
              - img [ref=e214]
            - link "Instagram" [ref=e216] [cursor=pointer]:
              - /url: https://www.instagram.com/africatourismgate
              - img [ref=e218]
      - generic [ref=e221]:
        - paragraph [ref=e222]:
          - text: © 2026 Africa Tourism Gate|
          - link "Politique de Confidentialité" [ref=e223] [cursor=pointer]:
            - /url: /legal/privacy
          - text: "|"
          - link "Conditions d'utilisation" [ref=e224] [cursor=pointer]:
            - /url: /legal/terms
          - text: "|"
          - link "À propos" [ref=e225] [cursor=pointer]:
            - /url: /about/who-we-are
          - text: "|"
          - link "FAQ" [ref=e226] [cursor=pointer]:
            - /url: /support
          - text: "|"
          - link "Contact" [ref=e227] [cursor=pointer]:
            - /url: /about/contact
          - text: "|"
          - link "GAP" [ref=e228] [cursor=pointer]:
            - /url: http://localhost:3004
        - paragraph [ref=e229]:
          - text: Conçu par
          - strong [ref=e230]: Carin Siwa et Ruth Bwiza
  - alert [ref=e231]
  - generic "Notifications"
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test';
  2  | 
  3  | test('email login stores session in sessionStorage and redirects to next', async ({ page }) => {
  4  |   await page.route('**/api/auth/login', async (route) => {
  5  |     if (route.request().method() !== 'POST') {
  6  |       await route.continue();
  7  |       return;
  8  |     }
  9  |     await route.fulfill({
  10 |       status: 200,
  11 |       contentType: 'application/json',
  12 |       body: JSON.stringify({
  13 |         accessToken: 'e2e-email-token',
  14 |         refreshToken: 'e2e-email-refresh',
  15 |         expiresIn: 3600,
  16 |         user: {
  17 |           id: 'user-email-login',
  18 |           email: 'client@example.com',
  19 |           firstName: 'Client',
  20 |           lastName: 'Email',
  21 |           preferredLanguage: 'fr',
  22 |           organizationId: null,
  23 |           status: 'active',
  24 |         },
  25 |       }),
  26 |     });
  27 |   });
  28 | 
  29 |   await page.goto('/booking/login?next=%2Faccount%2Fprofile');
  30 |   await page.getByLabel(/Adresse e-mail|Email address|Correo electrónico/i).fill('client@example.com');
> 31 |   await page.getByLabel(/^Mot de passe$|^Password$|^Contraseña$/i).fill('secret-password');
     |                                                                    ^ Error: locator.fill: Test timeout of 30000ms exceeded.
  32 |   await page.getByRole('button', { name: /Se connecter|Sign in|Iniciar sesión/i }).click();
  33 | 
  34 |   await expect(page).toHaveURL(/\/account\/profile$/);
  35 | 
  36 |   const stored = await page.evaluate(() => ({
  37 |     session: window.sessionStorage.getItem('atg.web.session'),
  38 |     local: window.localStorage.getItem('atg.web.session'),
  39 |   }));
  40 |   expect(stored.session).toContain('e2e-email-token');
  41 |   expect(stored.session).toContain('e2e-email-refresh');
  42 |   expect(stored.local).toBeNull();
  43 | });
  44 | 
```