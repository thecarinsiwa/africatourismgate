-- PR-11: Link identity documents to manifest traveler entries.
-- Column nullable for history; new uploads will require manifest_entry_id (API).

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns
   WHERE table_schema = DATABASE()
     AND table_name = 'booking_identity_documents'
     AND column_name = 'manifest_entry_id') = 0,
  'ALTER TABLE `booking_identity_documents`
     ADD COLUMN `manifest_entry_id` CHAR(36) NULL AFTER `booking_id`',
  'SELECT ''booking_identity_documents.manifest_entry_id already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics
   WHERE table_schema = DATABASE()
     AND table_name = 'booking_identity_documents'
     AND index_name = 'idx_booking_identity_documents_manifest_entry') = 0,
  'ALTER TABLE `booking_identity_documents`
     ADD KEY `idx_booking_identity_documents_manifest_entry` (`booking_id`, `manifest_entry_id`)',
  'SELECT ''idx_booking_identity_documents_manifest_entry already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.table_constraints
   WHERE table_schema = DATABASE()
     AND table_name = 'booking_identity_documents'
     AND constraint_name = 'fk_booking_identity_documents_manifest_entry') = 0,
  'ALTER TABLE `booking_identity_documents`
     ADD CONSTRAINT `fk_booking_identity_documents_manifest_entry`
       FOREIGN KEY (`manifest_entry_id`) REFERENCES `booking_manifest_entries` (`id`)
       ON DELETE SET NULL',
  'SELECT ''fk_booking_identity_documents_manifest_entry already exists'''
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Best-effort backfill: match docs (created_at order) to entries (sort_order) per booking.
-- Leftover docs stay NULL when counts differ or no entries exist.
UPDATE `booking_identity_documents` d
INNER JOIN (
  SELECT
    doc.id AS doc_id,
    entry.id AS entry_id
  FROM (
    SELECT
      `id`,
      `booking_id`,
      ROW_NUMBER() OVER (
        PARTITION BY `booking_id`
        ORDER BY `created_at` ASC, `id` ASC
      ) AS rn
    FROM `booking_identity_documents`
    WHERE `deleted_at` IS NULL
      AND `manifest_entry_id` IS NULL
  ) doc
  INNER JOIN (
    SELECT
      `id`,
      `booking_id`,
      ROW_NUMBER() OVER (
        PARTITION BY `booking_id`
        ORDER BY `sort_order` ASC, `created_at` ASC, `id` ASC
      ) AS rn
    FROM `booking_manifest_entries`
    WHERE `deleted_at` IS NULL
  ) entry
    ON entry.`booking_id` = doc.`booking_id`
   AND entry.rn = doc.rn
) map ON map.doc_id = d.`id`
SET d.`manifest_entry_id` = map.entry_id
WHERE d.`manifest_entry_id` IS NULL;
