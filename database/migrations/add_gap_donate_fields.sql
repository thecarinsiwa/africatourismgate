-- GAP site settings — bouton Donate (URL + libellé optionnels par locale)

ALTER TABLE `gap_site_settings`
  ADD COLUMN `donate_url` VARCHAR(512) DEFAULT NULL AFTER `unesco_url`,
  ADD COLUMN `donate_label` VARCHAR(120) DEFAULT NULL AFTER `donate_url`;
