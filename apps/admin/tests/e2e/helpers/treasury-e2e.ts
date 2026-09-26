import { expect, type Page } from '@playwright/test';
import { SEED_ORGANIZATION_ID, waitForPageIdle } from './phase3-qa';

export { SEED_ORGANIZATION_ID, waitForPageIdle };

/** Nav group label (FR / EN / ES). */
export const TREASURY_NAV_GROUP = /^Trésorerie$|^Treasury$|^Tesorería$/i;

/** Sidebar child — fund entries list. */
export const TREASURY_ENTRIES_NAV =
  /^Entrées de fonds$|^Fund entries$|^Entradas de fondos$/i;

export const TREASURY_ENTRIES_HEADING =
  /^Entrées de fonds$|^Fund entries$|^Entradas de fondos$/i;

export const TREASURY_NEW_ENTRY_BUTTON =
  /^Nouvelle entrée$|^New entry$|^Nueva entrada$/i;

export const TREASURY_SUBMIT_CREATE =
  /^Enregistrer l'entrée$|^Save entry$|^Guardar entrada$/i;

export const TREASURY_HUB_HEADING = /^Trésorerie$|^Treasury$|^Tesorería$/i;

export const TREASURY_DETAIL_HEADING =
  /^Détail de l'entrée$|^Entry detail$|^Detalle de la entrada$/i;

export const TREASURY_VIEW_ACTION = /^Voir$|^View$|^Ver$/i;

export const FIELD_ORGANIZATION = /^Organisation$|^Organization$|^Organización$/i;
export const FIELD_AMOUNT = /^Montant$|^Amount$|^Importe$/i;
export const FIELD_CURRENCY = /^Devise$|^Currency$|^Divisa$/i;
export const FIELD_OPERATION_DATE =
  /^Date d'opération$|^Operation date$|^Fecha de operación$/i;
export const FIELD_SOURCE =
  /^Source des fonds$|^Fund source$|^Fuente de los fondos$/i;
export const FIELD_PAYMENT_METHOD =
  /^Mode de paiement$|^Payment method$|^Método de pago$/i;
export const FIELD_REFERENCE = /^Référence$|^Reference$|^Referencia$/i;

export const SOURCE_CUSTOMER_DIRECT =
  /^Client direct$|^Direct customer$|^Cliente directo$/i;
export const PAYMENT_CASH = /^Espèces$|^Cash$|^Efectivo$/i;

export const ENTRIES_SEARCH_ARIA =
  /^Rechercher des entrées$|^Search entries$|^Buscar entradas$/i;

export const ENTRIES_TABLE_ARIA =
  /^Liste des entrées de fonds$|^Fund entries list$|^Lista de entradas de fondos$/i;

/** Isolated reference for a single e2e run (searchable in list). */
export function uniqueFundEntryReference(): string {
  return `E2E-TRESO-${Date.now()}`;
}

/**
 * Ouvre le groupe nav Trésorerie puis la liste des entrées (sélecteurs rôle/label).
 */
export async function navigateToTreasuryEntriesViaNav(page: Page) {
  await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
  await waitForPageIdle(page);

  const groupToggle = page.getByRole('button', { name: TREASURY_NAV_GROUP });
  await expect(groupToggle).toBeVisible({ timeout: 30_000 });

  if ((await groupToggle.getAttribute('aria-expanded')) !== 'true') {
    await groupToggle.click();
  }

  const entriesLink = page.getByRole('link', { name: TREASURY_ENTRIES_NAV });
  await expect(entriesLink).toBeVisible();
  await entriesLink.click();

  await expect(page).toHaveURL(/\/tresorerie\/entrees\/?$/, { timeout: 30_000 });
  await waitForPageIdle(page);
  await expect(
    page.getByRole('heading', { name: TREASURY_ENTRIES_HEADING }),
  ).toBeVisible();
}

/**
 * Remplit le formulaire création entrée (données isolées via `reference`).
 * Prérequis : page `/tresorerie/entrees/nouveau`, seed admin (super_admin).
 */
export async function fillFundEntryCreateForm(
  page: Page,
  options: {
    reference: string;
    amountMajor?: string;
    organizationId?: string;
  },
) {
  const amount = options.amountMajor ?? '1500.00';
  const orgId = options.organizationId ?? SEED_ORGANIZATION_ID;

  const orgSelect = page.getByLabel(FIELD_ORGANIZATION);
  await expect(orgSelect).toBeVisible({ timeout: 30_000 });
  await orgSelect.selectOption(orgId);

  await page.getByLabel(FIELD_AMOUNT).fill(amount);
  await page.getByLabel(FIELD_CURRENCY).selectOption('XOF');

  const today = new Date().toISOString().slice(0, 10);
  await page.getByLabel(FIELD_OPERATION_DATE).fill(today);

  await page.getByLabel(FIELD_SOURCE).selectOption('customer_direct');
  await page.getByLabel(FIELD_PAYMENT_METHOD).selectOption('cash');

  await page.getByLabel(FIELD_REFERENCE).fill(options.reference);
}
