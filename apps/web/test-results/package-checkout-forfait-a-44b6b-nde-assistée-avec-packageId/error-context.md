# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: package-checkout.spec.ts >> forfait activités: configurer créneaux, panier -> recap -> demande assistée avec packageId
- Location: tests\e2e\package-checkout.spec.ts:104:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Kinshasa Activities Duo' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: 'Kinshasa Activities Duo' })

```

```yaml
- alert
- dialog "Server Error":
  - navigation:
    - button "previous" [disabled]:
      - img "previous"
    - button "next" [disabled]:
      - img "next"
    - text: 1 of 1 error Next.js (14.2.18) is outdated
    - link "(learn more)":
      - /url: https://nextjs.org/docs/messages/version-staleness
  - heading "Server Error" [level=1]
  - paragraph: "Error: Cannot find module './vendor-chunks/next@14.2.18_@playwright+test@1.60.0_react-dom@18.3.1_react@18.3.1__react@18.3.1.js' Require stack: - E:\\projects\\africatourismgate\\apps\\web\\.next\\server\\webpack-runtime.js - E:\\projects\\africatourismgate\\apps\\web\\.next\\server\\app\\packages\\[id]\\page.js - E:\\projects\\africatourismgate\\node_modules\\.pnpm\\next@14.2.18_@playwright+test@1.60.0_react-dom@18.3.1_react@18.3.1__react@18.3.1\\node_modules\\next\\dist\\server\\require.js - E:\\projects\\africatourismgate\\node_modules\\.pnpm\\next@14.2.18_@playwright+test@1.60.0_react-dom@18.3.1_react@18.3.1__react@18.3.1\\node_modules\\next\\dist\\server\\load-components.js - E:\\projects\\africatourismgate\\node_modules\\.pnpm\\next@14.2.18_@playwright+test@1.60.0_react-dom@18.3.1_react@18.3.1__react@18.3.1\\node_modules\\next\\dist\\build\\utils.js - E:\\projects\\africatourismgate\\node_modules\\.pnpm\\next@14.2.18_@playwright+test@1.60.0_react-dom@18.3.1_react@18.3.1__react@18.3.1\\node_modules\\next\\dist\\server\\dev\\static-paths-worker.js - E:\\projects\\africatourismgate\\node_modules\\.pnpm\\next@14.2.18_@playwright+test@1.60.0_react-dom@18.3.1_react@18.3.1__react@18.3.1\\node_modules\\next\\dist\\compiled\\jest-worker\\processChild.js"
  - text: This error happened while generating the page. Any console logs will be displayed in the terminal window.
  - heading "Call Stack" [level=2]
  - group:
    - img
    - img
    - text: Next.js
  - heading "TracingChannel.traceSync" [level=3]
  - text: node:diagnostics_channel (328:14)
  - group:
    - img
    - img
    - text: Next.js
```

# Test source

```ts
  99  |   SCHEDULE_B,
  100 |   '2026-07-20T16:00:00.000Z',
  101 |   UNIT_PRICE_B,
  102 | );
  103 | 
  104 | test('forfait activités: configurer créneaux, panier -> recap -> demande assistée avec packageId', async ({
  105 |   page,
  106 | }) => {
  107 |   test.setTimeout(60_000);
  108 | 
  109 |   await page.addInitScript(() => {
  110 |     window.sessionStorage.setItem(
  111 |       'atg.web.session',
  112 |       JSON.stringify({
  113 |         accessToken: 'e2e-token',
  114 |         refreshToken: 'e2e-refresh-token',
  115 |         expiresAt: Date.now() + 60 * 60 * 1000,
  116 |         user: {
  117 |           id: 'user-e2e',
  118 |           email: 'client.e2e@example.com',
  119 |           firstName: 'Client',
  120 |           lastName: 'E2E',
  121 |           organizationId: null,
  122 |           status: 'active',
  123 |         },
  124 |       }),
  125 |     );
  126 |   });
  127 | 
  128 |   await page.route(`**/api/public/packages/${PACKAGE_ID}**`, async (route) => {
  129 |     await route.fulfill({
  130 |       status: 200,
  131 |       contentType: 'application/json',
  132 |       body: JSON.stringify(packageDetailMock),
  133 |     });
  134 |   });
  135 | 
  136 |   await page.route(`**/api/public/activities/${ACTIVITY_A}**`, async (route) => {
  137 |     await route.fulfill({
  138 |       status: 200,
  139 |       contentType: 'application/json',
  140 |       body: JSON.stringify(activityAMock),
  141 |     });
  142 |   });
  143 | 
  144 |   await page.route(`**/api/public/activities/${ACTIVITY_B}**`, async (route) => {
  145 |     await route.fulfill({
  146 |       status: 200,
  147 |       contentType: 'application/json',
  148 |       body: JSON.stringify(activityBMock),
  149 |     });
  150 |   });
  151 | 
  152 |   let postedCheckout: unknown = null;
  153 | 
  154 |   await page.route('**/api/bookings/request', async (route) => {
  155 |     if (route.request().method() !== 'POST') {
  156 |       await route.continue();
  157 |       return;
  158 |     }
  159 | 
  160 |     postedCheckout = route.request().postDataJSON();
  161 | 
  162 |     await route.fulfill({
  163 |       status: 201,
  164 |       contentType: 'application/json',
  165 |       body: JSON.stringify({
  166 |         bookingId: BOOKING_ID,
  167 |         status: 'pending_approval',
  168 |         message: 'Booking request submitted',
  169 |         totalCents: TOTAL_CENTS,
  170 |         currency: 'USD',
  171 |       }),
  172 |     });
  173 |   });
  174 | 
  175 |   await page.route(`**/api/bookings/${BOOKING_ID}`, async (route) => {
  176 |     await route.fulfill({
  177 |       status: 200,
  178 |       contentType: 'application/json',
  179 |       body: JSON.stringify({
  180 |         booking: {
  181 |           id: BOOKING_ID,
  182 |           userId: 'user-e2e',
  183 |           status: 'pending_approval',
  184 |           totalCents: TOTAL_CENTS,
  185 |           currency: 'USD',
  186 |           promoCodeId: null,
  187 |           createdAt: new Date().toISOString(),
  188 |           updatedAt: null,
  189 |         },
  190 |         items: [],
  191 |         totalCents: TOTAL_CENTS,
  192 |         currency: 'USD',
  193 |       }),
  194 |     });
  195 |   });
  196 | 
  197 |   await page.goto(`/packages/${PACKAGE_ID}?date=${DATE}&participants=${PARTICIPANTS}`);
  198 | 
> 199 |   await expect(page.getByRole('heading', { name: 'Kinshasa Activities Duo' })).toBeVisible();
      |                                                                                ^ Error: expect(locator).toBeVisible() failed
  200 |   await expect(
  201 |     page.getByRole('heading', { name: /choisir les cr|choose time slots|elegir horarios/i }),
  202 |   ).toBeVisible();
  203 | 
  204 |   const gombeSection = page.locator('article').filter({ hasText: 'Gombe City Tour' });
  205 |   await gombeSection.getByRole('radio').first().click();
  206 | 
  207 |   const riverSection = page.locator('article').filter({ hasText: 'Congo River Walk' });
  208 |   await riverSection.getByRole('radio').first().click();
  209 | 
  210 |   await page.getByRole('button', { name: /voir le r[ée]cap|view summary|ver resumen/i }).click();
  211 |   await expect(
  212 |     page.getByRole('heading', { name: /r[ée]capitulatif du forfait|package summary|resumen del paquete/i }),
  213 |   ).toBeVisible();
  214 | 
  215 |   await page.locator('#reserve').getByRole('button', {
  216 |     name: /ajouter au panier|add to cart|a[ñn]adir al carrito/i,
  217 |   }).click();
  218 | 
  219 |   await expect(page).toHaveURL(/\/booking\/cart\?.*kind=package/);
  220 |   await expect(page.getByText('Kinshasa Activities Duo')).toBeVisible();
  221 |   await expect(page.getByText('Gombe City Tour')).toBeVisible();
  222 |   await expect(page.getByText('Congo River Walk')).toBeVisible();
  223 | 
  224 |   await page.getByRole('link', { name: /continuer vers r[ée]cap/i }).click();
  225 |   await expect(page).toHaveURL(/\/booking\/recap\?.*kind=package/);
  226 |   await expect(page.getByRole('heading', { name: /recapitulatif/i })).toBeVisible();
  227 | 
  228 |   await expect(
  229 |     page.getByRole('button', { name: /demander une r[ée]servation|request a booking|solicitar una reserva/i }),
  230 |   ).toBeEnabled();
  231 |   await page
  232 |     .getByRole('button', { name: /demander une r[ée]servation|request a booking|solicitar una reserva/i })
  233 |     .click();
  234 |   await expect(page).toHaveURL(new RegExp(`/booking/request-success\\?booking_id=${BOOKING_ID}`), {
  235 |     timeout: 15_000,
  236 |   });
  237 | 
  238 |   expect(postedCheckout).toEqual({
  239 |     packageId: PACKAGE_ID,
  240 |     items: [
  241 |       {
  242 |         itemType: 'activity_schedule',
  243 |         referenceId: SCHEDULE_A,
  244 |         quantity: PARTICIPANTS,
  245 |       },
  246 |       {
  247 |         itemType: 'activity_schedule',
  248 |         referenceId: SCHEDULE_B,
  249 |         quantity: PARTICIPANTS,
  250 |       },
  251 |     ],
  252 |   });
  253 | 
  254 |   await expect(page.getByText(/demande envoy[ée]e|request submitted|solicitud enviada/i)).toBeVisible();
  255 |   await expect(page.getByText(/r[ée]f\. demande|request ref|ref\. solicitud/i)).toBeVisible();
  256 | });
  257 | 
```