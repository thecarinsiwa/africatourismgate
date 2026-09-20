# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: reviews.spec.ts >> booking detail submits review via POST /bookings/:id/reviews
- Location: tests\e2e\reviews.spec.ts:217:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('radio', { name: /5 sur 5|5 out of 5|5 de 5/i })
    - locator resolved to <button role="radio" type="button" aria-checked="false" aria-label="5 sur 5" class="rounded p-0.5 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60">…</button>
  - attempting click action
    - waiting for element to be visible, enabled and stable
  - element was detached from the DOM, retrying

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e3]:
    - heading "Something went wrong" [level=2] [ref=e4]
    - paragraph [ref=e5]: entries.map is not a function
    - button "Try again" [ref=e6] [cursor=pointer]
  - alert [ref=e7]
  - generic "Notifications"
  - generic [ref=e10] [cursor=pointer]:
    - img [ref=e11]
    - generic [ref=e13]: 4 errors
    - button "Hide Errors" [ref=e14]:
      - img [ref=e15]
```

# Test source

```ts
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
  275 |         }),
  276 |       });
  277 |       return;
  278 |     }
  279 |     await route.continue();
  280 |   });
  281 | 
  282 |   await page.goto(`/account/reservations/${BOOKING_ID}`);
> 283 |   await page.getByRole('radio', { name: /5 sur 5|5 out of 5|5 de 5/i }).click();
      |                                                                         ^ Error: locator.click: Test timeout of 30000ms exceeded.
  284 |   await page.locator('#review-title').fill('E2E stay');
  285 |   await page.locator('#review-body').fill('E2E comment');
  286 |   await page.getByRole('button', { name: /Publier mon avis|Submit review|Enviar reseña/i }).click();
  287 | 
  288 |   await expect(
  289 |     page.getByRole('heading', { name: /Votre avis|Your review|Su reseña/i }),
  290 |   ).toBeVisible();
  291 |   await expect(page.getByText('E2E stay')).toBeVisible();
  292 |   expect(postReviewCalled).toBe(true);
  293 | });
  294 | 
```