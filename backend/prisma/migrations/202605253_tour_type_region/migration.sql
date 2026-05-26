ALTER TABLE `Tour`
  ADD COLUMN `type` ENUM('TREKKING', 'RESORT', 'CULTURE', 'CRUISE') NOT NULL DEFAULT 'CULTURE',
  ADD COLUMN `region` ENUM('BAC', 'TRUNG', 'NAM') NOT NULL DEFAULT 'BAC';

CREATE INDEX `Tour_type_idx` ON `Tour`(`type`);
CREATE INDEX `Tour_region_idx` ON `Tour`(`region`);
