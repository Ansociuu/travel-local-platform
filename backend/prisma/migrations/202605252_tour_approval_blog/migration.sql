ALTER TABLE `Tour`
  ADD COLUMN `approvalNote` TEXT NULL,
  ADD COLUMN `approvalStatus` ENUM('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'ARCHIVED') NOT NULL DEFAULT 'APPROVED',
  ADD COLUMN `reviewedAt` DATETIME(3) NULL;

CREATE INDEX `Tour_approvalStatus_idx` ON `Tour`(`approvalStatus`);
