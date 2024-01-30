/*
  Warnings:

  - The primary key for the `sale` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `saledetail` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `id` to the `SaleDetail` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `saledetail` DROP FOREIGN KEY `SaleDetail_saleId_fkey`;

-- AlterTable
ALTER TABLE `invoice` MODIFY `payDueDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `sale` DROP PRIMARY KEY,
    ADD COLUMN `deleted` DATETIME(3) NULL,
    MODIFY `id` BIGINT NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `saledetail` DROP PRIMARY KEY,
    ADD COLUMN `id` BIGINT NOT NULL AUTO_INCREMENT,
    MODIFY `saleId` BIGINT NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AddForeignKey
ALTER TABLE `SaleDetail` ADD CONSTRAINT `SaleDetail_saleId_fkey` FOREIGN KEY (`saleId`) REFERENCES `Sale`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
