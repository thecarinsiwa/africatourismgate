/**
 * @deprecated SYSCO-004 — remplacé par la table `accounting_mapping_rules`
 * et `AccountingMappingEngine`. Conservé uniquement pour référence historique
 * des clés stub TRESO-039. Ne plus importer en production.
 *
 * Voir : docs/syscohada-domain-model.md §5.7 · GET /accounting-links/mapping-config
 */
export type AccountingMappingRule = {
  key: string;
  fundOpType: 'fund_entry' | 'fund_exit';
  /** @deprecated Hints texte — utiliser debit_account_id / credit_account_id en DB */
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

/** @deprecated */
export const TREASURY_ACCOUNTING_MAPPING_CONFIG: AccountingMappingConfig = {
  version: 1,
  stub: true,
  description:
    'DEPRECATED — utiliser accounting_mapping_rules (SYSCO-004).',
  rules: [
    {
      key: 'fund_entry.default',
      fundOpType: 'fund_entry',
      debitAccountHint: '57',
      creditAccountHint: '70',
      label: 'Entrée de fonds — mapping par défaut',
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

/** @deprecated */
export function findAccountingMappingRule(
  key: string,
): AccountingMappingRule | undefined {
  return TREASURY_ACCOUNTING_MAPPING_CONFIG.rules.find((r) => r.key === key);
}
