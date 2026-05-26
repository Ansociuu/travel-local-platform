-- Owner / homestay approval flow
ALTER TABLE `Hotel`
  ADD COLUMN `approvalNote` TEXT NULL,
  ADD COLUMN `approvalStatus` ENUM('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'ARCHIVED') NOT NULL DEFAULT 'APPROVED',
  ADD COLUMN `reviewedAt` DATETIME(3) NULL;

CREATE TABLE `OwnerApplication` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `businessName` VARCHAR(191) NOT NULL,
  `contactName` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(191) NOT NULL,
  `address` VARCHAR(191) NOT NULL,
  `city` VARCHAR(191) NOT NULL,
  `note` TEXT NULL,
  `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
  `rejectionReason` TEXT NULL,
  `reviewedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `OwnerApplication_userId_key`(`userId`),
  INDEX `OwnerApplication_status_idx`(`status`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX `Hotel_approvalStatus_idx` ON `Hotel`(`approvalStatus`);

ALTER TABLE `OwnerApplication`
  ADD CONSTRAINT `OwnerApplication_userId_fkey`
  FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
