-- Support ticket priority for admin triage (defensive: column may already exist in fresh schema import)

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'support_tickets' AND column_name = 'priority') = 0,
  'ALTER TABLE `support_tickets` ADD COLUMN `priority` ENUM(''low'',''normal'',''high'',''urgent'') NOT NULL DEFAULT ''normal'' AFTER `status`',
  'SELECT ''support_tickets.priority already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
