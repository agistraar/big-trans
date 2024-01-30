/*
  Warnings:

  - Added the required column `type` to the `Customer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `customer` ADD COLUMN `type` ENUM('ANALOG', 'INET', 'DIGITAL') NOT NULL;
