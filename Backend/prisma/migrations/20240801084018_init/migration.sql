-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `balance` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `User_username_key`(`username`),
    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Film` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `director` VARCHAR(191) NOT NULL,
    `releaseYear` INTEGER NOT NULL,
    `genre` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,
    `duration` INTEGER NOT NULL,
    `coverImage` VARCHAR(191) NULL,
    `video` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FilmUser` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `filmId` INTEGER NOT NULL,

    UNIQUE INDEX `FilmUser_userId_filmId_key`(`userId`, `filmId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `FilmUser` ADD CONSTRAINT `FilmUser_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FilmUser` ADD CONSTRAINT `FilmUser_filmId_fkey` FOREIGN KEY (`filmId`) REFERENCES `Film`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
