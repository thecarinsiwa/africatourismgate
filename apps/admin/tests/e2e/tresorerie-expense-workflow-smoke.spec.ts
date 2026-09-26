import { expect, test } from '@playwright/test';
import { loginAsSeedAdmin } from './helpers/admin-auth';
import {
  E2E_PNG_BYTES,
  EXIT_DETAIL_HEADING,
  EXIT_MARK_DISBURSED,
  EXIT_MARK_RECORDED,
  EXIT_SUBMIT_CREATE,
  STATUS_AUTHORIZED,
  STATUS_CLOSED,
  STATUS_DISBURSED,
  STATUS_DRAFT,
  STATUS_RECORDED,
  STATUS_SUBMITTED,
  STATUS_VALIDATED,
  TREASURY_NEED_DETAIL_HEADING,
  TREASURY_NEED_SUBMIT_CREATE,
  TREASURY_NEW_NEED_BUTTON,
  WORKFLOW_AUTHORIZE,
  WORKFLOW_DISBURSE,
  WORKFLOW_PROGRESS_ARIA,
  WORKFLOW_SUBMIT,
  WORKFLOW_VALIDATE,
  fillExpenseRequestCreateForm,
  fillFundExitCreateForm,
  navigateToTreasuryNeedsViaNav,
  runExpenseRequestTransition,
  uniqueExpenseRequestTitle,
  uniqueFundExitReference,
  waitForPageIdle,
} from './helpers/treasury-e2e';

/**
 * TRESO-043 — happy path circuit état de besoin → sortie enregistrée.
 * Données isolées via titre / référence `E2E-BESOIN-*` / `E2E-SORTIE-*`.
 */
test.describe('Trésorerie — circuit sortie (workflow)', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await loginAsSeedAdmin(page);
  });

  test('besoin → valider → autoriser → décaisser → justificatif → enregistrée', async ({
    page,
  }) => {
    const title = uniqueExpenseRequestTitle();
    const exitRef = uniqueFundExitReference();

    await navigateToTreasuryNeedsViaNav(page);
    await page.getByRole('link', { name: TREASURY_NEW_NEED_BUTTON }).click();
    await expect(page).toHaveURL(/\/tresorerie\/besoins\/nouveau\/?$/, {
      timeout: 30_000,
    });
    await waitForPageIdle(page);

    await fillExpenseRequestCreateForm(page, { title });
    await page.getByRole('button', { name: TREASURY_NEED_SUBMIT_CREATE }).click();

    await expect(page).toHaveURL(
      /\/tresorerie\/besoins\/[0-9a-f-]{36}\/voir\/?$/i,
      { timeout: 60_000 },
    );
    await waitForPageIdle(page);

    const needId = page.url().match(
      /\/tresorerie\/besoins\/([0-9a-f-]{36})/i,
    )?.[1];
    expect(needId).toBeTruthy();

    await expect(
      page.getByRole('heading', { name: TREASURY_NEED_DETAIL_HEADING }),
    ).toBeVisible();
    await expect(page.getByText(title)).toBeVisible();
    await expect(page.getByText(STATUS_DRAFT).first()).toBeVisible();

    const progress = page.getByRole('group', { name: WORKFLOW_PROGRESS_ARIA });
    await expect(progress).toBeVisible();
    await expect(
      progress.getByText(/^Brouillon$|^Draft$|^Borrador$/i),
    ).toBeVisible();

    await runExpenseRequestTransition(page, WORKFLOW_SUBMIT);
    await expect(page.getByText(STATUS_SUBMITTED).first()).toBeVisible({
      timeout: 30_000,
    });

    await runExpenseRequestTransition(page, WORKFLOW_VALIDATE);
    await expect(page.getByText(STATUS_VALIDATED).first()).toBeVisible({
      timeout: 30_000,
    });

    await runExpenseRequestTransition(page, WORKFLOW_AUTHORIZE);
    await expect(page.getByText(STATUS_AUTHORIZED).first()).toBeVisible({
      timeout: 30_000,
    });

    await page.getByRole('link', { name: WORKFLOW_DISBURSE }).first().click();
    await expect(page).toHaveURL(
      /\/tresorerie\/sorties\/nouveau\?expenseRequestId=/i,
      { timeout: 30_000 },
    );
    await waitForPageIdle(page);

    await fillFundExitCreateForm(page, { reference: exitRef });
    await page.getByRole('button', { name: EXIT_SUBMIT_CREATE }).click();

    await expect(page).toHaveURL(
      /\/tresorerie\/sorties\/[0-9a-f-]{36}\/voir\/?$/i,
      { timeout: 60_000 },
    );
    await waitForPageIdle(page);
    await expect(
      page.getByRole('heading', { name: EXIT_DETAIL_HEADING }),
    ).toBeVisible();
    await expect(page.getByText(exitRef)).toBeVisible();
    await expect(page.getByText(STATUS_DRAFT).first()).toBeVisible();

    // Transition illégale côté UI : pas de « enregistrée » tant que draft
    await expect(
      page.getByRole('button', { name: EXIT_MARK_RECORDED }),
    ).toHaveCount(0);

    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeAttached({ timeout: 15_000 });
    await fileInput.setInputFiles({
      name: 'e2e-justificatif.png',
      mimeType: 'image/png',
      buffer: E2E_PNG_BYTES,
    });
    await expect(page.getByText('e2e-justificatif.png')).toBeVisible({
      timeout: 30_000,
    });

    await page.getByRole('button', { name: EXIT_MARK_DISBURSED }).click();
    await expect(page.getByText(STATUS_DISBURSED).first()).toBeVisible({
      timeout: 30_000,
    });

    await page.getByRole('button', { name: EXIT_MARK_RECORDED }).click();
    await expect(page.getByText(STATUS_RECORDED).first()).toBeVisible({
      timeout: 30_000,
    });

    await page.goto(`/tresorerie/besoins/${needId}/voir`, {
      waitUntil: 'domcontentloaded',
    });
    await waitForPageIdle(page);
    await expect(page.getByText(STATUS_CLOSED).first()).toBeVisible({
      timeout: 30_000,
    });
    await expect(
      page.getByRole('group', { name: WORKFLOW_PROGRESS_ARIA }),
    ).toBeVisible();
    await expect(
      page
        .getByRole('group', { name: WORKFLOW_PROGRESS_ARIA })
        .getByText(/^Enregistrement$|^Recording$|^Registro$/i),
    ).toBeVisible();
  });

  test('transition illégale sortie draft → recorded refusée (API)', async ({
    page,
    request,
  }) => {
    const title = uniqueExpenseRequestTitle();
    const exitRef = uniqueFundExitReference();

    await navigateToTreasuryNeedsViaNav(page);
    await page.getByRole('link', { name: TREASURY_NEW_NEED_BUTTON }).click();
    await waitForPageIdle(page);
    await fillExpenseRequestCreateForm(page, {
      title,
      amountMajor: '100.00',
    });
    await page.getByRole('button', { name: TREASURY_NEED_SUBMIT_CREATE }).click();
    await expect(page).toHaveURL(/\/voir\/?$/i, { timeout: 60_000 });
    await waitForPageIdle(page);

    await runExpenseRequestTransition(page, WORKFLOW_SUBMIT);
    await runExpenseRequestTransition(page, WORKFLOW_VALIDATE);
    await runExpenseRequestTransition(page, WORKFLOW_AUTHORIZE);

    await page.getByRole('link', { name: WORKFLOW_DISBURSE }).first().click();
    await waitForPageIdle(page);
    await fillFundExitCreateForm(page, {
      reference: exitRef,
      amountMajor: '100.00',
    });
    await page.getByRole('button', { name: EXIT_SUBMIT_CREATE }).click();
    await expect(page).toHaveURL(/\/sorties\/[0-9a-f-]{36}\/voir/i, {
      timeout: 60_000,
    });

    const exitId = page.url().match(/\/sorties\/([0-9a-f-]{36})/i)?.[1];
    expect(exitId).toBeTruthy();

    await expect(
      page.getByRole('button', { name: EXIT_MARK_RECORDED }),
    ).toHaveCount(0);
    await expect(
      page.getByRole('button', { name: EXIT_MARK_DISBURSED }),
    ).toBeVisible();

    const cookies = await page.context().cookies();
    const access = cookies.find((c) => c.name === 'atg.admin.access')?.value;
    expect(access).toBeTruthy();

    const apiURL = process.env.PLAYWRIGHT_API_URL ?? 'http://localhost:3000';
    const response = await request.post(
      `${apiURL}/api/fund-exits/${exitId}/transition`,
      {
        headers: {
          Authorization: `Bearer ${decodeURIComponent(access!)}`,
          'Content-Type': 'application/json',
        },
        data: { toStatus: 'recorded' },
      },
    );
    expect(response.status()).toBe(400);
    const body = await response.text();
    expect(body.toLowerCase()).toMatch(/illegal|transition/);
  });
});
