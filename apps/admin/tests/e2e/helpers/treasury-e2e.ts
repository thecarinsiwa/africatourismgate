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

// ─── Expense request / exit workflow (TRESO-043) ─────────────────────────────

export const TREASURY_NEEDS_NAV =
  /^États de besoin$|^Expense requests$|^Estados de necesidad$/i;

export const TREASURY_NEEDS_HEADING =
  /^États de besoin$|^Expense requests$|^Estados de necesidad$/i;

export const TREASURY_NEW_NEED_BUTTON =
  /^Nouveau besoin$|^New request$|^Nueva solicitud$/i;

export const TREASURY_NEED_SUBMIT_CREATE =
  /^Créer la demande$|^Create request$|^Crear la solicitud$/i;

export const TREASURY_NEED_DETAIL_HEADING =
  /^Détail de l'état de besoin$|^Expense request detail$|^Detalle del estado de necesidad$/i;

export const FIELD_TITLE = /^Titre$|^Title$|^Título$/i;
export const FIELD_DESCRIPTION =
  /^Justification$|^Description$|^Justificación$/i;
export const FIELD_REQUESTED_AMOUNT =
  /^Montant demandé$|^Requested amount$|^Importe solicitado$/i;

export const WORKFLOW_SUBMIT = /^Soumettre$|^Submit$|^Enviar$/i;
export const WORKFLOW_VALIDATE = /^Valider$|^Validate$|^Validar$/i;
export const WORKFLOW_AUTHORIZE = /^Autoriser$|^Authorize$|^Autorizar$/i;
export const WORKFLOW_CONFIRM = /^Confirmer$|^Confirm$|^Confirmar$/i;
export const WORKFLOW_DISBURSE =
  /^Enregistrer le décaissement$|^Record disbursement$|^Registrar el desembolso$/i;

export const EXIT_SUBMIT_CREATE =
  /^Enregistrer la sortie$|^Save exit$|^Guardar salida$/i;
export const EXIT_MARK_DISBURSED =
  /^Marquer comme décaissée$|^Mark as disbursed$|^Marcar como desembolsada$/i;
export const EXIT_MARK_RECORDED =
  /^Marquer comme enregistrée$|^Mark as recorded$|^Marcar como registrada$/i;

export const EXIT_DETAIL_HEADING =
  /^Détail de la sortie$|^Exit detail$|^Detalle de la salida$/i;

export const WORKFLOW_PROGRESS_ARIA =
  /^Progression du circuit de validation$|^Validation workflow progress$|^Progreso del circuito de validación$/i;

export const STATUS_DRAFT = /^Brouillon$|^Draft$|^Borrador$/i;
export const STATUS_SUBMITTED = /^Soumis$|^Submitted$|^Enviado$/i;
export const STATUS_VALIDATED = /^Validé$|^Validated$|^Validado$/i;
export const STATUS_AUTHORIZED = /^Autorisé$|^Authorized$|^Autorizado$/i;
export const STATUS_CLOSED = /^Clôturé$|^Closed$|^Cerrado$/i;
export const STATUS_DISBURSED = /^Décaissée$|^Disbursed$|^Desembolsada$/i;
export const STATUS_RECORDED = /^Enregistrée$|^Recorded$|^Registrada$/i;

export const ATTACHMENT_UPLOAD =
  /^Ajouter un fichier$|^Add a file$|^Añadir un archivo$/i;

export function uniqueExpenseRequestTitle(): string {
  return `E2E-BESOIN-${Date.now()}`;
}

export function uniqueFundExitReference(): string {
  return `E2E-SORTIE-${Date.now()}`;
}

export async function navigateToTreasuryNeedsViaNav(page: Page) {
  await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
  await waitForPageIdle(page);

  const groupToggle = page.getByRole('button', { name: TREASURY_NAV_GROUP });
  await expect(groupToggle).toBeVisible({ timeout: 30_000 });
  if ((await groupToggle.getAttribute('aria-expanded')) !== 'true') {
    await groupToggle.click();
  }

  const needsLink = page.getByRole('link', { name: TREASURY_NEEDS_NAV });
  await expect(needsLink).toBeVisible();
  await needsLink.click();

  await expect(page).toHaveURL(/\/tresorerie\/besoins\/?$/, { timeout: 30_000 });
  await waitForPageIdle(page);
  await expect(
    page.getByRole('heading', { name: TREASURY_NEEDS_HEADING }),
  ).toBeVisible();
}

export async function confirmWorkflowModal(page: Page) {
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: WORKFLOW_CONFIRM }).click();
  await expect(dialog).toBeHidden({ timeout: 30_000 });
}

export async function runExpenseRequestTransition(
  page: Page,
  actionName: RegExp,
) {
  await page.getByRole('button', { name: actionName }).click();
  await confirmWorkflowModal(page);
  await waitForPageIdle(page);
}

export async function fillExpenseRequestCreateForm(
  page: Page,
  options: {
    title: string;
    description?: string;
    amountMajor?: string;
    organizationId?: string;
  },
) {
  const orgId = options.organizationId ?? SEED_ORGANIZATION_ID;
  const orgSelect = page.getByLabel(FIELD_ORGANIZATION);
  await expect(orgSelect).toBeVisible({ timeout: 30_000 });
  await orgSelect.selectOption(orgId);

  await page.getByLabel(FIELD_TITLE).fill(options.title);
  await page
    .getByLabel(FIELD_DESCRIPTION)
    .fill(options.description ?? `Justification e2e ${options.title}`);
  await page.getByLabel(FIELD_REQUESTED_AMOUNT).fill(options.amountMajor ?? '2500.00');
  await page.getByLabel(FIELD_CURRENCY).selectOption('XOF');
}

export const FIELD_EXPENSE_REQUEST =
  /^État de besoin$|^Expense request$|^Estado de necesidad$/i;

export async function fillFundExitCreateForm(
  page: Page,
  options: {
    reference: string;
    amountMajor?: string;
  },
) {
  const expenseSelect = page.getByLabel(FIELD_EXPENSE_REQUEST);
  await expect(expenseSelect).toBeEnabled({ timeout: 30_000 });
  await expect(expenseSelect).not.toHaveValue('', { timeout: 30_000 });

  await page.getByLabel(FIELD_AMOUNT).fill(options.amountMajor ?? '2500.00');
  await page.getByLabel(FIELD_CURRENCY).selectOption('XOF');

  const today = new Date().toISOString().slice(0, 10);
  await page
    .getByLabel(/^Date de décaissement$|^Disbursement date$|^Fecha de desembolso$/i)
    .fill(today);

  await page.getByLabel(FIELD_PAYMENT_METHOD).selectOption('cash');
  await page.getByLabel(FIELD_REFERENCE).fill(options.reference);
}

/** Minimal valid 1×1 PNG for justificatif upload. */
export const E2E_PNG_BYTES = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);
