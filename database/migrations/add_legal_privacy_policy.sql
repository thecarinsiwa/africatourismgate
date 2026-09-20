-- Extend legal_pages with privacy-policy section
ALTER TABLE `legal_pages`
  MODIFY COLUMN `section_key` ENUM('terms-of-use', 'privacy-policy') NOT NULL;

-- Seed: French privacy policy (draft, idempotent)
INSERT INTO `legal_pages` (
  `id`, `section_key`, `title`, `content`,
  `status`, `published_at`, `locale`, `created_by_user_id`
) VALUES
(
  '00000000-0000-4000-8000-00000000c002',
  'privacy-policy',
  'Politique de confidentialité',
  '<p>La présente politique de confidentialité décrit comment Africa Tourism Gate collecte, utilise et protège vos données personnelles.</p><p>Le contenu détaillé sera mis à jour par l''équipe éditoriale.</p>',
  'draft',
  NULL,
  'fr',
  '00000000-0000-4000-8000-000000000010'
)
ON DUPLICATE KEY UPDATE
  `title` = VALUES(`title`),
  `content` = VALUES(`content`);
