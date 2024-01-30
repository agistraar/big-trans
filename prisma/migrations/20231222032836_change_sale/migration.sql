/*
  Warnings:

  - The primary key for the `saledetail` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `saledetail` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `sale` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `saledetail` DROP PRIMARY KEY,
    DROP COLUMN `createdAt`,
    ADD PRIMARY KEY (`saleId`, `quantity`, `name`, `nominal`);
