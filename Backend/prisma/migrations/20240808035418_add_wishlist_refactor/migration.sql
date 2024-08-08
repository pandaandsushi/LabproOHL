/*
  Warnings:

  - The primary key for the `filmuser` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `filmuser` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `filmuser` DROP PRIMARY KEY,
    DROP COLUMN `id`;

-- CreateTable
CREATE TABLE `Wishlist` (
    `userId` INTEGER NOT NULL,
    `filmId` INTEGER NOT NULL,

    UNIQUE INDEX `Wishlist_userId_filmId_key`(`userId`, `filmId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Wishlist` ADD CONSTRAINT `Wishlist_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Wishlist` ADD CONSTRAINT `Wishlist_filmId_fkey` FOREIGN KEY (`filmId`) REFERENCES `Film`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
