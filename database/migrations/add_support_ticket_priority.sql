-- Support ticket priority for admin triage
ALTER TABLE `support_tickets`
  ADD COLUMN `priority` ENUM('low','normal','high','urgent') NOT NULL DEFAULT 'normal'
  AFTER `status`;
