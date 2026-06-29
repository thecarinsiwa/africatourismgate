# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: activity-checkout.spec.ts >> activité Gombe City Tour: créneau complet grisé, panier -> recap -> demande assistée
- Location: tests\e2e\activity-checkout.spec.ts:45:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Gombe City Tour' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: 'Gombe City Tour' })

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
  - paragraph: "Error: Cannot find module './vendor-chunks/next@14.2.18_@playwright+test@1.60.0_react-dom@18.3.1_react@18.3.1__react@18.3.1.js' Require stack: - E:\\projects\\africatourismgate\\apps\\web\\.next\\server\\webpack-runtime.js - E:\\projects\\africatourismgate\\apps\\web\\.next\\server\\app\\activities\\[id]\\page.js - E:\\projects\\africatourismgate\\node_modules\\.pnpm\\next@14.2.18_@playwright+test@1.60.0_react-dom@18.3.1_react@18.3.1__react@18.3.1\\node_modules\\next\\dist\\server\\require.js - E:\\projects\\africatourismgate\\node_modules\\.pnpm\\next@14.2.18_@playwright+test@1.60.0_react-dom@18.3.1_react@18.3.1__react@18.3.1\\node_modules\\next\\dist\\server\\load-components.js - E:\\projects\\africatourismgate\\node_modules\\.pnpm\\next@14.2.18_@playwright+test@1.60.0_react-dom@18.3.1_react@18.3.1__react@18.3.1\\node_modules\\next\\dist\\build\\utils.js - E:\\projects\\africatourismgate\\node_modules\\.pnpm\\next@14.2.18_@playwright+test@1.60.0_react-dom@18.3.1_react@18.3.1__react@18.3.1\\node_modules\\next\\dist\\server\\dev\\static-paths-worker.js - E:\\projects\\africatourismgate\\node_modules\\.pnpm\\next@14.2.18_@playwright+test@1.60.0_react-dom@18.3.1_react@18.3.1__react@18.3.1\\node_modules\\next\\dist\\compiled\\jest-worker\\processChild.js"
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
  24  |     {
  25  |       scheduleId: SCHEDULE_MORNING,
  26  |       startDatetime: '2026-07-20T09:00:00.000Z',
  27  |       capacity: 12,
  28  |       bookedCount: 2,
  29  |       remainingPlaces: 10,
  30  |       priceCents: UNIT_PRICE_CENTS,
  31  |       currency: 'USD',
  32  |     },
  33  |     {
  34  |       scheduleId: SCHEDULE_AFTERNOON,
  35  |       startDatetime: '2026-07-20T14:00:00.000Z',
  36  |       capacity: 8,
  37  |       bookedCount: 8,
  38  |       remainingPlaces: 0,
  39  |       priceCents: UNIT_PRICE_CENTS,
  40  |       currency: 'USD',
  41  |     },
  42  |   ],
  43  | };
  44  | 
  45  | test('activité Gombe City Tour: créneau complet grisé, panier -> recap -> demande assistée', async ({
  46  |   page,
  47  | }) => {
  48  |   test.setTimeout(60_000);
  49  | 
  50  |   await page.addInitScript(() => {
  51  |     window.sessionStorage.setItem(
  52  |       'atg.web.session',
  53  |       JSON.stringify({
  54  |         accessToken: 'e2e-token',
  55  |         refreshToken: 'e2e-refresh-token',
  56  |         expiresAt: Date.now() + 60 * 60 * 1000,
  57  |         user: {
  58  |           id: 'user-e2e',
  59  |           email: 'client.e2e@example.com',
  60  |           firstName: 'Client',
  61  |           lastName: 'E2E',
  62  |           organizationId: null,
  63  |           status: 'active',
  64  |         },
  65  |       }),
  66  |     );
  67  |   });
  68  | 
  69  |   await page.route(`**/api/public/activities/${ACTIVITY_ID}**`, async (route) => {
  70  |     await route.fulfill({
  71  |       status: 200,
  72  |       contentType: 'application/json',
  73  |       body: JSON.stringify(activityDetailMock),
  74  |     });
  75  |   });
  76  | 
  77  |   let postedItems: unknown = null;
  78  | 
  79  |   await page.route('**/api/bookings/request', async (route) => {
  80  |     if (route.request().method() !== 'POST') {
  81  |       await route.continue();
  82  |       return;
  83  |     }
  84  | 
  85  |     postedItems = route.request().postDataJSON();
  86  | 
  87  |     await route.fulfill({
  88  |       status: 201,
  89  |       contentType: 'application/json',
  90  |       body: JSON.stringify({
  91  |         bookingId: BOOKING_ID,
  92  |         status: 'pending_approval',
  93  |         message: 'Booking request submitted',
  94  |         totalCents: TOTAL_CENTS,
  95  |         currency: 'USD',
  96  |       }),
  97  |     });
  98  |   });
  99  | 
  100 |   await page.route(`**/api/bookings/${BOOKING_ID}`, async (route) => {
  101 |     await route.fulfill({
  102 |       status: 200,
  103 |       contentType: 'application/json',
  104 |       body: JSON.stringify({
  105 |         booking: {
  106 |           id: BOOKING_ID,
  107 |           userId: 'user-e2e',
  108 |           status: 'pending_approval',
  109 |           totalCents: TOTAL_CENTS,
  110 |           currency: 'USD',
  111 |           promoCodeId: null,
  112 |           createdAt: new Date().toISOString(),
  113 |           updatedAt: null,
  114 |         },
  115 |         items: [],
  116 |         totalCents: TOTAL_CENTS,
  117 |         currency: 'USD',
  118 |       }),
  119 |     });
  120 |   });
  121 | 
  122 |   await page.goto(`/activities/${ACTIVITY_ID}?date=${DATE}&participants=${PARTICIPANTS}`);
  123 | 
> 124 |   await expect(page.getByRole('heading', { name: 'Gombe City Tour' })).toBeVisible();
      |                                                                        ^ Error: expect(locator).toBeVisible() failed
  125 |   await expect(page.getByText('Tourism Gate Experiences Kinshasa')).toBeVisible();
  126 | 
  127 |   const schedules = page.locator('#schedules');
  128 |   await expect(schedules.getByRole('heading', { name: /cr[ée]neaux|time slots|horarios/i })).toBeVisible();
  129 | 
  130 |   const scheduleGroup = schedules.getByRole('radiogroup');
  131 |   await expect(scheduleGroup).toBeVisible();
  132 | 
  133 |   const soldOutChip = scheduleGroup.getByRole('radio', { name: /complet|sold out|agotado/i });
  134 |   await expect(soldOutChip).toBeVisible();
  135 |   await expect(soldOutChip).toBeDisabled();
  136 | 
  137 |   const availableChip = scheduleGroup
  138 |     .getByRole('radio')
  139 |     .filter({ hasNotText: /complet|sold out|agotado/i })
  140 |     .first();
  141 |   await availableChip.click();
  142 |   await expect(availableChip).toHaveAttribute('aria-checked', 'true');
  143 | 
  144 |   await page.locator('button:visible', { hasText: /r[ée]server|book now|reservar/i }).first().click();
  145 |   await expect(page).toHaveURL(/\/booking\/cart\?.*kind=activity_schedule/);
  146 |   await expect(page.getByText('Gombe City Tour')).toBeVisible();
  147 |   await expect(page.getByText('Tourism Gate Experiences Kinshasa')).toBeVisible();
  148 | 
  149 |   await page.goto(
  150 |     `/booking/recap?kind=activity_schedule&activityId=${ACTIVITY_ID}&scheduleId=${SCHEDULE_MORNING}&date=${DATE}&participants=${PARTICIPANTS}`,
  151 |   );
  152 |   await expect(page.getByRole('heading', { name: /recapitulatif/i })).toBeVisible();
  153 |   await expect(page.getByText('Gombe City Tour')).toBeVisible();
  154 |   await expect(page.getByText('Tourism Gate Experiences Kinshasa')).toBeVisible();
  155 | 
  156 |   await expect(
  157 |     page.getByRole('button', { name: /demander une r[ée]servation|request a booking|solicitar una reserva/i }),
  158 |   ).toBeEnabled();
  159 |   await page
  160 |     .getByRole('button', { name: /demander une r[ée]servation|request a booking|solicitar una reserva/i })
  161 |     .click();
  162 |   await expect(page).toHaveURL(new RegExp(`/booking/request-success\\?booking_id=${BOOKING_ID}`), {
  163 |     timeout: 15_000,
  164 |   });
  165 | 
  166 |   expect(postedItems).toEqual({
  167 |     items: [
  168 |       {
  169 |         itemType: 'activity_schedule',
  170 |         referenceId: SCHEDULE_MORNING,
  171 |         quantity: PARTICIPANTS,
  172 |       },
  173 |     ],
  174 |   });
  175 | 
  176 |   await expect(page.getByText(/demande envoy[ée]e|request submitted|solicitud enviada/i)).toBeVisible();
  177 |   await expect(page.getByText(/r[ée]f\. demande|request ref|ref\. solicitud/i)).toBeVisible();
  178 | });
  179 | 
```