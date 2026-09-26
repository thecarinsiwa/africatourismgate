/**
 * Skeleton de règles de mapping trésorerie → comptes SYSCOHADA (TRESO-039).
 *
 * STUB UNIQUEMENT — aucune écriture de journal n’est générée.
 * L’épic suivant (TRESO-041 / docs/tresorerie-syscohada-epic-next.md) consommera
 * ces clés via `accounting_links.mapping_rule_key`.
 */
export type AccountingMappingRule = {
  key: string;
  fundOpType: 'fund_entry' | 'fund_exit';
  /** Indices de comptes SYSCOHADA (placeholders, non validés). */
  debitAccountHint: string;
  creditAccountHint: string;
  label: string;
  notes?: string;
};

export type AccountingMappingConfig = {
  version: number;
  stub: true;
  description: string;
  rules: AccountingMappingRule[];
};

export const TREASURY_ACCOUNTING_MAPPING_CONFIG: AccountingMappingConfig = {
  version: 1,
  stub: true,
  description:
    'Règles de mapping skeleton pour le pont comptable. Pas de génération d’écritures dans ce lot.',
  rules: [
    {
      key: 'fund_entry.default',
      fundOpType: 'fund_entry',
      debitAccountHint: '57',
      creditAccountHint: '70',
      label: 'Entrée de fonds — mapping par défaut',
      notes: 'Placeholder caisse/banque vs produits.',
    },
    {
      key: 'fund_entry.booking_payment',
      fundOpType: 'fund_entry',
      debitAccountHint: '57',
      creditAccountHint: '411',
      label: 'Entrée liée à un paiement réservation',
    },
    {
      key: 'fund_exit.default',
      fundOpType: 'fund_exit',
      debitAccountHint: '60',
      creditAccountHint: '57',
      label: 'Sortie de fonds — mapping par défaut',
      notes: 'Placeholder charges vs caisse/banque.',
    },
    {
      key: 'fund_exit.expense_request',
      fundOpType: 'fund_exit',
      debitAccountHint: '61',
      creditAccountHint: '57',
      label: 'Sortie liée à un état de besoin',
    },
  ],
};

export function findAccountingMappingRule(
  key: string,
): AccountingMappingRule | undefined {
  return TREASURY_ACCOUNTING_MAPPING_CONFIG.rules.find((r) => r.key === key);
}
