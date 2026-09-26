import { BadRequestException } from '@nestjs/common';
import type { EntityManager } from 'typeorm';

/**
 * Bloque l’annulation si un pont comptable `linked` existe (TRESO-039).
 * No-op si la table `accounting_links` n’est pas encore migrée.
 */
export async function assertFundOpNotAccountingLinked(
  manager: EntityManager,
  fundOpType: 'fund_entry' | 'fund_exit',
  fundOpId: string,
): Promise<void> {
  const tables: Array<{ count: number | string }> = await manager.query(
    `SELECT COUNT(*) AS count
     FROM information_schema.tables
     WHERE table_schema = DATABASE()
       AND table_name = 'accounting_links'`,
  );
  const tableCount = Number(tables?.[0]?.count ?? 0);
  if (!Number.isFinite(tableCount) || tableCount < 1) {
    return;
  }

  const linked: Array<{ id: string }> = await manager.query(
    `SELECT id
     FROM accounting_links
     WHERE fund_op_type = ?
       AND fund_op_id = ?
       AND status = 'linked'
     LIMIT 1`,
    [fundOpType, fundOpId],
  );

  if (linked.length > 0) {
    throw new BadRequestException(
      'Cannot void an operation already linked to accounting',
    );
  }
}
