# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: reviews.spec.ts >> booking detail shows post-stay review form when canReview
- Location: tests\e2e\reviews.spec.ts:127:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/Laisser un avis|Leave a review|Dejar una opinión/i)
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText(/Laisser un avis|Leave a review|Dejar una opinión/i)

```

```yaml
- main:
  - heading "Something went wrong" [level=2]
  - paragraph: entries.map is not a function
  - button "Try again"
- alert
- img
- text: 4 errors
- button "Hide Errors":
  - img
```

# Test source

```ts
  74  |   };
  75  | }
  76  | 
  77  | test('hotel detail shows guest average rating and reviews section', async ({ page }) => {
  78  |   await page.route(`**/api/public/accommodations/${PROPERTY_ID}**`, async (route) => {
  79  |     if (route.request().method() !== 'GET') {
  80  |       await route.continue();
  81  |       return;
  82  |     }
  83  |     const url = route.request().url();
  84  |     if (url.includes('/reviews')) {
  85  |       await route.fulfill({
  86  |         status: 200,
  87  |         contentType: 'application/json',
  88  |         body: JSON.stringify({
  89  |           data: [
  90  |             {
  91  |               id: 'review-1',
  92  |               rating: 5,
  93  |               title: 'Excellent',
  94  |               body: 'Great stay.',
  95  |               authorFirstName: 'Alice',
  96  |               createdAt: '2026-05-10T12:00:00.000Z',
  97  |             },
  98  |             {
  99  |               id: 'review-2',
  100 |               rating: 4,
  101 |               title: null,
  102 |               body: 'Very good hotel.',
  103 |               authorFirstName: 'Bob',
  104 |               createdAt: '2026-04-20T09:00:00.000Z',
  105 |             },
  106 |           ],
  107 |           meta: { total: 2, page: 1, limit: 5, totalPages: 1 },
  108 |         }),
  109 |       });
  110 |       return;
  111 |     }
  112 |     await route.fulfill({
  113 |       status: 200,
  114 |       contentType: 'application/json',
  115 |       body: JSON.stringify(minimalPropertyDetail()),
  116 |     });
  117 |   });
  118 | 
  119 |   await page.goto(`/hotels/${PROPERTY_ID}`);
  120 |   await expect(page.getByRole('heading', { name: 'Tourism Gate Demo Hotel' })).toBeVisible();
  121 |   await expect(page.getByText('4.5').first()).toBeVisible();
  122 |   await expect(page.getByText(/2.*(avis|reviews|opiniones)/i).first()).toBeVisible();
  123 |   await expect(page.getByText('Excellent')).toBeVisible();
  124 |   await expect(page.getByText('Great stay.')).toBeVisible();
  125 | });
  126 | 
  127 | test('booking detail shows post-stay review form when canReview', async ({ page }) => {
  128 |   await mockSession(page);
  129 | 
  130 |   await page.route(`**/api/bookings/${BOOKING_ID}**`, async (route) => {
  131 |     const url = route.request().url();
  132 |     if (route.request().method() === 'GET' && !url.includes('/reviews')) {
  133 |       await route.fulfill({
  134 |         status: 200,
  135 |         contentType: 'application/json',
  136 |         body: JSON.stringify({
  137 |           booking: {
  138 |             id: BOOKING_ID,
  139 |             userId: USER_ID,
  140 |             status: 'confirmed',
  141 |             totalCents: 18000,
  142 |             currency: 'USD',
  143 |             promoCodeId: null,
  144 |             createdAt: '2026-04-01T10:00:00.000Z',
  145 |             updatedAt: null,
  146 |           },
  147 |           items: [
  148 |             {
  149 |               id: 'item-1',
  150 |               bookingId: BOOKING_ID,
  151 |               itemType: 'room',
  152 |               referenceId: 'room-1',
  153 |               titleSnapshot: 'Standard Double',
  154 |               quantity: 1,
  155 |               unitPriceCents: 9000,
  156 |               startDate: '2026-05-01',
  157 |               endDate: '2026-05-02',
  158 |               createdAt: '2026-04-01T10:00:00.000Z',
  159 |               updatedAt: null,
  160 |             },
  161 |           ],
  162 |           totalCents: 18000,
  163 |           currency: 'USD',
  164 |           review: null,
  165 |           canReview: true,
  166 |         }),
  167 |       });
  168 |       return;
  169 |     }
  170 |     await route.continue();
  171 |   });
  172 | 
  173 |   await page.goto(`/account/reservations/${BOOKING_ID}`);
> 174 |   await expect(page.getByText(/Laisser un avis|Leave a review|Dejar una opinión/i)).toBeVisible();
      |                                                                                     ^ Error: expect(locator).toBeVisible() failed
  175 |   await expect(page.getByRole('radiogroup')).toBeVisible();
  176 | });
  177 | 
  178 | test('bookings list shows leave review CTA when canReview', async ({ page }) => {
  179 |   await mockSession(page);
  180 | 
  181 |   await page.route('**/api/bookings?**', async (route) => {
  182 |     if (route.request().method() !== 'GET') {
  183 |       await route.continue();
  184 |       return;
  185 |     }
  186 |     await route.fulfill({
  187 |       status: 200,
  188 |       contentType: 'application/json',
  189 |       body: JSON.stringify({
  190 |         data: [
  191 |           {
  192 |             id: BOOKING_ID,
  193 |             userId: USER_ID,
  194 |             status: 'confirmed',
  195 |             totalCents: 18000,
  196 |             currency: 'USD',
  197 |             promoCodeId: null,
  198 |             createdAt: '2026-04-01T10:00:00.000Z',
  199 |             updatedAt: null,
  200 |             clientEmail: 'reviews.e2e@example.com',
  201 |             clientFirstName: 'Review',
  202 |             clientLastName: 'E2E',
  203 |             organizationId: null,
  204 |             canReview: true,
  205 |           },
  206 |         ],
  207 |         meta: { total: 1, page: 1, limit: 50, totalPages: 1 },
  208 |       }),
  209 |     });
  210 |   });
  211 | 
  212 |   await page.goto('/account/reservations');
  213 |   await expect(page.getByRole('link', { name: /Laisser un avis|Leave a review/i })).toBeVisible();
  214 |   await expect(page.getByText(/séjour.*avis|stay.*review/i)).toBeVisible();
  215 | });
  216 | 
  217 | test('booking detail submits review via POST /bookings/:id/reviews', async ({ page }) => {
  218 |   await mockSession(page);
  219 | 
  220 |   let postReviewCalled = false;
  221 | 
  222 |   await page.route(`**/api/bookings/${BOOKING_ID}**`, async (route) => {
  223 |     const url = route.request().url();
  224 |     if (route.request().method() === 'GET' && !url.includes('/reviews')) {
  225 |       await route.fulfill({
  226 |         status: 200,
  227 |         contentType: 'application/json',
  228 |         body: JSON.stringify({
  229 |           booking: {
  230 |             id: BOOKING_ID,
  231 |             userId: USER_ID,
  232 |             status: 'confirmed',
  233 |             totalCents: 18000,
  234 |             currency: 'USD',
  235 |             promoCodeId: null,
  236 |             createdAt: '2026-04-01T10:00:00.000Z',
  237 |             updatedAt: null,
  238 |           },
  239 |           items: [
  240 |             {
  241 |               id: 'item-1',
  242 |               bookingId: BOOKING_ID,
  243 |               itemType: 'room',
  244 |               referenceId: 'room-1',
  245 |               titleSnapshot: 'Standard Double',
  246 |               quantity: 1,
  247 |               unitPriceCents: 9000,
  248 |               startDate: '2026-05-01',
  249 |               endDate: '2026-05-02',
  250 |               createdAt: '2026-04-01T10:00:00.000Z',
  251 |               updatedAt: null,
  252 |             },
  253 |           ],
  254 |           totalCents: 18000,
  255 |           currency: 'USD',
  256 |           review: null,
  257 |           canReview: true,
  258 |         }),
  259 |       });
  260 |       return;
  261 |     }
  262 |     if (route.request().method() === 'POST' && url.includes('/reviews')) {
  263 |       postReviewCalled = true;
  264 |       const body = route.request().postDataJSON() as { rating: number; title?: string };
  265 |       await route.fulfill({
  266 |         status: 201,
  267 |         contentType: 'application/json',
  268 |         body: JSON.stringify({
  269 |           id: 'review-new',
  270 |           rating: body.rating,
  271 |           title: body.title ?? null,
  272 |           body: 'E2E comment',
  273 |           authorFirstName: 'Review',
  274 |           createdAt: '2026-06-02T14:00:00.000Z',
```